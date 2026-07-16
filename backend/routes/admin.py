"""
admin.py — Admin Panel Routes
Full admin CRUD: users, text content, code snippets, analytics
"""
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models.user import User
from models.content import TextContent, CodeSnippet
from models.typing_test import TypingResult
from models.progress import KeyError as KeyErrorModel

admin_bp = Blueprint('admin', __name__)


def require_admin():
    """Check if current user is admin."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return user and user.role == 'admin'


# ---- USER MANAGEMENT ----

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    search = request.args.get('search', '')

    query = User.query
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=limit, error_out=False
    )

    return jsonify({
        'data': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages,
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    if 'role' in data:
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = data['is_active']

    db.session.commit()
    return jsonify({'message': 'User updated', 'data': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


# ---- TEXT CONTENT ----

@admin_bp.route('/texts', methods=['POST'])
@jwt_required()
def add_text():
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'message': 'Content is required'}), 400

    text = TextContent(
        content=content,
        difficulty=data.get('difficulty', 'intermediate'),
        word_count=len(content.split()),
        category=data.get('category', 'general'),
        created_by=int(get_jwt_identity()),
    )
    db.session.add(text)
    db.session.commit()
    return jsonify({'message': 'Text added', 'data': text.to_dict()}), 201


@admin_bp.route('/texts/<int:text_id>', methods=['PUT'])
@jwt_required()
def update_text(text_id):
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    text = TextContent.query.get(text_id)
    if not text:
        return jsonify({'message': 'Text not found'}), 404

    data = request.get_json()
    if 'content' in data:
        text.content = data['content']
        text.word_count = len(data['content'].split())
    if 'difficulty' in data:
        text.difficulty = data['difficulty']
    if 'category' in data:
        text.category = data['category']
    if 'is_active' in data:
        text.is_active = data['is_active']

    db.session.commit()
    return jsonify({'message': 'Text updated', 'data': text.to_dict()}), 200


@admin_bp.route('/texts/<int:text_id>', methods=['DELETE'])
@jwt_required()
def delete_text(text_id):
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    text = TextContent.query.get(text_id)
    if not text:
        return jsonify({'message': 'Text not found'}), 404

    db.session.delete(text)
    db.session.commit()
    return jsonify({'message': 'Text deleted'}), 200


# ---- CODE SNIPPETS ----

@admin_bp.route('/code-snippets', methods=['POST'])
@jwt_required()
def add_snippet():
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    snippet = CodeSnippet(
        title=data.get('title', 'Untitled'),
        content=data.get('content', ''),
        language=data.get('language', 'python'),
        difficulty=data.get('difficulty', 'intermediate'),
        description=data.get('description', ''),
        created_by=int(get_jwt_identity()),
    )
    db.session.add(snippet)
    db.session.commit()
    return jsonify({'message': 'Snippet added', 'data': snippet.to_dict()}), 201


@admin_bp.route('/code-snippets/<int:snippet_id>', methods=['PUT'])
@jwt_required()
def update_snippet(snippet_id):
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    snippet = CodeSnippet.query.get(snippet_id)
    if not snippet:
        return jsonify({'message': 'Snippet not found'}), 404

    data = request.get_json()
    for field in ['title', 'content', 'language', 'difficulty', 'description', 'is_active']:
        if field in data:
            setattr(snippet, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Snippet updated', 'data': snippet.to_dict()}), 200


@admin_bp.route('/code-snippets/<int:snippet_id>', methods=['DELETE'])
@jwt_required()
def delete_snippet(snippet_id):
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    snippet = CodeSnippet.query.get(snippet_id)
    if not snippet:
        return jsonify({'message': 'Snippet not found'}), 404

    db.session.delete(snippet)
    db.session.commit()
    return jsonify({'message': 'Snippet deleted'}), 200


# ---- ANALYTICS ----

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    if not require_admin():
        return jsonify({'message': 'Admin access required'}), 403

    # Basic analytics
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_tests = TypingResult.query.count()
    total_texts = TextContent.query.count()
    total_snippets = CodeSnippet.query.count()

    # Average WPM across all tests
    avg_wpm = db.session.query(func.avg(TypingResult.wpm)).scalar() or 0

    # Tests in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_tests = TypingResult.query.filter(
        TypingResult.completed_at >= week_ago
    ).count()

    # New users in last 7 days
    new_users = User.query.filter(User.created_at >= week_ago).count()

    return jsonify({
        'data': {
            'total_users': total_users,
            'active_users': active_users,
            'total_tests': total_tests,
            'total_texts': total_texts,
            'total_snippets': total_snippets,
            'avg_wpm': round(float(avg_wpm), 1),
            'tests_this_week': recent_tests,
            'new_users_this_week': new_users,
        }
    }), 200
