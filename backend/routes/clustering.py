"""
backend/routes/clustering.py
Flask Blueprint for clustering-related endpoints.
Handles dataset inspection, preprocessing summaries, K-Means clustering,
evaluation metrics, PCA dimensionality reduction, distance comparison, and CSV uploads.
"""

import os
import io
import pandas as pd
from flask import Blueprint, jsonify, request

from ml.preprocessing import load_wash_dataset, preprocess_wash
from ml.clustering import (
    run_kmeans,
    compute_cluster_profiles,
    stability_analysis,
    run_distance_comparison,
)
from ml.evaluation import compute_all_metrics, compute_pca
from database.db import log_upload

clustering_bp = Blueprint("clustering_bp", __name__)

_DATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "wash_dataset.csv")
)

# In-memory cached state
_last_clustering_result = {}
_scaled_data = None
_feature_names = None
_original_df = None


def _ensure_data_loaded():
    """Load and preprocess dataset if not already in memory."""
    global _scaled_data, _feature_names, _original_df
    if _scaled_data is None:
        df = load_wash_dataset(_DATA_PATH)
        _scaled_data, _feature_names, _original_df = preprocess_wash(df)


@clustering_bp.route("/api/dataset", methods=["GET"])
def get_dataset():
    """
    GET /api/dataset
    Returns dataset preview, metadata, and preprocessing summary.
    """
    try:
        _ensure_data_loaded()
        df = _original_df

        missing_summary = {col: int(df[col].isna().sum()) for col in df.columns}
        total_missing = sum(missing_summary.values())

        return jsonify({
            "columns": list(df.columns),
            "preview": df.to_dict(orient="records"),  # Return full records for explorer
            "total_rows": int(len(df)),
            "features_count": len(_feature_names),
            "missing_values_summary": missing_summary,
            "total_missing_values": total_missing,
            "feature_names": _feature_names,
            "preprocessing_summary": {
                "total_records": int(len(df)),
                "total_features": len(_feature_names),
                "total_columns": int(len(df.columns)),
                "missing_values_detected": total_missing,
                "records_used_for_clustering": int(len(_scaled_data)),
                "scaler": "StandardScaler (zero mean, unit variance)"
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clustering_bp.route("/api/clustering", methods=["POST"])
def run_clustering_endpoint():
    """
    POST /api/clustering
    Runs K-Means clustering with user-selected K (2-6).
    Computes PCA 2D coordinates, descriptive cluster profiles, stability, and distance comparison.
    """
    try:
        _ensure_data_loaded()

        body = request.get_json(force=True, silent=True) or {}
        n_clusters = int(body.get("n_clusters", 3))

        if n_clusters < 2 or n_clusters > 10:
            return jsonify({"error": "n_clusters must be between 2 and 10"}), 400

        # Run K-Means
        labels, inertia, model = run_kmeans(_scaled_data, n_clusters)

        # Compute cluster profiles
        profiles = compute_cluster_profiles(_original_df, labels, _feature_names)

        # Compute PCA coordinates
        pca_coords, explained_variance = compute_pca(_scaled_data)
        explained_total = round(sum(explained_variance), 2)

        # Stability analysis
        stability = stability_analysis(_scaled_data, n_clusters, n_runs=10)

        # Distance metric comparison (Euclidean L2 vs Manhattan L1)
        distance_comp = run_distance_comparison(_scaled_data, n_clusters)

        regions = (
            _original_df["country"].tolist()
            if "country" in _original_df.columns
            else [f"Region {i+1}" for i in range(len(labels))]
        )

        # Store complete record table with assigned cluster for the explorer
        enriched_records = []
        for i, row in _original_df.iterrows():
            item = row.to_dict()
            cluster_id = int(labels[i])
            item["cluster"] = cluster_id
            item["cluster_name"] = profiles[cluster_id]["cluster_name"]
            item["pca_x"] = pca_coords[i][0]
            item["pca_y"] = pca_coords[i][1]
            enriched_records.append(item)

        result_payload = {
            "labels": labels.tolist(),
            "cluster_profiles": profiles,
            "pca_coords": pca_coords,
            "explained_variance": explained_variance,
            "explained_variance_total": explained_total,
            "n_clusters": n_clusters,
            "regions": regions,
            "inertia": float(inertia),
            "stability": stability,
            "distance_comparison": distance_comp,
            "enriched_records": enriched_records
        }

        _last_clustering_result.clear()
        _last_clustering_result.update(result_payload)

        return jsonify(result_payload)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clustering_bp.route("/api/evaluation", methods=["GET"])
def get_evaluation():
    """
    GET /api/evaluation
    Returns WCSS, Silhouette Score, and Davies-Bouldin index for k in [2, 3, 4, 5, 6].
    """
    try:
        _ensure_data_loaded()

        metrics = compute_all_metrics(_scaled_data, k_range=[2, 3, 4, 5, 6])
        best_k_silhouette = max(metrics, key=lambda m: m["silhouette_score"])["k"]
        best_k_davies = min(metrics, key=lambda m: m["davies_bouldin_score"])["k"]

        return jsonify({
            "metrics": metrics,
            "best_k_silhouette": best_k_silhouette,
            "best_k_davies": best_k_davies,
            "explanations": {
                "wcss": "Within-Cluster Sum of Squares (Inertia) measures cluster compactness. Lower values indicate tighter clusters; look for the 'elbow' inflection point.",
                "silhouette": "Silhouette Score ranges from -1 to +1. Values above 0.5 suggest dense, well-separated clusters with minimal assignment ambiguity.",
                "davies_bouldin": "Davies-Bouldin Index measures the average similarity between each cluster and its most similar one. Lower values indicate superior separation."
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clustering_bp.route("/api/cluster-profiles", methods=["GET"])
def get_cluster_profiles():
    """
    GET /api/cluster-profiles
    Returns profiles and records from the most recent clustering run,
    or executes default K=3 clustering if not yet executed.
    """
    try:
        _ensure_data_loaded()
        if not _last_clustering_result:
            # Run default K=3
            labels, inertia, model = run_kmeans(_scaled_data, 3)
            profiles = compute_cluster_profiles(_original_df, labels, _feature_names)
            pca_coords, explained_variance = compute_pca(_scaled_data)
            stability = stability_analysis(_scaled_data, 3, 10)
            dist_comp = run_distance_comparison(_scaled_data, 3)

            enriched = []
            for i, row in _original_df.iterrows():
                item = row.to_dict()
                cid = int(labels[i])
                item["cluster"] = cid
                item["cluster_name"] = profiles[cid]["cluster_name"]
                enriched.append(item)

            _last_clustering_result.update({
                "labels": labels.tolist(),
                "cluster_profiles": profiles,
                "n_clusters": 3,
                "inertia": float(inertia),
                "stability": stability,
                "distance_comparison": dist_comp,
                "enriched_records": enriched
            })

        return jsonify({
            "cluster_profiles": _last_clustering_result.get("cluster_profiles", {}),
            "n_clusters": _last_clustering_result.get("n_clusters"),
            "inertia": _last_clustering_result.get("inertia"),
            "stability": _last_clustering_result.get("stability"),
            "distance_comparison": _last_clustering_result.get("distance_comparison"),
            "enriched_records": _last_clustering_result.get("enriched_records", [])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clustering_bp.route("/api/upload", methods=["POST"])
def upload_dataset():
    """
    POST /api/upload
    Uploads a new WASH CSV dataset and logs upload to SQLite.
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded. Use field 'file'."}), 400

        file = request.files["file"]
        if not file.filename:
            return jsonify({"error": "Empty filename."}), 400

        content = file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Validate minimum necessary columns
        required = ["country", "basic_water_access_pct", "sanitation_access_pct"]
        missing = [c for c in required if c not in df.columns]
        if missing:
            return jsonify({"error": f"Uploaded file is missing required columns: {missing}"}), 400

        with open(_DATA_PATH, "wb") as f:
            f.write(content)

        # Log to SQLite
        log_upload(file.filename, int(len(df)), int(len(df.columns)))

        # Reset cache
        global _scaled_data, _feature_names, _original_df
        _scaled_data = None
        _feature_names = None
        _original_df = None
        _last_clustering_result.clear()

        _ensure_data_loaded()

        return jsonify({
            "message": "Dataset uploaded and parsed successfully.",
            "rows": int(len(df)),
            "columns": list(df.columns),
            "features_detected": _feature_names
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
