"""
user.py — User and Token Blocklist models
"""
from datetime import datetime
from extensions import db, bcrypt


class User(db.Model):
    """User account model."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('user', 'admin'), default='user', nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    preferred_mode = db.Column(db.Enum('normal', 'programmer'), default='normal')
    preferred_duration = db.Column(db.Integer, default=60)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    typing_results = db.relationship('TypingResult', backref='user', lazy='dynamic')
    key_errors = db.relationship('KeyError', backref='user', lazy='dynamic')
    progress = db.relationship('UserProgress', backref='user', lazy='dynamic')

    def set_password(self, password):
        """Hash and store password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verify password against hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Serialize user to dict (no password)."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'preferred_mode': self.preferred_mode,
            'preferred_duration': self.preferred_duration,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
        }


class TokenBlocklist(db.Model):
    """Revoked JWT tokens (for logout)."""
    __tablename__ = 'token_blocklist'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jti = db.Column(db.String(255), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
