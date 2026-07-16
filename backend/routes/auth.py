"""
auth.py — Authentication Routes
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
"""
from datetime import datetime
import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from extensions import db, limiter
from models.user import User, TokenBlocklist

auth_bp = Blueprint('auth', __name__)

EMAIL_RE = re.compile(
    r"^(?=.{6,254}$)(?!.*\.\.)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}"
    r"@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,24}$"
)

BLOCKED_EMAIL_DOMAINS = {
    'example.com',
    'example.net',
    'example.org',
    'mailinator.com',
    'tempmail.com',
    'temp-mail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'yopmail.com',
    'fakeemail.com',
    'fakemail.com',
}

BLOCKED_DOMAIN_SUFFIXES = (
    '.example',
    '.invalid',
    '.localhost',
    '.local',
    '.test',
)


def validate_email(email):
    """Return an email validation error message, or None when valid."""
    if not email:
        return 'Email is required'
    if not EMAIL_RE.match(email):
        return 'Enter a valid email address, such as name@domain.com'

    domain = email.rsplit('@', 1)[1].lower()
    if domain in BLOCKED_EMAIL_DOMAINS or domain.endswith(BLOCKED_DOMAIN_SUFFIXES):
        return 'Use a real email domain, not a test or disposable email'

    return None


def validate_password(password):
    """Return password rule errors."""
    errors = []
    if len(password) < 6:
        errors.append('at least 6 characters')
    if not re.search(r'[A-Z]', password):
        errors.append('one uppercase letter')
    if not re.search(r'\d', password):
        errors.append('one digit')
    if not re.search(r'[^A-Za-z0-9]', password):
        errors.append('one special character')
    return errors


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """Register a new user."""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validation
    if not username or len(username) < 3:
        return jsonify({
            'message': 'Username must be at least 3 characters',
            'field': 'username',
        }), 400
    if not re.match(r'^[A-Za-z0-9_]+$', username):
        return jsonify({
            'message': 'Username can only contain letters, numbers, and underscores',
            'field': 'username',
        }), 400

    email_error = validate_email(email)
    if email_error:
        return jsonify({'message': email_error, 'field': 'email'}), 400

    password_errors = validate_password(password)
    if password_errors:
        return jsonify({
            'message': 'Password must include ' + ', '.join(password_errors),
            'field': 'password',
            'missing_rules': password_errors,
        }), 400

    # Check uniqueness
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered', 'field': 'email'}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken', 'field': 'username'}), 409

    # Create user
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Registration successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict(),
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """Login with email and password."""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # Find user
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is deactivated'}), 403

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout — add current token to blocklist."""
    jti = get_jwt()['jti']
    exp = datetime.fromtimestamp(get_jwt()['exp'])
    user_id = int(get_jwt_identity())

    blocked = TokenBlocklist(jti=jti, user_id=user_id, expires_at=exp)
    db.session.add(blocked)
    db.session.commit()

    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Get a new access token using refresh token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)

    return jsonify({
        'access_token': access_token,
    }), 200
