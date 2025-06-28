from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__, static_folder="../../client/build", static_url_path="/")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev")
    app.json.compact = False

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    CORS(app)

    # Import and register blueprints
    from .controllers.movie_controller import movie_bp
    from .controllers.user_controller import user_bp
    app.register_blueprint(movie_bp)
    app.register_blueprint(user_bp)

    return app
