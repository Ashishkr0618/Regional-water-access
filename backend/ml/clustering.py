"""
backend/ml/clustering.py
Implements K-Means clustering, distance metric comparison (Euclidean vs. Manhattan L1),
descriptive cluster profiles, and stability analysis for regional WASH indicators.
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import silhouette_score, adjusted_rand_score
from scipy.spatial.distance import pdist, squareform


def run_kmeans(scaled_data, n_clusters, random_state=42):
    """
    Run K-Means clustering on the scaled data using squared Euclidean distance.

    Args:
        scaled_data (np.ndarray): Standardized feature matrix.
        n_clusters (int): Number of clusters (K).
        random_state (int): Random seed for reproducibility.

    Returns:
        tuple: (labels, inertia, model)
    """
    model = KMeans(
        n_clusters=n_clusters,
        init="k-means++",
        n_init=15,
        max_iter=300,
        random_state=random_state
    )
    labels = model.fit_predict(scaled_data)
    inertia = float(model.inertia_)
    return labels, inertia, model


def run_distance_comparison(scaled_data, n_clusters=3):
    """
    Compare Euclidean-based clustering against Manhattan (L1) metric-based clustering.

    Note on methodology:
      Standard Scikit-learn KMeans specifically minimizes squared Euclidean distance
      (the cluster centroid is the mean). For Manhattan distance, we use
      Agglomerative Hierarchical Clustering with metric='manhattan' (L1 norm, linkage='average'),
      which groups observations by absolute differences rather than squared deviations.
      We compute the Adjusted Rand Index (ARI) to quantify cluster alignment.

    Args:
        scaled_data (np.ndarray): Standardized feature matrix.
        n_clusters (int): Number of clusters.

    Returns:
        dict: Summary of Euclidean vs. Manhattan comparison.
    """
    # 1. Euclidean KMeans
    km = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
    euclidean_labels = km.fit_predict(scaled_data)
    sil_euclidean = float(silhouette_score(scaled_data, euclidean_labels, metric="euclidean"))

    # 2. Manhattan Agglomerative (L1 distance)
    agg_manhattan = AgglomerativeClustering(
        n_clusters=n_clusters,
        metric="manhattan",
        linkage="average"
    )
    manhattan_labels = agg_manhattan.fit_predict(scaled_data)
    sil_manhattan = float(silhouette_score(scaled_data, manhattan_labels, metric="manhattan"))

    # 3. Agreement between the two clusterings
    ari = float(adjusted_rand_score(euclidean_labels, manhattan_labels))

    # Cluster sizes
    euclidean_sizes = [int(np.sum(euclidean_labels == i)) for i in range(n_clusters)]
    manhattan_sizes = [int(np.sum(manhattan_labels == i)) for i in range(n_clusters)]

    return {
        "n_clusters": n_clusters,
        "adjusted_rand_index": round(ari, 4),
        "euclidean": {
            "algorithm": "K-Means (Squared Euclidean L2)",
            "silhouette_score": round(sil_euclidean, 4),
            "cluster_sizes": euclidean_sizes,
        },
        "manhattan": {
            "algorithm": "Agglomerative Average (Manhattan L1)",
            "silhouette_score": round(sil_manhattan, 4),
            "cluster_sizes": manhattan_sizes,
        },
        "interpretation": (
            f"An Adjusted Rand Index of {ari:.2f} indicates "
            + ("high" if ari > 0.75 else "moderate" if ari > 0.4 else "low")
            + " structural agreement between Euclidean and Manhattan formulations. "
            "Manhattan L1 distance reduces sensitivity to extreme outlier indicator values."
        )
    }


def compute_cluster_profiles(df, labels, feature_names):
    """
    Compute descriptive statistics for each cluster and assign meaningful names
    based on the actual data averages (e.g. High Water Accessibility).

    Args:
        df (pd.DataFrame): Original WASH dataframe (unscaled).
        labels (np.ndarray): Cluster assignments.
        feature_names (list[str]): Indicator column names.

    Returns:
        dict: cluster_id -> profile dict with statistics and descriptions.
    """
    df_copy = df.copy()
    df_copy["cluster"] = labels

    profiles = {}

    for cluster_id in sorted(df_copy["cluster"].unique()):
        cluster_rows = df_copy[df_copy["cluster"] == cluster_id]

        feature_means = {}
        for feat in feature_names:
            if feat in cluster_rows.columns:
                feature_means[feat] = round(float(cluster_rows[feat].mean()), 2)

        # Retrieve specific averages with fallbacks
        avg_water = feature_means.get("basic_water_access_pct", round(float(cluster_rows.get("basic_water_access_pct", pd.Series([0])).mean()), 2))
        avg_safely = feature_means.get("safely_managed_water_pct", round(float(cluster_rows.get("safely_managed_water_pct", pd.Series([0])).mean()), 2))
        avg_sanitation = feature_means.get("sanitation_access_pct", round(float(cluster_rows.get("sanitation_access_pct", pd.Series([0])).mean()), 2))
        avg_hygiene = feature_means.get("hygiene_availability_pct", round(float(cluster_rows.get("hygiene_availability_pct", pd.Series([0])).mean()), 2))
        avg_rural = feature_means.get("rural_water_access_pct", round(float(cluster_rows.get("rural_water_access_pct", pd.Series([0])).mean()), 2))
        avg_urban = feature_means.get("urban_water_access_pct", round(float(cluster_rows.get("urban_water_access_pct", pd.Series([0])).mean()), 2))

        # Dynamic naming and characterization based on actual metrics
        rural_gap = avg_urban - avg_rural
        if avg_water >= 85:
            cluster_name = "High Water Accessibility"
            summary = "Universal or near-universal drinking water and advanced sanitation infrastructure."
            characteristics = [
                f"{avg_water:.1f}% basic drinking water coverage",
                f"{avg_sanitation:.1f}% sanitation access",
                f"Minimal rural-urban gap ({rural_gap:.1f}%)"
            ]
        elif avg_water >= 60:
            if rural_gap > 25:
                cluster_name = "Rural Water Access Challenges"
                summary = "Substantial urban infrastructure but lagging rural coverage requiring targeted last-mile investment."
                characteristics = [
                    f"Noticeable rural-urban disparity ({rural_gap:.1f}% gap)",
                    f"{avg_urban:.1f}% urban vs {avg_rural:.1f}% rural access",
                    f"{avg_hygiene:.1f}% hygiene availability"
                ]
            else:
                cluster_name = "Moderate Water Accessibility"
                summary = "Transitioning infrastructure with moderate coverage across urban and rural communities."
                characteristics = [
                    f"{avg_water:.1f}% basic water coverage",
                    f"{avg_sanitation:.1f}% sanitation service",
                    f"{avg_hygiene:.1f}% basic hygiene facilities"
                ]
        elif avg_water >= 40:
            cluster_name = "Developing Water Infrastructure"
            summary = "Significant access deficits with reliance on unimproved or surface water sources."
            characteristics = [
                f"{avg_water:.1f}% basic water access",
                f"{avg_sanitation:.1f}% sanitation access",
                "Substantial reliance on unimproved sources"
            ]
        else:
            cluster_name = "Severe Water-Access Deficits"
            summary = "Critical WASH vulnerability with acute shortages in both basic drinking water and basic sanitation."
            characteristics = [
                f"Only {avg_water:.1f}% basic water access",
                f"Severe sanitation deficit ({avg_sanitation:.1f}%)",
                "High dependence on untreated surface water"
            ]

        countries_list = cluster_rows["country"].tolist() if "country" in cluster_rows.columns else []
        regions_list = cluster_rows["region"].unique().tolist() if "region" in cluster_rows.columns else []

        profiles[int(cluster_id)] = {
            "cluster_id": int(cluster_id),
            "cluster_name": cluster_name,
            "label": cluster_name,
            "num_regions": int(len(cluster_rows)),
            "size": int(len(cluster_rows)),
            "summary": summary,
            "characteristics": characteristics,
            "avg_basic_water_access_pct": avg_water,
            "avg_safely_managed_water_pct": avg_safely,
            "avg_sanitation_access_pct": avg_sanitation,
            "avg_hygiene_availability_pct": avg_hygiene,
            "avg_rural_access_pct": avg_rural,
            "avg_urban_access_pct": avg_urban,
            "feature_means": feature_means,
            "top_countries": countries_list[:5],
            "countries": countries_list,
            "regions": regions_list,
        }

    return profiles


def stability_analysis(scaled_data, n_clusters, n_runs=10):
    """
    Assess stability of K-Means clustering across multiple random initializations.
    Computes silhouette variation and mean pairwise Adjusted Rand Index (ARI).

    Args:
        scaled_data (np.ndarray): Scaled feature matrix.
        n_clusters (int): Number of clusters.
        n_runs (int): Number of independent KMeans runs.

    Returns:
        dict: Stability statistics.
    """
    silhouette_scores = []
    run_labels = []

    for seed in range(n_runs):
        km = KMeans(n_clusters=n_clusters, random_state=seed * 7 + 1, n_init=5)
        lbls = km.fit_predict(scaled_data)
        run_labels.append(lbls)
        if len(set(lbls)) > 1:
            silhouette_scores.append(float(silhouette_score(scaled_data, lbls)))

    # Compute pairwise Adjusted Rand Index across distinct initializations
    aris = []
    for i in range(len(run_labels)):
        for j in range(i + 1, len(run_labels)):
            aris.append(adjusted_rand_score(run_labels[i], run_labels[j]))

    mean_ari = float(np.mean(aris)) if aris else 1.0

    return {
        "n_clusters": n_clusters,
        "runs": n_runs,
        "mean_silhouette": round(float(np.mean(silhouette_scores)), 4) if silhouette_scores else 0.0,
        "std_silhouette": round(float(np.std(silhouette_scores)), 4) if silhouette_scores else 0.0,
        "mean_adjusted_rand_index": round(mean_ari, 4),
        "stability_level": "High" if mean_ari >= 0.8 else "Moderate" if mean_ari >= 0.6 else "Sensitive to initialization",
        "scores": [round(s, 4) for s in silhouette_scores]
    }
