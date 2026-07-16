"""
app.py — typeCode Flask Backend
Main application entry point.
"""
import os
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager

from config import config_map
from extensions import db, jwt, bcrypt, cors, limiter, migrate
from models.user import TokenBlocklist


def create_app():
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__)

    # Load configuration
    env = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config_map.get(env, config_map['development']))

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    limiter.init_app(app)
    migrate.init_app(app, db)

    # ---- JWT callbacks ----
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        """Check if a JWT token has been revoked (logout)."""
        jti = jwt_payload['jti']
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Authorization token is required'}), 401

    # ---- Register routes ----
    from routes import register_routes
    register_routes(app)

    # ---- Health check ----
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'message': 'typeCode API is running'}), 200

    # ---- Create tables on first run ----
    with app.app_context():
        # Import all models so SQLAlchemy knows about them
        import models  # noqa: F401
        db.create_all()

    return app


# ---- Run ----
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
