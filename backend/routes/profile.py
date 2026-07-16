"""
profile.py — User Profile Routes
GET  /api/user/profile
PUT  /api/user/profile
PUT  /api/user/password
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from .auth import validate_password

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({'data': user.to_dict()}), 200


@profile_bp.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()

    if 'username' in data:
        new_username = data['username'].strip()
        if len(new_username) < 3:
            return jsonify({'message': 'Username must be at least 3 characters'}), 400
        # Check uniqueness
        existing = User.query.filter_by(username=new_username).first()
        if existing and existing.id != user_id:
            return jsonify({'message': 'Username already taken'}), 409
        user.username = new_username

    if 'bio' in data:
        user.bio = data['bio'][:500]  # Limit bio length

    if 'preferred_mode' in data:
        user.preferred_mode = data['preferred_mode']

    if 'preferred_duration' in data:
        user.preferred_duration = data['preferred_duration']

    db.session.commit()

    return jsonify({
        'message': 'Profile updated',
        'data': user.to_dict(),
    }), 200


@profile_bp.route('/user/password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user's password."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    current = data.get('current_password', '')
    new_pw = data.get('new_password', '')

    if not user.check_password(current):
        return jsonify({'message': 'Current password is incorrect'}), 401

    password_errors = validate_password(new_pw)
    if password_errors:
        return jsonify({
            'message': 'New password must include ' + ', '.join(password_errors),
            'missing_rules': password_errors,
        }), 400

    user.set_password(new_pw)
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200
