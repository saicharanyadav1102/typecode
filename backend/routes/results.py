"""
results.py — Result Routes
POST /api/results — Save test result
POST /api/results/key-errors — Save per-key error data
GET  /api/results/history — Get user's test history
GET  /api/progress — Get aggregated progress
GET  /api/progress/weak-keys — Get weak keys
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.typing_test import TypingResult
from models.progress import KeyError as KeyErrorModel, UserProgress

results_bp = Blueprint('results', __name__)


@results_bp.route('/results', methods=['POST'])
@jwt_required()
def save_result():
    """Save a typing test result."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No data provided'}), 400

    # Create result record
    result = TypingResult(
        user_id=user_id,
        test_mode=data.get('test_mode', 'normal'),
        content_id=data.get('content_id', 0),
        content_type=data.get('content_type', 'text'),
        duration_seconds=data.get('duration_seconds', 0),
        wpm=data.get('wpm', 0),
        cpm=data.get('cpm', 0),
        accuracy=data.get('accuracy', 0),
        total_chars=data.get('total_chars', 0),
        correct_chars=data.get('correct_chars', 0),
        incorrect_chars=data.get('incorrect_chars', 0),
        consistency=data.get('consistency', 0),
        language=data.get('language'),
        difficulty=data.get('difficulty', 'intermediate'),
    )
    db.session.add(result)

    # Update user progress
    update_user_progress(user_id, data)

    db.session.commit()

    return jsonify({
        'status': 'success',
        'data': {
            'result_id': result.id,
            'wpm': float(result.wpm),
            'accuracy': float(result.accuracy),
        }
    }), 201


@results_bp.route('/results/key-errors', methods=['POST'])
@jwt_required()
def save_key_errors():
    """Save per-key error data from a typing test."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    key_errors = data.get('key_errors', {})
    if not key_errors:
        return jsonify({'message': 'No key error data'}), 400

    for key_char, stats in key_errors.items():
        # Find or create key error record
        record = KeyErrorModel.query.filter_by(
            user_id=user_id, key_char=key_char
        ).first()

        if record:
            # Update existing record (accumulate)
            record.error_count += stats.get('errors', 0)
            record.total_attempts += stats.get('attempts', 0)
        else:
            record = KeyErrorModel(
                user_id=user_id,
                key_char=key_char,
                error_count=stats.get('errors', 0),
                total_attempts=stats.get('attempts', 0),
            )
            db.session.add(record)

        # Recalculate error rate
        if record.total_attempts > 0:
            record.error_rate = (record.error_count / record.total_attempts) * 100

    db.session.commit()

    return jsonify({'status': 'success'}), 200


@results_bp.route('/results/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's typing test history (paginated)."""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    limit = min(limit, 50)  # Cap at 50

    results = TypingResult.query.filter_by(user_id=user_id) \
        .order_by(TypingResult.completed_at.desc()) \
        .paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        'data': [r.to_dict() for r in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200


@results_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    """Get user's aggregated progress stats."""
    user_id = int(get_jwt_identity())

    # Combine normal + programmer progress
    progress_records = UserProgress.query.filter_by(user_id=user_id).all()

    if not progress_records:
        return jsonify({
            'data': {
                'avg_wpm': 0, 'avg_accuracy': 0, 'tests_completed': 0,
                'best_wpm': 0, 'total_time_seconds': 0,
            }
        }), 200

    # Aggregate across modes
    total_tests = sum(p.tests_completed for p in progress_records)
    best_wpm = max((float(p.best_wpm) for p in progress_records), default=0)
    total_time = sum(p.total_time_seconds for p in progress_records)

    if total_tests > 0:
        avg_wpm = sum(float(p.avg_wpm) * p.tests_completed for p in progress_records) / total_tests
        avg_accuracy = sum(float(p.avg_accuracy) * p.tests_completed for p in progress_records) / total_tests
    else:
        avg_wpm = 0
        avg_accuracy = 0

    return jsonify({
        'data': {
            'avg_wpm': round(avg_wpm, 1),
            'avg_accuracy': round(avg_accuracy, 1),
            'tests_completed': total_tests,
            'best_wpm': round(best_wpm, 1),
            'total_time_seconds': total_time,
        }
    }), 200


@results_bp.route('/progress/weak-keys', methods=['GET'])
@jwt_required()
def get_weak_keys():
    """Get user's weakest keys sorted by error rate."""
    user_id = int(get_jwt_identity())

    keys = KeyErrorModel.query.filter_by(user_id=user_id) \
        .filter(KeyErrorModel.total_attempts >= 5) \
        .order_by(KeyErrorModel.error_rate.desc()) \
        .limit(20).all()

    return jsonify({
        'data': [k.to_dict() for k in keys],
    }), 200


def update_user_progress(user_id, test_data):
    """Update aggregated user progress after a test."""
    mode = test_data.get('test_mode', 'normal')

    progress = UserProgress.query.filter_by(
        user_id=user_id, test_mode=mode
    ).first()

    if not progress:
        progress = UserProgress(user_id=user_id, test_mode=mode)
        db.session.add(progress)

    wpm = test_data.get('wpm', 0)
    accuracy = test_data.get('accuracy', 0)
    duration = test_data.get('duration_seconds', 0)

    # Update running averages. New SQLAlchemy objects can still have None here
    # before database defaults are applied.
    n = progress.tests_completed or 0
    if n > 0:
        progress.avg_wpm = ((float(progress.avg_wpm) * n) + wpm) / (n + 1)
        progress.avg_accuracy = ((float(progress.avg_accuracy) * n) + accuracy) / (n + 1)
    else:
        progress.avg_wpm = wpm
        progress.avg_accuracy = accuracy

    progress.tests_completed = n + 1
    progress.total_time_seconds = (progress.total_time_seconds or 0) + duration
    progress.last_test_date = datetime.utcnow()

    if wpm > float(progress.best_wpm or 0):
        progress.best_wpm = wpm
