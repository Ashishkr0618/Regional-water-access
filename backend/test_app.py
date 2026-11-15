"""
backend/test_app.py
Comprehensive test suite for AquaScope API and ML modules.
"""

import os
import io
import json
import pytest
from app import create_app, _startup

@pytest.fixture(scope="session")
def client():
    _startup()
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert data["model_trained"] is True
    assert data["dataset_loaded"] is True


def test_dashboard_endpoint(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.get_json()
    assert "total_regions" in data
    assert data["total_regions"] > 0
    assert "avg_basic_water_access" in data
    assert "top_regions" in data
    assert len(data["top_regions"]) > 0
    assert "regional_breakdown" in data


def test_dataset_endpoint(client):
    res = client.get("/api/dataset")
    assert res.status_code == 200
    data = res.get_json()
    assert "preview" in data
    assert "columns" in data
    assert "preprocessing_summary" in data
    assert data["preprocessing_summary"]["total_records"] > 0


def test_clustering_endpoint(client):
    res = client.post("/api/clustering", json={"n_clusters": 3})
    assert res.status_code == 200
    data = res.get_json()
    assert data["n_clusters"] == 3
    assert len(data["labels"]) > 0
    assert "cluster_profiles" in data
    assert "pca_coords" in data
    assert "explained_variance" in data
    assert "stability" in data
    assert "distance_comparison" in data
    assert "enriched_records" in data


def test_clustering_validation(client):
    res = client.post("/api/clustering", json={"n_clusters": 1})
    assert res.status_code == 400

    res2 = client.post("/api/clustering", json={"n_clusters": 15})
    assert res2.status_code == 400


def test_evaluation_endpoint(client):
    res = client.get("/api/evaluation")
    assert res.status_code == 200
    data = res.get_json()
    assert "metrics" in data
    assert len(data["metrics"]) == 5  # K=2, 3, 4, 5, 6
    assert "best_k_silhouette" in data
    assert "best_k_davies" in data


def test_cluster_profiles_endpoint(client):
    res = client.get("/api/cluster-profiles")
    assert res.status_code == 200
    data = res.get_json()
    assert "cluster_profiles" in data


def test_prediction_potable(client):
    payload = {
        "ph": 7.3,
        "Hardness": 165.0,
        "Solids": 310.0,
        "Chloramines": 3.2,
        "Sulfate": 210.0,
        "Conductivity": 380.0,
        "Organic_carbon": 1.8,
        "Trihalomethanes": 35.0,
        "Turbidity": 2.1,
        "region": "Europe"
    }
    res = client.post("/api/predict-water-quality", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert "prediction" in data
    assert "confidence" in data
    assert "feature_importances" in data
    assert "region_info" in data


def test_prediction_invalid(client):
    # Missing required field
    res = client.post("/api/predict-water-quality", json={"ph": 7.0})
    assert res.status_code == 400

    # Non-numeric field
    res2 = client.post("/api/predict-water-quality", json={
        "ph": "invalid_string",
        "Hardness": 100,
        "Solids": 200,
        "Chloramines": 3,
        "Sulfate": 200,
        "Conductivity": 300,
        "Organic_carbon": 2,
        "Trihalomethanes": 30,
        "Turbidity": 2
    })
    assert res2.status_code == 400


def test_prediction_history(client):
    res = client.get("/api/prediction-history?limit=5")
    assert res.status_code == 200
    data = res.get_json()
    assert "history" in data
    assert isinstance(data["history"], list)


def test_water_quality_metrics(client):
    res = client.get("/api/water-quality-metrics")
    assert res.status_code == 200
    data = res.get_json()
    assert "metrics" in data
    assert "accuracy" in data["metrics"]


def test_upload_invalid(client):
    # Missing file
    res = client.post("/api/upload")
    assert res.status_code == 400

    # Missing required columns
    fake_csv = io.BytesIO(b"foo,bar\n1,2\n3,4")
    res2 = client.post(
        "/api/upload",
        data={"file": (fake_csv, "test.csv")},
        content_type="multipart/form-data"
    )
    assert res2.status_code == 400
