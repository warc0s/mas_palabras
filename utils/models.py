from datetime import datetime
import json
from sqlalchemy.orm import validates

from utils.text import normalize_text as normalize_text_helper

from utils.database import db

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    english_word = db.Column(db.String(100), nullable=False, index=True)
    normalized_english_word = db.Column(db.String(100), nullable=False, index=True)
    translation = db.Column(db.String(100), nullable=False)
    explanation = db.Column(db.String(300), nullable=True)
    language_id = db.Column(db.Integer, db.ForeignKey('language.id'), nullable=False, index=True)
    feature_id = db.Column(db.Integer, db.ForeignKey('feature.id'), nullable=False, index=True)
    __table_args__ = (
        db.UniqueConstraint('language_id', 'normalized_english_word', name='uq_words_language_normalized'),
    )
    
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
            'last_practiced': self.last_practiced.isoformat() if self.last_practiced else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def get_accuracy(self):
        if self.times_practiced == 0:
            return 0
        return round((self.times_correct / self.times_practiced) * 100, 1)

    def needs_practice(self):
        """Determina si la palabra necesita más práctica"""
        if self.times_practiced == 0:
            return True
        if self.times_practiced < 3:
            return True
        return self.get_accuracy() < 70

    def practice_priority(self):
        """Devuelve prioridad numérica para ordenar por necesidad de práctica."""
        if self.times_practiced == 0:
            return 3
        if self.times_practiced < 3:
            return 2
        if self.times_practiced > 0 and self.get_accuracy() < 70:
            return 1
        return 0

    @staticmethod
    def normalize_text(value: str) -> str:
        """Normaliza texto eliminando acentos y usando casefold."""
        return normalize_text_helper(value)

    def set_normalized_english(self):
        self.normalized_english_word = self.normalize_text(self.english_word)

    @validates('english_word')
    def _update_normalized(self, key, value):
        self.normalized_english_word = self.normalize_text(value)
        return value


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
    current_index = db.Column(db.Integer, default=0, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    quiz_config = db.Column(db.Text, nullable=True)

    def get_word_ids(self):
        if not self.word_ids:
            return []
        try:
            return json.loads(self.word_ids)
        except json.JSONDecodeError:
            return []

    def set_word_ids(self, ids):
        self.word_ids = json.dumps(ids)
