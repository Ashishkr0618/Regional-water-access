"""
backend/app.py
Main Flask application entry point for AquaScope:
Regional Water-Access Profiles from Survey Indicators Using Clustering.
"""

import os
import sys

# Silence loky core-counting warning on Windows where wmic is deprecated
os.environ.setdefault("LOKY_MAX_CPU_COUNT", "4")

# Ensure backend directory is in path
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from flask import Flask, jsonify
from flask_cors import CORS

from routes.dashboard import dashboard_bp
from routes.clustering import clustering_bp
from routes.prediction import prediction_bp
from database.db import init_db
from ml.water_quality import train_water_quality_model

_DATA_DIR = os.path.join(_BACKEND_DIR, "data")
_MODELS_DIR = os.path.join(_BACKEND_DIR, "models")
_WQ_CSV = os.path.join(_DATA_DIR, "water_quality.csv")
_MODEL_PATH = os.path.join(_MODELS_DIR, "water_quality_model.joblib")


def create_app():
    """Application factory for AquaScope Flask backend."""
    app = Flask(__name__)
    CORS(app)

    # Register API blueprints
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(clustering_bp)
    app.register_blueprint(prediction_bp)

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found", "status": 404}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error", "status": 500}), 500

    return app


def _startup():
    """Initialize database, train model if missing, pre-warm dataset."""
    os.makedirs(_MODELS_DIR, exist_ok=True)
    os.makedirs(os.path.join(_BACKEND_DIR, "database"), exist_ok=True)

    # 1. Initialize SQLite
    init_db()
    print("[startup] SQLite database initialized.")

    # 2. Train water quality classifier if missing
    if not os.path.exists(_MODEL_PATH):
        print("[startup] Water quality model not found. Training model now...")
        try:
            metrics = train_water_quality_model(_WQ_CSV, _MODEL_PATH)
            print(f"[startup] Water quality model trained successfully. Test Accuracy: {metrics['accuracy'] * 100:.2f}%")
        except Exception as e:
            print(f"[startup] Error training model: {e}")
    else:
        print("[startup] Water quality model loaded from disk.")

    # 3. Preload WASH dataset
    try:
        from routes.clustering import _ensure_data_loaded
        _ensure_data_loaded()
        print("[startup] WASH dataset preloaded successfully.")
    except Exception as e:
        print(f"[startup] Warning: Could not preload WASH dataset: {e}")


if __name__ == "__main__":
    _startup()
    app = create_app()
    print("[startup] AquaScope backend server running on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
