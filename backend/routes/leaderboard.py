"""
leaderboard.py — Leaderboard Routes
GET /api/leaderboard
"""
from flask import Blueprint, request, jsonify
from extensions import db
from models.typing_test import TypingResult
from models.user import User

leaderboard_bp = Blueprint('leaderboard', __name__)


@leaderboard_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard — top WPM scores.
    
    Query params:
        mode: 'normal' or 'programmer'
        duration: test duration in seconds
        language: for programmer mode
        page: pagination page
        limit: results per page
    """
    mode = request.args.get('mode', 'normal')
    duration = request.args.get('duration', type=int)
    language = request.args.get('language')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    limit = min(limit, 50)

    # Join with users to get usernames
    query = db.session.query(
        TypingResult, User.username
    ).join(
        User, TypingResult.user_id == User.id
    ).filter(
        TypingResult.test_mode == mode,
        User.is_active == True,
    )

    if duration:
        query = query.filter(TypingResult.duration_seconds == duration)
    if language and mode == 'programmer':
        query = query.filter(TypingResult.language == language)

    # Order by WPM descending
    query = query.order_by(TypingResult.wpm.desc())

    # Paginate
    results = query.paginate(page=page, per_page=limit, error_out=False)

    entries = []
    for result, username in results.items:
        entry = result.to_dict()
        entry['username'] = username
        entries.append(entry)

    return jsonify({
        'data': entries,
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200
