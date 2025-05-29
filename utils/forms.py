from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, SubmitField, TextAreaField, SelectField, HiddenField
from wtforms.validators import DataRequired, Length, ValidationError
from utils.models import Word
import unicodedata

def normalize_text(text):
    """Normaliza texto removiendo acentos para comparación"""
    return ''.join(c for c in unicodedata.normalize('NFD', text.lower()) 
                   if unicodedata.category(c) != 'Mn')

class WordForm(FlaskForm):
    english_word = StringField('Palabra', 
                              validators=[DataRequired(), Length(min=1, max=100)])
    translation = StringField('Traducción', 
                             validators=[DataRequired(), Length(min=1, max=100)])
    explanation = TextAreaField('Explicación', 
                               validators=[Length(max=300)])
    language = SelectField('Idioma', coerce=int, validators=[DataRequired()])
    feature = SelectField('Característica', coerce=int, validators=[DataRequired()])
    submit = SubmitField('Guardar')

    def __init__(self, word_id=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.word_id = word_id

    def validate_english_word(self, field):
        """Valida que no exista duplicado"""
        query = Word.query.filter_by(
            english_word=field.data.strip(),
            language_id=self.language.data
        )
        if self.word_id:
            query = query.filter(Word.id != self.word_id)
        
        existing = query.first()
        if existing:
            raise ValidationError(f'La palabra "{field.data}" ya existe en este idioma.')

class QuizForm(FlaskForm):
    answer = StringField('Tu Respuesta', validators=[DataRequired()])
    word_id = HiddenField()  # SIN DataRequired para evitar problemas en GET
    session_id = HiddenField()  # SIN DataRequired
    quiz_type = HiddenField()  # SIN DataRequired
    submit = SubmitField('Verificar')

class QuizConfigForm(FlaskForm):
    """Formulario para configurar el quiz"""
    language = SelectField('Filtrar por Idioma', coerce=int)
    feature = SelectField('Filtrar por Característica', coerce=int)
    quiz_type = SelectField('Tipo de Quiz', choices=[
        ('to_spanish', 'Traducir al español'),
        ('to_original', 'Traducir al idioma original'),
        ('mixed', 'Mixto')
    ], default='to_spanish')
    only_difficult = SelectField('Dificultad', choices=[
        ('all', 'Todas las palabras'),
        ('needs_practice', 'Solo palabras que necesitan práctica'),
        ('new', 'Solo palabras nuevas (no practicadas)')
    ], default='all')
    submit = SubmitField('Iniciar Quiz')

# FORMULARIOS SEPARADOS
class LanguageForm(FlaskForm):
    new_language = StringField('Nuevo Idioma', validators=[DataRequired(), Length(min=1, max=50)])
    submit = SubmitField('Agregar Idioma')

class FeatureForm(FlaskForm):
    new_feature = StringField('Nueva Característica', validators=[DataRequired(), Length(min=1, max=50)])
    submit = SubmitField('Agregar Característica')

class SearchForm(FlaskForm):
    """Formulario de búsqueda y filtros"""
    search = StringField('Buscar palabra...')
    language = SelectField('Idioma', coerce=int)
    feature = SelectField('Característica', coerce=int)
    sort_by = SelectField('Ordenar por', choices=[
        ('english_word', 'Palabra (A-Z)'),
        ('translation', 'Traducción (A-Z)'),
        ('created_at_desc', 'Más recientes'),
        ('created_at_asc', 'Más antiguas'),
        ('accuracy_desc', 'Mayor precisión'),
        ('accuracy_asc', 'Menor precisión'),
        ('needs_practice', 'Necesitan práctica')
    ], default='english_word')
    submit = SubmitField('Filtrar')

# NUEVO FORMULARIO PARA IMPORTAR
class ImportForm(FlaskForm):
    """Formulario para importar palabras desde JSON"""
    file = FileField('Archivo JSON', validators=[
        FileRequired(message='Selecciona un archivo'),
        FileAllowed(['json'], message='Solo se permiten archivos JSON')
    ])
    overwrite_duplicates = SelectField('Manejar duplicados', choices=[
        ('skip', 'Omitir palabras duplicadas'),
        ('update', 'Actualizar palabras existentes'),
        ('create_new', 'Crear como palabras nuevas (agregar sufijo)')
    ], default='skip')
    create_missing = SelectField('Idiomas/Características faltantes', choices=[
        ('create', 'Crear automáticamente'),
        ('skip', 'Omitir palabras con datos faltantes')
    ], default='create')
    submit = SubmitField('Importar Palabras')