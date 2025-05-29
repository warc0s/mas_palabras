from utils.database import db
from datetime import datetime

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    english_word = db.Column(db.String(100), nullable=False)
    translation = db.Column(db.String(100), nullable=False)
    explanation = db.Column(db.String(300), nullable=True)
    language_id = db.Column(db.Integer, db.ForeignKey('language.id'), nullable=False)
    feature_id = db.Column(db.Integer, db.ForeignKey('feature.id'), nullable=False)
    
    # Nuevos campos para tracking
    times_practiced = db.Column(db.Integer, default=0)
    times_correct = db.Column(db.Integer, default=0)
    last_practiced = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'Word: {self.english_word}'

    def to_dict(self):
        accuracy = (self.times_correct / self.times_practiced * 100) if self.times_practiced > 0 else 0
        return {
            'id': self.id,
            'english_word': self.english_word,
            'translation': self.translation,
            'explanation': self.explanation,
            'language': self.language.language if self.language else 'N/A',
            'feature': self.feature.feature if self.feature else 'N/A',
            'times_practiced': self.times_practiced,
            'times_correct': self.times_correct,
            'accuracy': round(accuracy, 1),
            'last_practiced': self.last_practiced.strftime('%d/%m/%Y') if self.last_practiced else 'Nunca'
        }

    def get_accuracy(self):
        if self.times_practiced == 0:
            return 0
        return round((self.times_correct / self.times_practiced) * 100, 1)

    def needs_practice(self):
        """Determina si la palabra necesita más práctica"""
        if self.times_practiced < 3:
            return True
        return self.get_accuracy() < 70


class Language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    language = db.Column(db.String(50), nullable=False, unique=True)
    active = db.Column(db.Boolean, default=True, nullable=False)
    words = db.relationship('Word', backref='language', lazy=True)

    def __repr__(self):
        return self.language


class Feature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    feature = db.Column(db.String(50), nullable=False, unique=True)
    active = db.Column(db.Boolean, default=True, nullable=False)
    words = db.relationship('Word', backref='feature', lazy=True)

    def __repr__(self):
        return self.feature


class QuizSession(db.Model):
    """Rastrea sesiones de quiz para evitar repeticiones"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(36), nullable=False)
    word_ids = db.Column(db.Text, nullable=False)  # JSON string de IDs usados
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_questions = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)