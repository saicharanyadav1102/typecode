"""
typing_test.py — Typing Result model
"""
from datetime import datetime, timezone
from extensions import db


class TypingResult(db.Model):
    """Individual typing test results."""
    __tablename__ = 'typing_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    test_mode = db.Column(db.Enum('normal', 'programmer'), nullable=False)
    content_id = db.Column(db.Integer, nullable=False)
    content_type = db.Column(db.Enum('text', 'code'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    wpm = db.Column(db.Numeric(6, 2), nullable=False)
    cpm = db.Column(db.Numeric(8, 2), nullable=False)
    accuracy = db.Column(db.Numeric(5, 2), nullable=False)
    total_chars = db.Column(db.Integer, nullable=False)
    correct_chars = db.Column(db.Integer, nullable=False)
    incorrect_chars = db.Column(db.Integer, nullable=False)
    consistency = db.Column(db.Numeric(5, 2), default=0)
    language = db.Column(db.String(20), nullable=True)
    difficulty = db.Column(db.Enum('beginner', 'intermediate', 'advanced'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Indexes for common queries
    __table_args__ = (
        db.Index('idx_user_mode', 'user_id', 'test_mode'),
        db.Index('idx_user_date', 'user_id', 'completed_at'),
        db.Index('idx_leaderboard', 'test_mode', 'duration_seconds', 'wpm'),
    )

    @staticmethod
    def _iso_utc(value):
        if not value:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        else:
            value = value.astimezone(timezone.utc)
        return value.isoformat().replace('+00:00', 'Z')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'test_mode': self.test_mode,
            'content_id': self.content_id,
            'content_type': self.content_type,
            'duration_seconds': self.duration_seconds,
            'wpm': float(self.wpm),
            'cpm': float(self.cpm),
            'accuracy': float(self.accuracy),
            'total_chars': self.total_chars,
            'correct_chars': self.correct_chars,
            'incorrect_chars': self.incorrect_chars,
            'consistency': float(self.consistency) if self.consistency else 0,
            'language': self.language,
            'difficulty': self.difficulty,
            'completed_at': self._iso_utc(self.completed_at),
        }
