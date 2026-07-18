"""
config.py — typeCode Backend Configuration
Loads environment variables and sets Flask config.
"""
import os
from datetime import timedelta
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load .env file
load_dotenv()


def parse_csv_env(name, default_values):
    """Read a comma-separated env var and drop empty values."""
    raw = os.getenv(name)
    if not raw:
        return default_values
    return [value.strip() for value in raw.split(',') if value.strip()]


class Config:
    """Base configuration."""

    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')
    DEBUG = False
    TESTING = False

    # Database — MySQL via PyMySQL
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'typecode_db')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    _db_url = os.getenv('DATABASE_URL')
    if _db_url:
        if _db_url.startswith("postgres://"):
            _db_url = _db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif _db_url.startswith("postgresql://") and not _db_url.startswith("postgresql+"):
            _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
        try:
            scheme, rest = _db_url.split("://", 1)
            if "@" in rest:
                user_pass, host_db = rest.rsplit("@", 1)
                if ":" in user_pass:
                    user, raw_password = user_pass.split(":", 1)
                    if "@" in raw_password or "#" in raw_password or "%" in raw_password:
                        _db_url = f"{scheme}://{user}:{quote_plus(raw_password)}@{host_db}"
        except Exception:
            pass
        SQLALCHEMY_DATABASE_URI = _db_url
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASSWORD)}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 3600,
        'pool_pre_ping': True,
    }

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-me')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 900))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 2592000))
    )
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'

    # CORS
    CORS_ORIGINS = parse_csv_env('CORS_ORIGINS', ['*'])


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    CORS_ORIGINS = list(dict.fromkeys(Config.CORS_ORIGINS + [
        r'http://localhost:\d+',
        r'http://127\.0\.0\.1:\d+',
        'null',
    ]))


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


# Config map
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
