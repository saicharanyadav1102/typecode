"""
content.py — Text Content and Code Snippet models
"""
from datetime import datetime
from extensions import db


class TextContent(db.Model):
    """Text passages for normal typing mode."""
    __tablename__ = 'text_content'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Enum('beginner', 'intermediate', 'advanced'), nullable=False, index=True)
    word_count = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), default='general', index=True)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'difficulty': self.difficulty,
            'word_count': self.word_count,
            'category': self.category,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class CodeSnippet(db.Model):
    """Code snippets for programmer typing mode."""
    __tablename__ = 'code_snippets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    language = db.Column(
        db.Enum('python', 'javascript', 'java', 'c', 'cpp', 'html', 'css', 'sql'),
        nullable=False, index=True
    )
    difficulty = db.Column(db.Enum('beginner', 'intermediate', 'advanced'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Composite index for language + difficulty queries
    __table_args__ = (
        db.Index('idx_lang_diff', 'language', 'difficulty'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'language': self.language,
            'difficulty': self.difficulty,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
