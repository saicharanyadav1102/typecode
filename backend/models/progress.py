"""
progress.py — Key Error and User Progress models
"""
from datetime import datetime
from extensions import db


class KeyError(db.Model):
    """Per-user, per-key error tracking.
    Tracks which keys the user mistypes most often,
    so they can focus on improving those specific keys.
    """
    __tablename__ = 'key_errors'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    key_char = db.Column(db.String(10), nullable=False)
    error_count = db.Column(db.Integer, default=0)
    total_attempts = db.Column(db.Integer, default=0)
    error_rate = db.Column(db.Numeric(5, 2), default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Unique constraint: one row per user per key
    __table_args__ = (
        db.UniqueConstraint('user_id', 'key_char', name='uk_user_key'),
        db.Index('idx_user_errors', 'user_id', 'error_rate'),
    )

    def to_dict(self):
        return {
            'key_char': self.key_char,
            'error_count': self.error_count,
            'total_attempts': self.total_attempts,
            'error_rate': float(self.error_rate) if self.error_rate else 0,
        }


class UserProgress(db.Model):
    """Aggregated progress stats per user per mode."""
    __tablename__ = 'user_progress'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    test_mode = db.Column(db.Enum('normal', 'programmer', name='progress_test_mode_enum'), nullable=False)
    avg_wpm = db.Column(db.Numeric(6, 2), default=0)
    avg_accuracy = db.Column(db.Numeric(5, 2), default=0)
    tests_completed = db.Column(db.Integer, default=0)
    best_wpm = db.Column(db.Numeric(6, 2), default=0)
    total_time_seconds = db.Column(db.Integer, default=0)
    most_errored_keys = db.Column(db.String(100), nullable=True)
    last_test_date = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'test_mode', name='uk_user_mode'),
    )

    def to_dict(self):
        return {
            'test_mode': self.test_mode,
            'avg_wpm': float(self.avg_wpm) if self.avg_wpm else 0,
            'avg_accuracy': float(self.avg_accuracy) if self.avg_accuracy else 0,
            'tests_completed': self.tests_completed,
            'best_wpm': float(self.best_wpm) if self.best_wpm else 0,
            'total_time_seconds': self.total_time_seconds,
            'most_errored_keys': self.most_errored_keys,
            'last_test_date': self.last_test_date.isoformat() if self.last_test_date else None,
        }
