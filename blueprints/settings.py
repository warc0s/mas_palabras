"""Blueprint that groups the settings and catalogue configuration views."""

from __future__ import annotations

from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from flask.typing import ResponseReturnValue

from utils.database import db
from utils.forms import FeatureForm, LanguageForm
from utils.models import Feature, Language, Word


settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings", methods=["GET", "POST"], endpoint="settings")
def settings_view() -> ResponseReturnValue:
    """Render the settings page handling language and feature forms."""
    language_form = LanguageForm()
    feature_form = FeatureForm()

    if request.method == "POST":
        if language_form.language_submit.data and language_form.validate():
            language_name = language_form.new_language.data.strip()
            _handle_language_submission(language_name)
            return redirect(url_for("settings.settings"))

        if feature_form.feature_submit.data and feature_form.validate():
            feature_name = feature_form.new_feature.data.strip()
            _handle_feature_submission(feature_name)
            return redirect(url_for("settings.settings"))

    languages = Language.query.filter_by(active=True).order_by(Language.language).all()
    features = Feature.query.filter_by(active=True).order_by(Feature.feature).all()

    return render_template(
        "settings.html",
        language_form=language_form,
        feature_form=feature_form,
        languages=languages,
        features=features,
    )


@settings_bp.route("/delete_language/<int:language_id>", methods=["POST"])
def delete_language(language_id: int) -> ResponseReturnValue:
    """Delete or deactivate a language depending on its usage."""
    language = db.session.get(Language, language_id)
    if not language:
        abort(404)

    word_count = Word.query.filter_by(language_id=language_id).count()

    if word_count > 0:
        language.active = False
        db.session.commit()
        flash(
            f'Idioma "{language.language}" desactivado. Las {word_count} palabras asociadas se mantienen.',
            "info",
        )
    else:
        db.session.delete(language)
        db.session.commit()
        flash(f'Idioma "{language.language}" eliminado completamente.', "success")

    return redirect(url_for("settings.settings"))


@settings_bp.route("/delete_feature/<int:feature_id>", methods=["POST"])
def delete_feature(feature_id: int) -> ResponseReturnValue:
    """Delete or deactivate a feature depending on whether it is in use."""
    feature = db.session.get(Feature, feature_id)
    if not feature:
        abort(404)

    word_count = Word.query.filter_by(feature_id=feature_id).count()

    if word_count > 0:
        feature.active = False
        db.session.commit()
        flash(
            f'Característica "{feature.feature}" desactivada. Las {word_count} palabras asociadas se mantienen.',
            "info",
        )
    else:
        db.session.delete(feature)
        db.session.commit()
        flash(f'Característica "{feature.feature}" eliminada completamente.', "success")

    return redirect(url_for("settings.settings"))


def _handle_language_submission(language_name: str) -> None:
    existing = Language.query.filter_by(language=language_name).first()
    if existing:
        if not existing.active:
            existing.active = True
            db.session.commit()
            flash(f'Idioma "{language_name}" reactivado exitosamente.', "success")
        else:
            flash(f'El idioma "{language_name}" ya existe.', "warning")
        return

    new_language = Language(language=language_name, active=True)
    db.session.add(new_language)
    db.session.commit()
    flash(f'Idioma "{language_name}" agregado exitosamente.', "success")


def _handle_feature_submission(feature_name: str) -> None:
    existing = Feature.query.filter_by(feature=feature_name).first()
    if existing:
        if not existing.active:
            existing.active = True
            db.session.commit()
            flash(f'Característica "{feature_name}" reactivada exitosamente.', "success")
        else:
            flash(f'La característica "{feature_name}" ya existe.', "warning")
        return

    new_feature = Feature(feature=feature_name, active=True)
    db.session.add(new_feature)
    db.session.commit()
    flash(f'Característica "{feature_name}" agregada exitosamente.', "success")
