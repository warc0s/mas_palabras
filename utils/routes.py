from flask import render_template, request, redirect, url_for, jsonify, flash
from utils.database import db
from utils.models import Word, Language, Feature
from utils.forms import WordForm, QuizForm, LanguageForm, FeatureForm  # ACTUALIZADO
from sqlalchemy.sql.expression import func

def register_routes(app):
    
    @app.route('/')
    def index():
        word_count = Word.query.count()
        language_count = Language.query.filter_by(active=True).count()
        feature_count = Feature.query.filter_by(active=True).count()
        return render_template('index.html', 
                             word_count=word_count,
                             language_count=language_count,
                             feature_count=feature_count)

    @app.route('/settings', methods=['GET', 'POST'])
    def settings():
        language_form = LanguageForm()
        feature_form = FeatureForm()
        
        # Manejar formulario de idiomas
        if language_form.validate_on_submit() and 'language_submit' in request.form:
            language_name = language_form.new_language.data.strip()
            existing = Language.query.filter_by(language=language_name).first()
            if existing:
                if not existing.active:
                    existing.active = True
                    db.session.commit()
                    flash(f'Idioma "{language_name}" reactivado exitosamente.', 'success')
                else:
                    flash(f'El idioma "{language_name}" ya existe.', 'warning')
            else:
                new_language = Language(language=language_name, active=True)
                db.session.add(new_language)
                db.session.commit()
                flash(f'Idioma "{language_name}" agregado exitosamente.', 'success')
            return redirect(url_for('settings'))
        
        # Manejar formulario de características
        if feature_form.validate_on_submit() and 'feature_submit' in request.form:
            feature_name = feature_form.new_feature.data.strip()
            existing = Feature.query.filter_by(feature=feature_name).first()
            if existing:
                if not existing.active:
                    existing.active = True
                    db.session.commit()
                    flash(f'Característica "{feature_name}" reactivada exitosamente.', 'success')
                else:
                    flash(f'La característica "{feature_name}" ya existe.', 'warning')
            else:
                new_feature = Feature(feature=feature_name, active=True)
                db.session.add(new_feature)
                db.session.commit()
                flash(f'Característica "{feature_name}" agregada exitosamente.', 'success')
            return redirect(url_for('settings'))
        
        # Obtener listas para mostrar
        languages = Language.query.filter_by(active=True).order_by('language').all()
        features = Feature.query.filter_by(active=True).order_by('feature').all()
        
        return render_template('settings.html', 
                             language_form=language_form, 
                             feature_form=feature_form,
                             languages=languages, 
                             features=features)

    # NUEVAS RUTAS PARA ELIMINAR
    @app.route('/delete_language/<int:id>')
    def delete_language(id):
        language = Language.query.get_or_404(id)
        word_count = Word.query.filter_by(language_id=id).count()
        
        if word_count > 0:
            language.active = False
            db.session.commit()
            flash(f'Idioma "{language.language}" desactivado. Las {word_count} palabras asociadas se mantienen.', 'info')
        else:
            db.session.delete(language)
            db.session.commit()
            flash(f'Idioma "{language.language}" eliminado completamente.', 'success')
        
        return redirect(url_for('settings'))

    @app.route('/delete_feature/<int:id>')
    def delete_feature(id):
        feature = Feature.query.get_or_404(id)
        word_count = Word.query.filter_by(feature_id=id).count()
        
        if word_count > 0:
            feature.active = False
            db.session.commit()
            flash(f'Característica "{feature.feature}" desactivada. Las {word_count} palabras asociadas se mantienen.', 'info')
        else:
            db.session.delete(feature)
            db.session.commit()
            flash(f'Característica "{feature.feature}" eliminada completamente.', 'success')
        
        return redirect(url_for('settings'))

    @app.route('/maspalabras', methods=['GET', 'POST'])
    def maspalabras():
        form = WordForm()
        # SOLO IDIOMAS Y CARACTERÍSTICAS ACTIVOS
        form.language.choices = [(l.id, l.language) for l in Language.query.filter_by(active=True).order_by('language').all()]
        form.feature.choices = [(f.id, f.feature) for f in Feature.query.filter_by(active=True).order_by('feature').all()]
        
        if form.validate_on_submit():
            word = Word(
                english_word=form.english_word.data.strip(),
                translation=form.translation.data.strip(),
                explanation=form.explanation.data.strip() if form.explanation.data else '',
                language_id=form.language.data,
                feature_id=form.feature.data
            )
            db.session.add(word)
            db.session.commit()
            flash('Palabra agregada exitosamente!', 'success')
            return redirect(url_for('verpalabras'))
        
        return render_template('maspalabras.html', form=form)

    @app.route('/verpalabras')
    def verpalabras():
        words = Word.query.order_by('english_word').all()
        return render_template('verpalabras.html', words=words)

    @app.route('/get_word/<int:id>')
    def get_word(id):
        word = Word.query.get_or_404(id)
        return jsonify(word.to_dict())

    @app.route('/edit/<int:id>', methods=['GET', 'POST'])
    def edit(id):
        word = Word.query.get_or_404(id)
        form = WordForm()
        
        # SOLO IDIOMAS Y CARACTERÍSTICAS ACTIVOS para el dropdown
        form.language.choices = [(l.id, l.language) for l in Language.query.filter_by(active=True).order_by('language').all()]
        form.feature.choices = [(f.id, f.feature) for f in Feature.query.filter_by(active=True).order_by('feature').all()]

        if form.validate_on_submit():
            word.english_word = form.english_word.data.strip()
            word.translation = form.translation.data.strip()
            word.explanation = form.explanation.data.strip() if form.explanation.data else ''
            word.language_id = form.language.data
            word.feature_id = form.feature.data
            
            db.session.commit()
            flash('Palabra actualizada exitosamente!', 'success')
            return redirect(url_for('verpalabras'))

        elif request.method == 'GET':
            form.english_word.data = word.english_word
            form.translation.data = word.translation
            form.explanation.data = word.explanation
            form.language.data = word.language_id
            form.feature.data = word.feature_id

        return render_template('edit.html', form=form, word=word)

    @app.route('/delete/<int:id>')
    def delete(id):
        word = Word.query.get_or_404(id)
        db.session.delete(word)
        db.session.commit()
        flash('Palabra eliminada exitosamente!', 'success')
        return redirect(url_for('verpalabras'))

    @app.route('/practicar', methods=['GET', 'POST'])
    def quiz():
        form = QuizForm()
        word = Word.query.order_by(func.random()).first()
        
        if not word:
            flash('No hay palabras disponibles para practicar. Agrega algunas primero!', 'warning')
            return redirect(url_for('maspalabras'))
        
        if form.validate_on_submit():
            user_answer = form.answer.data.strip().lower()
            correct_answer = word.translation.lower()
            
            if user_answer == correct_answer:
                flash('¡Correcto! Excelente trabajo.', 'success')
            else:
                flash(f'Incorrecto. La respuesta correcta era: {word.translation}', 'error')
            
            return redirect(url_for('quiz'))
        
        return render_template('quiz.html', form=form, word=word)