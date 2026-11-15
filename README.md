# 🌊 AquaScope — Regional Water Intelligence Platform

> A college machine learning project for clustering global water-access regions and predicting water potability using K-Means and Random Forest.

---

## Table of Contents

1. [Project Introduction](#1-project-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Technologies Used](#4-technologies-used)
5. [Dataset Description](#5-dataset-description)
6. [Data Preprocessing](#6-data-preprocessing)
7. [ML Algorithm 1: K-Means Clustering](#7-ml-algorithm-1-k-means-clustering)
8. [Clustering Evaluation Metrics](#8-clustering-evaluation-metrics)
9. [PCA Visualization](#9-pca-visualization)
10. [ML Algorithm 2: Random Forest Classifier](#10-ml-algorithm-2-random-forest-classifier)
11. [System Architecture](#11-system-architecture)
12. [Installation Instructions](#12-installation-instructions)
13. [Project Folder Structure](#13-project-folder-structure)
14. [API Endpoints Reference](#14-api-endpoints-reference)
15. [How to Use the Application](#15-how-to-use-the-application)
16. [ML Results and Interpretation](#16-ml-results-and-interpretation)
17. [Project Limitations](#17-project-limitations)
18. [Future Scope](#18-future-scope)
19. [Viva / Presentation Guide](#19-viva--presentation-guide)
20. [Disclaimer](#20-disclaimer)

---

## 1. Project Introduction

**AquaScope** is a full-stack data-science web application that applies machine learning to the global water-access problem. It ingests regional WASH (Water, Sanitation, and Hygiene) statistics and drinking-water chemistry data, then:

- **Clusters** countries and regions by water-access indicators using **K-Means**, revealing hidden patterns such as "high urban access but poor rural coverage" that raw tables cannot easily show.
- **Predicts** whether a water sample is potable using a **Random Forest** classifier trained on physicochemical properties.
- **Visualises** results through an interactive React dashboard — bar charts, scatter plots, cluster profiles, evaluation curves, and a live prediction form.

The project demonstrates how modern data science tools (Python, Scikit-learn, Flask, React) can be combined into a coherent system to turn raw statistics into actionable insight. Even though this is built with demonstration data, the architecture and methodology scale directly to real-world datasets published by organisations like WHO and UNICEF.

---

## 2. Problem Statement

Access to safe drinking water is recognised as a fundamental human right, yet billions of people worldwide still lack it. According to the United Nations, over **2 billion people** live in water-stressed countries, and roughly **785 million** lack access to basic drinking water services. The gap between urban and rural access remains wide, and sanitation coverage lags further behind.

**The challenge for data science:**

Traditional spreadsheet reports describe the situation country-by-country, but they do not automatically reveal *groups* of countries sharing similar challenges. Policy makers who want to design targeted interventions — say, a rural electrification-plus-water programme — need to know *which cluster* of countries would benefit most.

AquaScope addresses this by:

1. Automatically grouping regions with similar water-access profiles (unsupervised learning).
2. Predicting whether a water source is chemically safe to drink (supervised learning).
3. Presenting both analyses in a web interface accessible to non-technical stakeholders.

---

## 3. Objectives

1. **Collect and structure** representative global water-access and water-quality datasets covering multiple regions, years, and geographic categories.
2. **Preprocess** raw data — handle missing values, normalise features, and prepare input matrices — following reproducible data-science best practices.
3. **Apply K-Means clustering** to group world regions by WASH indicators and determine the optimal number of clusters using the Elbow Method, Silhouette Score, and Davies-Bouldin Index.
4. **Visualise clusters** in two dimensions using Principal Component Analysis (PCA) so that patterns become visible even when many features exist.
5. **Train a Random Forest classifier** to predict water potability from physicochemical parameters and interpret the model through feature importance scores.
6. **Build a full-stack web application** (React + Flask) that exposes the ML models through a REST API and presents results in an interactive, user-friendly dashboard.

---

## 4. Technologies Used

| Technology | Purpose | Version |
|---|---|---|
| **Python** | Backend language, ML scripting | 3.8 + |
| **Flask** | REST API framework | 3.x |
| **Flask-CORS** | Cross-origin request handling | 4.x |
| **Pandas** | Data loading, manipulation, missing-value handling | 2.x |
| **NumPy** | Numerical arrays and operations | 1.x / 2.x |
| **Scikit-learn** | K-Means, Random Forest, PCA, StandardScaler, metrics | 1.x |
| **Joblib** | Saving / loading trained ML models | 1.x |
| **SciPy** | Statistical utilities | 1.x |
| **React** | Frontend UI library | 18.x |
| **Vite** | Frontend build tool and dev server | 5.x |
| **Recharts** | Chart components (bar, line, scatter) | 2.x |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **Axios** | HTTP client for API calls | 1.x |
| **Node.js** | JavaScript runtime for frontend tooling | 18 + |

---

## 5. Dataset Description

> ⚠️ **Important Disclaimer:** Both datasets bundled with this project are **sample demonstration datasets created for educational purposes**. The numbers are inspired by real-world ranges but are **not** official WHO or UNICEF figures. For genuine research or policy work, download data directly from the [WHO/UNICEF JMP portal](https://washdata.org/) or the [World Bank Open Data](https://data.worldbank.org/) catalogue.

### 5.1 WASH Dataset (`backend/data/wash_dataset.csv`)

This dataset contains regional water, sanitation, and hygiene (WASH) indicators for a range of countries across five continents. Each row represents one country for one year.

| Column | Description | Typical Range |
|---|---|---|
| `country` | Country name | — |
| `region` | Continent / sub-region label | Africa, Asia, Europe, … |
| `basic_water_access_pct` | % population with at least basic drinking-water service | 20 – 100 |
| `safely_managed_water_pct` | % population with safely managed drinking water | 10 – 99 |
| `unimproved_water_pct` | % using unimproved sources (unprotected wells, etc.) | 0 – 60 |
| `surface_water_pct` | % using surface water (rivers, lakes) directly | 0 – 30 |
| `rural_water_access_pct` | % rural population with basic water access | 10 – 99 |
| `urban_water_access_pct` | % urban population with basic water access | 50 – 100 |
| `sanitation_access_pct` | % with at least basic sanitation services | 15 – 99 |
| `hygiene_availability_pct` | % with handwashing facility and soap at home | 10 – 95 |
| `year` | Reference year | 2018 – 2023 |

**Source inspiration:** WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene.

### 5.2 Water Quality Dataset (`backend/data/water_quality.csv`)

Each row represents a physicochemical analysis of a water sample. The target variable (`Potability`) indicates whether the sample is safe to drink.

| Column | Description | Typical Range |
|---|---|---|
| `ph` | Acidity / alkalinity (WHO safe range: 6.5–8.5) | 0 – 14 |
| `Hardness` | Dissolved calcium and magnesium (mg/L) | 50 – 350 |
| `Solids` | Total dissolved solids (ppm) | 320 – 61,000 |
| `Chloramines` | Disinfectant concentration (ppm) | 0.5 – 13 |
| `Sulfate` | Dissolved sulphates (mg/L) | 130 – 500 |
| `Conductivity` | Electrical conductivity (μS/cm) | 180 – 750 |
| `Organic_carbon` | Total organic carbon (ppm) | 2 – 28 |
| `Trihalomethanes` | Disinfection by-products (μg/L) | 0.2 – 125 |
| `Turbidity` | Cloudiness of water (NTU) | 1.5 – 7 |
| `Potability` | **Target** — 1 = Potable, 0 = Not potable | 0 or 1 |

**Source inspiration:** Kadiwal, A. — *Water Potability* dataset, Kaggle (open-licence research dataset).

> 💡 Some rows contain intentional `NaN` values so that the preprocessing pipeline's imputation step is exercised during the demo.

---

## 6. Data Preprocessing

Before feeding raw data into any ML algorithm, we must clean and transform it. Here is exactly what AquaScope does, step by step.

### Step 1 — Load Data with Pandas

```python
import pandas as pd

df = pd.read_csv("backend/data/wash_dataset.csv")
print(df.shape)   # rows × columns
print(df.head())  # first 5 rows
```

`pd.read_csv()` reads a comma-separated file into a **DataFrame** — think of it as a smart spreadsheet that Python can manipulate. `df.shape` tells us how many rows and columns we have.

### Step 2 — Inspect Missing Values

```python
print(df.isnull().sum())   # count NaN per column
```

Real-world data always has gaps. `isnull()` returns a True/False mask; `.sum()` counts the `True` values per column.

### Step 3 — Handle Missing Values (Imputation)

```python
# WASH dataset — fill with column mean (numerical columns)
for col in numeric_cols:
    df[col].fillna(df[col].mean(), inplace=True)

# Water quality — fill with column median (more robust to outliers)
for col in numeric_cols:
    df[col].fillna(df[col].median(), inplace=True)
```

**Why mean vs median?**
- **Mean imputation** works well when data is roughly symmetric (no extreme outliers).
- **Median imputation** is better when the column has outliers (e.g., `Solids` can reach 61,000 ppm), because the median is not pulled by extreme values.

### Step 4 — Drop Non-Numeric Columns

```python
feature_cols = df.select_dtypes(include="number").columns.tolist()
X = df[feature_cols].values   # NumPy array
```

K-Means works with *numbers only*. Columns like `country` and `region` are text, so we exclude them from the feature matrix `X`. We keep them in the original DataFrame for labelling clusters later.

### Step 5 — Normalise with StandardScaler

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

`StandardScaler` transforms each column so it has **mean = 0** and **standard deviation = 1**. The formula applied to each value is:

```
z = (x - mean) / std_dev
```

### Why Does Normalisation Matter for K-Means?

K-Means measures distance between data points. If `basic_water_access_pct` ranges from 0–100 and `surface_water_pct` ranges from 0–5, the first feature dominates the distance calculation — not because it is more important, but just because it is *bigger*. After scaling, every feature contributes equally to the clustering geometry.

> ✅ **Rule of thumb:** Always scale before K-Means or any distance-based algorithm.

---

## 7. ML Algorithm 1: K-Means Clustering

### What is K-Means?

K-Means is an **unsupervised** machine learning algorithm that automatically divides a dataset into **K groups (clusters)** so that data points inside each group are as similar as possible, and data points in different groups are as different as possible.

"Unsupervised" means we do *not* tell the algorithm the correct answer. There are no labels. The algorithm discovers structure on its own.

### How K-Means Works — Step by Step

1. **Initialise:** Randomly pick K data points to serve as initial cluster centres (called *centroids*).
2. **Assign:** Calculate the distance from every data point to every centroid. Assign each point to the *nearest* centroid. This forms K initial clusters.
3. **Update:** Recalculate each centroid as the *mean* (average) of all points currently assigned to that cluster. The centroids move.
4. **Repeat:** Go back to Step 2, re-assign all points to the now-moved centroids, then update again. Keep repeating until assignments stop changing (convergence).
5. **Done:** The final clusters represent natural groupings in the data.

```
Iteration 1:  random centroids  →  first assignment
Iteration 2:  updated centroids →  better assignment
...
Iteration N:  centroids stable  →  algorithm stops
```

### What Does K Mean?

`K` is simply the **number of clusters** you want. If `K=3`, the algorithm will split the data into exactly 3 groups. Choosing K is one of the most important — and tricky — decisions in clustering. We evaluate multiple values (K = 2 through 6) and use the Elbow Method and Silhouette Score to pick the best one.

### Why Try Multiple K Values?

There is no single correct K for most datasets. With too few clusters, very different countries get lumped together; with too many, clusters become artificially narrow. We plot evaluation metrics for K = 2, 3, 4, 5, 6 and look for the K that gives the best balance.

### Role of `random_state`

```python
KMeans(n_clusters=3, random_state=42)
```

Because initial centroids are chosen randomly, running K-Means twice on the same data can give different results. Setting `random_state=42` (any fixed integer) makes the random choices reproducible — your classmate will get exactly the same clusters as you.

---

## 8. Clustering Evaluation Metrics

After running K-Means, how do we know if the clusters are actually good? We use four metrics.

### 8.1 WCSS — Within-Cluster Sum of Squares (Elbow Method)

**What it is:** WCSS sums the squared distances between each data point and its cluster's centroid. It measures how *tightly packed* each cluster is.

**Formula:**
```
WCSS = Σ (distance from point to its centroid)²
```

**What a good score looks like:** Lower WCSS is better (points closer to their centroid). However, WCSS always decreases as K increases, so we do not simply minimise it. Instead, we plot WCSS vs K and look for an **"elbow"** — the point where the curve bends sharply. Beyond that K, adding more clusters gives diminishing returns.

```
WCSS
 |   *
 |      *
 |          *
 |               *   ← elbow (best K)
 |                   * * *
 +-------------------------------- K
     2   3   4   5   6   7
```

**How to interpret it:** If the elbow is at K = 4, then 4 clusters likely captures the main structure in your data.

### 8.2 Silhouette Score

**What it is:** For each data point, the Silhouette Score measures:
- How similar it is to points in its **own cluster** (cohesion).
- How different it is from points in the **nearest other cluster** (separation).

**Scale:** −1 to +1
- **Close to +1:** The point is well inside its cluster and far from others — excellent clustering.
- **Close to 0:** The point is on the border between two clusters — ambiguous.
- **Negative:** The point may have been assigned to the wrong cluster — poor clustering.

**Rule of thumb:**
| Score Range | Interpretation |
|---|---|
| 0.71 – 1.00 | Strong structure |
| 0.51 – 0.70 | Reasonable structure |
| 0.26 – 0.50 | Weak structure |
| ≤ 0.25 | No meaningful structure |

### 8.3 Davies-Bouldin Index

**What it is:** For each cluster, it finds the cluster most similar to it (the worst-case neighbour), computes a similarity ratio, then averages across all clusters.

**Lower is better.** A score of 0 would be perfect (completely separate, compact clusters).

The Davies-Bouldin Index penalises clusters that are both spread out *and* close to other clusters — exactly what we want to avoid.

### 8.4 Cluster Stability

**What it is:** We run K-Means multiple times (e.g., 10 runs with different random seeds) and record the Silhouette Score each time. We then report the **mean** and **standard deviation** of those scores.

- **Low standard deviation:** The algorithm finds consistent clusters regardless of random initialisation — the structure is real.
- **High standard deviation:** Results vary a lot — the clusters may not be stable and K might need to change.

---

## 9. PCA Visualization

### What is PCA?

**Principal Component Analysis (PCA)** is a dimensionality reduction technique. It takes a dataset with many columns (dimensions) and compresses it into fewer dimensions while preserving as much variation as possible.

In plain English: PCA finds the two directions in multi-dimensional space along which the data "spreads out" the most, then projects every data point onto those two directions. The result is a 2D set of coordinates that we can plot on a regular scatter plot.

### Why We Use It for Visualisation

Our WASH dataset has 9 numeric features. No human can visualise 9-dimensional space. PCA collapses those 9 dimensions into 2 "principal components" that capture the majority of the variance, making it possible to see cluster shapes with our own eyes.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
pca_coords = pca.fit_transform(X_scaled)
explained_variance = pca.explained_variance_ratio_
```

### How to Interpret the Scatter Plot

Each dot on the PCA scatter plot is one country/region. Dots are coloured by their K-Means cluster label. When you see:
- **Tight, well-separated colour blobs:** The clusters are distinct — the algorithm did a good job.
- **Mixed / overlapping colours:** Clusters share similar characteristics — the K may be too high, or the data may not cluster cleanly.

### What Explained Variance Means

```python
print(explained_variance)  # e.g., [0.62, 0.18]
```

This output means:
- **Component 1** captures 62 % of the total variation in the data.
- **Component 2** captures 18 % of the total variation.
- Together, the 2D plot represents **80 %** of all the information in the original 9D data.

Higher total explained variance = less information lost in projection = more trustworthy 2D picture.

---

## 10. ML Algorithm 2: Random Forest Classifier

### What is Random Forest?

A **Random Forest** is an **ensemble** (collection) of many **decision trees** working together. Each individual tree is a flowchart-like structure that asks a series of yes/no questions about input features to arrive at a prediction. The forest aggregates the votes of all trees and returns the majority answer.

### How It Works (Simplified)

1. **Bootstrap sampling:** For each tree, randomly pick a sample of training rows (with replacement). Different trees see slightly different data — this is called *bagging*.
2. **Random feature selection:** At each split inside a tree, only a random subset of features is considered. This prevents all trees from being identical.
3. **Grow each tree:** Each tree makes the best possible split at each node until it is fully grown (or hits a depth limit).
4. **Aggregate votes:** For a new data point, each tree in the forest votes for a class (Potable or Not Potable). The final prediction is whichever class gets the most votes.

```
Input: [pH=7.2, Hardness=200, ...]
  │
  ├─ Tree 1 → Potable
  ├─ Tree 2 → Not Potable
  ├─ Tree 3 → Potable
  ├─ Tree 4 → Potable
  └─ Tree 5 → Potable
  
  Majority: Potable ✅  (confidence ≈ 80%)
```

### Why We Use It for Water Quality Prediction

Random Forest is well-suited here because:
- It handles **non-linear relationships** (e.g., pH matters, but only outside a certain range).
- It is **robust to outliers** in chemistry measurements.
- It provides **feature importance scores**, showing which chemicals most influence potability.
- It works well on **moderately imbalanced** datasets without extensive tuning.

### Feature Importance

After training, Scikit-learn can tell us how much each feature contributed to the model's decisions:

```python
importances = model.feature_importances_
# e.g., {'ph': 0.14, 'Sulfate': 0.13, 'Conductivity': 0.12, ...}
```

A higher importance score means that feature was used more frequently and more decisively across all trees. This tells domain experts which water parameters are most predictive of safety — useful even beyond the ML model itself.

---

## 11. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              React Frontend (Vite)                  │   │
│   │  Port 5173                                          │   │
│   │                                                     │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│   │  │Dashboard │  │Clustering│  │Water Quality     │  │   │
│   │  │ Page     │  │ Page     │  │Predictor Page    │  │   │
│   │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │   │
│   └───────┼─────────────┼────────────────┼─────────────┘   │
│           │  Axios HTTP  │                │                  │
└───────────┼─────────────┼────────────────┼──────────────────┘
            │             │                │
            ▼             ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│               Flask Backend  (Port 5000)                    │
│                                                             │
│   /api/dashboard    /api/clustering     /api/predict-...    │
│   /api/dataset      /api/evaluation     /api/health         │
│   /api/cluster-...  /api/upload                             │
│                                                             │
│   ┌───────────────────────────────────────────────────┐     │
│   │                 ML Modules                        │     │
│   │                                                   │     │
│   │  preprocessing.py   clustering.py   evaluation.py│     │
│   │  water_quality.py                                 │     │
│   └───────────────┬───────────────────────────────────┘     │
│                   │                                         │
│   ┌───────────────┴───────────────────────────────────┐     │
│   │   Datasets & Saved Models                         │     │
│   │   wash_dataset.csv   water_quality.csv            │     │
│   │   models/water_quality_model.pkl                  │     │
│   └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Data flow for a clustering request:**
1. User selects K = 4 and clicks "Run Clustering" in the React UI.
2. React sends `POST /api/clustering` with `{"n_clusters": 4}` via Axios.
3. Flask receives the request, calls `preprocessing.py` → `clustering.py` → `evaluation.py`.
4. JSON response with labels, cluster profiles, and PCA coordinates is returned.
5. React renders a coloured scatter plot and cluster summary table.

---

## 12. Installation Instructions

### Prerequisites

| Requirement | Minimum Version | Check Command |
|---|---|---|
| Python | 3.8 + | `python --version` |
| pip | 21 + | `pip --version` |
| Node.js | 18 + | `node --version` |
| npm | 9 + | `npm --version` |

### 1️⃣ Clone or Download the Project

```bash
git clone <your-repo-url>
cd aquascope
```

Or extract the ZIP archive and open a terminal in the `aquascope/` folder.

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# (Recommended) Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * Training water quality model...
 * Model trained and saved.
```

> ⚠️ The first run trains and saves the Random Forest model. This may take 10–20 seconds. Subsequent runs load the cached `.pkl` file and start instantly.

### 3️⃣ Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x  ready in Xms

  ➜  Local:   http://localhost:5173/
```

### 4️⃣ Access the Application

| Service | URL |
|---|---|
| **Frontend (React UI)** | http://localhost:5173 |
| **Backend REST API** | http://localhost:5000 |
| **API Health Check** | http://localhost:5000/api/health |

---

## 13. Project Folder Structure

```
aquascope/
│
├── README.md                    ← Full project documentation and viva guide
├── .gitignore                   ← Git ignore rules
│
├── backend/                     ← Python / Flask server
│   ├── app.py                   ← Flask application entry point & factory
│   ├── requirements.txt         ← Python package dependencies
│   ├── test_app.py              ← Automated Pytest test suite (12 tests)
│   │
│   ├── data/                    ← CSV datasets
│   │   ├── wash_dataset.csv     ← WASH indicators (69 countries, 11 features)
│   │   └── water_quality.csv    ← Water chemistry (220 samples, 10 features)
│   │
│   ├── database/                ← SQLite storage layer
│   │   ├── __init__.py
│   │   ├── db.py                ← SQLite table schema & logging functions
│   │   └── aquascope.db         ← SQLite database (predictions & uploads)
│   │
│   ├── ml/                      ← Machine learning modules
│   │   ├── preprocessing.py     ← Missing value imputation & StandardScaler
│   │   ├── clustering.py        ← K-Means, profiles, stability & distance benchmark
│   │   ├── evaluation.py        ← WCSS, Silhouette, DB index, 2D PCA projection
│   │   └── water_quality.py     ← Random Forest training, evaluation & inference
│   │
│   ├── models/                  ← Serialized model files (.joblib)
│   │   └── water_quality_model.joblib
│   │
│   └── routes/                  ← Flask REST API Blueprints
│       ├── dashboard.py         ← /api/dashboard
│       ├── clustering.py        ← /api/dataset, /api/clustering, /api/evaluation, /api/upload
│       └── prediction.py        ← /api/predict-water-quality, /api/prediction-history, /api/water-quality-metrics, /api/health
│
└── frontend/                    ← React / Vite application
    ├── index.html               ← HTML shell
    ├── package.json             ← npm dependencies
    ├── vite.config.js           ← Vite proxy configuration (/api -> :5000)
    ├── tailwind.config.js       ← Tailwind CSS configuration
    ├── postcss.config.js        ← PostCSS plugins
    │
    └── src/
        ├── main.jsx             ← React DOM root entry point
        ├── App.jsx              ← React Router & 6-page navigation layout
        ├── index.css            ← Global styles & custom component classes
        │
        ├── pages/               ← 6 Core Functional Dashboard Pages
        │   ├── LandingPage.jsx  ← Page 1: Hero branding & platform statistics
        │   ├── Dashboard.jsx    ← Page 2: High-level WASH analytics & ladders
        │   ├── ClusterAnalysis.jsx ← Page 3: K-Means, PCA, metrics, Manhattan benchmark & upload
        │   ├── WaterQualityPrediction.jsx ← Page 4: Parameter form, confidence, importance & history
        │   ├── RegionalExplorer.jsx ← Page 5: Searchable table, continent cards & CSV export
        │   └── AboutProject.jsx ← Page 6: SDG 6, architecture, metrics & oral viva Q&A
        │
        ├── components/          ← Reusable UI components
        │   ├── Sidebar.jsx      ← Navy navigation sidebar
        │   ├── StatCard.jsx     ← Metric card with icon and colored accent
        │   ├── ClusterBadge.jsx ← Dynamic cluster pill with color dot
        │   └── LoadingSpinner.jsx ← Animated loading indicator
        │
        └── services/
            └── api.js           ← Axios client & API wrapper methods
```

---

## 14. API Endpoints Reference

### Dashboard

| Method | Endpoint | Description | Request Body | Response Keys |
|---|---|---|---|---|
| `GET` | `/api/dashboard` | Aggregated WASH statistics for the overview page | — | `total_regions`, `avg_basic_water_access`, `avg_sanitation_access`, `avg_hygiene_availability`, `avg_rural_access`, `avg_urban_access`, `dataset_records`, `top_regions`, `bottom_regions`, `year_range` |

### Dataset & Clustering

| Method | Endpoint | Description | Request Body | Response Keys |
|---|---|---|---|---|
| `GET` | `/api/dataset` | Dataset preview and schema | — | `columns`, `preview`, `total_rows`, `missing_values_summary`, `feature_names` |
| `POST` | `/api/clustering` | Run K-Means with chosen K | `{"n_clusters": 4}` | `labels`, `cluster_profiles`, `pca_coords`, `explained_variance`, `n_clusters`, `regions` |
| `GET` | `/api/evaluation` | Metrics for K = 2–6 | — | `metrics` (list of `{k, wcss, silhouette_score, davies_bouldin_score}`), `best_k_silhouette`, `best_k_davies` |
| `GET` | `/api/cluster-profiles` | Profiles from most recent clustering run | — | Cluster profile dict |
| `POST` | `/api/upload` | Upload a custom WASH CSV | Multipart form (`file`) | `message`, `rows`, `columns` |

### Water Quality Prediction & Health

| Method | Endpoint | Description | Request Body | Response Keys |
|---|---|---|---|---|
| `POST` | `/api/predict-water-quality` | Predict potability from water parameters | `{"ph": 7.0, "Hardness": 200, "Solids": 20000, "Chloramines": 7, "Sulfate": 350, "Conductivity": 420, "Organic_carbon": 14, "Trihalomethanes": 70, "Turbidity": 4}` | `prediction`, `prediction_label`, `confidence`, `feature_importances`, `parameter_flags`, `disclaimer`, `region_info` |
| `GET` | `/api/prediction-history` | Fetch recent prediction records from SQLite | Query param: `limit=10` | `history`, `count` |
| `GET` | `/api/water-quality-metrics` | Retrieve test metrics of trained Random Forest model | — | `metrics` (`accuracy`, `precision`, `recall`, `f1_score`, `confusion_matrix`, `classification_report`) |
| `GET` | `/api/health` | Server, SQLite and model status | — | `status`, `model_trained`, `dataset_loaded`, `version` |

---

## 15. How to Use the Application

### 🏠 Page 1 — Dashboard

1. Open http://localhost:5173 in your browser.
2. The Dashboard loads automatically with summary statistics: total regions, average water access percentages, rural vs urban split, and sanitation coverage.
3. Bar charts show the top 5 and bottom 5 regions by basic water access.
4. No interaction required — data loads on page open.

### 📊 Page 2 — Dataset Explorer (within Clustering page)

1. Navigate to **Clustering** in the top navigation bar.
2. The dataset preview table shows the first 20 rows of `wash_dataset.csv`.
3. A summary panel shows total rows, number of missing values per column, and the list of numeric features used for clustering.
4. This page is read-only — it helps you understand what goes into the ML algorithm.

### 🔵 Page 3 — Clustering

1. On the **Clustering** page, use the K slider or input box to select a number of clusters (2–6).
2. Click **"Run Clustering"**.
3. After a moment, three things appear:
   - **PCA Scatter Plot:** Coloured dots representing each country, grouped by cluster.
   - **Cluster Profiles Table:** Average feature values for each cluster (e.g., Cluster 0 = "High Access", Cluster 1 = "Low Rural Access").
   - **Cluster Assignments:** A list showing which countries belong to each cluster.
4. Try different K values and compare how the scatter plot changes.

### 📈 Page 4 — Evaluation Metrics

1. Navigate to **Evaluation**.
2. The page automatically runs K-Means for K = 2 through 6 and plots:
   - **Elbow Curve:** WCSS vs K — look for the bend.
   - **Silhouette Score vs K:** Higher is better — look for the peak.
   - **Davies-Bouldin Index vs K:** Lower is better — look for the dip.
3. The page highlights the K that scores best on Silhouette and Davies-Bouldin.
4. Use this K as your recommended number of clusters in the Clustering page.

### 💧 Page 5 — Water Quality Predictor

1. Navigate to **Water Quality Predictor**.
2. Fill in the form with water chemistry values. Default placeholder values are provided to help you understand typical ranges.
3. Click **"Predict Potability"**.
4. The result shows:
   - **Prediction:** "Potable ✅" or "Not Potable ❌"
   - **Confidence:** The percentage of Random Forest trees that voted for this outcome.
   - **Feature Importances:** A bar chart showing which parameters most influenced the decision.
5. Read the disclaimer at the bottom — this tool is for educational demonstration only.

---

## 16. ML Results and Interpretation

> 📌 **Note:** Specific numeric results (accuracy percentages, exact silhouette scores) are not stated here because they depend on the random state, the dataset version, and your machine's floating-point behaviour. The guidance below tells you *how to read* whatever numbers you do see.

### Elbow Plot

Look at the WCSS curve from K = 2 to K = 6. The "elbow" is the K value where the curve changes from steeply falling to nearly flat. Choosing K at the elbow means you get most of the clustering benefit without over-fragmenting the data.

If the elbow is not obvious (the curve falls smoothly), use the Silhouette Score to break the tie.

### Silhouette Score

A Silhouette Score **above 0.5** generally means the clusters are reasonably well-defined — most points sit comfortably inside one cluster and away from others. A score **above 0.7** is excellent. A score **below 0.25** suggests the data may not cluster neatly at this K.

If your highest Silhouette Score occurs at K = 3, choose K = 3 for your analysis.

### Cluster Profiles

Each cluster profile table row shows the average value of each WASH indicator within that cluster. Use these to give clusters meaningful names:
- A cluster where `basic_water_access_pct ≈ 95` and `safely_managed_water_pct ≈ 85` → label it **"High Access"**.
- A cluster where `surface_water_pct ≈ 25` → label it **"Surface-Water Dependent"**.
- A cluster where `rural_water_access_pct` is much lower than `urban_water_access_pct` → label it **"Urban-Rural Divide"**.

Labelling clusters with domain knowledge is what turns raw ML output into actionable insight.

### Prediction Confidence

The confidence percentage from the Random Forest predictor reflects the fraction of its trees that voted for the given class. For example, "Potable — 76% confidence" means 76 out of 100 trees voted "Potable". A confidence close to 50% signals that the model is uncertain — the sample is chemically borderline.

---

## 17. Project Limitations

Understanding limitations is as important as understanding capabilities. Any honest ML project must acknowledge them.

### 📂 Sample Dataset Limitations
The WASH and water quality datasets bundled with this project are **illustrative, not authoritative**. They are designed to exercise the ML pipeline and produce interesting clusters, not to accurately represent the actual water situation in any specific country. Conclusions drawn from this data should not be generalised to real-world policy.

### 🎲 K-Means Sensitivity to Initialisation
K-Means starts with randomly chosen centroids. Although `random_state=42` ensures reproducibility within this project, different random seeds can produce meaningfully different cluster assignments — especially when clusters are close together or when K is not well-chosen. This is why we report cluster stability (standard deviation across runs).

### 🔢 Choosing K is Subjective
The Elbow Method and Silhouette Score narrow down good K values, but the final choice still involves human judgment. There is rarely one "correct" K — it depends on the question you are trying to answer.

### 🧪 Water Quality Model is Not a Certified Safety Assessment
The Random Forest predictor was trained on a demonstration dataset. It has **not** been validated against laboratory results or certified by any health authority. Its predictions must **never** be used to decide whether real water is safe to consume. Always rely on certified laboratory testing for actual safety decisions.

### 📏 No Temporal Analysis
The dataset includes a `year` column, but the current ML pipeline treats all years as equivalent. Trends over time (is access improving? is it declining?) are not modelled.

### 🌐 Not Suitable for Real-World Policy Without Proper Validation
Deploying any ML model for public health decisions requires peer review, adversarial testing, fairness analysis, and regulatory approval. This project is a *learning prototype*, not a production system.

---

## 18. Future Scope

AquaScope as built demonstrates the core pipeline. Here are seven directions to extend it into a more powerful tool:

1. **Real Data Integration:** Connect to live WHO/JMP API endpoints or World Bank data APIs and schedule automatic dataset refreshes, so the platform always reflects the latest official figures.

2. **Time-Series Analysis:** Add a longitudinal clustering mode (e.g., LSTM or temporal K-Means) to track how clusters shift from year to year and identify countries that are improving or deteriorating.

3. **Geospatial Visualisation:** Integrate a map library (Leaflet.js or Mapbox) to colour-code countries on an actual world map by cluster membership, making the results instantly interpretable by any audience.

4. **Deep Learning for Water Quality:** Replace or complement Random Forest with a neural network (e.g., a simple MLP in PyTorch or TensorFlow) trained on a larger, certified water-quality dataset.

5. **Custom CSV Upload Pipeline:** Extend the upload endpoint to validate column names, run preprocessing automatically, and generate a full clustering report for user-supplied datasets — turning AquaScope into a reusable analysis tool.

6. **User Authentication and Report Export:** Add login support so analysts can save their clustering configurations and export PDF or Excel reports of cluster profiles and evaluation metrics.

7. **Automated Cluster Labelling with LLMs:** Pass cluster profile statistics to a language model API that suggests human-readable cluster names and policy recommendations based on the statistical patterns.

---

## 19. Viva / Presentation Guide

This section is specifically written for college students preparing for a project viva or final presentation. Read it the night before!

---

### 🎓 Key Questions and Model Answers

---

**Q1: What is the main goal of your project?**

> AquaScope uses machine learning to analyse global water access data. It has two ML components: an unsupervised K-Means clustering model that groups countries by water-access indicators, and a supervised Random Forest classifier that predicts whether a water sample is safe to drink. The results are presented through a web interface built with React and Flask.

---

**Q2: How do you explain K-Means in simple words?**

> Imagine you have a bag of mixed fruits — apples, oranges, and bananas — but nobody has labelled them. K-Means is like asking someone to sort that bag into K groups based on how the fruits look (colour, size, shape). The algorithm starts by picking K random starting points, assigns every fruit to the nearest starting point, recalculates the "centre" of each group, and repeats until nothing changes. In our project, the "fruits" are countries and the "features" are water-access percentages.

---

**Q3: How do you explain PCA in simple words?**

> PCA is like making a shadow of a 3D object on a 2D wall. The original object (our data) has many dimensions (9 features). PCA finds the angle that casts the most informative shadow — the one that preserves as much shape as possible — and projects the data onto a flat 2D plane. We then plot that 2D projection as a scatter plot, so we can see the clusters with our own eyes.

---

**Q4: Why is clustering called "unsupervised" learning?**

> In supervised learning, we give the algorithm labelled examples — "this country has HIGH access, this one has LOW access" — and it learns to replicate those labels. In unsupervised learning, we give the algorithm data *without* any labels and ask it to find patterns on its own. K-Means does not know what a "high access" or "low access" country looks like beforehand; it discovers those groupings purely from the numbers.

---

**Q5: Why did you use Random Forest instead of a simpler algorithm like Logistic Regression?**

> Logistic Regression assumes the relationship between features and the output is roughly linear. Water potability depends on complex interactions — for example, pH alone does not determine safety, but *combined with* high turbidity and low chloramines it does. Random Forest naturally handles these non-linear interactions through its tree-based splitting. It also gives us feature importances for free, which adds interpretability.

---

**Q6: What is the Elbow Method and how did you use it?**

> The Elbow Method plots the Within-Cluster Sum of Squares (WCSS) for different values of K. As K increases, WCSS always decreases because clusters get smaller. But the rate of decrease slows down after a certain point — that slowdown looks like an elbow on the graph. The K value at the elbow is where adding more clusters gives diminishing returns in tightness, so it is a good estimate of the natural number of groups in the data.

---

**Q7: What does the Silhouette Score tell you?**

> The Silhouette Score for a data point measures how similar it is to its own cluster compared to the nearest other cluster. It ranges from −1 to +1. A score near +1 means the point is well inside its cluster and far from others. A score near 0 means it is on the boundary. We average this across all points to get one number per K value. We pick the K with the highest average Silhouette Score.

---

**Q8: What are the limitations of your project?**

> The main limitations are: (1) the datasets are for demonstration only and not official figures, so real-world conclusions should not be drawn; (2) K-Means is sensitive to the random initialisation of centroids; (3) the water quality predictor has not been validated and must not be used for actual safety decisions; (4) the system does not model trends over time.

---

**Q9: How is your project different from just making a chart in Excel?**

> Excel can produce charts of raw data, but it cannot automatically discover *hidden groups* in the data — you have to know what to look for. K-Means finds those groups without prior knowledge. Additionally, the Random Forest model learns to generalise from training examples and can predict outcomes for entirely new, unseen water samples — something a static chart cannot do. The web interface also makes the analysis accessible to any user, not just someone who can run Python scripts.

---

**Q10: How would you scale this to a real production system?**

> For production, we would: replace demonstration data with certified WHO/JMP datasets via API; containerise the application with Docker and deploy on a cloud platform; add authentication and role-based access; implement model retraining pipelines as new data arrives; and have the model outputs reviewed by water-safety domain experts before any stakeholder-facing deployment.

---

## 20. Disclaimer

> [!IMPORTANT]
> **This project is built for educational purposes as part of a college machine learning curriculum.**

- The datasets included (`wash_dataset.csv`, `water_quality.csv`) are **sample demonstration datasets** created to exercise the data preprocessing and ML pipeline. They are **not** official datasets from the World Health Organization (WHO), UNICEF, the Joint Monitoring Programme (JMP), or any other authoritative body.

- The numbers, country statistics, and water chemistry readings in these files are **illustrative only** and may not reflect real-world conditions in any specific country or region.

- The water quality prediction feature is a **machine learning demonstration** and does **not** constitute a certified safety assessment. It must **never** be used to determine whether water is safe for human consumption. For genuine safety testing, consult a certified laboratory.

- For real research or policy work, obtain data from:
  - **WHO/UNICEF JMP:** https://washdata.org/
  - **World Bank Open Data:** https://data.worldbank.org/
  - **UNICEF Data Warehouse:** https://data.unicef.org/

- All trademarks, datasets, and organisation names mentioned are the property of their respective owners.

---

<p align="center">
  Built with ❤️ as a college ML project &nbsp;|&nbsp; AquaScope &nbsp;🌊
</p>
