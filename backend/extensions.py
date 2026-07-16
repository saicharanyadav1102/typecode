"""
extensions.py — Flask Extensions
Initialize extensions here, attach to app in app.py
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate

# Database ORM
db = SQLAlchemy()

# JWT Authentication
jwt = JWTManager()

# Password hashing
bcrypt = Bcrypt()

# Cross-Origin Resource Sharing
cors = CORS()

# Rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"],
)

# Database migrations
migrate = Migrate()
