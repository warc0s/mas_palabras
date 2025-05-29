from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, SelectField
from wtforms.validators import DataRequired, Length

class WordForm(FlaskForm):
    english_word = StringField('Palabra en Inglés', 
                              validators=[DataRequired(), Length(min=1, max=100)])
    translation = StringField('Traducción', 
                             validators=[DataRequired(), Length(min=1, max=100)])
    explanation = TextAreaField('Explicación', 
                               validators=[Length(max=300)])
    language = SelectField('Idioma', coerce=int, validators=[DataRequired()])
    feature = SelectField('Característica', coerce=int, validators=[DataRequired()])
    submit = SubmitField('Guardar')

class QuizForm(FlaskForm):
    answer = StringField('Tu Respuesta', validators=[DataRequired()])
    submit = SubmitField('Verificar')

# FORMULARIOS SEPARADOS
class LanguageForm(FlaskForm):
    new_language = StringField('Nuevo Idioma', validators=[DataRequired(), Length(min=1, max=50)])
    submit = SubmitField('Agregar Idioma')

class FeatureForm(FlaskForm):
    new_feature = StringField('Nueva Característica', validators=[DataRequired(), Length(min=1, max=50)])
    submit = SubmitField('Agregar Característica')