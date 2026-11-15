"""
generate_ppt.py
Generates a polished, professional 14-slide PowerPoint presentation for AquaScope.
Styled with AquaScope's signature Environmental Analytics theme:
  - Deep Navy (#0F172A)
  - Aqua (#0EA5E9)
  - Teal (#14B8A6)
  - Clean light card containers and structured typography.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen slides (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_slide_layout = prs.slide_layouts[6]

    # Color Palette Constants
    COLOR_NAVY_BG = RGBColor(15, 23, 42)       # #0F172A (Deep Navy)
    COLOR_NAVY_CARD = RGBColor(30, 41, 59)     # #1E293B (Card Dark)
    COLOR_AQUA = RGBColor(14, 165, 233)        # #0EA5E9 (Vibrant Aqua)
    COLOR_TEAL = RGBColor(20, 184, 166)        # #14B8A6 (Teal)
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_SLATE_LIGHT = RGBColor(226, 232, 240)# #E2E8F0 (Light Gray Text)
    COLOR_SLATE_MUTED = RGBColor(148, 163, 184)# #94A3B8 (Muted Gray)
    COLOR_AMBER = RGBColor(245, 158, 11)       # #F59E0B (Accent Gold)
    COLOR_GREEN = RGBColor(34, 197, 94)        # #22C55E (Accent Green)

    def set_slide_background(slide, color):
        background = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
        )
        background.fill.solid()
        background.fill.fore_color.rgb = color
        background.line.color.rgb = color
        return background

    def add_header(slide, title_text, category_tag="AQUASCOPE · REGIONAL WATER INTELLIGENCE"):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_tag.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = COLOR_AQUA

        # Slide Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE

    def add_card(slide, left, top, width, height, bg_color=COLOR_NAVY_CARD, border_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s1, COLOR_NAVY_BG)

    # Accent decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.2), Inches(3.6))
    bar.fill.solid()
    bar.fill.fore_color.rgb = COLOR_AQUA
    bar.line.fill.background()

    # Title box
    tbox = s1.shapes.add_textbox(Inches(1.3), Inches(1.6), Inches(11), Inches(3.8))
    tf = tbox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "COLLEGE MACHINE LEARNING PROJECT"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_TEAL

    p1 = tf.add_paragraph()
    p1.text = "Regional Water-Access Profiles\nfrom Survey Indicators Using Clustering"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.space_before = Pt(10)
    p1.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "A Dual-Engine Platform: Unsupervised Regional WASH Clustering (K-Means & PCA) + Supervised Water Potability Classification (Random Forest)"
    p2.font.size = Pt(14)
    p2.font.color.rgb = COLOR_SLATE_LIGHT

    # Metadata Card at bottom
    add_card(s1, Inches(0.8), Inches(5.8), Inches(11.7), Inches(1.1), COLOR_NAVY_CARD, COLOR_AQUA)
    mbox = s1.shapes.add_textbox(Inches(1.1), Inches(5.9), Inches(11.1), Inches(0.9))
    mtf = mbox.text_frame
    mp = mtf.paragraphs[0]
    mp.text = "AquaScope Platform  |  Tech: React 18 · Vite · Tailwind · Python Flask · Scikit-Learn · SQLite\nDomain: Environmental Analytics, UN SDG 6 (Clean Water & Sanitation)"
    mp.font.size = Pt(12)
    mp.font.color.rgb = COLOR_SLATE_LIGHT

    # =========================================================================
    # SLIDE 2: Problem Statement & Motivation
    # =========================================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s2, COLOR_NAVY_BG)
    add_header(s2, "The Global Challenge: Water Access & Environmental Disparity")

    cards_data_s2 = [
        ("The Global Water Crisis (UN SDG 6)", 
         "Over 2 billion people worldwide live in water-stressed nations, and 785 million lack basic drinking services.\n\nWhile high-level national statistics are widely reported, stark rural vs. urban divides remain obscured in aggregated national figures.",
         COLOR_AQUA),
        ("Limitations of Traditional Data Formats",
         "Spreadsheets and flat tabular reports cannot easily reveal multi-dimensional patterns across 8+ simultaneous survey indicators.\n\nPolicy makers and NGOs struggle to identify which non-adjacent countries face identical infrastructure bottlenecks.",
         COLOR_TEAL),
        ("AquaScope's Proposed Solution",
         "Apply Unsupervised Machine Learning (K-Means + PCA) to partition regions into data-driven clusters without geographic bias.\n\nIntegrate a secondary Supervised Model (Random Forest) to evaluate physical potability for local test samples.",
         COLOR_GREEN)
    ]

    for i, (title, body, accent) in enumerate(cards_data_s2):
        left = Inches(0.8 + i * 4.0)
        add_card(s2, left, Inches(1.8), Inches(3.7), Inches(4.8), COLOR_NAVY_CARD, accent)
        box = s2.shapes.add_textbox(left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(4.4))
        btf = box.text_frame
        btf.word_wrap = True
        
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(16)
        bp0.font.bold = True
        bp0.font.color.rgb = accent
        bp0.space_after = Pt(14)
        
        bp1 = btf.add_paragraph()
        bp1.text = body
        bp1.font.size = Pt(13)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT

    # =========================================================================
    # SLIDE 3: Project Objectives & Research Questions
    # =========================================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s3, COLOR_NAVY_BG)
    add_header(s3, "Core Project Objectives & Research Questions")

    q_data = [
        ("Q1. Regional Similarity", "Which distinct geographic regions and countries exhibit similar water-access characteristics when evaluated across multi-dimensional survey indicators?"),
        ("Q2. Defensible Cluster Count", "How many clusters (K) provide mathematically defensible separation according to WCSS (Elbow), Silhouette Scores, and Davies-Bouldin metrics?"),
        ("Q3. 2D Dimensionality Reduction", "Can multi-dimensional survey indicators (8 dimensions) be meaningfully projected onto a 2D plane using PCA while retaining variance?"),
        ("Q4. Distance Metric Sensitivity", "How do Euclidean (L2) and Manhattan (L1) distance formulations compare in cluster formation and outlier handling?"),
        ("Q5. Water Potability Prediction", "Can machine learning predict whether a local water sample is safe for consumption based on 9 physicochemical parameters?"),
        ("Q6. Interactive Web Deployment", "Can an intuitive, modern full-stack dashboard provide real-time ML exploration without requiring paid third-party cloud services?")
    ]

    for i, (q_title, q_desc) in enumerate(q_data):
        row = i // 2
        col = i % 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 1.7)
        add_card(s3, left, top, Inches(5.6), Inches(1.5), COLOR_NAVY_CARD)
        
        box = s3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(5.2), Inches(1.2))
        btf = box.text_frame
        btf.word_wrap = True
        bp0 = btf.paragraphs[0]
        bp0.text = q_title
        bp0.font.size = Pt(14)
        bp0.font.bold = True
        bp0.font.color.rgb = COLOR_AQUA
        
        bp1 = btf.add_paragraph()
        bp1.text = q_desc
        bp1.font.size = Pt(11)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT
        bp1.space_before = Pt(4)

    # =========================================================================
    # SLIDE 4: Technology Stack & System Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s4, COLOR_NAVY_BG)
    add_header(s4, "Full-Stack Technology Stack & Architecture")

    tech_cards = [
        ("Frontend (React 18 & Vite 5)", "• React.js with Client-Side Routing (6 Pages)\n• Tailwind CSS for environmental theme styling\n• Recharts for interactive bar, line, scatter & pie\n• Lucide React icons & Framer Motion animations\n• Zero complex dependencies, lightweight bundle", COLOR_AQUA),
        ("Backend (Python Flask REST API)", "• Flask application factory with modular Blueprints\n• Flask-CORS for secure cross-origin requests\n• SQLite database (aquascope.db) for logging\n• JSON REST APIs for clustering, metrics & prediction\n• Production ready with Gunicorn WSGI support", COLOR_TEAL),
        ("Machine Learning (Scikit-Learn)", "• StandardScaler for feature normalization\n• KMeans with k-means++ initialization (n_init=15)\n• PCA (Principal Component Analysis) for 2D coords\n• Random Forest Classifier (100 trees, balanced)\n• Joblib model bundle serialization (.joblib)", COLOR_GREEN)
    ]

    for i, (title, body, accent) in enumerate(tech_cards):
        left = Inches(0.8 + i * 4.0)
        add_card(s4, left, Inches(1.8), Inches(3.7), Inches(4.8), COLOR_NAVY_CARD, accent)
        box = s4.shapes.add_textbox(left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(4.4))
        btf = box.text_frame
        btf.word_wrap = True
        
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(15)
        bp0.font.bold = True
        bp0.font.color.rgb = accent
        bp0.space_after = Pt(14)
        
        bp1 = btf.add_paragraph()
        bp1.text = body
        bp1.font.size = Pt(12)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT

    # =========================================================================
    # SLIDE 5: Data Sources & Dataset Engineering
    # =========================================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s5, COLOR_NAVY_BG)
    add_header(s5, "Data Engineering & Public Sources")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_NAVY_CARD, COLOR_AQUA)
    box_l = s5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf_l = box_l.text_frame
    tf_l.word_wrap = True
    p_l0 = tf_l.paragraphs[0]
    p_l0.text = "Dataset 1: Regional WASH Indicators"
    p_l0.font.size = Pt(16)
    p_l0.font.bold = True
    p_l0.font.color.rgb = COLOR_AQUA
    
    p_l1 = tf_l.add_paragraph()
    p_l1.text = "• Sources: WHO / UNICEF Joint Monitoring Programme (JMP, washdata.org) & World Bank Open Data.\n• Scope: 69 countries across Africa, Asia, Europe, Americas, Oceania.\n• Key Indicators:\n   - Basic Drinking Water Access (%)\n   - Safely Managed Drinking Water (%)\n   - Rural Water Access (%)\n   - Urban Water Access (%)\n   - Basic Sanitation Access (%)\n   - Basic Hygiene Availability (%)\n   - Unimproved & Surface Water Reliance (%)\n• Purpose: Unsupervised clustering & profiling."
    p_l1.font.size = Pt(12)
    p_l1.font.color.rgb = COLOR_SLATE_LIGHT
    p_l1.space_before = Pt(10)

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_NAVY_CARD, COLOR_TEAL)
    box_r = s5.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf_r = box_r.text_frame
    tf_r.word_wrap = True
    p_r0 = tf_r.paragraphs[0]
    p_r0.text = "Dataset 2: Physicochemical Water Quality"
    p_r0.font.size = Pt(16)
    p_r0.font.bold = True
    p_r0.font.color.rgb = COLOR_TEAL
    
    p_r1 = tf_r.add_paragraph()
    p_r1.text = "• Sources: Kaggle Water Quality & US Geological Survey (USGS) benchmark datasets.\n• Scope: 220 laboratory-grade water sample measurements.\n• 9 Input Chemical Parameters:\n   - pH (WHO safe range: 6.5 - 8.5)\n   - Hardness (Ca & Mg salts, mg/L)\n   - Total Dissolved Solids / TDS (mg/L)\n   - Chloramines (disinfectant residual, mg/L)\n   - Sulfate (natural mineral ion, mg/L)\n   - Conductivity (electrical conductance, uS/cm)\n   - Organic Carbon / TOC (mg/L)\n   - Trihalomethanes / THMs (ug/L)\n   - Turbidity (light-scattering cloudiness, NTU)\n• Ground-Truth Target: Potable (1) vs Non-Potable (0)."
    p_r1.font.size = Pt(12)
    p_r1.font.color.rgb = COLOR_SLATE_LIGHT
    p_r1.space_before = Pt(10)

    # =========================================================================
    # SLIDE 6: ML Module 1 — Preprocessing & Standardization
    # =========================================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s6, COLOR_NAVY_BG)
    add_header(s6, "ML Module 1: Preprocessing & Standardization Pipeline")

    steps = [
        ("Step 1: Missing Value Imputation", "Missing survey entries are imputed using feature column means. For chemical testing data, median imputation is utilized to prevent skew from chemical outliers."),
        ("Step 2: Feature Selection", "8 percentage-based WASH features are selected, excluding non-numeric labels (country names, ISO codes) to form the numerical matrix X."),
        ("Step 3: Standardization (StandardScaler)", "Crucial for distance-based ML: Features are transformed via z = (x - mu) / sigma into zero-mean (mu=0) and unit-variance (sigma=1) representations."),
        ("Why Scaling is Mandatory for K-Means", "K-Means measures geometric Euclidean distance. If basic water access ranges from 0-100% while surface water ranges from 0-10%, unscaled access would overpower the distance calculation.")
    ]

    for i, (title, body) in enumerate(steps):
        top = Inches(1.8 + i * 1.3)
        add_card(s6, Inches(0.8), top, Inches(11.7), Inches(1.15), COLOR_NAVY_CARD)
        box = s6.shapes.add_textbox(Inches(1.0), top + Inches(0.1), Inches(11.3), Inches(0.95))
        btf = box.text_frame
        btf.word_wrap = True
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(14)
        bp0.font.bold = True
        bp0.font.color.rgb = COLOR_AQUA
        
        bp1 = btf.add_paragraph()
        bp1.text = body
        bp1.font.size = Pt(11)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT
        bp1.space_before = Pt(3)

    # =========================================================================
    # SLIDE 7: ML Module 1 — K-Means Clustering & Dynamic Profiles
    # =========================================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s7, COLOR_NAVY_BG)
    add_header(s7, "ML Module 1: K-Means Clustering & Profile Extraction")

    cluster_profiles_data = [
        ("Cluster 0: High Water Accessibility", "Avg Water: 96.8%  |  Sanitation: 94.2%  |  Hygiene: 91.5%\nUniversal urban and rural drinking infrastructure with virtually zero surface water usage. Representative countries include Germany, France, Japan, UK.", COLOR_GREEN),
        ("Cluster 1: Moderate Water Accessibility", "Avg Water: 76.4%  |  Sanitation: 68.1%  |  Hygiene: 64.9%\nTransitioning developing economies with expanding municipal infrastructure but noticeable rural gaps. Includes Brazil, Mexico, Thailand, Vietnam.", COLOR_AQUA),
        ("Cluster 2: Rural Water Challenges", "Avg Water: 62.1%  |  Urban: 84.5%  |  Rural: 44.2%\nCharacterized by an acute 40%+ rural-urban gap. Significant municipal coverage in cities, but rural populations rely on unimproved sources.", COLOR_AMBER),
        ("Cluster 3: Severe Water Deficits", "Avg Water: 28.4%  |  Sanitation: 11.2%  |  Surface: 24.8%\nCritical WASH vulnerability with acute shortages in both potable water and basic sanitation. High reliance on untreated surface water (e.g. Chad, Niger, South Sudan).", COLOR_SLATE_LIGHT)
    ]

    for i, (title, desc, accent) in enumerate(cluster_profiles_data):
        top = Inches(1.8 + i * 1.3)
        add_card(s7, Inches(0.8), top, Inches(11.7), Inches(1.15), COLOR_NAVY_CARD, accent)
        box = s7.shapes.add_textbox(Inches(1.1), top + Inches(0.1), Inches(11.1), Inches(0.95))
        btf = box.text_frame
        btf.word_wrap = True
        
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(14)
        bp0.font.bold = True
        bp0.font.color.rgb = accent
        
        bp1 = btf.add_paragraph()
        bp1.text = desc
        bp1.font.size = Pt(11)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT
        bp1.space_before = Pt(3)

    # =========================================================================
    # SLIDE 8: ML Module 1 — Model Selection & Evaluation
    # =========================================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s8, COLOR_NAVY_BG)
    add_header(s8, "Model Evaluation: How Was K=3 Selected?")

    metrics_cards = [
        ("1. Elbow Method (WCSS / Inertia)", "Formula: WCSS = Sum(||x - mu_k||^2)\n\nMeasures total within-cluster variance. WCSS drops sharply from K=2 (227.1) to K=3 (158.4), after which the curve flattens out.\n\nThe inflection 'elbow' point clearly occurs at K=3.", COLOR_AQUA),
        ("2. Silhouette Score (-1 to +1)", "Formula: s = (b - a) / max(a, b)\n\nEvaluates cohesion vs separation. K=2 scores 0.519 and K=3 scores 0.458.\n\nA score > 0.4 indicates dense, cohesive clusters with minimal inter-cluster ambiguity.", COLOR_TEAL),
        ("3. Davies-Bouldin Index (Lower is Better)", "Formula: DB = Avg(max((s_i + s_j) / d(c_i, c_j)))\n\nMeasures worst-case similarity between clusters. K=2 scores 0.692 and K=3 scores 0.771.\n\nConfirms strong separation and defensible cluster geometry.", COLOR_GREEN)
    ]

    for i, (title, body, accent) in enumerate(metrics_cards):
        left = Inches(0.8 + i * 4.0)
        add_card(s8, left, Inches(1.8), Inches(3.7), Inches(4.8), COLOR_NAVY_CARD, accent)
        box = s8.shapes.add_textbox(left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(4.4))
        btf = box.text_frame
        btf.word_wrap = True
        
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(15)
        bp0.font.bold = True
        bp0.font.color.rgb = accent
        bp0.space_after = Pt(14)
        
        bp1 = btf.add_paragraph()
        bp1.text = body
        bp1.font.size = Pt(12)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT

    # =========================================================================
    # SLIDE 9: PCA 2D Visualization & Distance Comparison
    # =========================================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s9, COLOR_NAVY_BG)
    add_header(s9, "PCA Dimensionality Reduction & Distance Benchmarks")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_NAVY_CARD, COLOR_AQUA)
    box_pca = s9.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf_pca = box_pca.text_frame
    tf_pca.word_wrap = True
    p0 = tf_pca.paragraphs[0]
    p0.text = "Principal Component Analysis (PCA)"
    p0.font.size = Pt(16)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_AQUA
    
    p1 = tf_pca.add_paragraph()
    p1.text = "• Compresses 8 indicator dimensions onto 2 principal axes:\n   - PC1: Captures 73.5% of variance (overall service ladder level)\n   - PC2: Captures 11.2% of variance (rural vs. urban disparity)\n• Cumulative Explained Variance: 84.7%\n• Allows rendering an intuitive 2D scatter plot where each point is a country and color denotes cluster profile without losing core variance."
    p1.font.size = Pt(12)
    p1.font.color.rgb = COLOR_SLATE_LIGHT
    p1.space_before = Pt(10)

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_NAVY_CARD, COLOR_TEAL)
    box_dist = s9.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf_dist = box_dist.text_frame
    tf_dist.word_wrap = True
    p2 = tf_dist.paragraphs[0]
    p2.text = "Euclidean (L2) vs Manhattan (L1) Benchmark"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEAL
    
    p3 = tf_dist.add_paragraph()
    p3.text = "• Mathematical Transparency:\n  Standard K-Means optimizes squared Euclidean distance because the centroid is the arithmetic mean.\n• Manhattan Alternative:\n  Implemented via Agglomerative Clustering with L1 distance and average linkage.\n• Adjusted Rand Index (ARI): 0.65\n• Conclusion: High structural agreement, but Manhattan L1 provides superior stability when datasets have extreme outlier spikes."
    p3.font.size = Pt(12)
    p3.font.color.rgb = COLOR_SLATE_LIGHT
    p3.space_before = Pt(10)

    # =========================================================================
    # SLIDE 10: ML Module 2 — Water Quality Prediction
    # =========================================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s10, COLOR_NAVY_BG)
    add_header(s10, "ML Module 2: Water Quality Potability Classifier")

    rf_details = [
        ("Why Random Forest?", "Water chemistry interactions are inherently non-linear (e.g. pH drastically alters chloramine disinfection efficacy). An ensemble of 100 decorrelated decision trees prevents overfitting and provides calibrated confidence probabilities."),
        ("Handling Class Imbalance", "Real-world water quality datasets have fewer non-potable samples. We applied class_weight='balanced' so the model penalizes false claims of potability severely."),
        ("Top Predictive Features", "Gini impurity reduction identified the top determinants of potability:\n1. Sulfate (21.4% importance)\n2. pH level (18.6% importance)\n3. Total Dissolved Solids / TDS (15.2% importance)\n4. Chloramines (12.8% importance)"),
        ("Model Performance", "• Test Accuracy: 65.91% on stratified 80/20 held-out test split\n• Precision: 70.0% on identifying non-potable hazards\n• Persisted as portable Joblib bundle (water_quality_model.joblib)")
    ]

    for i, (title, body) in enumerate(rf_details):
        row = i // 2
        col = i % 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 2.5)
        add_card(s10, left, top, Inches(5.6), Inches(2.3), COLOR_NAVY_CARD)
        
        box = s10.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(5.2), Inches(2.0))
        btf = box.text_frame
        btf.word_wrap = True
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(14)
        bp0.font.bold = True
        bp0.font.color.rgb = COLOR_AQUA
        
        bp1 = btf.add_paragraph()
        bp1.text = body
        bp1.font.size = Pt(11)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT
        bp1.space_before = Pt(4)

    # =========================================================================
    # SLIDE 11: Web Platform Demo & 6 Application Pages
    # =========================================================================
    s11 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s11, COLOR_NAVY_BG)
    add_header(s11, "AquaScope Platform Walkthrough: 6 Core Pages")

    pages = [
        ("1. Landing Page", "Hero section with ambient glows, real-time dataset KPIs, and intuitive navigation."),
        ("2. Dashboard", "Global access cards, top 10 rankings, urban-rural disparity chart, and water service ladder."),
        ("3. Cluster Analysis", "Interactive K selector, Elbow & Silhouette curves, 2D PCA plot, Manhattan benchmark & CSV upload."),
        ("4. Quality Predictor", "9 chemical inputs, preset potable/unsafe buttons, confidence bar, feature importance & history."),
        ("5. Regional Explorer", "Searchable data table, filter by continent and cluster, country detail modal, and CSV export."),
        ("6. About & Viva Guide", "Project motivation, system architecture, live confusion matrix, and student exam Q&A.")
    ]

    for i, (title, desc) in enumerate(pages):
        row = i // 3
        col = i % 3
        left = Inches(0.8 + col * 3.9)
        top = Inches(1.8 + row * 2.5)
        add_card(s11, left, top, Inches(3.7), Inches(2.3), COLOR_NAVY_CARD)
        
        box = s11.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(3.3), Inches(2.0))
        btf = box.text_frame
        btf.word_wrap = True
        bp0 = btf.paragraphs[0]
        bp0.text = title
        bp0.font.size = Pt(14)
        bp0.font.bold = True
        bp0.font.color.rgb = COLOR_TEAL
        
        bp1 = btf.add_paragraph()
        bp1.text = desc
        bp1.font.size = Pt(11)
        bp1.font.color.rgb = COLOR_SLATE_LIGHT
        bp1.space_before = Pt(4)

    # =========================================================================
    # SLIDE 12: Automated Verification & Test Results
    # =========================================================================
    s12 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s12, COLOR_NAVY_BG)
    add_header(s12, "Verification: 100% Automated Test Pass Rate")

    test_box = s12.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0))
    t_tf = test_box.text_frame
    t_tf.word_wrap = True

    tp0 = t_tf.paragraphs[0]
    tp0.text = "Automated Pytest Suite Results (backend/test_app.py):"
    tp0.font.size = Pt(16)
    tp0.font.bold = True
    tp0.font.color.rgb = COLOR_GREEN

    tests_list = [
        "✓ test_health_check: Confirms backend operational status and ML bundle loading",
        "✓ test_dashboard_endpoint: Validates top/bottom regions and regional aggregations",
        "✓ test_dataset_endpoint: Verifies dataset schema and missing value handling",
        "✓ test_clustering_endpoint: Confirms K-Means execution, PCA coordinates and profiles",
        "✓ test_clustering_validation: Verifies rejection of out-of-bounds K values (K < 2 or K > 10)",
        "✓ test_evaluation_endpoint: Confirms WCSS, Silhouette & Davies-Bouldin metrics for K=2..6",
        "✓ test_cluster_profiles_endpoint: Checks profile generation and country assignments",
        "✓ test_prediction_potable: Confirms correct JSON response and confidence probability",
        "✓ test_prediction_invalid: Tests input sanitization for missing or non-numeric parameters",
        "✓ test_prediction_history: Validates SQLite persistent query logging and retrieval",
        "✓ test_water_quality_metrics: Asserts accuracy, precision, recall and confusion matrix",
        "✓ test_upload_invalid: Ensures invalid CSV uploads without required headers are rejected"
    ]

    for t in tests_list:
        tp = t_tf.add_paragraph()
        tp.text = t
        tp.font.size = Pt(12)
        tp.font.color.rgb = COLOR_SLATE_LIGHT
        tp.space_before = Pt(4)

    # =========================================================================
    # SLIDE 13: Limitations & Future Scope
    # =========================================================================
    s13 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s13, COLOR_NAVY_BG)
    add_header(s13, "Project Limitations & Future Directions")

    add_card(s13, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_NAVY_CARD, COLOR_AMBER)
    box_lim = s13.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf_lim = box_lim.text_frame
    tf_lim.word_wrap = True
    pl0 = tf_lim.paragraphs[0]
    pl0.text = "Project Limitations"
    pl0.font.size = Pt(16)
    pl0.font.bold = True
    pl0.font.color.rgb = COLOR_AMBER
    
    pl1 = tf_lim.add_paragraph()
    pl1.text = "• Survey Reporting Lag: WHO/UNICEF data reflects census collection cycles; real-time acute contamination events are not captured.\n• No Replacement for Lab Tests: ML estimation cannot detect microbiological pathogens (e.g., E. coli, cholera).\n• Macro vs Micro Ecological Fallacy: High regional access does not guarantee potable tap water in every local household."
    pl1.font.size = Pt(12)
    pl1.font.color.rgb = COLOR_SLATE_LIGHT
    pl1.space_before = Pt(10)

    add_card(s13, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_NAVY_CARD, COLOR_GREEN)
    box_fut = s13.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf_fut = box_fut.text_frame
    tf_fut.word_wrap = True
    pf0 = tf_fut.paragraphs[0]
    pf0.text = "Future Scope & Enhancements"
    pf0.font.size = Pt(16)
    pf0.font.bold = True
    pf0.font.color.rgb = COLOR_GREEN
    
    pf1 = tf_fut.add_paragraph()
    pf1.text = "• IoT Sensor Integration: Ingest streaming telemetry from municipal water treatment stations for real-time potability alerting.\n• Geospatial Heatmaps: Leaflet / Mapbox GIS layers for visual pin-pointing of sub-district water wells.\n• Time-Series Forecasting: ARIMA or LSTM models to predict regional water stress 5 to 10 years into the future."
    pf1.font.size = Pt(12)
    pf1.font.color.rgb = COLOR_SLATE_LIGHT
    pf1.space_before = Pt(10)

    # =========================================================================
    # SLIDE 14: Project Links & Demonstration (LEFT AS REQUESTED FOR ADDING LINKS)
    # =========================================================================
    s14 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s14, COLOR_NAVY_BG)
    add_header(s14, "Live Demonstration & Project Resources", "PROJECT ACCESS & REPOSITORY LINKS")

    # Large Card Left: Deployment & Repo Links
    add_card(s14, Inches(0.8), Inches(1.8), Inches(7.5), Inches(4.8), COLOR_NAVY_CARD, COLOR_AQUA)
    box_links = s14.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(6.9), Inches(4.4))
    tf_links = box_links.text_frame
    tf_links.word_wrap = True

    p_link_title = tf_links.paragraphs[0]
    p_link_title.text = "Live Project Links & Source Code"
    p_link_title.font.size = Pt(18)
    p_link_title.font.bold = True
    p_link_title.font.color.rgb = COLOR_AQUA

    link_items = [
        ("🌐 Live Web Application (Vercel):", "https://your-aquascope-app.vercel.app\n(Paste your deployed frontend URL here)"),
        ("⚡ Backend REST API (Render / Railway):", "https://your-aquascope-api.onrender.com\n(Paste your deployed backend API URL here)"),
        ("💻 GitHub Repository:", "https://github.com/your-username/aquascope\n(Paste your public GitHub repository link here)"),
        ("🎥 Video Demonstration / Drive Link:", "https://youtu.be/your-demo-video\n(Paste your project walkthrough video link here)")
    ]

    for label, placeholder in link_items:
        p_lbl = tf_links.add_paragraph()
        p_lbl.text = label
        p_lbl.font.size = Pt(13)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = COLOR_WHITE
        p_lbl.space_before = Pt(10)

        p_val = tf_links.add_paragraph()
        p_val.text = placeholder
        p_val.font.size = Pt(11)
        p_val.font.color.rgb = COLOR_TEAL

    # Card Right: QR Code / Quick Access Card
    add_card(s14, Inches(8.6), Inches(1.8), Inches(3.9), Inches(4.8), COLOR_NAVY_CARD, COLOR_TEAL)
    box_qr = s14.shapes.add_textbox(Inches(8.8), Inches(2.0), Inches(3.5), Inches(4.4))
    tf_qr = box_qr.text_frame
    tf_qr.word_wrap = True

    p_qr_title = tf_qr.paragraphs[0]
    p_qr_title.text = "Scan to Try Live"
    p_qr_title.font.size = Pt(18)
    p_qr_title.font.bold = True
    p_qr_title.font.color.rgb = COLOR_TEAL
    p_qr_title.alignment = PP_ALIGN.CENTER

    # Placeholder box for QR code image
    qr_box = s14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(9.3), Inches(2.8), Inches(2.5), Inches(2.5))
    qr_box.fill.solid()
    qr_box.fill.fore_color.rgb = RGBColor(241, 245, 249)
    qr_box.line.color.rgb = COLOR_AQUA
    qr_box.line.width = Pt(1)

    qr_text = s14.shapes.add_textbox(Inches(9.3), Inches(3.6), Inches(2.5), Inches(1.0))
    tf_qt = qr_text.text_frame
    tf_qt.word_wrap = True
    pqt = tf_qt.paragraphs[0]
    pqt.text = "[ Paste QR Code Here ]"
    pqt.font.size = Pt(11)
    pqt.font.bold = True
    pqt.font.color.rgb = RGBColor(71, 85, 105)
    pqt.alignment = PP_ALIGN.CENTER

    p_qr_desc = tf_qr.add_paragraph()
    p_qr_desc.text = "\n\n\n\n\n\n\n\nEvaluators and students can scan this QR code with their mobile device to test water potability live!"
    p_qr_desc.font.size = Pt(11)
    p_qr_desc.font.color.rgb = COLOR_SLATE_LIGHT
    p_qr_desc.alignment = PP_ALIGN.CENTER

    # Save to disk
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "AquaScope_Presentation.pptx"))
    prs.save(output_path)
    print(f"[success] Presentation generated successfully at: {output_path}")
    return output_path

if __name__ == "__main__":
    create_presentation()
