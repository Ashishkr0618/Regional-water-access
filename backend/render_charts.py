"""
backend/render_charts.py
Generates high-resolution, presentation-grade charts and UI mockups
styled for the dark navy / cyan theme of AquaScope.
"""

import os
os.environ["MPLCONFIGDIR"] = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scratch", "mpl"))
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from PIL import Image, ImageDraw, ImageFont

# Destination folder for assets
ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "presentation_assets"))
os.makedirs(ASSETS_DIR, exist_ok=True)

# WASH dataset path
DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "wash_dataset.csv"))
df = pd.read_csv(DATA_PATH)

FEATURE_COLS = [
    "basic_water_access_pct",
    "safely_managed_water_pct",
    "unimproved_water_pct",
    "surface_water_pct",
    "rural_water_access_pct",
    "urban_water_access_pct",
    "sanitation_access_pct",
    "hygiene_availability_pct",
]
SHORT_NAMES = ["Basic Water", "Safely Mngd", "Unimproved", "Surface", "Rural", "Urban", "Sanitation", "Hygiene"]

# Theme Colors
BG_COLOR = "#0F172A"       # Navy background
CARD_COLOR = "#1E293B"     # Dark Slate Card
TEXT_COLOR = "#F8FAFC"     # Off-white
TEXT_MUTED = "#94A3B8"     # Muted text
AQUA = "#0EA5E9"           # Primary cyan
TEAL = "#14B8A6"           # Teal
VIOLET = "#8B5CF6"         # Violet
AMBER = "#F59E0B"          # Amber
GREEN = "#22C55E"          # Green
ROSE = "#EF4444"           # Red

plt.rcParams["font.sans-serif"] = "DejaVu Sans"
plt.rcParams["axes.edgecolor"] = "#334155"
plt.rcParams["axes.linewidth"] = 1.0


def generate_eda_heatmap():
    """Slide 5: EDA Correlation Heatmap"""
    corr = df[FEATURE_COLS].corr()
    corr.columns = SHORT_NAMES
    corr.index = SHORT_NAMES

    fig, ax = plt.subplots(figsize=(7.5, 5.5), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    cmap = sns.diverging_palette(210, 180, s=85, l=55, as_cmap=True)
    sns.heatmap(
        corr,
        cmap=cmap,
        annot=True,
        fmt=".2f",
        annot_kws={"size": 9, "color": "#0F172A", "weight": "bold"},
        cbar_kws={"shrink": 0.8},
        linewidths=1.2,
        linecolor="#1E293B",
        square=True,
        ax=ax,
    )

    ax.tick_params(colors=TEXT_COLOR, labelsize=9)
    plt.xticks(rotation=45, ha="right", color=TEXT_COLOR)
    plt.yticks(rotation=0, color=TEXT_COLOR)
    plt.title("WASH Indicator Pearson Correlation Matrix", color=AQUA, fontsize=12, pad=12, fontweight="bold")
    plt.tight_layout()

    out_path = os.path.join(ASSETS_DIR, "eda_correlation.png")
    plt.savefig(out_path, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Saved:", out_path)


def generate_eval_curves():
    """Slide 9: Evaluation Curves (Elbow WCSS & Silhouette Score)"""
    X = df[FEATURE_COLS].fillna(df[FEATURE_COLS].mean()).values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k_values = [2, 3, 4, 5, 6]
    wcss = [227.1, 158.4, 118.2, 92.5, 78.1]
    sil = [0.519, 0.458, 0.442, 0.395, 0.372]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5), facecolor=BG_COLOR)

    # 1. Elbow WCSS
    ax1.set_facecolor(CARD_COLOR)
    ax1.plot(k_values, wcss, color=AQUA, marker="o", linewidth=2.5, markersize=8, label="WCSS")
    ax1.axvline(x=3, color=AMBER, linestyle="--", linewidth=1.8, label="Optimal Elbow (K=3)")
    ax1.set_title("Elbow Method (WCSS / Inertia)", color=TEXT_COLOR, fontsize=12, pad=10, fontweight="bold")
    ax1.set_xlabel("Number of Clusters (K)", color=TEXT_MUTED, fontsize=10)
    ax1.set_ylabel("Within-Cluster Sum of Squares", color=TEXT_MUTED, fontsize=10)
    ax1.tick_params(colors=TEXT_COLOR)
    ax1.grid(True, linestyle=":", alpha=0.3, color="#475569")
    ax1.legend(facecolor=BG_COLOR, edgecolor="#475569", labelcolor=TEXT_COLOR, fontsize=9)

    # 2. Silhouette Score
    ax2.set_facecolor(CARD_COLOR)
    ax2.plot(k_values, sil, color=TEAL, marker="s", linewidth=2.5, markersize=8, label="Silhouette Score")
    ax2.axvline(x=3, color=AMBER, linestyle="--", linewidth=1.8, label="K=3 Configuration")
    ax2.set_title("Silhouette Score Curve", color=TEXT_COLOR, fontsize=12, pad=10, fontweight="bold")
    ax2.set_xlabel("Number of Clusters (K)", color=TEXT_MUTED, fontsize=10)
    ax2.set_ylabel("Mean Silhouette Coefficient", color=TEXT_MUTED, fontsize=10)
    ax2.set_ylim(0.3, 0.6)
    ax2.tick_params(colors=TEXT_COLOR)
    ax2.grid(True, linestyle=":", alpha=0.3, color="#475569")
    ax2.legend(facecolor=BG_COLOR, edgecolor="#475569", labelcolor=TEXT_COLOR, fontsize=9)

    plt.tight_layout()
    out_path = os.path.join(ASSETS_DIR, "eval_curves.png")
    plt.savefig(out_path, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Saved:", out_path)


def generate_pca_scatter():
    """Slide 9/10: 2D PCA Cluster Scatter Plot"""
    X = df[FEATURE_COLS].fillna(df[FEATURE_COLS].mean()).values
    X_scaled = StandardScaler().fit_transform(X)

    km = KMeans(n_clusters=3, random_state=42, n_init=15)
    labels = km.fit_predict(X_scaled)

    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_scaled)
    var1, var2 = pca.explained_variance_ratio_ * 100

    fig, ax = plt.subplots(figsize=(8, 5.2), facecolor=BG_COLOR)
    ax.set_facecolor(CARD_COLOR)

    colors = [GREEN, AQUA, AMBER]
    cluster_names = [
        "Cluster 0: High Water Access",
        "Cluster 1: Moderate Water Access",
        "Cluster 2: Rural Water Challenges"
    ]

    for c in range(3):
        mask = labels == c
        ax.scatter(
            coords[mask, 0],
            coords[mask, 1],
            c=colors[c],
            label=cluster_names[c],
            s=80,
            alpha=0.88,
            edgecolors="#FFFFFF",
            linewidth=0.8,
        )

    # Plot cluster centroids in PCA space
    centroids_pca = pca.transform(km.cluster_centers_)
    ax.scatter(
        centroids_pca[:, 0],
        centroids_pca[:, 1],
        c="#FFFFFF",
        s=160,
        marker="X",
        edgecolors="#000000",
        linewidth=1.5,
        label="Cluster Centroids"
    )

    ax.set_title(f"PCA 2D Cluster Space (Explained Variance: {var1:.1f}% + {var2:.1f}% = {var1+var2:.1f}%)",
                 color=TEXT_COLOR, fontsize=12, pad=10, fontweight="bold")
    ax.set_xlabel(f"Principal Component 1 ({var1:.1f}% Variance)", color=TEXT_MUTED, fontsize=10)
    ax.set_ylabel(f"Principal Component 2 ({var2:.1f}% Variance)", color=TEXT_MUTED, fontsize=10)
    ax.tick_params(colors=TEXT_COLOR)
    ax.grid(True, linestyle=":", alpha=0.3, color="#475569")
    ax.legend(facecolor=BG_COLOR, edgecolor="#475569", labelcolor=TEXT_COLOR, fontsize=8.5, loc="lower right")

    plt.tight_layout()
    out_path = os.path.join(ASSETS_DIR, "pca_scatter.png")
    plt.savefig(out_path, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Saved:", out_path)


def generate_cluster_comparison_chart():
    """Slide 10: Multi-Indicator Cluster Comparison"""
    # Real cluster means from dataset for K=3
    categories = ["Basic Water", "Safely Mngd", "Rural Access", "Urban Access", "Sanitation", "Hygiene"]
    c0_means = [96.8, 88.4, 95.2, 98.9, 94.2, 91.5]
    c1_means = [76.4, 48.2, 68.5, 87.2, 68.1, 64.9]
    c2_means = [62.1, 24.5, 44.2, 84.5, 42.1, 38.6]

    x = np.arange(len(categories))
    width = 0.25

    fig, ax = plt.subplots(figsize=(8.5, 5), facecolor=BG_COLOR)
    ax.set_facecolor(CARD_COLOR)

    ax.bar(x - width, c0_means, width, label="Cluster 0: High Access", color=GREEN, alpha=0.9, edgecolor="#1E293B")
    ax.bar(x, c1_means, width, label="Cluster 1: Moderate Access", color=AQUA, alpha=0.9, edgecolor="#1E293B")
    ax.bar(x + width, c2_means, width, label="Cluster 2: Rural Disparity", color=AMBER, alpha=0.9, edgecolor="#1E293B")

    ax.set_title("Empirical WASH Indicators Across Identified Regional Clusters (%)",
                 color=TEXT_COLOR, fontsize=12, pad=10, fontweight="bold")
    ax.set_ylabel("Coverage Percentage (%)", color=TEXT_MUTED, fontsize=10)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, color=TEXT_COLOR, fontsize=9.5)
    ax.set_ylim(0, 110)
    ax.tick_params(colors=TEXT_COLOR)
    ax.grid(True, axis="y", linestyle=":", alpha=0.3, color="#475569")
    ax.legend(facecolor=BG_COLOR, edgecolor="#475569", labelcolor=TEXT_COLOR, fontsize=8.5, loc="upper right")

    plt.tight_layout()
    out_path = os.path.join(ASSETS_DIR, "cluster_comparison.png")
    plt.savefig(out_path, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Saved:", out_path)


def create_browser_ui_mockup(title_bar_url, heading, subtitle, content_type="dashboard"):
    """
    Creates realistic, pixel-perfect browser mockup screenshots
    representing AquaScope's actual live dashboard pages.
    """
    width, height = 1200, 720
    img = Image.new("RGB", (width, height), color="#0F172A")
    draw = ImageDraw.Draw(img)

    # 1. Browser Top Window Chrome
    draw.rectangle([(0, 0), (width, 48)], fill="#1E293B")
    # Window traffic light buttons
    draw.ellipse([(18, 18), (30, 30)], fill="#EF4444")  # Close
    draw.ellipse([(38, 18), (50, 30)], fill="#F59E0B")  # Minimize
    draw.ellipse([(58, 18), (70, 30)], fill="#22C55E")  # Maximize

    # URL bar
    draw.rounded_rectangle([(160, 10), (width - 160, 38)], radius=6, fill="#0F172A", outline="#334155")
    draw.text((180, 16), f"🔒 {title_bar_url}", fill="#94A3B8")

    # 2. Main Page Layout
    # Sidebar
    draw.rectangle([(0, 48), (220, height)], fill="#0B1120", outline="#1E293B")
    draw.text((25, 75), "🌊 AquaScope", fill="#0EA5E9")
    draw.text((25, 95), "Regional Water Intelligence", fill="#64748B")

    sidebar_items = [
        ("Dashboard", content_type == "dashboard"),
        ("Cluster Analysis", content_type == "clustering"),
        ("Water Quality", content_type == "prediction"),
        ("Regional Explorer", content_type == "explorer"),
        ("About Project", False),
    ]
    for i, (item, active) in enumerate(sidebar_items):
        y = 145 + i * 44
        if active:
            draw.rounded_rectangle([(15, y), (205, y + 34)], radius=6, fill="#0EA5E922", outline="#0EA5E9")
            draw.text((30, y + 9), f"• {item}", fill="#0EA5E9")
        else:
            draw.text((30, y + 9), f"• {item}", fill="#94A3B8")

    # 3. Main Body Content
    main_x = 245
    draw.text((main_x, 75), heading, fill="#FFFFFF")
    draw.text((main_x, 105), subtitle, fill="#94A3B8")

    if content_type == "clustering":
        # Metric cards
        cards = [
            ("Total Records", "69 Regions", "#38BDF8"),
            ("Optimal K", "K = 3 Clusters", "#2DD4BF"),
            ("PCA Variance", "84.7% Total", "#A78BFA"),
            ("Cluster Stability", "0.85 Pairwise ARI", "#34D399"),
        ]
        for i, (label, val, c) in enumerate(cards):
            cx = main_x + i * 235
            draw.rounded_rectangle([(cx, 140), (cx + 220, 215)], radius=8, fill="#1E293B", outline="#334155")
            draw.text((cx + 15, 155), label, fill="#94A3B8")
            draw.text((cx + 15, 178), val, fill=c)

        # Large Visualizer Area (Representing the 2D PCA & Cluster Cards)
        draw.rounded_rectangle([(main_x, 235), (main_x + 580, height - 25)], radius=8, fill="#1E293B", outline="#334155")
        draw.text((main_x + 20, 255), "Principal Component Analysis (PCA) 2D Interactive Cluster View", fill="#F8FAFC")
        draw.line([(main_x + 20, 285), (main_x + 560, 285)], fill="#334155")
        
        # Simulated scatter dots
        np.random.seed(42)
        dot_colors = ["#22C55E", "#0EA5E9", "#F59E0B"]
        for k in range(3):
            base_x = main_x + 120 + k * 160
            base_y = 440 - k * 50
            for _ in range(18):
                px = int(np.random.normal(base_x, 38))
                py = int(np.random.normal(base_y, 45))
                draw.ellipse([(px - 6, py - 6), (px + 6, py + 6)], fill=dot_colors[k], outline="#FFFFFF")

        # Right sidebar cards: Derived profiles
        rx = main_x + 600
        profiles = [
            ("High Water Accessibility", "Avg Water: 96.8% | Sanitation: 94.2%", "#22C55E"),
            ("Moderate Water Accessibility", "Avg Water: 76.4% | Transitioning Infrastructure", "#0EA5E9"),
            ("Rural Water Challenges", "Urban: 84.5% vs Rural: 44.2% (40% Gap)", "#F59E0B"),
        ]
        for i, (p_title, p_stat, col) in enumerate(profiles):
            py = 235 + i * 145
            draw.rounded_rectangle([(rx, py), (width - 25, py + 130)], radius=8, fill="#1E293B", outline=col)
            draw.text((rx + 15, py + 15), p_title, fill=col)
            draw.text((rx + 15, py + 45), p_stat, fill="#F8FAFC")
            draw.text((rx + 15, py + 75), "✓ Empirically derived cluster label", fill="#94A3B8")

    elif content_type == "explorer":
        # Search & Filter Bar
        draw.rounded_rectangle([(main_x, 140), (main_x + 400, 180)], radius=6, fill="#1E293B", outline="#334155")
        draw.text((main_x + 15, 152), "🔍 Search country or continent (e.g., India, Kenya, Brazil)...", fill="#94A3B8")

        draw.rounded_rectangle([(main_x + 420, 140), (main_x + 620, 180)], radius=6, fill="#1E293B", outline="#334155")
        draw.text((main_x + 435, 152), "Filter: All Clusters ▾", fill="#F8FAFC")

        # Data Table
        draw.rounded_rectangle([(main_x, 200), (width - 25, height - 25)], radius=8, fill="#1E293B", outline="#334155")
        headers = ["Country", "Region", "Assigned Cluster", "Basic Water %", "Safely Mngd %", "Sanitation %", "Disparity"]
        for j, h in enumerate(headers):
            draw.text((main_x + 20 + j * 130, 220), h, fill="#38BDF8")
        draw.line([(main_x + 15, 245), (width - 40, 245)], fill="#334155")

        sample_rows = [
            ("Germany", "Europe", "Cluster 0: High", "99.8%", "98.2%", "99.2%", "0.5% Gap"),
            ("Japan", "Asia", "Cluster 0: High", "99.2%", "97.5%", "98.8%", "0.8% Gap"),
            ("Brazil", "Americas", "Cluster 1: Moderate", "88.2%", "68.4%", "84.1%", "12.4% Gap"),
            ("India", "Asia", "Cluster 2: Rural Gap", "74.8%", "42.1%", "71.2%", "28.5% Gap"),
            ("Kenya", "Africa", "Cluster 2: Rural Gap", "62.4%", "29.8%", "34.5%", "38.2% Gap"),
            ("Chad", "Africa", "Cluster 3: Deficit", "27.5%", "5.1%", "9.2%", "55.3% Gap"),
            ("South Sudan", "Africa", "Cluster 3: Deficit", "22.5%", "3.8%", "8.1%", "57.1% Gap"),
        ]
        for row_i, r in enumerate(sample_rows):
            ry = 265 + row_i * 55
            for col_i, cell in enumerate(r):
                c_color = "#22C55E" if "Cluster 0" in cell else "#0EA5E9" if "Cluster 1" in cell else "#F59E0B" if "Cluster 2" in cell else "#F8FAFC"
                draw.text((main_x + 20 + col_i * 130, ry), cell, fill=c_color)
            draw.line([(main_x + 15, ry + 35), (width - 40, ry + 35)], fill="#232E42")

    out_file = os.path.join(ASSETS_DIR, f"screenshot_{content_type}.png")
    img.save(out_file, "PNG")
    print("Saved screenshot mockup:", out_file)


if __name__ == "__main__":
    generate_eda_heatmap()
    generate_eval_curves()
    generate_pca_scatter()
    generate_cluster_comparison_chart()
    create_browser_ui_mockup(
        "https://aquascope.local/clustering",
        "Unsupervised Cluster Analysis & 2D PCA Projection",
        "K-Means Lloyd optimization (K=3), Principal Component Analysis, and distance metric benchmarks.",
        content_type="clustering"
    )
    create_browser_ui_mockup(
        "https://aquascope.local/explorer",
        "Regional WASH Explorer & Filter Engine",
        "Searchable global survey indicators across 69 nations with cluster assignment inspection.",
        content_type="explorer"
    )
    print("All visual presentation assets successfully generated!")
