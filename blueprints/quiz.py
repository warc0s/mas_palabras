"""Blueprint containing the quiz configuration and gameplay flow."""

from __future__ import annotations

import json
import random
import uuid
from datetime import datetime
from typing import Dict, cast

from flask import Blueprint, flash, redirect, render_template, request, session, url_for
from flask.typing import ResponseReturnValue
from sqlalchemy import and_, or_
from sqlalchemy.orm import selectinload

from utils.database import db
from utils.forms import QuizConfigForm, QuizForm
from utils.models import Feature, Language, QuizSession, Word
from utils.text import normalize_text


quiz_bp = Blueprint("quiz", __name__)


@quiz_bp.route("/quiz", methods=["GET", "POST"], endpoint="configure")
def configure_quiz() -> ResponseReturnValue:
    """Render the quiz configuration view and start a new session."""
    config_form = QuizConfigForm()

    languages = Language.query.filter_by(active=True).order_by(Language.language).all()
    features = Feature.query.filter_by(active=True).order_by(Feature.feature).all()

    config_form.language.choices = [(0, "Todos los idiomas")] + [
        (language.id, language.language) for language in languages
    ]
    config_form.feature.choices = [(0, "Todas las características")] + [
        (feature.id, feature.feature) for feature in features
    ]

    if config_form.validate_on_submit():
        return _start_quiz_session(config_form)

    return render_template("quiz_config.html", form=config_form)


@quiz_bp.route("/quiz_question", methods=["GET", "POST"], endpoint="question")
def quiz_question() -> ResponseReturnValue:
    """Display the active quiz question or process the submitted answer."""
    if "quiz_session_id" not in session:
        flash("No hay sesión de quiz activa. Configura un nuevo quiz.", "warning")
        return redirect(url_for("quiz.configure"))

    if request.method == "POST":
        return _process_quiz_answer()

    return _get_next_question()


@quiz_bp.route("/end_quiz", endpoint="end")
def end_quiz() -> ResponseReturnValue:
    """Force the active quiz session to finish."""
    quiz_session = _get_active_quiz_session()
    if quiz_session and not quiz_session.is_completed:
        quiz_session.is_completed = True
        db.session.commit()
    _clear_quiz_cookie()
    flash("Quiz terminado.", "info")
    return redirect(url_for("quiz.configure"))


def _start_quiz_session(config_form: QuizConfigForm) -> ResponseReturnValue:
    active_quiz = _get_active_quiz_session()
    if active_quiz and not active_quiz.is_completed:
        active_quiz.is_completed = True
        db.session.commit()
    _clear_quiz_cookie()

    query = Word.query
    if config_form.language.data:
        query = query.filter(Word.language_id == config_form.language.data)
    if config_form.feature.data:
        query = query.filter(Word.feature_id == config_form.feature.data)

    if config_form.only_difficult.data == "needs_practice":
        query = query.filter(
            or_(
                Word.times_practiced < 3,
                and_(
                    Word.times_practiced > 0,
                    (Word.times_correct * 100.0 / Word.times_practiced) < 70,
                ),
            )
        )
    elif config_form.only_difficult.data == "new":
        query = query.filter(Word.times_practiced == 0)

    word_ids = [row.id for row in query.with_entities(Word.id).all()]
    if not word_ids:
        flash("No hay palabras disponibles con los filtros seleccionados.", "warning")
        return redirect(url_for("quiz.configure"))

    session_id = str(uuid.uuid4())
    random.shuffle(word_ids)

    quiz_session = QuizSession(
        session_id=session_id,
        total_questions=0,
        correct_answers=0,
        current_index=0,
        is_completed=False,
        created_at=datetime.utcnow(),
    )
    quiz_session.set_word_ids(word_ids)
    quiz_session.quiz_config = json.dumps(
        {
            "quiz_type": config_form.quiz_type.data,
            "language": config_form.language.data,
            "feature": config_form.feature.data,
            "only_difficult": config_form.only_difficult.data,
            "pool_size": len(word_ids),
        }
    )

    db.session.add(quiz_session)
    db.session.commit()

    session["quiz_session_id"] = session_id

    flash(f"Quiz iniciado con {len(word_ids)} palabras disponibles.", "info")
    return redirect(url_for("quiz.question"))


def _get_next_question() -> ResponseReturnValue:
    quiz_session = _get_active_quiz_session()
    if not quiz_session:
        _clear_quiz_cookie()
        flash("No hay sesión de quiz activa. Configura un nuevo quiz.", "warning")
        return redirect(url_for("quiz.configure"))

    if quiz_session.is_completed:
        _clear_quiz_cookie()
        flash("La sesión de quiz ya fue completada. Inicia una nueva.", "info")
        return redirect(url_for("quiz.configure"))

    word_ids = quiz_session.get_word_ids()
    total_pool = len(word_ids)

    if total_pool == 0:
        quiz_session.is_completed = True
        db.session.commit()
        _finalize_quiz(quiz_session)
        return redirect(url_for("quiz.configure"))

    skip_requested = request.args.get("skip", default=0, type=int)
    if skip_requested:
        completed = _advance_quiz_session(quiz_session, correct=False, total_pool=total_pool, count_attempt=True)
        db.session.commit()
        if completed:
            _finalize_quiz(quiz_session)
            return redirect(url_for("quiz.configure"))

    advanced_missing = False
    word: Word | None = None
    while quiz_session.current_index < total_pool:
        current_word_id = word_ids[quiz_session.current_index]
        word = (
            Word.query.options(selectinload(Word.language), selectinload(Word.feature))
            .filter_by(id=current_word_id)
            .one_or_none()
        )
        if word:
            break
        _advance_quiz_session(quiz_session, correct=False, total_pool=total_pool, count_attempt=False)
        advanced_missing = True
    else:
        db.session.commit()
        _finalize_quiz(quiz_session)
        return redirect(url_for("quiz.configure"))

    if advanced_missing:
        db.session.commit()

    if word is None:
        db.session.commit()
        _finalize_quiz(quiz_session)
        return redirect(url_for("quiz.configure"))

    assert word is not None

    config: Dict[str, object] = {}
    if quiz_session.quiz_config:
        try:
            config = json.loads(quiz_session.quiz_config)
        except json.JSONDecodeError:
            config = {}

    quiz_type = config.get("quiz_type", "to_spanish")
    if quiz_type == "mixed":
        quiz_type = "to_spanish" if quiz_session.total_questions % 2 == 0 else "to_original"

    form = QuizForm()
    stats = {
        "answered": quiz_session.total_questions,
        "correct_answers": quiz_session.correct_answers,
        "total_available": total_pool,
    }

    return render_template(
        "quiz.html",
        form=form,
        word=word,
        quiz_type=quiz_type,
        stats=stats,
        progress=quiz_session.total_questions,
        session_id=quiz_session.session_id,
    )


def _process_quiz_answer() -> ResponseReturnValue:
    quiz_session = _get_active_quiz_session()
    if not quiz_session or quiz_session.is_completed:
        _clear_quiz_cookie()
        flash("Sesión de quiz expirada. Inicia un nuevo quiz.", "warning")
        return redirect(url_for("quiz.configure"))

    form = QuizForm()

    if not form.answer.validate(form):
        flash("Debes escribir una respuesta.", "error")
        return redirect(url_for("quiz.question"))

    answer = form.answer.data.strip()
    word_id_raw = form.word_id.data
    quiz_type = form.quiz_type.data
    form_session_id = form.session_id.data

    if not word_id_raw:
        flash("Error: ID de palabra no encontrado.", "error")
        return redirect(url_for("quiz.question"))

    try:
        word_id = int(word_id_raw)
    except (TypeError, ValueError):
        flash("Error: ID de palabra inválido.", "error")
        return redirect(url_for("quiz.question"))

    word = db.session.get(Word, word_id)
    if not word:
        flash("La palabra seleccionada no existe.", "error")
        return redirect(url_for("quiz.question"))

    if form_session_id and form_session_id != quiz_session.session_id:
        flash("La sesión proporcionada no es válida.", "warning")
        return redirect(url_for("quiz.configure"))

    word_ids = quiz_session.get_word_ids()
    total_pool = len(word_ids)

    if quiz_session.current_index >= total_pool:
        quiz_session.is_completed = True
        db.session.commit()
        _finalize_quiz(quiz_session)
        return redirect(url_for("quiz.configure"))

    expected_word_id = word_ids[quiz_session.current_index]
    if expected_word_id != word.id:
        flash("La pregunta ya fue respondida o no es válida.", "warning")
        return redirect(url_for("quiz.question"))

    correct_answer = word.translation if quiz_type == "to_spanish" else word.english_word

    user_normalized = normalize_text(answer)
    correct_normalized = normalize_text(correct_answer)
    is_correct = user_normalized == correct_normalized

    word.times_practiced += 1
    if is_correct:
        word.times_correct += 1
    word.last_practiced = datetime.utcnow()

    completed = _advance_quiz_session(quiz_session, correct=is_correct, total_pool=total_pool)

    try:
        db.session.commit()
    except Exception:  # pragma: no cover - defensive path
        db.session.rollback()
        flash("Error al guardar el progreso.", "error")
        return redirect(url_for("quiz.question"))

    if is_correct:
        flash("¡Correcto! Excelente trabajo.", "success")
    else:
        flash(f'Incorrecto. La respuesta correcta era: "{correct_answer}"', "error")

    if completed:
        _finalize_quiz(quiz_session)
        return redirect(url_for("quiz.configure"))

    return redirect(url_for("quiz.question"))


def _advance_quiz_session(
    quiz_session: QuizSession, *, correct: bool, total_pool: int, count_attempt: bool = True
) -> bool:
    if count_attempt:
        quiz_session.total_questions += 1
        if correct:
            quiz_session.correct_answers += 1
    quiz_session.current_index += 1
    if quiz_session.current_index >= total_pool:
        quiz_session.is_completed = True
        return True
    return False


def _get_active_quiz_session() -> QuizSession | None:
    session_id = session.get("quiz_session_id")
    if not session_id:
        return None
    return cast(QuizSession | None, QuizSession.query.filter_by(session_id=session_id).first())


def _clear_quiz_cookie() -> None:
    session.pop("quiz_session_id", None)


def _finalize_quiz(quiz_session: QuizSession) -> None:
    accuracy = (
        (quiz_session.correct_answers / quiz_session.total_questions) * 100
        if quiz_session.total_questions
        else 0.0
    )
    message = (
        "¡Quiz completado! Respondiste "
        f"{quiz_session.correct_answers}/{quiz_session.total_questions} "
        f"correctamente ({accuracy:.1f}%)"
    )
    _clear_quiz_cookie()
    flash(message, "success")
