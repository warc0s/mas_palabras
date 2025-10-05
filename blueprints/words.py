"""Views related to word management and landing statistics."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, Literal, TypedDict, cast

from flask import (
    Blueprint,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from flask.typing import ResponseReturnValue
from sqlalchemy import case, desc, func, or_
from sqlalchemy.orm import selectinload

from utils.database import db
from utils.forms import ImportForm, SearchForm, WordForm
from utils.models import Feature, Language, Word


class ImportIssue(TypedDict):
    line: int
    code: str
    action: Literal["error", "skipped"]


class ImportResult(TypedDict):
    success: int
    skipped: int
    errors: int
    created_languages: list[str]
    created_features: list[str]
    issues: list[ImportIssue]


words_bp = Blueprint("words", __name__)


@words_bp.route("/")
def index() -> ResponseReturnValue:
    """Render the dashboard with aggregate statistics."""
    word_count = Word.query.count()
    language_count = Language.query.filter_by(active=True).count()
    feature_count = Feature.query.filter_by(active=True).count()

    total_practiced = db.session.query(func.sum(Word.times_practiced)).scalar() or 0

    if word_count > 0:
        avg_accuracy_result = (
            db.session.query(func.avg(Word.times_correct * 100.0 / Word.times_practiced))
            .filter(Word.times_practiced > 0)
            .scalar()
        )
        avg_accuracy = round(avg_accuracy_result or 0.0, 1)
    else:
        avg_accuracy = 0.0

    needs_practice = Word.query.filter(
        or_(
            Word.times_practiced == 0,
            Word.times_practiced < 3,
            (Word.times_practiced > 0)
            & (Word.times_correct * 100.0 / Word.times_practiced < 70),
        )
    ).count()

    return render_template(
        "index.html",
        word_count=word_count,
        language_count=language_count,
        feature_count=feature_count,
        total_practiced=total_practiced,
        avg_accuracy=avg_accuracy,
        words_need_practice=needs_practice,
    )


@words_bp.route("/maspalabras", methods=["GET", "POST"])
def create_word() -> ResponseReturnValue:
    """Allow manual creation of a new word."""
    form = WordForm()
    languages = Language.query.filter_by(active=True).order_by(Language.language).all()
    features = Feature.query.filter_by(active=True).order_by(Feature.feature).all()

    form.language.choices = [(language.id, language.language) for language in languages]
    form.feature.choices = [(feature.id, feature.feature) for feature in features]

    if form.validate_on_submit():
        word = Word(
            english_word=form.english_word.data.strip(),
            translation=form.translation.data.strip(),
            explanation=(form.explanation.data or "").strip(),
            language_id=form.language.data,
            feature_id=form.feature.data,
        )
        db.session.add(word)
        db.session.commit()
        flash("Palabra agregada exitosamente!", "success")
        return redirect(url_for("words.view_words"))

    return render_template("maspalabras.html", form=form, languages=languages)


@words_bp.route("/verpalabras")
def view_words() -> ResponseReturnValue:
    """List words applying filters, pagination and ordering."""
    search_form = SearchForm()
    languages = Language.query.filter_by(active=True).order_by(Language.language).all()
    features = Feature.query.filter_by(active=True).order_by(Feature.feature).all()

    search_form.language.choices = [(0, "Todos los idiomas")] + [
        (language.id, language.language) for language in languages
    ]
    search_form.feature.choices = [(0, "Todas las características")] + [
        (feature.id, feature.feature) for feature in features
    ]

    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(max(request.args.get("per_page", 25, type=int), 1), 100)

    query = Word.query.options(selectinload(Word.language), selectinload(Word.feature))

    search_term = request.args.get("search", "").strip()
    if search_term:
        ilike_term = f"%{search_term}%"
        query = query.filter(
            or_(
                Word.english_word.ilike(ilike_term),
                Word.translation.ilike(ilike_term),
                Word.explanation.ilike(ilike_term),
            )
        )

    language_filter = request.args.get("language", 0, type=int)
    if language_filter:
        query = query.filter(Word.language_id == language_filter)

    feature_filter = request.args.get("feature", 0, type=int)
    if feature_filter:
        query = query.filter(Word.feature_id == feature_filter)

    accuracy_expr = case(
        (Word.times_practiced > 0, Word.times_correct * 100.0 / Word.times_practiced),
        else_=0.0,
    )
    unpracticed_rank = case((Word.times_practiced == 0, 1), else_=0)

    sort_by = request.args.get("sort_by", "english_word")
    if sort_by == "english_word":
        query = query.order_by(Word.english_word)
    elif sort_by == "translation":
        query = query.order_by(Word.translation)
    elif sort_by == "created_at_desc":
        query = query.order_by(desc(Word.created_at))
    elif sort_by == "created_at_asc":
        query = query.order_by(Word.created_at)
    elif sort_by == "accuracy_desc":
        query = query.order_by(unpracticed_rank, desc(accuracy_expr), Word.english_word)
    elif sort_by == "accuracy_asc":
        query = query.order_by(unpracticed_rank, accuracy_expr, Word.english_word)
    elif sort_by == "needs_practice":
        needs_practice_score = case(
            (Word.times_practiced == 0, 3),
            (Word.times_practiced < 3, 2),
            (accuracy_expr < 70, 1),
            else_=0,
        )
        query = query.order_by(desc(needs_practice_score), Word.english_word)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    words = pagination.items
    filters = request.args.to_dict()
    filters.pop("page", None)
    filters.setdefault("per_page", str(per_page))

    search_form.search.data = search_term
    search_form.language.data = language_filter
    search_form.feature.data = feature_filter
    search_form.sort_by.data = sort_by

    return render_template(
        "verpalabras.html",
        words=words,
        search_form=search_form,
        pagination=pagination,
        page=page,
        per_page=per_page,
        total_words=pagination.total,
        filters=filters,
    )


@words_bp.route("/get_word/<int:word_id>")
def get_word(word_id: int) -> ResponseReturnValue:
    """Return a JSON payload describing the required word."""
    word = db.session.get(Word, word_id)
    if not word:
        return jsonify({"error": {"code": "not_found", "message": "Palabra no encontrada"}}), 404
    return jsonify(word.to_dict())


@words_bp.route("/edit/<int:word_id>", methods=["GET", "POST"])
def edit_word(word_id: int) -> ResponseReturnValue:
    """Edit a word identified by its ID."""
    word = db.session.get(Word, word_id)
    if not word:
        abort(404)

    form = WordForm(word_id=word_id)
    languages = Language.query.filter_by(active=True).order_by(Language.language).all()
    features = Feature.query.filter_by(active=True).order_by(Feature.feature).all()

    form.language.choices = [(language.id, language.language) for language in languages]
    form.feature.choices = [(feature.id, feature.feature) for feature in features]

    if form.validate_on_submit():
        word.english_word = form.english_word.data.strip()
        word.translation = form.translation.data.strip()
        word.explanation = (form.explanation.data or "").strip()
        word.language_id = form.language.data
        word.feature_id = form.feature.data
        db.session.commit()
        flash("Palabra actualizada exitosamente!", "success")
        return redirect(url_for("words.view_words"))

    if request.method == "GET":
        form.english_word.data = word.english_word
        form.translation.data = word.translation
        form.explanation.data = word.explanation
        form.language.data = word.language_id
        form.feature.data = word.feature_id

    return render_template("edit.html", form=form, word=word, languages=languages)


@words_bp.route("/delete/<int:word_id>", methods=["POST"])
def delete_word(word_id: int) -> ResponseReturnValue:
    """Remove a word from the catalogue."""
    word = db.session.get(Word, word_id)
    if not word:
        abort(404)
    db.session.delete(word)
    db.session.commit()
    flash("Palabra eliminada exitosamente!", "success")
    return redirect(url_for("words.view_words"))


@words_bp.route("/bulk_delete", methods=["POST"])
def bulk_delete_words() -> ResponseReturnValue:
    """Delete multiple words given their IDs."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Solicitud inválida"}), 400

    identifiers = payload.get("word_ids", [])
    if not isinstance(identifiers, list) or not identifiers:
        return jsonify({"error": "No se proporcionaron IDs"}), 400

    try:
        unique_ids = {int(identifier) for identifier in identifiers}
    except (TypeError, ValueError):
        return jsonify({"error": "IDs inválidos proporcionados"}), 400

    try:
        deleted_count = Word.query.filter(Word.id.in_(unique_ids)).delete(synchronize_session=False)
        db.session.commit()
    except Exception:  # pragma: no cover - unexpected DB error path
        db.session.rollback()
        return jsonify({"error": "Error al eliminar palabras"}), 500

    return jsonify({"message": f"{deleted_count} palabras eliminadas", "deleted": deleted_count})


@words_bp.route("/import_words", methods=["GET", "POST"])
def import_words() -> ResponseReturnValue:
    """Import words from a JSON payload."""
    form = ImportForm()
    if form.validate_on_submit():
        file_storage = form.file.data
        try:
            raw_content = file_storage.read().decode("utf-8")
            data = json.loads(raw_content)
        except UnicodeDecodeError:
            flash("Error: el archivo debe estar codificado en UTF-8.", "error")
            return redirect(url_for("words.import_words"))
        except json.JSONDecodeError:
            flash("Error: El archivo no contiene JSON válido.", "error")
            return redirect(url_for("words.import_words"))

        if not isinstance(data, list):
            flash("El archivo JSON debe contener una lista de palabras.", "error")
            return redirect(url_for("words.import_words"))

        result = process_import(data, form.overwrite_duplicates.data, form.create_missing.data)

        if result["success"] > 0:
            flash(f"¡Importación exitosa! {result['success']} palabras importadas.", "success")
        if result["skipped"] > 0:
            flash(f"{result['skipped']} palabras omitidas (duplicadas o inválidas).", "info")
        if result["errors"] > 0:
            flash(f"{result['errors']} palabras con errores.", "warning")
        if result["issues"]:
            preview = ", ".join(
                f"#{issue['line']} ({issue['code']})" for issue in result["issues"][:5]
            )
            flash(f"Detalles de errores/omisiones: {preview}", "warning")
            remaining = len(result["issues"]) - 5
            if remaining > 0:
                flash(f"Se omitieron {remaining} incidencias adicionales.", "warning")
        if result["created_languages"]:
            flash(f"Idiomas creados: {', '.join(result['created_languages'])}", "info")
        if result["created_features"]:
            flash(f"Características creadas: {', '.join(result['created_features'])}", "info")

        return redirect(url_for("words.view_words"))

    return render_template("import_words.html", form=form)


@words_bp.route("/export_words")
def export_words() -> ResponseReturnValue:
    """Return all words as a JSON attachment."""
    words = Word.query.options(selectinload(Word.language), selectinload(Word.feature)).all()
    payload = [word.to_dict() for word in words]
    response = jsonify(payload)
    response.headers["Content-Disposition"] = "attachment; filename=palabras.json"
    return response


def _extract_error_code(error: Exception) -> str:
    if isinstance(error, ValueError) and error.args:
        return str(error.args[0])
    return error.__class__.__name__


def _register_import_issue(
    result: ImportResult, *, line: int, code: str, action: Literal["error", "skipped"]
) -> None:
    if action == "error":
        result["errors"] += 1
    else:
        result["skipped"] += 1
    result["issues"].append({"line": line, "code": code, "action": action})


def process_import(data: Iterable[Any], overwrite_mode: str, create_missing_mode: str) -> ImportResult:
    """Process the words import returning a summary of the operation."""
    result: ImportResult = {
        "success": 0,
        "skipped": 0,
        "errors": 0,
        "created_languages": [],
        "created_features": [],
        "issues": [],
    }

    created_languages: set[str] = set()
    created_features: set[str] = set()
    new_words: list[Word] = []
    pending_new_records: dict[tuple[int, str], Word] = {}

    for line_number, item in enumerate(data, start=1):
        try:
            sanitized = _sanitize_import_item(item)
        except ValueError as error:
            _register_import_issue(
                result,
                line=line_number,
                code=_extract_error_code(error),
                action="error",
            )
            continue

        try:
            language_created, feature_created = _ensure_relations(
                sanitized, create_missing_mode, created_languages, created_features
            )
        except ValueError as error:
            _register_import_issue(
                result,
                line=line_number,
                code=_extract_error_code(error),
                action="skipped",
            )
            continue

        created_languages.update(language_created)
        created_features.update(feature_created)

        key = (sanitized["language_id"], sanitized["normalized_english"])
        existing_word = _find_existing_word(
            english_word=sanitized["normalized_english"], language_name=sanitized["language"]
        )
        if not existing_word:
            existing_word = pending_new_records.get(key)

        if existing_word:
            if overwrite_mode == "skip":
                _register_import_issue(result, line=line_number, code="duplicate", action="skipped")
                continue
            _update_existing_word(existing_word, sanitized)
            result["success"] += 1
            continue

        new_word = _build_new_word(sanitized)
        new_words.append(new_word)
        pending_new_records[key] = new_word
        result["success"] += 1

    if created_languages:
        result["created_languages"] = sorted(created_languages)
    if created_features:
        result["created_features"] = sorted(created_features)

    try:
        if new_words:
            db.session.bulk_save_objects(new_words)
        if result["success"] > 0 or created_languages or created_features:
            db.session.commit()
        else:
            db.session.rollback()
    except Exception:
        db.session.rollback()
        raise

    return result


def _ensure_relations(
    sanitized: Dict[str, Any],
    create_missing_mode: str,
    created_languages: set[str],
    created_features: set[str],
) -> tuple[set[str], set[str]]:
    language_name = sanitized["language"]
    feature_name = sanitized["feature"]

    language = Language.query.filter_by(language=language_name).first()
    feature = Feature.query.filter_by(feature=feature_name).first()

    created_now_languages: set[str] = set()
    created_now_features: set[str] = set()

    if not language:
        if create_missing_mode != "create":
            raise ValueError("language_missing")
        language = Language(language=language_name, active=True)
        db.session.add(language)
        db.session.flush()
        created_now_languages.add(language_name)

    if not feature:
        if create_missing_mode != "create":
            raise ValueError("feature_missing")
        feature = Feature(feature=feature_name, active=True)
        db.session.add(feature)
        db.session.flush()
        created_now_features.add(feature_name)

    sanitized["language_id"] = language.id
    sanitized["feature_id"] = feature.id

    return created_now_languages, created_now_features


def _find_existing_word(*, english_word: str, language_name: str) -> Word | None:
    language = Language.query.filter_by(language=language_name).first()
    if not language:
        return None
    return cast(
        Word | None,
        Word.query.filter_by(
            language_id=language.id,
            normalized_english_word=english_word,
        ).first(),
    )


def _build_new_word(sanitized: Dict[str, Any]) -> Word:
    word = Word(
        english_word=sanitized["english_word"],
        translation=sanitized["translation"],
        explanation=sanitized["explanation"],
        language_id=sanitized["language_id"],
        feature_id=sanitized["feature_id"],
        times_practiced=sanitized["times_practiced"],
        times_correct=sanitized["times_correct"],
        last_practiced=sanitized["last_practiced"],
        created_at=datetime.utcnow(),
    )
    word.normalized_english_word = sanitized["normalized_english"]
    return word


def _update_existing_word(existing_word: Word, sanitized: Dict[str, Any]) -> None:
    existing_word.translation = sanitized["translation"]
    existing_word.explanation = sanitized["explanation"]
    existing_word.feature_id = sanitized["feature_id"]
    if sanitized["has_stats"]:
        existing_word.times_practiced = sanitized["times_practiced"]
        existing_word.times_correct = sanitized["times_correct"]
    if sanitized["has_last_practiced"]:
        existing_word.last_practiced = sanitized["last_practiced"]
    if isinstance(existing_word, Word) and existing_word.normalized_english_word != sanitized["normalized_english"]:
        existing_word.normalized_english_word = sanitized["normalized_english"]


def _sanitize_import_item(item: Any) -> Dict[str, Any]:
    if not isinstance(item, dict):
        raise ValueError("invalid_record")

    required_fields = ["english_word", "translation", "language", "feature"]
    missing = [field for field in required_fields if field not in item]
    if missing:
        raise ValueError("missing_fields")

    try:
        english_word = str(item["english_word"]).strip()
        translation = str(item["translation"]).strip()
        language_name = str(item["language"]).strip()
        feature_name = str(item["feature"]).strip()
    except (TypeError, ValueError):
        raise ValueError("invalid_fields")

    if not all([english_word, translation, language_name, feature_name]):
        raise ValueError("empty_fields")

    explanation = str(item.get("explanation", "") or "").strip()

    times_practiced = _as_int(item.get("times_practiced", 0))
    times_correct = _as_int(item.get("times_correct", 0))

    if times_practiced < 0 or times_correct < 0:
        raise ValueError("negative_stats")
    if times_correct > times_practiced:
        times_correct = times_practiced

    last_practiced = None
    has_last_practiced = False
    if "last_practiced" in item and item.get("last_practiced") not in (None, "", "Nunca", "nunca"):
        last_practiced = _parse_last_practiced(item.get("last_practiced"))
        has_last_practiced = True

    return {
        "english_word": english_word,
        "normalized_english": Word.normalize_text(english_word),
        "translation": translation,
        "explanation": explanation,
        "language": language_name,
        "feature": feature_name,
        "times_practiced": times_practiced,
        "times_correct": times_correct,
        "last_practiced": last_practiced,
        "has_stats": "times_practiced" in item or "times_correct" in item,
        "has_last_practiced": has_last_practiced,
    }


def _parse_last_practiced(raw_value: Any) -> datetime | None:
    if raw_value in (None, "", "Nunca", "nunca"):
        return None

    if isinstance(raw_value, (int, float)):
        try:
            parsed = datetime.fromtimestamp(float(raw_value), tz=timezone.utc)
            return parsed.replace(tzinfo=None)
        except (OverflowError, ValueError) as error:
            raise ValueError("timestamp_invalid") from error

    if isinstance(raw_value, str):
        value = raw_value.strip()
        if not value or value.casefold() == "nunca":
            return None
        iso_sources = [value, value.replace("Z", "+00:00")]
        for candidate in iso_sources:
            try:
                parsed_iso = datetime.fromisoformat(candidate)
                if parsed_iso.tzinfo:
                    parsed_iso = parsed_iso.astimezone(timezone.utc).replace(tzinfo=None)
                return parsed_iso
            except ValueError:
                continue
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue

    raise ValueError("invalid_date_format")


def _as_int(value: Any) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError) as error:
        raise ValueError("invalid_integer") from error
