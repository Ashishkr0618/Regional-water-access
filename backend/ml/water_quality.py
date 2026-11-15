"""
backend/ml/water_quality.py
Implements a Random Forest classifier for predicting water potability
based on physicochemical parameters.
Handles dataset loading, preprocessing, model training, evaluation, and inference.
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "ph", "Hardness", "Solids", "Chloramines",
    "Sulfate", "Conductivity", "Organic_carbon",
    "Trihalomethanes", "Turbidity"
]
TARGET_COLUMN = "Potability"


def load_water_quality(filepath):
    """Load water quality CSV into pandas DataFrame."""
    return pd.read_csv(filepath)


def preprocess_water_quality(df):
    """
    Clean and preprocess water quality records.
    Replaces blank strings with NaN, fills missing features with median values,
    and drops rows without valid target labels.
    """
    df = df.copy()
    df.replace("", np.nan, inplace=True)

    for col in FEATURE_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            median_val = float(df[col].median())
            df[col] = df[col].fillna(median_val)

    if TARGET_COLUMN in df.columns:
        df = df.dropna(subset=[TARGET_COLUMN])
        df[TARGET_COLUMN] = df[TARGET_COLUMN].astype(int)

    return df


def train_water_quality_model(filepath, model_save_path):
    """
    Train Random Forest classifier with 80/20 train-test split,
    compute detailed performance metrics, and persist the model bundle.
    """
    df = load_water_quality(filepath)
    df = preprocess_water_quality(df)

    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, target_names=["Not Potable", "Potable"], output_dict=True)

    feature_importances = {
        col: round(float(imp), 4)
        for col, imp in zip(FEATURE_COLUMNS, model.feature_importances_)
    }

    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "classification_report": report,
        "feature_importances": feature_importances,
        "test_samples": int(len(y_test)),
        "train_samples": int(len(y_train)),
        "algorithm": "Random Forest Classifier (100 estimators, max_depth=10)"
    }

    model_bundle = {
        "model": model,
        "scaler": scaler,
        "feature_columns": FEATURE_COLUMNS,
        "metrics": metrics,
    }

    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(model_bundle, model_save_path)

    return metrics


def predict_water_quality(model_path, input_dict):
    """
    Load saved model bundle and predict potability with confidence for input parameters.
    """
    bundle = joblib.load(model_path)
    model = bundle["model"]
    scaler = bundle["scaler"]
    feature_columns = bundle["feature_columns"]

    input_vector = np.array(
        [float(input_dict.get(col, 0)) for col in feature_columns]
    ).reshape(1, -1)

    input_scaled = scaler.transform(input_vector)

    prediction = int(model.predict(input_scaled)[0])
    probabilities = model.predict_proba(input_scaled)[0]
    confidence = round(float(probabilities[prediction]), 4)

    importances = {
        col: round(float(imp), 4)
        for col, imp in zip(feature_columns, model.feature_importances_)
    }

    return {
        "prediction": prediction,
        "confidence": confidence,
        "feature_importances": importances,
    }
