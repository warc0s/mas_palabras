from utils.database import db

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    english_word = db.Column(db.String(100), nullable=False)
    translation = db.Column(db.String(100), nullable=False)
    explanation = db.Column(db.String(300), nullable=True)
    language_id = db.Column(db.Integer, db.ForeignKey('language.id'), nullable=False)
    feature_id = db.Column(db.Integer, db.ForeignKey('feature.id'), nullable=False)

    def __repr__(self):
        return f'Word: {self.english_word}'

    def to_dict(self):
        return {
            'id': self.id,
            'english_word': self.english_word,
            'translation': self.translation,
            'explanation': self.explanation,
            'language': self.language.language if self.language else 'N/A',
            'feature': self.feature.feature if self.feature else 'N/A'
        }


class Language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    language = db.Column(db.String(50), nullable=False, unique=True)
    active = db.Column(db.Boolean, default=True, nullable=False)  # NUEVO CAMPO
    words = db.relationship('Word', backref='language', lazy=True)

    def __repr__(self):
        return self.language


class Feature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    feature = db.Column(db.String(50), nullable=False, unique=True)
    active = db.Column(db.Boolean, default=True, nullable=False)  # NUEVO CAMPO
    words = db.relationship('Word', backref='feature', lazy=True)

    def __repr__(self):
        return self.feature