from flask import render_template, request, redirect, url_for, jsonify, flash, session
from utils.database import db
from utils.models import Word, Language, Feature, QuizSession
from utils.forms import WordForm, QuizForm, LanguageForm, FeatureForm, SearchForm, QuizConfigForm, ImportForm, normalize_text
from sqlalchemy.sql.expression import func, case
from sqlalchemy import or_, desc, asc, and_
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import os

def register_routes(app):
    
    @app.route('/')
    def index():
        word_count = Word.query.count()
        language_count = Language.query.filter_by(active=True).count()
        feature_count = Feature.query.filter_by(active=True).count()
        
        # Estadísticas adicionales - CORREGIDO
        total_practiced = db.session.query(func.sum(Word.times_practiced)).scalar() or 0
        
        # Corregir el cálculo de precisión promedio
        if word_count > 0:
            # Calcular promedio solo de palabras que han sido practicadas
            avg_accuracy_result = db.session.query(
                func.avg(Word.times_correct * 100.0 / Word.times_practiced)
            ).filter(Word.times_practiced > 0).scalar()
            avg_accuracy = round(avg_accuracy_result, 1) if avg_accuracy_result else 0
        else:
            avg_accuracy = 0
        
        # Contar palabras que necesitan práctica - CORREGIDO
        words_need_practice = Word.query.filter(
            or_(
                Word.times_practiced < 3,
                Word.times_practiced == 0,
                (Word.times_practiced > 0) & 
                (Word.times_correct * 100.0 / Word.times_practiced < 70)
            )
        ).count()
        
        return render_template('index.html', 
                             word_count=word_count,
                             language_count=language_count,
                             feature_count=feature_count,
                             total_practiced=total_practiced,
                             avg_accuracy=avg_accuracy,
                             words_need_practice=words_need_practice)

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
        languages = Language.query.filter_by(active=True).order_by('language').all()
        features = Feature.query.filter_by(active=True).order_by('feature').all()
        
        form.language.choices = [(l.id, l.language) for l in languages]
        form.feature.choices = [(f.id, f.feature) for f in features]
        
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
        
        return render_template('maspalabras.html', form=form, languages=languages)

    @app.route('/verpalabras')
    def verpalabras():
        search_form = SearchForm()
        
        # Configurar opciones del formulario
        languages = Language.query.filter_by(active=True).order_by('language').all()
        features = Feature.query.filter_by(active=True).order_by('feature').all()
        
        search_form.language.choices = [(0, 'Todos los idiomas')] + [(l.id, l.language) for l in languages]
        search_form.feature.choices = [(0, 'Todas las características')] + [(f.id, f.feature) for f in features]
        
        # Construir consulta base
        query = Word.query
        
        # Aplicar filtros de búsqueda
        search_term = request.args.get('search', '').strip()
        if search_term:
            query = query.filter(
                or_(
                    Word.english_word.ilike(f'%{search_term}%'),
                    Word.translation.ilike(f'%{search_term}%'),
                    Word.explanation.ilike(f'%{search_term}%')
                )
            )
        
        # Filtro por idioma
        language_filter = request.args.get('language', 0, type=int)
        if language_filter:
            query = query.filter(Word.language_id == language_filter)
        
        # Filtro por característica
        feature_filter = request.args.get('feature', 0, type=int)
        if feature_filter:
            query = query.filter(Word.feature_id == feature_filter)
        
        # Ordenamiento - CORREGIDO
        sort_by = request.args.get('sort_by', 'english_word')
        if sort_by == 'english_word':
            query = query.order_by(Word.english_word)
        elif sort_by == 'translation':
            query = query.order_by(Word.translation)
        elif sort_by == 'created_at_desc':
            query = query.order_by(desc(Word.created_at))
        elif sort_by == 'created_at_asc':
            query = query.order_by(Word.created_at)
        elif sort_by == 'accuracy_desc':
            # Ordenar por precisión (solo palabras practicadas)
            query = query.filter(Word.times_practiced > 0).order_by(
                desc(Word.times_correct * 100.0 / Word.times_practiced)
            )
        elif sort_by == 'accuracy_asc':
            query = query.filter(Word.times_practiced > 0).order_by(
                Word.times_correct * 100.0 / Word.times_practiced
            )
        elif sort_by == 'needs_practice':
            # Ordenar poniendo primero las que necesitan práctica
            query = query.order_by(
                desc(
                    case(
                        [(Word.times_practiced < 3, 1)],  # Si practicada menos de 3 veces
                        else_=case(
                            [(Word.times_practiced == 0, 2)],  # Si nunca practicada
                            else_=case(
                                [(Word.times_correct * 100.0 / Word.times_practiced < 70, 3)],  # Si precisión baja
                                else_=0
                            )
                        )
                    )
                ),
                Word.english_word
            )
        
        words = query.all()
        
        # Prellenar el formulario con valores actuales
        search_form.search.data = search_term
        search_form.language.data = language_filter
        search_form.feature.data = feature_filter
        search_form.sort_by.data = sort_by
        
        return render_template('verpalabras.html', words=words, search_form=search_form)

    @app.route('/get_word/<int:id>')
    def get_word(id):
        word = Word.query.get_or_404(id)
        return jsonify(word.to_dict())

    @app.route('/edit/<int:id>', methods=['GET', 'POST'])
    def edit(id):
        word = Word.query.get_or_404(id)
        form = WordForm(word_id=id)
        
        # SOLO IDIOMAS Y CARACTERÍSTICAS ACTIVOS para el dropdown
        languages = Language.query.filter_by(active=True).order_by('language').all()
        features = Feature.query.filter_by(active=True).order_by('feature').all()
        
        form.language.choices = [(l.id, l.language) for l in languages]
        form.feature.choices = [(f.id, f.feature) for f in features]

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

        return render_template('edit.html', form=form, word=word, languages=languages)

    @app.route('/delete/<int:id>')
    def delete(id):
        word = Word.query.get_or_404(id)
        db.session.delete(word)
        db.session.commit()
        flash('Palabra eliminada exitosamente!', 'success')
        return redirect(url_for('verpalabras'))

    # NUEVA RUTA PARA IMPORTAR
    @app.route('/import_words', methods=['GET', 'POST'])
    def import_words():
        form = ImportForm()
        
        if form.validate_on_submit():
            try:
                # Leer el archivo JSON
                file = form.file.data
                file_content = file.read().decode('utf-8')
                data = json.loads(file_content)
                
                # Validar que es una lista
                if not isinstance(data, list):
                    flash('El archivo JSON debe contener una lista de palabras.', 'error')
                    return redirect(url_for('import_words'))
                
                # Procesar la importación
                result = process_import(data, form.overwrite_duplicates.data, form.create_missing.data)
                
                # Mostrar resultados
                if result['success'] > 0:
                    flash(f'¡Importación exitosa! {result["success"]} palabras importadas.', 'success')
                
                if result['skipped'] > 0:
                    flash(f'{result["skipped"]} palabras omitidas (duplicadas o inválidas).', 'info')
                
                if result['errors'] > 0:
                    flash(f'{result["errors"]} palabras con errores.', 'warning')
                
                if result['created_languages']:
                    flash(f'Idiomas creados: {", ".join(result["created_languages"])}', 'info')
                
                if result['created_features']:
                    flash(f'Características creadas: {", ".join(result["created_features"])}', 'info')
                
                return redirect(url_for('verpalabras'))
                
            except json.JSONDecodeError:
                flash('Error: El archivo no contiene JSON válido.', 'error')
            except Exception as e:
                flash(f'Error al procesar el archivo: {str(e)}', 'error')
        
        return render_template('import_words.html', form=form)

    def process_import(data, overwrite_mode, create_missing_mode):
        """Procesa la importación de palabras"""
        result = {
            'success': 0,
            'skipped': 0,
            'errors': 0,
            'created_languages': [],
            'created_features': []
        }
        
        required_fields = ['english_word', 'translation', 'language', 'feature']
        
        for item in data:
            try:
                # Validar campos requeridos
                if not all(field in item for field in required_fields):
                    result['errors'] += 1
                    continue
                
                # Validar que los campos no estén vacíos
                if not all(str(item[field]).strip() for field in required_fields):
                    result['errors'] += 1
                    continue
                
                # Obtener o crear idioma
                language = Language.query.filter_by(language=item['language']).first()
                if not language:
                    if create_missing_mode == 'create':
                        language = Language(language=item['language'], active=True)
                        db.session.add(language)
                        db.session.flush()  # Para obtener el ID
                        result['created_languages'].append(item['language'])
                    else:
                        result['skipped'] += 1
                        continue
                
                # Obtener o crear característica
                feature = Feature.query.filter_by(feature=item['feature']).first()
                if not feature:
                    if create_missing_mode == 'create':
                        feature = Feature(feature=item['feature'], active=True)
                        db.session.add(feature)
                        db.session.flush()  # Para obtener el ID
                        result['created_features'].append(item['feature'])
                    else:
                        result['skipped'] += 1
                        continue
                
                # Verificar duplicados
                existing_word = Word.query.filter_by(
                    english_word=item['english_word'].strip(),
                    language_id=language.id
                ).first()
                
                if existing_word:
                    if overwrite_mode == 'skip':
                        result['skipped'] += 1
                        continue
                    elif overwrite_mode == 'update':
                        # Actualizar palabra existente
                        existing_word.translation = item['translation'].strip()
                        existing_word.explanation = item.get('explanation', '').strip()
                        existing_word.feature_id = feature.id
                        result['success'] += 1
                        continue
                    elif overwrite_mode == 'create_new':
                        # Crear con sufijo
                        base_word = item['english_word'].strip()
                        counter = 1
                        new_word = f"{base_word}_{counter}"
                        
                        while Word.query.filter_by(english_word=new_word, language_id=language.id).first():
                            counter += 1
                            new_word = f"{base_word}_{counter}"
                        
                        item['english_word'] = new_word
                
                # Crear nueva palabra
                new_word = Word(
                    english_word=item['english_word'].strip(),
                    translation=item['translation'].strip(),
                    explanation=item.get('explanation', '').strip(),
                    language_id=language.id,
                    feature_id=feature.id,
                    times_practiced=item.get('times_practiced', 0),
                    times_correct=item.get('times_correct', 0),
                    last_practiced=datetime.strptime(item['last_practiced'], '%d/%m/%Y') if item.get('last_practiced') and item['last_practiced'] != 'Nunca' else None
                )
                
                db.session.add(new_word)
                result['success'] += 1
                
            except Exception as e:
                result['errors'] += 1
                continue
        
        # Confirmar cambios
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
        
        return result

    @app.route('/practicar', methods=['GET', 'POST'])
    def quiz():
        # Si es POST, procesar respuesta
        if request.method == 'POST':
            return process_quiz_answer()
        
        # Si es GET, mostrar configuración o pregunta
        config_form = QuizConfigForm()
        
        # Configurar opciones del formulario
        languages = Language.query.filter_by(active=True).order_by('language').all()
        features = Feature.query.filter_by(active=True).order_by('feature').all()
        
        config_form.language.choices = [(0, 'Todos los idiomas')] + [(l.id, l.language) for l in languages]
        config_form.feature.choices = [(0, 'Todas las características')] + [(f.id, f.feature) for f in features]
        
        # Si no hay sesión activa, mostrar configuración
        if 'quiz_session_id' not in session:
            if config_form.validate_on_submit():
                return start_quiz_session(config_form)
            return render_template('quiz_config.html', form=config_form)
        
        # Obtener siguiente pregunta
        return get_next_question()

    def start_quiz_session(config_form):
        """Inicia una nueva sesión de quiz"""
        # Limpiar sesión anterior
        session.pop('quiz_session_id', None)
        session.pop('used_word_ids', None)
        session.pop('quiz_config', None)
        session.pop('quiz_stats', None)
        
        # Construir consulta según filtros
        query = Word.query
        
        if config_form.language.data:
            query = query.filter(Word.language_id == config_form.language.data)
        
        if config_form.feature.data:
            query = query.filter(Word.feature_id == config_form.feature.data)
        
        # CORREGIDO: Filtrar por dificultad con mejor manejo
        if config_form.only_difficult.data == 'needs_practice':
            query = query.filter(
                or_(
                    Word.times_practiced < 3,
                    Word.times_practiced == 0,
                    and_(
                        Word.times_practiced > 0,
                        (Word.times_correct * 100.0 / Word.times_practiced) < 70
                    )
                )
            )
        elif config_form.only_difficult.data == 'new':
            query = query.filter(Word.times_practiced == 0)
        
        available_words = query.all()
        
        if not available_words:
            flash('No hay palabras disponibles con los filtros seleccionados.', 'warning')
            return redirect(url_for('quiz'))
        
        # Crear sesión
        session_id = str(uuid.uuid4())
        session['quiz_session_id'] = session_id
        session['used_word_ids'] = []
        session['quiz_config'] = {
            'quiz_type': config_form.quiz_type.data,
            'language': config_form.language.data,
            'feature': config_form.feature.data,
            'only_difficult': config_form.only_difficult.data
        }
        session['quiz_stats'] = {
            'total_questions': 0,
            'correct_answers': 0
        }
        
        flash(f'Quiz iniciado con {len(available_words)} palabras disponibles.', 'info')
        return redirect(url_for('quiz'))

    def get_next_question():
        """Obtiene la siguiente pregunta del quiz"""
        config = session.get('quiz_config', {})
        used_ids = session.get('used_word_ids', [])
        
        # Construir consulta base
        query = Word.query
        
        # CORREGIDO: Excluir palabras usadas solo si hay IDs usados
        if used_ids:
            query = query.filter(~Word.id.in_(used_ids))
        
        # Aplicar filtros de la configuración
        if config.get('language'):
            query = query.filter(Word.language_id == config['language'])
        
        if config.get('feature'):
            query = query.filter(Word.feature_id == config['feature'])
        
        # CORREGIDO: Filtrar por dificultad con mejor manejo de división por cero
        if config.get('only_difficult') == 'needs_practice':
            query = query.filter(
                or_(
                    Word.times_practiced < 3,
                    Word.times_practiced == 0,
                    and_(
                        Word.times_practiced > 0,
                        (Word.times_correct * 100.0 / Word.times_practiced) < 70
                    )
                )
            )
        elif config.get('only_difficult') == 'new':
            query = query.filter(Word.times_practiced == 0)
        
        # CORREGIDO: Usar order_by random compatible con SQLite
        word = query.order_by(func.random()).first()
        
        if not word:
            # Sesión completada
            stats = session.get('quiz_stats', {})
            session.pop('quiz_session_id', None)
            session.pop('used_word_ids', None)
            session.pop('quiz_config', None)
            session.pop('quiz_stats', None)
            
            accuracy = (stats['correct_answers'] / stats['total_questions'] * 100) if stats['total_questions'] > 0 else 0
            flash(f'¡Quiz completado! Respondiste {stats["correct_answers"]}/{stats["total_questions"]} correctamente ({accuracy:.1f}%)', 'success')
            return redirect(url_for('quiz'))
        
        # Determinar tipo de pregunta
        quiz_type = config.get('quiz_type', 'to_spanish')
        if quiz_type == 'mixed':
            quiz_type = 'to_spanish' if len(used_ids) % 2 == 0 else 'to_original'
        
        form = QuizForm()
        form.word_id.data = str(word.id)  # CORREGIDO: Convertir a string
        form.session_id.data = session['quiz_session_id']
        form.quiz_type.data = quiz_type
        
        stats = session.get('quiz_stats', {'total_questions': 0, 'correct_answers': 0})
        progress = len(used_ids)
        
        return render_template('quiz.html', form=form, word=word, 
                             quiz_type=quiz_type, stats=stats, progress=progress)

    def process_quiz_answer():
        """Procesa la respuesta del quiz"""
        form = QuizForm()
        
        if not form.validate_on_submit():
            # CORREGIDO: Mejor manejo de errores de validación
            errors = []
            for field, field_errors in form.errors.items():
                errors.extend(field_errors)
            flash(f'Error en el formulario: {", ".join(errors)}', 'error')
            return redirect(url_for('quiz'))
        
        # CORREGIDO: Verificar que la sesión sea válida
        if 'quiz_session_id' not in session:
            flash('Sesión de quiz expirada. Inicia un nuevo quiz.', 'warning')
            return redirect(url_for('quiz'))
        
        try:
            word_id = int(form.word_id.data)  # CORREGIDO: Convertir a int
            word = Word.query.get_or_404(word_id)
        except (ValueError, TypeError):
            flash('ID de palabra inválido.', 'error')
            return redirect(url_for('quiz'))
        
        user_answer = form.answer.data.strip()
        quiz_type = form.quiz_type.data
        
        # Determinar respuesta correcta según tipo de quiz
        if quiz_type == 'to_spanish':
            correct_answer = word.translation
            question_text = word.english_word
        else:  # to_original
            correct_answer = word.english_word
            question_text = word.translation
        
        # Normalizar respuestas para comparación
        user_normalized = normalize_text(user_answer)
        correct_normalized = normalize_text(correct_answer)
        
        is_correct = user_normalized == correct_normalized
        
        # Actualizar estadísticas de la palabra
        word.times_practiced += 1
        if is_correct:
            word.times_correct += 1
        word.last_practiced = datetime.utcnow()
        
        # Actualizar estadísticas de la sesión
        stats = session.get('quiz_stats', {'total_questions': 0, 'correct_answers': 0})
        stats['total_questions'] += 1
        if is_correct:
            stats['correct_answers'] += 1
        session['quiz_stats'] = stats
        
        # Agregar palabra a usadas
        used_ids = session.get('used_word_ids', [])
        used_ids.append(word.id)
        session['used_word_ids'] = used_ids
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            flash('Error al guardar el progreso.', 'error')
            return redirect(url_for('quiz'))
        
        # Mostrar resultado
        if is_correct:
            flash('¡Correcto! Excelente trabajo.', 'success')
        else:
            flash(f'Incorrecto. La respuesta correcta era: "{correct_answer}"', 'error')
        
        return redirect(url_for('quiz'))

    @app.route('/end_quiz')
    def end_quiz():
        """Termina la sesión de quiz actual"""
        session.pop('quiz_session_id', None)
        session.pop('used_word_ids', None)
        session.pop('quiz_config', None)
        session.pop('quiz_stats', None)
        flash('Quiz terminado.', 'info')
        return redirect(url_for('quiz'))

    @app.route('/api/languages')
    def api_languages():
        """API para obtener idiomas (para JavaScript)"""
        languages = Language.query.filter_by(active=True).order_by('language').all()
        return jsonify([{'id': l.id, 'name': l.language} for l in languages])

    @app.route('/bulk_delete', methods=['POST'])
    def bulk_delete():
        """Eliminar múltiples palabras"""
        word_ids = request.json.get('word_ids', [])
        if not word_ids:
            return jsonify({'error': 'No se proporcionaron IDs'}), 400
        
        try:
            Word.query.filter(Word.id.in_(word_ids)).delete(synchronize_session=False)
            db.session.commit()
            return jsonify({'message': f'{len(word_ids)} palabras eliminadas exitosamente'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error al eliminar palabras'}), 500

    @app.route('/export_words')
    def export_words():
        """Exportar palabras como JSON"""
        words = Word.query.all()
        data = [word.to_dict() for word in words]
        
        response = jsonify(data)
        response.headers['Content-Disposition'] = 'attachment; filename=palabras.json'
        return response