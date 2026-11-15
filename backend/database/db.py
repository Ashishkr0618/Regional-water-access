"""
backend/database/db.py
SQLite database manager for AquaScope.
Stores prediction history and dataset upload logs using Python's built-in sqlite3.
"""

import os
import sqlite3
from datetime import datetime

_DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(_DB_DIR, "aquascope.db")


def get_db_connection():
    """Create and return a connection to the SQLite database with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Table for recording water quality predictions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            ph REAL,
            hardness REAL,
            solids REAL,
            chloramines REAL,
            sulfate REAL,
            conductivity REAL,
            organic_carbon REAL,
            trihalomethanes REAL,
            turbidity REAL,
            region TEXT,
            prediction INTEGER,
            prediction_label TEXT,
            confidence REAL
        )
    """)

    # Table for tracking dataset uploads
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            filename TEXT NOT NULL,
            row_count INTEGER,
            col_count INTEGER
        )
    """)

    conn.commit()
    conn.close()


def log_prediction(params, prediction, prediction_label, confidence, region=None):
    """Insert a new prediction record into SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO predictions (
                timestamp, ph, hardness, solids, chloramines, sulfate,
                conductivity, organic_carbon, trihalomethanes, turbidity,
                region, prediction, prediction_label, confidence
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            params.get("ph"),
            params.get("Hardness"),
            params.get("Solids"),
            params.get("Chloramines"),
            params.get("Sulfate"),
            params.get("Conductivity"),
            params.get("Organic_carbon"),
            params.get("Trihalomethanes"),
            params.get("Turbidity"),
            region,
            prediction,
            prediction_label,
            confidence
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[db] Warning: Failed to log prediction: {e}")


def get_recent_predictions(limit=10):
    """Retrieve the most recent predictions from SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM predictions
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        print(f"[db] Warning: Failed to fetch predictions: {e}")
        return []


def log_upload(filename, row_count, col_count):
    """Log dataset upload event into SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO uploads (timestamp, filename, row_count, col_count)
            VALUES (?, ?, ?, ?)
        """, (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            filename,
            row_count,
            col_count
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[db] Warning: Failed to log upload: {e}")
