"""Routes package — register all blueprints."""
from .auth import auth_bp
from .typing import typing_bp
from .results import results_bp
from .leaderboard import leaderboard_bp
from .profile import profile_bp
from .admin import admin_bp


def register_routes(app):
    """Register all route blueprints with the Flask app."""
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(typing_bp, url_prefix='/api')
    app.register_blueprint(results_bp, url_prefix='/api')
    app.register_blueprint(leaderboard_bp, url_prefix='/api')
    app.register_blueprint(profile_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
