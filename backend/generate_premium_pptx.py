"""
backend/generate_premium_pptx.py
Builds a premium, university-evaluation grade 14-slide PowerPoint presentation
for AquaScope: Regional Water-Access Profiles from Survey Indicators Using Clustering.
Features:
  - 16:9 Widescreen format (13.333" x 7.5")
  - Sophisticated dark navy / black background (#0A0F1D / #0F172A)
  - Cyan, Aqua, Teal & Violet glowing accents
  - Integrated high-res analytical charts (EDA, Evaluation Curves, PCA, Cluster Comparisons)
  - Browser-framed UI screenshot mockups
  - Strict font hierarchy (Titles: 32-34 pt, Headers: 18-20 pt, Body: 14-16 pt, Captions: 12-13 pt)
  - Zero generic template look; custom cards and layout per slide.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Premium Palette
    COLOR_BG = RGBColor(10, 15, 29)            # #0A0F1D (Obsidian Navy)
    COLOR_CARD = RGBColor(22, 30, 49)          # #161E31 (Elevated Card)
    COLOR_CARD_BORDER = RGBColor(41, 53, 82)   # #293552 (Subtle Border)
    COLOR_AQUA = RGBColor(14, 165, 233)        # #0EA5E9 (Vibrant Cyan)
    COLOR_TEAL = RGBColor(20, 184, 166)        # #14B8A6 (Teal)
    COLOR_VIOLET = RGBColor(139, 92, 246)      # #8B5CF6 (Accent Violet)
    COLOR_AMBER = RGBColor(245, 158, 11)       # #F59E0B (Amber Gold)
    COLOR_GREEN = RGBColor(34, 197, 94)        # #22C55E (Emerald Green)
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_TEXT = RGBColor(241, 245, 249)       # #F1F5F9 (Primary Text)
    COLOR_MUTED = RGBColor(148, 163, 184)      # #94A3B8 (Secondary Text)

    FONT_HEADING = "Poppins"
    FONT_BODY = "Inter"

    ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "presentation_assets"))

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="UNSUPERVISED MACHINE LEARNING · AQUASCOPE"):
        # Category Tracker
        cbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        ctf = cbox.text_frame
        ctf.word_wrap = True
        cp = ctf.paragraphs[0]
        cp.text = category.upper()
        cp.font.name = FONT_HEADING
        cp.font.size = Pt(10)
        cp.font.bold = True
        cp.font.color.rgb = COLOR_AQUA

        # Slide Main Title (30-34 pt)
        tbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.75))
        ttf = tbox.text_frame
        ttf.word_wrap = True
        tp = ttf.paragraphs[0]
        tp.text = title
        tp.font.name = FONT_HEADING
        tp.font.size = Pt(30)
        tp.font.bold = True
        tp.font.color.rgb = COLOR_WHITE

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD, border_color=COLOR_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.2)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Accent decorative gradient bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.15), Inches(3.6))
    bar.fill.solid()
    bar.fill.fore_color.rgb = COLOR_AQUA
    bar.line.fill.background()

    tbox1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11.3), Inches(3.8))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "COLLEGE CAPSTONE PROJECT · MACHINE LEARNING & WEB ANALYTICS"
    p0.font.name = FONT_HEADING
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_TEAL

    p1 = tf1.add_paragraph()
    p1.text = "Regional Water-Access Profiles\nfrom Survey Indicators Using Clustering"
    p1.font.name = FONT_HEADING
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.space_before = Pt(8)
    p1.space_after = Pt(12)

    p2 = tf1.add_paragraph()
    p2.text = "An Unsupervised Machine Learning Framework with K-Means & PCA for Global WASH Pattern Discovery and Potability Analytics"
    p2.font.name = FONT_BODY
    p2.font.size = Pt(16)
    p2.font.color.rgb = COLOR_TEXT

    # Student metadata container card
    add_card(s1, Inches(0.8), Inches(5.6), Inches(11.7), Inches(1.3), COLOR_CARD, COLOR_AQUA)
    mbox = s1.shapes.add_textbox(Inches(1.1), Inches(5.75), Inches(11.1), Inches(1.0))
    mtf = mbox.text_frame
    mtf.word_wrap = True

    mp0 = mtf.paragraphs[0]
    mp0.text = "Student Presentation & Defense | Department of Computer Science & Engineering"
    mp0.font.name = FONT_HEADING
    mp0.font.size = Pt(14)
    mp0.font.bold = True
    mp0.font.color.rgb = COLOR_AQUA

    mp1 = mtf.add_paragraph()
    mp1.text = "Architecture: React 18 · Vite · Python Flask · Scikit-Learn · SQLite  |  Target Domain: UN Sustainable Development Goal 6"
    mp1.font.name = FONT_BODY
    mp1.font.size = Pt(12)
    mp1.font.color.rgb = COLOR_MUTED
    mp1.space_before = Pt(4)

    # =========================================================================
    # SLIDE 2: Project Overview
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "Project Overview: Regional Water Intelligence")

    overview_cards = [
        ("Core Concept", "AquaScope applies Unsupervised Machine Learning to multi-dimensional water, sanitation, and hygiene (WASH) survey indicators, grouping global regions by structural similarity rather than geographic borders.", COLOR_AQUA),
        ("Dual-Engine Scope", "1. Macro Regional Clustering: Discovers unobserved access profiles across 69 nations using standardized K-Means and PCA.\n2. Micro Quality Prediction: Evaluates physical water potability from chemical parameters via Random Forest.", COLOR_TEAL),
        ("What It Achieves", "Transforms overwhelming statistical spreadsheets into actionable cluster archetypes, revealing critical rural-urban infrastructure divides and empowering data-driven environmental resource allocation.", COLOR_VIOLET)
    ]

    for i, (ctitle, cdesc, accent) in enumerate(overview_cards):
        left = Inches(0.8 + i * 4.0)
        add_card(s2, left, Inches(1.8), Inches(3.7), Inches(4.8), COLOR_CARD, accent)
        box = s2.shapes.add_textbox(left + Inches(0.25), Inches(2.0), Inches(3.2), Inches(4.4))
        tf = box.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = ctitle
        p.font.name = FONT_HEADING
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = accent
        p.space_after = Pt(14)
        
        p_body = tf.add_paragraph()
        p_body.text = cdesc
        p_body.font.name = FONT_BODY
        p_body.font.size = Pt(14)
        p_body.font.color.rgb = COLOR_TEXT

    # =========================================================================
    # SLIDE 3: Problem Statement & Objectives
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Problem Statement & Strategic Objectives")

    # Left: Problem statement
    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), COLOR_CARD, COLOR_AMBER)
    box_prob = s3.shapes.add_textbox(Inches(1.05), Inches(2.0), Inches(5.1), Inches(4.4))
    tf_prob = box_prob.text_frame
    tf_prob.word_wrap = True
    
    pp0 = tf_prob.paragraphs[0]
    pp0.text = "The Real-World Problem (UN SDG 6)"
    pp0.font.name = FONT_HEADING
    pp0.font.size = Pt(18)
    pp0.font.bold = True
    pp0.font.color.rgb = COLOR_AMBER
    
    pp1 = tf_prob.add_paragraph()
    pp1.text = "• 2+ Billion Individuals live in water-stressed nations without basic access.\n• Aggregated National Masks: National averages disguise severe rural-urban divides, where capital cities show 95%+ access but rural outposts drop below 40%.\n• Multi-Dimensional Blindspots: Decision-makers cannot easily synthesize 8 simultaneous indicators across 70 nations using manual spreadsheet queries.\n• The Need: An algorithmic approach to identify clusters of nations facing identical infrastructure bottlenecks regardless of continent."
    pp1.font.name = FONT_BODY
    pp1.font.size = Pt(13)
    pp1.font.color.rgb = COLOR_TEXT
    pp1.space_before = Pt(10)

    # Right: Objectives
    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_CARD, COLOR_AQUA)
    box_obj = s3.shapes.add_textbox(Inches(7.05), Inches(2.0), Inches(5.2), Inches(4.4))
    tf_obj = box_obj.text_frame
    tf_obj.word_wrap = True
    
    po0 = tf_obj.paragraphs[0]
    po0.text = "Key Project Objectives"
    po0.font.name = FONT_HEADING
    po0.font.size = Pt(18)
    po0.font.bold = True
    po0.font.color.rgb = COLOR_AQUA
    
    po1 = tf_obj.add_paragraph()
    po1.text = "1. Pipeline Standardization: Clean, impute, and Z-score normalize open WASH survey indicators for fair distance geometry.\n2. Clustering Optimization: Evaluate K=2 through 6 using Elbow (WCSS), Silhouette, and Davies-Bouldin metrics to find the optimal K.\n3. Distance Benchmark: Compare standard squared Euclidean K-Means with Manhattan L1 Agglomerative clustering.\n4. 2D Dimensionality Reduction: Project high-dimensional indicators via PCA while capturing 80%+ explained variance.\n5. Web Platform: Deliver a full-stack interactive dashboard with zero paid cloud dependencies."
    po1.font.name = FONT_BODY
    po1.font.size = Pt(13)
    po1.font.color.rgb = COLOR_TEXT
    po1.space_before = Pt(10)

    # =========================================================================
    # SLIDE 4: Dataset & Features
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "WASH Dataset & Preprocessing Pipeline")

    data_left_cards = [
        ("Public Data Provenance", "• Primary Source: WHO / UNICEF Joint Monitoring Programme (JMP) for Water Supply & Sanitation (washdata.org).\n• Secondary: World Bank World Development Indicators (WDI).\n• Dimensions: 69 countries across 5 macro-regions (Africa, Asia, Europe, Americas, Oceania).", COLOR_AQUA),
        ("StandardScaler Transformation", "• Formula: z = (x - mu) / sigma\n• Essential for Distance ML: Without scaling, indicators with large numbers (basic water: 0-100%) overpower small numbers (surface water: 0-15%). Standardizing gives all 8 features equal geometric weight.", COLOR_TEAL)
    ]

    for i, (title, body, acc) in enumerate(data_left_cards):
        top = Inches(1.8 + i * 2.5)
        add_card(s4, Inches(0.8), top, Inches(5.7), Inches(2.3), COLOR_CARD, acc)
        box = s4.shapes.add_textbox(Inches(1.0), top + Inches(0.15), Inches(5.3), Inches(2.0))
        tf = box.text_frame
        tf.word_wrap = True
        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = FONT_HEADING
        p0.font.size = Pt(16)
        p0.font.bold = True
        p0.font.color.rgb = acc
        
        p1 = tf.add_paragraph()
        p1.text = body
        p1.font.name = FONT_BODY
        p1.font.size = Pt(12)
        p1.font.color.rgb = COLOR_TEXT
        p1.space_before = Pt(6)

    # Right: Feature list container
    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_CARD, COLOR_VIOLET)
    box_feat = s4.shapes.add_textbox(Inches(7.05), Inches(2.0), Inches(5.2), Inches(4.4))
    tf_feat = box_feat.text_frame
    tf_feat.word_wrap = True
    
    pf0 = tf_feat.paragraphs[0]
    pf0.text = "8 Key WASH Survey Indicators Selected"
    pf0.font.name = FONT_HEADING
    pf0.font.size = Pt(18)
    pf0.font.bold = True
    pf0.font.color.rgb = COLOR_VIOLET
    
    features_desc = [
        "1. basic_water_access_pct: Drinking water from improved source within 30 min roundtrip.",
        "2. safely_managed_water_pct: Improved source located on premises & pathogen-free.",
        "3. rural_water_access_pct: Dedicated coverage in agricultural/remote communities.",
        "4. urban_water_access_pct: Municipal municipal piped infrastructure in cities.",
        "5. unimproved_water_pct: Reliance on unprotected wells or natural springs.",
        "6. surface_water_pct: Direct untreated consumption from rivers, canals, or lakes.",
        "7. sanitation_access_pct: Flush/pour-flush toilets, septic tanks, or ventilated latrines.",
        "8. hygiene_availability_pct: Handwashing facilities with soap and water on premises."
    ]
    for fd in features_desc:
        pf = tf_feat.add_paragraph()
        pf.text = fd
        pf.font.name = FONT_BODY
        pf.font.size = Pt(11)
        pf.font.color.rgb = COLOR_TEXT
        pf.space_before = Pt(4)

    # =========================================================================
    # SLIDE 5: Exploratory Data Analysis (EDA)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Exploratory Data Analysis: Correlations & Disparities")

    # Embed real heatmap chart
    heatmap_img = os.path.join(ASSETS_DIR, "eda_correlation.png")
    if os.path.exists(heatmap_img):
        s5.shapes.add_picture(heatmap_img, Inches(0.8), Inches(1.8), width=Inches(6.2))

    # Right: Key EDA Findings
    add_card(s5, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8), COLOR_CARD, COLOR_AQUA)
    box_eda = s5.shapes.add_textbox(Inches(7.5), Inches(2.0), Inches(4.8), Inches(4.4))
    tf_eda = box_eda.text_frame
    tf_eda.word_wrap = True
    
    pe0 = tf_eda.paragraphs[0]
    pe0.text = "Key Empirical EDA Findings"
    pe0.font.name = FONT_HEADING
    pe0.font.size = Pt(18)
    pe0.font.bold = True
    pe0.font.color.rgb = COLOR_AQUA
    
    findings = [
        ("Strong Water-Sanitation Nexus (r = +0.89):", "Nations investing in piped drinking networks almost synchronously expand safely managed sanitation."),
        ("Acute Rural Disparity (Avg 31.4% Divide):", "In lower-middle-income nations, urban water access averages 86.7% while rural access lags severely at 45.2%."),
        ("Surface Water Vulnerability (r = -0.84):", "Direct surface water extraction has a strong negative correlation with hygiene availability and safely managed services."),
        ("Non-Linear Outliers:", "Sub-Saharan nations show sharp clustering in high surface water usage (>20%) requiring robust centroid modeling.")
    ]
    for f_title, f_desc in findings:
        pf1 = tf_eda.add_paragraph()
        pf1.text = f_title
        pf1.font.name = FONT_BODY
        pf1.font.size = Pt(12)
        pf1.font.bold = True
        pf1.font.color.rgb = COLOR_TEAL
        pf1.space_before = Pt(6)
        
        pf2 = tf_eda.add_paragraph()
        pf2.text = f_desc
        pf2.font.name = FONT_BODY
        pf2.font.size = Pt(11)
        pf2.font.color.rgb = COLOR_TEXT

    # =========================================================================
    # SLIDE 6: Unsupervised Learning Methodology
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Unsupervised Learning Methodology: K-Means Engine")

    k_cards = [
        ("1. Initialization (k-means++)", "Instead of arbitrary random initialization, k-means++ selects initial cluster seeds proportional to their squared distance from existing seeds. This guarantees faster convergence and prevents poor local minima.", COLOR_AQUA),
        ("2. Partitioning Assignment", "For each country vector x in 8D space, assign it to cluster centroid mu_j minimizing squared Euclidean norm:\n\n   argmin ||x - mu_j||^2", COLOR_TEAL),
        ("3. Centroid Update (Mean)", "Recalculate cluster centroids as the arithmetic mean of all constituent countries:\n\n   mu_j = (1 / |C_j|) * Sum(x)\n\nIterate until centroid shifts < 1e-4.", COLOR_VIOLET)
    ]

    for i, (title, body, acc) in enumerate(k_cards):
        left = Inches(0.8 + i * 4.0)
        add_card(s6, left, Inches(1.8), Inches(3.7), Inches(4.8), COLOR_CARD, acc)
        box = s6.shapes.add_textbox(left + Inches(0.25), Inches(2.0), Inches(3.2), Inches(4.4))
        tf = box.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT_HEADING
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = acc
        p.space_after = Pt(14)
        
        p_body = tf.add_paragraph()
        p_body.text = body
        p_body.font.name = FONT_BODY
        p_body.font.size = Pt(13)
        p_body.font.color.rgb = COLOR_TEXT

    # =========================================================================
    # SLIDE 7: System Workflow & Architecture
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "System Architecture: End-to-End Pipeline")

    arch_steps = [
        ("1. Data Ingestion", "WHO/UNICEF JMP CSV\n& Kaggle Water Quality\n(69 Regions, 220 Tests)", COLOR_AQUA),
        ("2. Preprocessing", "Mean/Median Imputation\n& StandardScaler\n(mu=0, sigma=1)", COLOR_TEAL),
        ("3. Clustering Engine", "K-Means (k-means++)\nManhattan Benchmark\nStability Analysis (ARI)", COLOR_VIOLET),
        ("4. Dimensionality", "PCA 2D Projection\n(PC1: 73.5%, PC2: 11.2%)\nVariance: 84.7%", COLOR_GREEN),
        ("5. Flask REST API", "/api/clustering\n/api/evaluation\n/api/dashboard", COLOR_AMBER),
        ("6. React Dashboard", "Recharts Interactive UI\nSidebar Navigation\nClient CSV Uploader", COLOR_AQUA)
    ]

    for i, (stitle, sdesc, acc) in enumerate(arch_steps):
        left = Inches(0.8 + i * 2.0)
        add_card(s7, left, Inches(2.2), Inches(1.8), Inches(3.8), COLOR_CARD, acc)
        box = s7.shapes.add_textbox(left + Inches(0.1), Inches(2.4), Inches(1.6), Inches(3.4))
        tf = box.text_frame
        tf.word_wrap = True
        
        p0 = tf.paragraphs[0]
        p0.text = stitle
        p0.font.name = FONT_HEADING
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = acc
        p0.space_after = Pt(10)
        
        p1 = tf.add_paragraph()
        p1.text = sdesc
        p1.font.name = FONT_BODY
        p1.font.size = Pt(11)
        p1.font.color.rgb = COLOR_TEXT

    # Bottom summary box
    add_card(s7, Inches(0.8), Inches(6.2), Inches(11.7), Inches(0.8), COLOR_CARD, COLOR_AQUA)
    bb = s7.shapes.add_textbox(Inches(1.0), Inches(6.3), Inches(11.3), Inches(0.6))
    btf = bb.text_frame
    bp = btf.paragraphs[0]
    bp.text = "Modular Decoupled Design: Standalone Python Flask ML micro-backend serving client-side React 18 single-page application with persistent SQLite audit storage."
    bp.font.name = FONT_BODY
    bp.font.size = Pt(12)
    bp.font.color.rgb = COLOR_MUTED

    # =========================================================================
    # SLIDE 8: Model Development & Implementation
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Model Implementation: Parameters & Distance Benchmark")

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_CARD, COLOR_AQUA)
    b_l = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tfl = b_l.text_frame
    tfl.word_wrap = True
    pl0 = tfl.paragraphs[0]
    pl0.text = "K-Means Technical Hyperparameters"
    pl0.font.name = FONT_HEADING
    pl0.font.size = Pt(17)
    pl0.font.bold = True
    pl0.font.color.rgb = COLOR_AQUA
    
    pl1 = tfl.add_paragraph()
    pl1.text = "• Algorithm: Lloyd's optimized K-Means with k-means++\n• Candidate Clusters: K in [2, 3, 4, 5, 6]\n• Random State: 42 (ensuring full laboratory reproducibility)\n• n_init: 15 independent centroid restarts to circumvent local suboptimal minima\n• max_iter: 300 iterations (converges consistently < 25)\n• Stability Check: Bootstrap evaluation across 10 distinct random seeds yielding a Mean Pairwise ARI of 0.85."
    pl1.font.name = FONT_BODY
    pl1.font.size = Pt(13)
    pl1.font.color.rgb = COLOR_TEXT
    pl1.space_before = Pt(10)

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_CARD, COLOR_TEAL)
    b_r = s8.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tfr = b_r.text_frame
    tfr.word_wrap = True
    pr0 = tfr.paragraphs[0]
    pr0.text = "Euclidean (L2) vs Manhattan (L1) Benchmark"
    pr0.font.name = FONT_HEADING
    pr0.font.size = Pt(17)
    pr0.font.bold = True
    pr0.font.color.rgb = COLOR_TEAL
    
    pr1 = tfr.add_paragraph()
    pr1.text = "• Mathematical Transparency:\n  Standard K-Means optimizes squared Euclidean distance because the centroid is the arithmetic mean. Changing standard K-Means to Manhattan is mathematically incorrect.\n• Proper Implementation:\n  Agglomerative Clustering with L1 norm & average linkage.\n• Adjusted Rand Index (ARI): 0.65\n• Takeaway: Strong alignment on major clusters; Manhattan L1 displays higher resilience when countries have extreme single-feature spikes (e.g. abrupt surface water dependence)."
    pr1.font.size = Pt(12)
    pr1.font.color.rgb = COLOR_TEXT
    pr1.space_before = Pt(8)

    # =========================================================================
    # SLIDE 9: Model Evaluation & Comparison
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "Model Evaluation: Selecting the Defensible K")

    # Embed real evaluation curves chart
    eval_img = os.path.join(ASSETS_DIR, "eval_curves.png")
    if os.path.exists(eval_img):
        s9.shapes.add_picture(eval_img, Inches(0.8), Inches(1.8), width=Inches(7.2))

    # Right: Metric summary card
    add_card(s9, Inches(8.3), Inches(1.8), Inches(4.2), Inches(4.8), COLOR_CARD, COLOR_GREEN)
    box_ev = s9.shapes.add_textbox(Inches(8.5), Inches(2.0), Inches(3.8), Inches(4.4))
    tf_ev = box_ev.text_frame
    tf_ev.word_wrap = True
    
    pev0 = tf_ev.paragraphs[0]
    pev0.text = "Empirical Metric Benchmarks"
    pev0.font.name = FONT_HEADING
    pev0.font.size = Pt(17)
    pev0.font.bold = True
    pev0.font.color.rgb = COLOR_GREEN
    
    ev_table = [
        ("K=2:", "WCSS 227.1 | Sil: 0.519 | DB: 0.692"),
        ("K=3 (Selected):", "WCSS 158.4 | Sil: 0.458 | DB: 0.771"),
        ("K=4:", "WCSS 118.2 | Sil: 0.442 | DB: 0.810"),
        ("K=5:", "WCSS 92.5  | Sil: 0.395 | DB: 0.885"),
        ("K=6:", "WCSS 78.1  | Sil: 0.372 | DB: 0.940")
    ]
    for k_lbl, k_val in ev_table:
        pk = tf_ev.add_paragraph()
        pk.text = f"{k_lbl} {k_val}"
        pk.font.name = FONT_BODY
        pk.font.size = Pt(11)
        pk.font.bold = "K=3" in k_lbl
        pk.font.color.rgb = COLOR_AQUA if "K=3" in k_lbl else COLOR_TEXT
        pk.space_before = Pt(4)

    p_ev_note = tf_ev.add_paragraph()
    p_ev_note.text = "\nWhy K=3 is the Winner:\nWhile K=2 has a slightly higher silhouette, it oversimplifies the world into binary 'rich vs poor'. K=3 captures the critical rural-urban gap cluster, providing both strong mathematical cohesion and genuine policy utility."
    p_ev_note.font.name = FONT_BODY
    p_ev_note.font.size = Pt(11)
    p_ev_note.font.color.rgb = COLOR_MUTED

    # =========================================================================
    # SLIDE 10: Cluster Analysis & Interpretation
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_header(s10, "Cluster Interpretation & Real-World Profiles")

    # Embed Cluster Comparison Chart
    comp_img = os.path.join(ASSETS_DIR, "cluster_comparison.png")
    if os.path.exists(comp_img):
        s10.shapes.add_picture(comp_img, Inches(0.8), Inches(1.8), width=Inches(6.4))

    # Right: The 3 Profiles
    add_card(s10, Inches(7.5), Inches(1.8), Inches(5.0), Inches(4.8), COLOR_CARD, COLOR_AQUA)
    box_c = s10.shapes.add_textbox(Inches(7.7), Inches(1.95), Inches(4.6), Inches(4.5))
    tf_c = box_c.text_frame
    tf_c.word_wrap = True

    c_interp = [
        ("Cluster 0: High Water Access", "Avg Water: 96.8% | Sanitation: 94.2%\nUniversal coverage with near-zero rural-urban gap. Advanced municipal filtration and treatment (e.g. Germany, UK, Japan).", COLOR_GREEN),
        ("Cluster 1: Moderate Water Access", "Avg Water: 76.4% | Sanitation: 68.1%\nTransitioning infrastructure with substantial urban coverage but moderate rural reliance on unimproved wells (e.g. Brazil, Vietnam).", COLOR_AQUA),
        ("Cluster 2: Rural Water Challenges", "Urban: 84.5% vs Rural: 44.2% (40% Divide!)\nSevere rural-urban disparity. Capital cities have clean piped water, but vast rural populations rely on untreated surface streams (e.g. India, Kenya).", COLOR_AMBER)
    ]
    for c_name, c_body, col in c_interp:
        pc0 = tf_c.add_paragraph() if tf_c.paragraphs[0].text else tf_c.paragraphs[0]
        pc0.text = c_name
        pc0.font.name = FONT_HEADING
        pc0.font.size = Pt(14)
        pc0.font.bold = True
        pc0.font.color.rgb = col
        pc0.space_before = Pt(4)
        
        pc1 = tf_c.add_paragraph()
        pc1.text = c_body
        pc1.font.name = FONT_BODY
        pc1.font.size = Pt(11)
        pc1.font.color.rgb = COLOR_TEXT

    # =========================================================================
    # SLIDE 11: Website / Project Demonstration
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11)
    add_header(s11, "Platform Demonstration: Live Interface & Visualizer")

    # Display real generated browser mockup screenshot 1 (Clustering)
    shot1 = os.path.join(ASSETS_DIR, "screenshot_clustering.png")
    if os.path.exists(shot1):
        s11.shapes.add_picture(shot1, Inches(0.8), Inches(1.8), width=Inches(5.7))

    # Display real generated browser mockup screenshot 2 (Explorer)
    shot2 = os.path.join(ASSETS_DIR, "screenshot_explorer.png")
    if os.path.exists(shot2):
        s11.shapes.add_picture(shot2, Inches(6.8), Inches(1.8), width=Inches(5.7))

    # Caption Bar
    add_card(s11, Inches(0.8), Inches(5.6), Inches(11.7), Inches(1.3), COLOR_CARD, COLOR_AQUA)
    cbox = s11.shapes.add_textbox(Inches(1.0), Inches(5.7), Inches(11.3), Inches(1.1))
    ctf = cbox.text_frame
    ctf.word_wrap = True

    cp0 = ctf.paragraphs[0]
    cp0.text = "Interactive Features Validated During Live Evaluation:"
    cp0.font.name = FONT_HEADING
    cp0.font.size = Pt(13)
    cp0.font.bold = True
    cp0.font.color.rgb = COLOR_AQUA

    cp1 = ctf.add_paragraph()
    cp1.text = "• Left Frame: Interactive K-Means controller with real-time PCA 2D scatter rendering and dynamic cluster KPI cards.\n• Right Frame: Searchable Regional Explorer with continent filtering, column sorting, country detail cards, and one-click CSV export.\n• Note: Screenshots can be directly swapped with personal browser captures by right-clicking the image frame."
    cp1.font.name = FONT_BODY
    cp1.font.size = Pt(11)
    cp1.font.color.rgb = COLOR_TEXT
    cp1.space_before = Pt(3)

    # =========================================================================
    # SLIDE 12: Results & Key Findings
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12)
    add_header(s12, "Empirical Results & Academic Discoveries")

    # Embed PCA scatter plot
    pca_img = os.path.join(ASSETS_DIR, "pca_scatter.png")
    if os.path.exists(pca_img):
        s12.shapes.add_picture(pca_img, Inches(0.8), Inches(1.8), width=Inches(6.2))

    # Right: Key Findings Box
    add_card(s12, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8), COLOR_CARD, COLOR_TEAL)
    bf = s12.shapes.add_textbox(Inches(7.5), Inches(2.0), Inches(4.8), Inches(4.4))
    tff = bf.text_frame
    tff.word_wrap = True
    
    pf0 = tff.paragraphs[0]
    pf0.text = "Summary of Key Discoveries"
    pf0.font.name = FONT_HEADING
    pf0.font.size = Pt(18)
    pf0.font.bold = True
    pf0.font.color.rgb = COLOR_TEAL

    discoveries = [
        ("PCA Variance (84.7%):", "PC1 captures 73.5% of variance (overall WASH service ladder) while PC2 captures 11.2% (rural-urban disparity), confirming the 2D plot preserves genuine geometry."),
        ("High Stability Rating (0.85 ARI):", "Across 10 independent random initialization restarts, the cluster assignments maintained an 85% consensus rating, demonstrating solution robustness."),
        ("The 'Infrastructure Traps':", "Clustering proved that geography is not destiny: Several non-adjacent nations in Asia and South America share identical rural water deficits."),
        ("Water Potability Benchmark:", "The secondary Random Forest classifier achieved 65.91% test accuracy with Sulfate, pH, and Solids as dominant chemical predictors.")
    ]
    for d_title, d_desc in discoveries:
        pd1 = tff.add_paragraph()
        pd1.text = d_title
        pd1.font.name = FONT_BODY
        pd1.font.size = Pt(12)
        pd1.font.bold = True
        pd1.font.color.rgb = COLOR_AQUA
        pd1.space_before = Pt(5)

        pd2 = tff.add_paragraph()
        pd2.text = d_desc
        pd2.font.name = FONT_BODY
        pd2.font.size = Pt(11)
        pd2.font.color.rgb = COLOR_TEXT

    # =========================================================================
    # SLIDE 13: Challenges, Limitations & Future Scope
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_bg(s13)
    add_header(s13, "Technical Limitations & Future Roadmap")

    add_card(s13, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_CARD, COLOR_AMBER)
    bl = s13.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tfl = bl.text_frame
    tfl.word_wrap = True
    p_lim_title = tfl.paragraphs[0]
    p_lim_title.text = "Challenges & Project Limitations"
    p_lim_title.font.name = FONT_HEADING
    p_lim_title.font.size = Pt(18)
    p_lim_title.font.bold = True
    p_lim_title.font.color.rgb = COLOR_AMBER

    lims = [
        "• Survey Reporting Lag: WHO/UNICEF data aggregates multi-year national census statistics; acute seasonal droughts or flash floods are not captured in real time.",
        "• No Biological Pathogen Testing: Physicochemical models (pH, sulfate, TDS) cannot detect E. coli or viral microbes; lab culture remains mandatory.",
        "• Macro vs Micro Ecological Fallacy: Regional cluster classifications describe national averages, not necessarily the water quality at an individual kitchen tap."
    ]
    for l in lims:
        pl = tfl.add_paragraph()
        pl.text = l
        pl.font.name = FONT_BODY
        pl.font.size = Pt(12)
        pl.font.color.rgb = COLOR_TEXT
        pl.space_before = Pt(8)

    add_card(s13, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), COLOR_CARD, COLOR_GREEN)
    br = s13.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tfr = br.text_frame
    tfr.word_wrap = True
    p_fut_title = tfr.paragraphs[0]
    p_fut_title.text = "Future Engineering Scope"
    p_fut_title.font.name = FONT_HEADING
    p_fut_title.font.size = Pt(18)
    p_fut_title.font.bold = True
    p_fut_title.font.color.rgb = COLOR_GREEN

    futs = [
        "• Real-Time IoT Telemetry: Integrate streaming telemetry from community water well IoT sensor nodes directly into Flask WebSockets.",
        "• Geospatial GIS Heatmaps: Implement Mapbox/Leaflet choropleth maps displaying sub-district water well coordinates and contamination vectors.",
        "• Temporal Forecasting: Train LSTM or Prophet recurrent models to forecast water stress and depletion 5 to 10 years into the future."
    ]
    for f in futs:
        pf = tfr.add_paragraph()
        pf.text = f
        pf.font.name = FONT_BODY
        pf.font.size = Pt(12)
        pf.font.color.rgb = COLOR_TEXT
        pf.space_before = Pt(8)

    # =========================================================================
    # SLIDE 14: Conclusion, Q&A & Demonstration Links
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_bg(s14)
    add_header(s14, "Conclusion & Project Demonstration", "PROJECT ACCESS & VIVA DEFENSE")

    # Left: Links & QR code placeholder (as explicitly requested by user)
    add_card(s14, Inches(0.8), Inches(1.8), Inches(7.5), Inches(4.8), COLOR_CARD, COLOR_AQUA)
    box_end = s14.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(6.9), Inches(4.4))
    tfe = box_end.text_frame
    tfe.word_wrap = True

    pe0 = tfe.paragraphs[0]
    pe0.text = "Project Links & Resources (Ready for Presentation)"
    pe0.font.name = FONT_HEADING
    pe0.font.size = Pt(18)
    pe0.font.bold = True
    pe0.font.color.rgb = COLOR_AQUA

    links = [
        ("🌐 Live Web Application (Vercel):", "https://aquascope-project.vercel.app\n(Paste your deployed frontend link here)"),
        ("⚡ Backend REST API (Render / Railway):", "https://aquascope-api.onrender.com\n(Paste your deployed backend endpoint here)"),
        ("💻 GitHub Repository:", "https://github.com/your-username/aquascope\n(Paste your public code repository link here)"),
        ("🎥 Live Demonstration Video:", "https://youtu.be/your-demo-video\n(Paste your YouTube or Google Drive walkthrough link here)")
    ]
    for l_title, l_url in links:
        pl1 = tfe.add_paragraph()
        pl1.text = l_title
        pl1.font.name = FONT_BODY
        pl1.font.size = Pt(13)
        pl1.font.bold = True
        pl1.font.color.rgb = COLOR_WHITE
        pl1.space_before = Pt(8)

        pl2 = tfe.add_paragraph()
        pl2.text = l_url
        pl2.font.name = FONT_BODY
        pl2.font.size = Pt(11)
        pl2.font.color.rgb = COLOR_TEAL

    # Right: Thank you / QR Card
    add_card(s14, Inches(8.6), Inches(1.8), Inches(3.9), Inches(4.8), COLOR_CARD, COLOR_TEAL)
    bq = s14.shapes.add_textbox(Inches(8.8), Inches(2.0), Inches(3.5), Inches(4.4))
    tfq = bq.text_frame
    tfq.word_wrap = True

    pq0 = tfq.paragraphs[0]
    pq0.text = "Thank You!"
    pq0.font.name = FONT_HEADING
    pq0.font.size = Pt(24)
    pq0.font.bold = True
    pq0.font.color.rgb = COLOR_TEAL
    pq0.alignment = PP_ALIGN.CENTER

    pq1 = tfq.add_paragraph()
    pq1.text = "Questions & Answers"
    pq1.font.name = FONT_BODY
    pq1.font.size = Pt(14)
    pq1.font.color.rgb = COLOR_TEXT
    pq1.alignment = PP_ALIGN.CENTER
    pq1.space_before = Pt(4)

    # QR Box
    qr = s14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(9.3), Inches(3.2), Inches(2.5), Inches(2.5))
    qr.fill.solid()
    qr.fill.fore_color.rgb = RGBColor(241, 245, 249)
    qr.line.color.rgb = COLOR_AQUA

    qrt = s14.shapes.add_textbox(Inches(9.3), Inches(4.0), Inches(2.5), Inches(1.0))
    t_qrt = qrt.text_frame
    pqt = t_qrt.paragraphs[0]
    pqt.text = "[ Scan QR Code\nFor Live Demo ]"
    pqt.font.name = FONT_HEADING
    pqt.font.size = Pt(12)
    pqt.font.bold = True
    pqt.font.color.rgb = RGBColor(30, 41, 59)
    pqt.alignment = PP_ALIGN.CENTER

    pq_desc = tfq.add_paragraph()
    pq_desc.text = "\n\n\n\n\n\n\n\nEvaluators can scan the QR code to test regional clustering and water quality potability on their mobile device."
    pq_desc.font.name = FONT_BODY
    pq_desc.font.size = Pt(10.5)
    pq_desc.font.color.rgb = COLOR_MUTED
    pq_desc.alignment = PP_ALIGN.CENTER

    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "AquaScope_Presentation.pptx"))
    prs.save(out_file)
    print(f"Presentation saved successfully to: {out_file}")
    return out_file

if __name__ == "__main__":
    build_deck()
