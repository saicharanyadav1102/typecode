"""
typing.py — Typing Content Routes
GET /api/texts
GET /api/code-snippets
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.sql.expression import func
from extensions import db
from models.content import TextContent, CodeSnippet

typing_bp = Blueprint('typing', __name__)


@typing_bp.route('/texts', methods=['GET'])
def get_texts():
    """Get a random text passage, optionally filtered by difficulty."""
    difficulty = request.args.get('difficulty')
    category = request.args.get('category')

    query = TextContent.query.filter_by(is_active=True)

    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    if category:
        query = query.filter_by(category=category)

    # Get a random text
    text = query.order_by(func.rand()).first()

    if not text:
        return jsonify({'message': 'No text content available'}), 404

    return jsonify({
        'data': text.to_dict(),
        'id': text.id,
        'content': text.content,
    }), 200


@typing_bp.route('/code-snippets', methods=['GET'])
def get_code_snippets():
    """Get a random code snippet, filtered by language and/or difficulty."""
    language = request.args.get('language')
    difficulty = request.args.get('difficulty')

    query = CodeSnippet.query.filter_by(is_active=True)

    if language:
        query = query.filter_by(language=language)
    if difficulty:
        query = query.filter_by(difficulty=difficulty)

    snippet = query.order_by(func.rand()).first()

    if not snippet:
        return jsonify({'message': 'No code snippets available'}), 404

    return jsonify({
        'data': snippet.to_dict(),
        'id': snippet.id,
        'content': snippet.content,
    }), 200
