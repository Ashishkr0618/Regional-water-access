"""
backend/ml/evaluation.py
Provides evaluation metrics for different values of k in K-Means clustering,
and PCA dimensionality reduction for 2D visualization.
"""

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score
from sklearn.decomposition import PCA


def compute_all_metrics(scaled_data, k_range=None):
    """
    For each value of k in k_range, run K-Means and compute evaluation metrics:
      - WCSS (Within-Cluster Sum of Squares / inertia) — lower is better
      - Silhouette Score — higher is better (range -1 to 1)
      - Davies-Bouldin Score — lower is better

    Args:
        scaled_data (np.ndarray): Scaled feature matrix.
        k_range (list[int]): Values of k to evaluate. Defaults to [2, 3, 4, 5, 6].

    Returns:
        list[dict]: Each dict has keys: k, wcss, silhouette_score, davies_bouldin_score.
    """
    if k_range is None:
        k_range = [2, 3, 4, 5, 6]

    results = []

    for k in k_range:
        # Fit K-Means for this value of k
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(scaled_data)

        # Compute WCSS (inertia)
        wcss = float(model.inertia_)

        # Silhouette score measures how similar each point is to its own cluster
        # vs. other clusters. Only valid when there is more than one cluster.
        if len(set(labels)) > 1:
            sil = float(silhouette_score(scaled_data, labels))
            db = float(davies_bouldin_score(scaled_data, labels))
        else:
            sil = 0.0
            db = 0.0

        results.append({
            "k": k,
            "wcss": round(wcss, 4),
            "silhouette_score": round(sil, 4),
            "davies_bouldin_score": round(db, 4),
        })

    return results


def compute_pca(scaled_data, n_components=2):
    """
    Apply PCA to reduce the scaled data to n_components dimensions.
    Used to create a 2D scatter plot of the clusters.

    Args:
        scaled_data (np.ndarray): Scaled feature matrix.
        n_components (int): Number of principal components (default 2).

    Returns:
        tuple:
            - pca_coords (list[list[float]]): Each element is [x, y] for one data point.
            - explained_variance (list[float]): Variance explained by each component (%).
    """
    # Fit and transform the data
    pca = PCA(n_components=n_components, random_state=42)
    transformed = pca.fit_transform(scaled_data)

    # Convert to plain Python list of [x, y] pairs for JSON serialisation
    pca_coords = [[round(float(row[0]), 4), round(float(row[1]), 4)] for row in transformed]

    # Express explained variance as percentages rounded to 2 decimal places
    explained_variance = [round(float(v) * 100, 2) for v in pca.explained_variance_ratio_]

    return pca_coords, explained_variance
