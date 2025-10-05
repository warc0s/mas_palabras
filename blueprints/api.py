"""REST API blueprint exposing CRUD endpoints for core models."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable

from flask import Blueprint, jsonify, make_response, request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from werkzeug.exceptions import BadRequest, NotFound

from utils.database import db
from utils.models import Feature, Language, Word


api_bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")


@dataclass
class ApiError(Exception):
    status: int
    code: str
    message: str
    details: Dict[str, Any] | None = None


def _json_response(payload: Dict[str, Any], status: int = 200):
    return jsonify(payload), status


def _error_response(*, status: int, code: str, message: str, details: Dict[str, Any] | None = None):
    payload: Dict[str, Any] = {"error": {"code": code, "message": message}}
    if details:
        payload["error"]["details"] = details
    return _json_response(payload, status=status)


def _ensure_json() -> Dict[str, Any]:
    if not request.is_json:
        raise ApiError(400, "invalid_json", "Se requiere un cuerpo JSON")
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError(400, "invalid_json", "JSON inválido o malformado")
    return data


def _serialize_word(word: Word) -> Dict[str, Any]:
    return {
        "id": word.id,
        "english_word": word.english_word,
        "translation": word.translation,
        "explanation": word.explanation,
        "language_id": word.language_id,
        "feature_id": word.feature_id,
        "language": word.language.language if word.language else None,
        "feature": word.feature.feature if word.feature else None,
        "times_practiced": word.times_practiced,
        "times_correct": word.times_correct,
        "last_practiced": word.last_practiced.isoformat() if word.last_practiced else None,
        "created_at": word.created_at.isoformat() if word.created_at else None,
    }


def _serialize_language(language: Language) -> Dict[str, Any]:
    return {"id": language.id, "language": language.language, "active": language.active}


def _serialize_feature(feature: Feature) -> Dict[str, Any]:
    return {"id": feature.id, "feature": feature.feature, "active": feature.active}


def _validate_required(data: Dict[str, Any], required: Iterable[str]):
    missing = [field for field in required if not data.get(field)]
    if missing:
        raise ApiError(400, "missing_fields", f"Faltan campos requeridos: {', '.join(missing)}", {"missing": missing})


def _as_int(value: Any, field: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ApiError(400, "invalid_field", f"{field} debe ser un entero válido")


def _check_word_duplicate(*, english_word: str, language_id: int, current_id: int | None = None):
    normalized = Word.normalize_text(english_word.strip())
    query = Word.query.filter(Word.language_id == language_id, Word.normalized_english_word == normalized)
    if current_id:
        query = query.filter(Word.id != current_id)
    if query.first():
        raise ApiError(409, "duplicate_word", "La palabra ya existe para el idioma indicado")


def _get_language(language_id: int) -> Language:
    language = db.session.get(Language, language_id)
    if not language:
        raise ApiError(404, "language_not_found", f"Idioma {language_id} no encontrado")
    return language


def _get_feature(feature_id: int) -> Feature:
    feature = db.session.get(Feature, feature_id)
    if not feature:
        raise ApiError(404, "feature_not_found", f"Característica {feature_id} no encontrada")
    return feature


@api_bp.before_request
def _handle_options():
    if request.method == "OPTIONS":
        response = make_response("", 204)
        return response


@api_bp.after_request
def _add_cors_headers(response):
    response.headers.setdefault("Access-Control-Allow-Origin", "*")
    response.headers.setdefault("Access-Control-Allow-Headers", "Content-Type")
    response.headers.setdefault("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    return response


@api_bp.errorhandler(ApiError)
def _handle_api_error(error: ApiError):
    return _error_response(status=error.status, code=error.code, message=error.message, details=error.details)


@api_bp.errorhandler(BadRequest)
def _handle_bad_request(error: BadRequest):
    description = error.description or "Solicitud inválida"
    return _error_response(status=400, code="bad_request", message=description)


@api_bp.errorhandler(NotFound)
def _handle_not_found(error: NotFound):
    description = error.description or "Recurso no encontrado"
    return _error_response(status=404, code="not_found", message=description)


@api_bp.errorhandler(IntegrityError)
def _handle_integrity_error(error: IntegrityError):
    db.session.rollback()
    return _error_response(status=409, code="integrity_error", message="No se pudo completar la operación por restricciones de integridad")


@api_bp.get("/words")
def list_words():
    query = Word.query.options(selectinload(Word.language), selectinload(Word.feature))
    language_id = request.args.get("language_id", type=int)
    feature_id = request.args.get("feature_id", type=int)
    if language_id:
        query = query.filter(Word.language_id == language_id)
    if feature_id:
        query = query.filter(Word.feature_id == feature_id)
    words = query.order_by(Word.english_word).all()
    return _json_response({"data": [_serialize_word(word) for word in words], "meta": {"count": len(words)}})


@api_bp.post("/words")
def create_word():
    data = _ensure_json()
    _validate_required(data, ["english_word", "translation", "language_id", "feature_id"])

    language_id = _as_int(data.get("language_id"), "language_id")
    feature_id = _as_int(data.get("feature_id"), "feature_id")
    _get_language(language_id)
    _get_feature(feature_id)
    _check_word_duplicate(english_word=data["english_word"], language_id=language_id)

    word = Word(
        english_word=data["english_word"].strip(),
        translation=data["translation"].strip(),
        explanation=(data.get("explanation") or "").strip(),
        language_id=language_id,
        feature_id=feature_id,
    )

    db.session.add(word)
    db.session.commit()
    word = (
        Word.query.options(selectinload(Word.language), selectinload(Word.feature))
        .filter_by(id=word.id)
        .one()
    )
    return _json_response({"data": _serialize_word(word)}, status=201)


@api_bp.get("/words/<int:word_id>")
def get_word(word_id: int):
    word = (
        Word.query.options(selectinload(Word.language), selectinload(Word.feature))
        .filter_by(id=word_id)
        .one_or_none()
    )
    if not word:
        raise ApiError(404, "word_not_found", f"Palabra {word_id} no encontrada")
    return _json_response({"data": _serialize_word(word)})


@api_bp.put("/words/<int:word_id>")
def update_word(word_id: int):
    word = db.session.get(Word, word_id)
    if not word:
        raise ApiError(404, "word_not_found", f"Palabra {word_id} no encontrada")

    data = _ensure_json()
    _validate_required(data, ["english_word", "translation", "language_id", "feature_id"])

    language_id = _as_int(data.get("language_id"), "language_id")
    feature_id = _as_int(data.get("feature_id"), "feature_id")
    _get_language(language_id)
    _get_feature(feature_id)
    _check_word_duplicate(english_word=data["english_word"], language_id=language_id, current_id=word_id)

    word.english_word = data["english_word"].strip()
    word.translation = data["translation"].strip()
    word.explanation = (data.get("explanation") or "").strip()
    word.language_id = language_id
    word.feature_id = feature_id

    db.session.commit()
    db.session.refresh(word)
    return _json_response({"data": _serialize_word(word)})


@api_bp.delete("/words/<int:word_id>")
def delete_word(word_id: int):
    word = db.session.get(Word, word_id)
    if not word:
        raise ApiError(404, "word_not_found", f"Palabra {word_id} no encontrada")
    db.session.delete(word)
    db.session.commit()
    return _json_response({"data": {"id": word_id}}, status=200)


@api_bp.get("/languages")
def list_languages():
    include_inactive = request.args.get("include_inactive", default="false").lower() in {"true", "1", "yes"}
    query = Language.query
    if not include_inactive:
        query = query.filter(Language.active.is_(True))
    languages = query.order_by(Language.language).all()
    return _json_response({"data": [_serialize_language(language) for language in languages], "meta": {"count": len(languages)}})


@api_bp.post("/languages")
def create_language():
    data = _ensure_json()
    _validate_required(data, ["language"])

    name = data["language"].strip()
    existing = Language.query.filter_by(language=name).first()
    if existing:
        raise ApiError(409, "duplicate_language", "El idioma ya existe")

    language = Language(language=name, active=bool(data.get("active", True)))
    db.session.add(language)
    db.session.commit()
    return _json_response({"data": _serialize_language(language)}, status=201)


@api_bp.get("/languages/<int:language_id>")
def get_language(language_id: int):
    language = db.session.get(Language, language_id)
    if not language:
        raise ApiError(404, "language_not_found", f"Idioma {language_id} no encontrado")
    return _json_response({"data": _serialize_language(language)})


@api_bp.put("/languages/<int:language_id>")
def update_language(language_id: int):
    language = db.session.get(Language, language_id)
    if not language:
        raise ApiError(404, "language_not_found", f"Idioma {language_id} no encontrado")

    data = _ensure_json()
    if "language" in data:
        new_name = data["language"].strip()
        duplicate = Language.query.filter(Language.language == new_name, Language.id != language_id).first()
        if duplicate:
            raise ApiError(409, "duplicate_language", "El idioma ya existe")
        language.language = new_name
    if "active" in data:
        language.active = bool(data["active"])

    db.session.commit()
    return _json_response({"data": _serialize_language(language)})


@api_bp.delete("/languages/<int:language_id>")
def delete_language(language_id: int):
    language = db.session.get(Language, language_id)
    if not language:
        raise ApiError(404, "language_not_found", f"Idioma {language_id} no encontrado")

    word_count = Word.query.filter_by(language_id=language_id).count()
    if word_count > 0:
        language.active = False
        db.session.commit()
        return _json_response({"data": _serialize_language(language), "meta": {"affected_words": word_count, "action": "deactivated"}})

    db.session.delete(language)
    db.session.commit()
    return _json_response({"data": {"id": language_id}}, status=200)


@api_bp.get("/features")
def list_features():
    include_inactive = request.args.get("include_inactive", default="false").lower() in {"true", "1", "yes"}
    query = Feature.query
    if not include_inactive:
        query = query.filter(Feature.active.is_(True))
    features = query.order_by(Feature.feature).all()
    return _json_response({"data": [_serialize_feature(feature) for feature in features], "meta": {"count": len(features)}})


@api_bp.post("/features")
def create_feature():
    data = _ensure_json()
    _validate_required(data, ["feature"])

    name = data["feature"].strip()
    existing = Feature.query.filter_by(feature=name).first()
    if existing:
        raise ApiError(409, "duplicate_feature", "La característica ya existe")

    feature = Feature(feature=name, active=bool(data.get("active", True)))
    db.session.add(feature)
    db.session.commit()
    return _json_response({"data": _serialize_feature(feature)}, status=201)


@api_bp.get("/features/<int:feature_id>")
def get_feature(feature_id: int):
    feature = db.session.get(Feature, feature_id)
    if not feature:
        raise ApiError(404, "feature_not_found", f"Característica {feature_id} no encontrada")
    return _json_response({"data": _serialize_feature(feature)})


@api_bp.put("/features/<int:feature_id>")
def update_feature(feature_id: int):
    feature = db.session.get(Feature, feature_id)
    if not feature:
        raise ApiError(404, "feature_not_found", f"Característica {feature_id} no encontrada")

    data = _ensure_json()
    if "feature" in data:
        new_name = data["feature"].strip()
        duplicate = Feature.query.filter(Feature.feature == new_name, Feature.id != feature_id).first()
        if duplicate:
            raise ApiError(409, "duplicate_feature", "La característica ya existe")
        feature.feature = new_name
    if "active" in data:
        feature.active = bool(data["active"])

    db.session.commit()
    return _json_response({"data": _serialize_feature(feature)})


@api_bp.delete("/features/<int:feature_id>")
def delete_feature(feature_id: int):
    feature = db.session.get(Feature, feature_id)
    if not feature:
        raise ApiError(404, "feature_not_found", f"Característica {feature_id} no encontrada")

    word_count = Word.query.filter_by(feature_id=feature_id).count()
    if word_count > 0:
        feature.active = False
        db.session.commit()
        return _json_response({"data": _serialize_feature(feature), "meta": {"affected_words": word_count, "action": "deactivated"}})

    db.session.delete(feature)
    db.session.commit()
    return _json_response({"data": {"id": feature_id}}, status=200)

