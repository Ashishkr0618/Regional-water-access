"""
build_editorial_presentation.py
Builds an editorial, data-science presentation for AquaScope:
"AquaScope — Regional Water Intelligence"
Designed according to strict Our World in Data / academic research guidelines.
16:9 Widescreen (13.333" x 7.5"), clean off-white palette (#F7F8F6), deep navy (#142B3B),
teal (#168C8C), dark charcoal (#252B30), real data, real metrics, and zero generic AI templates.
"""

import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Exact Editorial Palette
    COLOR_BG = RGBColor(247, 248, 246)          # #F7F8F6 (Off-white canvas)
    COLOR_CARD = RGBColor(255, 255, 255)        # #FFFFFF (White panel)
    COLOR_CARD_ALT = RGBColor(241, 245, 249)    # #F1F5F9 (Soft slate container)
    COLOR_BORDER = RGBColor(226, 232, 240)      # #E2E8F0 (Subtle card border)
    COLOR_BORDER_STRONG = RGBColor(203, 213, 225) # #CBD5E1 (Structural border)
    COLOR_NAVY = RGBColor(20, 43, 59)           # #142B3B (Deep Navy Headline)
    COLOR_TEAL = RGBColor(22, 140, 140)         # #168C8C (Brand Teal Accent)
    COLOR_AQUA = RGBColor(168, 218, 220)        # #A8DADC (Muted Aqua)
    COLOR_CHARCOAL = RGBColor(37, 43, 48)       # #252B30 (Primary Reading Text)
    COLOR_MUTED = RGBColor(123, 133, 140)       # #7B858C (Secondary Caption Text)
    
    # Selective Data Indicators
    COLOR_GREEN = RGBColor(26, 152, 80)         # #1A9850 (Safe / High)
    COLOR_AMBER = RGBColor(245, 158, 11)        # #F59E0B (Warning / Moderate)
    COLOR_RED = RGBColor(215, 48, 39)           # #D73027 (Critical / Deficit)

    FONT_HEADING = "Aptos"
    FONT_BODY = "Aptos"

    ASSETS_DIR = r"C:\Users\ashis\.gemini\antigravity\scratch\aquascope\backend\presentation_assets"

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="RESEARCH & DATA INTELLIGENCE", subtitle=None):
        # Category Tracker Badge
        cbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.3))
        ctf = cbox.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0
        cp = ctf.paragraphs[0]
        cp.text = category.upper()
        cp.font.name = FONT_HEADING
        cp.font.size = Pt(10)
        cp.font.bold = True
        cp.font.color.rgb = COLOR_TEAL

        # Slide Main Title
        tbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.7), Inches(0.55))
        ttf = tbox.text_frame
        ttf.word_wrap = True
        ttf.margin_left = ttf.margin_top = ttf.margin_right = ttf.margin_bottom = 0
        tp = ttf.paragraphs[0]
        tp.text = title
        tp.font.name = FONT_HEADING
        tp.font.size = Pt(26)
        tp.font.bold = True
        tp.font.color.rgb = COLOR_NAVY

        # Optional Subtitle
        if subtitle:
            sbox = slide.shapes.add_textbox(Inches(0.8), Inches(1.22), Inches(11.7), Inches(0.35))
            stf = sbox.text_frame
            stf.word_wrap = True
            stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = 0
            sp = stf.paragraphs[0]
            sp.text = subtitle
            sp.font.name = FONT_BODY
            sp.font.size = Pt(12)
            sp.font.color.rgb = COLOR_MUTED

    def add_panel(slide, left, top, width, height, bg_color=COLOR_CARD, border_color=COLOR_BORDER):
        panel = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        panel.fill.solid()
        panel.fill.fore_color.rgb = bg_color
        if border_color:
            panel.line.color.rgb = border_color
            panel.line.width = Pt(1)
        else:
            panel.line.fill.background()
        return panel

    # =========================================================================
    # SLIDE 1: Title / Cover (Editorial Style)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Accent top bar
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = COLOR_TEAL
    top_bar.line.fill.background()

    # Left content block
    tbox1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(6.4), Inches(4.2))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_badge = tf1.paragraphs[0]
    p_badge.text = "ACADEMIC RESEARCH & DATA INTELLIGENCE CAPSTONE"
    p_badge.font.name = FONT_HEADING
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = COLOR_TEAL

    p_title = tf1.add_paragraph()
    p_title.text = "AquaScope"
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(44)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_NAVY
    p_title.space_before = Pt(8)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Regional Water Intelligence from Survey Indicators Using Clustering"
    p_sub.font.name = FONT_HEADING
    p_sub.font.size = Pt(20)
    p_sub.font.color.rgb = COLOR_TEAL
    p_sub.space_before = Pt(4)

    p_desc = tf1.add_paragraph()
    p_desc.text = "A data-science platform analyzing global water access, sanitation, and hygiene (WASH) survey indicators through unsupervised machine learning, geospatial choropleth modeling, and equity gap diagnostics."
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(13)
    p_desc.font.color.rgb = COLOR_CHARCOAL
    p_desc.space_before = Pt(16)

    # Metadata card at bottom left
    add_panel(s1, Inches(1.0), Inches(5.6), Inches(6.0), Inches(1.3), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    meta_box = s1.shapes.add_textbox(Inches(1.2), Inches(5.72), Inches(5.6), Inches(1.05))
    mtf = meta_box.text_frame
    mtf.word_wrap = True
    mtf.margin_left = mtf.margin_top = mtf.margin_right = mtf.margin_bottom = 0

    mp1 = mtf.paragraphs[0]
    mp1.text = "Student / Researcher: [Your Name / Roll No. Placeholder]"
    mp1.font.name = FONT_BODY
    mp1.font.size = Pt(11)
    mp1.font.bold = True
    mp1.font.color.rgb = COLOR_NAVY

    mp2 = mtf.add_paragraph()
    mp2.text = "Project Guide / Supervisor: [Faculty Advisor Name & Department]"
    mp2.font.name = FONT_BODY
    mp2.font.size = Pt(10)
    mp2.font.color.rgb = COLOR_CHARCOAL
    mp2.space_before = Pt(3)

    mp3 = mtf.add_paragraph()
    mp3.text = "Institution: [University / College Department of Computer Science & Engineering]"
    mp3.font.name = FONT_BODY
    mp3.font.size = Pt(10)
    mp3.font.color.rgb = COLOR_MUTED
    mp3.space_before = Pt(3)

    # Right side: Map Graphic Preview
    map_path = os.path.join(ASSETS_DIR, "world_map_editorial.png")
    if os.path.exists(map_path):
        add_panel(s1, Inches(7.3), Inches(1.4), Inches(5.0), Inches(5.3), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
        s1.shapes.add_picture(map_path, Inches(7.4), Inches(2.2), width=Inches(4.8))
        
        caption_box = s1.shapes.add_textbox(Inches(7.5), Inches(1.6), Inches(4.6), Inches(0.5))
        ctf = caption_box.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0
        cp = ctf.paragraphs[0]
        cp.text = "Global WASH Choropleth Model (WHO/UNICEF JMP)"
        cp.font.name = FONT_HEADING
        cp.font.size = Pt(12)
        cp.font.bold = True
        cp.font.color.rgb = COLOR_NAVY
        
        cp2 = ctf.add_paragraph()
        cp2.text = "Continuous 8-dimensional survey indicators harmonized across 69 nations"
        cp2.font.name = FONT_BODY
        cp2.font.size = Pt(10)
        cp2.font.color.rgb = COLOR_MUTED

    # =========================================================================
    # SLIDE 2: The Problem (Unequal Access & Disparity Gap)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "The Real-World Crisis: Hidden Disparities in Global Water Access", 
               "THE PROBLEM STATEMENT", 
               "National averages mask acute rural infrastructure deficits and critical safety deficits.")

    # Left Column: Problem Narrative & Diagnostic Points
    add_panel(s2, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    p_box2 = s2.shapes.add_textbox(Inches(1.1), Inches(1.95), Inches(5.0), Inches(4.7))
    ptf2 = p_box2.text_frame
    ptf2.word_wrap = True
    ptf2.margin_left = ptf2.margin_top = ptf2.margin_right = ptf2.margin_bottom = 0

    h1 = ptf2.paragraphs[0]
    h1.text = "1. The Severe Rural-Urban Divide"
    h1.font.name = FONT_HEADING
    h1.font.size = Pt(14)
    h1.font.bold = True
    h1.font.color.rgb = COLOR_NAVY

    b1 = ptf2.add_paragraph()
    b1.text = "Developing nations routinely demonstrate high urban municipal coverage (85–95%), while adjacent rural populations remain stranded below 35%. Macro-level statistics collapse these populations into a single misleading average."
    b1.font.name = FONT_BODY
    b1.font.size = Pt(11)
    b1.font.color.rgb = COLOR_CHARCOAL
    b1.space_before = Pt(4)

    h2 = ptf2.add_paragraph()
    h2.text = "2. The 'Safety Deficit' Vulnerability"
    h2.font.name = FONT_HEADING
    h2.font.size = Pt(14)
    h2.font.bold = True
    h2.font.color.rgb = COLOR_NAVY
    h2.space_before = Pt(14)

    b2 = ptf2.add_paragraph()
    b2.text = "Having 'basic' access means drinking water is located within a 30-minute roundtrip. It does not ensure the water is free from microbial fecal contamination or available consistently on premises."
    b2.font.name = FONT_BODY
    b2.font.size = Pt(11)
    b2.font.color.rgb = COLOR_CHARCOAL
    b2.space_before = Pt(4)

    h3 = ptf2.add_paragraph()
    h3.text = "3. Multi-Indicator Fragmentation"
    h3.font.name = FONT_HEADING
    h3.font.size = Pt(14)
    h3.font.bold = True
    h3.font.color.rgb = COLOR_NAVY
    h3.space_before = Pt(14)

    b3 = ptf2.add_paragraph()
    b3.text = "International survey records (WHO/UNICEF JMP) compile thousands of disjointed tabular rows. Analysts lack holistic profiling tools to identify countries facing identical structural water challenges."
    b3.font.name = FONT_BODY
    b3.font.size = Pt(11)
    b3.font.color.rgb = COLOR_CHARCOAL
    b3.space_before = Pt(4)

    # Right Column: Actual Disparity Chart
    disp_path = os.path.join(ASSETS_DIR, "disparity_gap_editorial.png")
    if os.path.exists(disp_path):
        add_panel(s2, Inches(6.7), Inches(1.7), Inches(5.8), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
        s2.shapes.add_picture(disp_path, Inches(6.85), Inches(1.85), width=Inches(5.5))

    # =========================================================================
    # SLIDE 3: Why This Project? (The Analytical Gap)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Why AquaScope? Bridging Raw Data and Holistic Intelligence",
               "MOTIVATION & METHODOLOGICAL GAP",
               "Traditional static reports fail to capture multi-dimensional country profiles.")

    # Two comparison columns: Left = Status Quo, Right = AquaScope Approach
    add_panel(s3, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), bg_color=COLOR_CARD_ALT, border_color=COLOR_BORDER)
    lbox = s3.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.6))
    ltf = lbox.text_frame
    ltf.word_wrap = True
    ltf.margin_left = ltf.margin_top = ltf.margin_right = ltf.margin_bottom = 0

    lh1 = ltf.paragraphs[0]
    lh1.text = "Conventional WASH Reporting"
    lh1.font.name = FONT_HEADING
    lh1.font.size = Pt(16)
    lh1.font.bold = True
    lh1.font.color.rgb = COLOR_MUTED

    items_l = [
        ("Static Tabular Silos:", "Data is buried in disjointed PDFs and massive multi-column CSVs that cannot be cross-filtered dynamically."),
        ("Single-Indicator Bias:", "Ranking countries purely on 'Basic Access' masks critical failures in sanitation, hygiene, and rural equity."),
        ("No Structural Groupings:", "Evaluators cannot identify which geographically distant nations share identical infrastructure bottlenecks."),
        ("No Actionable Benchmarking:", "Policy makers cannot benchmark country 'A' directly against country 'B' across multidimensional deltas.")
    ]
    for title, desc in items_l:
        p_t = ltf.add_paragraph()
        p_t.text = title
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(12)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_NAVY
        p_t.space_before = Pt(12)

        p_d = ltf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = COLOR_CHARCOAL
        p_d.space_before = Pt(2)

    # Right: AquaScope Solution
    add_panel(s3, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_TEAL)
    rbox = s3.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.6))
    rtf = rbox.text_frame
    rtf.word_wrap = True
    rtf.margin_left = rtf.margin_top = rtf.margin_right = rtf.margin_bottom = 0

    rh1 = rtf.paragraphs[0]
    rh1.text = "AquaScope Intelligence Platform"
    rh1.font.name = FONT_HEADING
    rh1.font.size = Pt(16)
    rh1.font.bold = True
    rh1.font.color.rgb = COLOR_TEAL

    items_r = [
        ("Unsupervised Machine Learning:", "Applies K-Means clustering across standardized 8-dimensional feature vectors to uncover natural profile archetypes."),
        ("Interactive Geospatial Choropleth:", "An editorial world map allowing users to toggle across 8 indicators with responsive gradient visualization."),
        ("Multi-Country Benchmarking Engine:", "Enables side-by-side comparative matrices with advantage indicators and computed rural-urban disparity deltas."),
        ("Automated Equity Diagnostics:", "Derives verifiable observations from data without fabrication, pinpointing extreme safety deficits.")
    ]
    for title, desc in items_r:
        p_t = rtf.add_paragraph()
        p_t.text = title
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(12)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_NAVY
        p_t.space_before = Pt(12)

        p_d = rtf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = COLOR_CHARCOAL
        p_d.space_before = Pt(2)

    # =========================================================================
    # SLIDE 4: Project Objectives (Structured Editorial Grid)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "Project Objectives: A Rigorous Full-Stack Engineering Scope",
               "SYSTEM OBJECTIVES",
               "Six core pillars uniting machine learning algorithms, API services, and user-centric exploration.")

    objectives = [
        ("01", "Harmonize Global Indicators", "Standardize open survey indicators from the WHO/UNICEF Joint Monitoring Programme into clean, continuous feature vectors across 69 surveyed nations."),
        ("02", "Unsupervised Profile Discovery", "Implement K-Means clustering on scaled features to partition countries into mathematically coherent water-access clusters without subjective labeling."),
        ("03", "Quantify Structural Disparities", "Isolate and analyze disparities between urban municipal coverage and rural village accessibility to identify where infrastructure gaps are widest."),
        ("04", "Measure The Safety Deficit", "Evaluate the gap between nominal basic water coverage and treated, safely managed drinking water delivered on premises."),
        ("05", "Interactive Geospatial Exploration", "Build a high-performance, light-themed world choropleth map featuring dynamic color scaling, search autocomplete, and slide-over dossiers."),
        ("06", "Cross-Country Benchmarking", "Provide comparative matrix tools enabling researchers and evaluators to compare two or more nations side-by-side with advantage analytics.")
    ]

    col_w = Inches(3.7)
    row_h = Inches(2.4)
    x_coords = [Inches(0.8), Inches(4.8), Inches(8.8)]
    y_coords = [Inches(1.8), Inches(4.5)]

    for idx, (num, title, desc) in enumerate(objectives):
        col_idx = idx % 3
        row_idx = idx // 3
        cx = x_coords[col_idx]
        cy = y_coords[row_idx]

        add_panel(s4, cx, cy, col_w, row_h, bg_color=COLOR_CARD, border_color=COLOR_BORDER)
        obox = s4.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.2), col_w - Inches(0.5), row_h - Inches(0.4))
        otf = obox.text_frame
        otf.word_wrap = True
        otf.margin_left = otf.margin_top = otf.margin_right = otf.margin_bottom = 0

        p_n = otf.paragraphs[0]
        p_n.text = num
        p_n.font.name = FONT_HEADING
        p_n.font.size = Pt(18)
        p_n.font.bold = True
        p_n.font.color.rgb = COLOR_TEAL

        p_t = otf.add_paragraph()
        p_t.text = title
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_NAVY
        p_t.space_before = Pt(4)

        p_d = otf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(10.5)
        p_d.font.color.rgb = COLOR_CHARCOAL
        p_d.space_before = Pt(6)

    # =========================================================================
    # SLIDE 5: Dataset & Survey Indicators (Authentic Sample Table)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Dataset & Survey Indicators: WHO/UNICEF JMP Standards",
               "DATASET ARCHITECTURE",
               "Official global survey indicators capturing water access, source safety, sanitation, and hygiene.")

    # Left: Indicator Taxonomy
    add_panel(s5, Inches(0.8), Inches(1.7), Inches(5.2), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    tbox5 = s5.shapes.add_textbox(Inches(1.05), Inches(1.95), Inches(4.7), Inches(4.7))
    ttf5 = tbox5.text_frame
    ttf5.word_wrap = True
    ttf5.margin_left = ttf5.margin_top = ttf5.margin_right = ttf5.margin_bottom = 0

    th1 = ttf5.paragraphs[0]
    th1.text = "Survey Indicators & Definitions"
    th1.font.name = FONT_HEADING
    th1.font.size = Pt(14)
    th1.font.bold = True
    th1.font.color.rgb = COLOR_NAVY

    indicators_meta = [
        ("Basic Drinking Water (%):", "Water from an improved source with collection time <= 30 mins roundtrip."),
        ("Safely Managed Water (%):", "Improved source located on premises, available when needed, free of contamination."),
        ("Rural vs. Urban Access (%):", "Coverage divided by municipal demarcation, quantifying geographic equity."),
        ("Sanitation Coverage (%):", "Improved facilities not shared with other households (flush/latrine)."),
        ("Hygiene Availability (%):", "Handwashing facility with soap and clean water on premises."),
        ("Unimproved & Surface (%):", "Unprotected dug wells and untreated direct river/lake collection (hazard metrics).")
    ]
    for name, expl in indicators_meta:
        pn = ttf5.add_paragraph()
        pn.text = name
        pn.font.name = FONT_HEADING
        pn.font.size = Pt(11)
        pn.font.bold = True
        pn.font.color.rgb = COLOR_TEAL
        pn.space_before = Pt(8)

        pe = ttf5.add_paragraph()
        pe.text = expl
        pe.font.name = FONT_BODY
        pe.font.size = Pt(10)
        pe.font.color.rgb = COLOR_CHARCOAL
        pe.space_before = Pt(1)

    # Right: Authentic Dataset Sample Table
    add_panel(s5, Inches(6.3), Inches(1.7), Inches(6.2), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    r_hdr = s5.shapes.add_textbox(Inches(6.6), Inches(1.95), Inches(5.6), Inches(0.5))
    rtf_hdr = r_hdr.text_frame
    rtf_hdr.word_wrap = True
    rtf_hdr.margin_left = rtf_hdr.margin_top = rtf_hdr.margin_right = rtf_hdr.margin_bottom = 0
    rp = rtf_hdr.paragraphs[0]
    rp.text = "Actual Sample Records (wash_dataset.csv, n=69)"
    rp.font.name = FONT_HEADING
    rp.font.size = Pt(13)
    rp.font.bold = True
    rp.font.color.rgb = COLOR_NAVY

    # Add Table Shape
    rows = 6
    cols = 6
    table_shape = s5.shapes.add_table(rows, cols, Inches(6.5), Inches(2.55), Inches(5.8), Inches(3.9))
    tbl = table_shape.table

    tbl.columns[0].width = Inches(1.3)
    tbl.columns[1].width = Inches(0.85)
    tbl.columns[2].width = Inches(0.9)
    tbl.columns[3].width = Inches(0.9)
    tbl.columns[4].width = Inches(0.9)
    tbl.columns[5].width = Inches(0.95)

    headers = ["Country", "Region", "Basic %", "Safely %", "Rural %", "Urban %"]
    for c_idx, h in enumerate(headers):
        cell = tbl.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = FONT_HEADING
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.alignment = PP_ALIGN.CENTER if c_idx > 1 else PP_ALIGN.LEFT

    table_data = [
        ["Ethiopia", "Africa", "41.4%", "8.2%", "32.6%", "92.6%"],
        ["Angola", "Africa", "57.3%", "22.5%", "38.1%", "86.2%"],
        ["Kenya", "Africa", "66.5%", "35.1%", "59.2%", "89.5%"],
        ["India", "Asia", "93.8%", "56.4%", "91.5%", "97.2%"],
        ["Germany", "Europe", "100.0%", "99.8%", "99.8%", "100.0%"],
    ]
    for r_idx, row in enumerate(table_data):
        bg_row = COLOR_CARD if r_idx % 2 == 0 else COLOR_CARD_ALT
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg_row
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = FONT_BODY
            p.font.size = Pt(9.5)
            p.font.color.rgb = COLOR_CHARCOAL
            p.alignment = PP_ALIGN.CENTER if c_idx > 1 else PP_ALIGN.LEFT

    # =========================================================================
    # SLIDE 6: System Architecture (Pipeline Diagram)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "System Architecture: End-to-End Pipeline & Tech Stack",
               "SYSTEM ARCHITECTURE",
               "Clean decoupling between data preprocessing, machine learning execution, and interactive frontend.")

    # 4 Architecture Flow Stages
    stages = [
        ("DATA INGESTION", "WHO/UNICEF JMP Survey", [
            "wash_dataset.csv (n=69 countries)",
            "8 continuous WASH indicators",
            "SQLite database storage (aquascope.db)",
            "Query caching & CSV streaming"
        ]),
        ("MACHINE LEARNING", "Scikit-Learn ML Engine", [
            "Data validation & cleansing",
            "StandardScaler normalization (z-scores)",
            "K-Means clustering (k=3 centroids)",
            "Silhouette, WCSS & Davies-Bouldin evals"
        ]),
        ("REST SERVICES", "Python Flask API Backend", [
            "/api/dashboard: dynamic query filtering",
            "/api/cluster-profiles: profile means",
            "/api/evaluation: WCSS & Silhouette",
            "RESTful JSON contracts & test suite"
        ]),
        ("USER INTERFACE", "React 18 + Vite Frontend", [
            "TopoJSON Interactive World Choropleth",
            "5-tier dynamic color scale & outlines",
            "Recharts multi-country comparison",
            "Slide-over country dossier drawer"
        ]),
    ]

    sw = Inches(2.7)
    sh = Inches(5.0)
    sx_coords = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]

    for idx, (tier_title, subtitle, bullets) in enumerate(stages):
        x = sx_coords[idx]
        add_panel(s6, x, Inches(1.7), sw, sh, bg_color=COLOR_CARD, border_color=COLOR_BORDER)

        # Stage Header
        s_box = s6.shapes.add_textbox(x + Inches(0.2), Inches(1.9), sw - Inches(0.4), Inches(0.9))
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = 0

        p1 = stf.paragraphs[0]
        p1.text = tier_title
        p1.font.name = FONT_HEADING
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_TEAL

        p2 = stf.add_paragraph()
        p2.text = subtitle
        p2.font.name = FONT_HEADING
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_NAVY
        p2.space_before = Pt(3)

        # Bullets
        b_box = s6.shapes.add_textbox(x + Inches(0.2), Inches(2.9), sw - Inches(0.4), Inches(3.6))
        btf = b_box.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = 0

        for b_idx, bullet in enumerate(bullets):
            bp = btf.paragraphs[0] if b_idx == 0 else btf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.name = FONT_BODY
            bp.font.size = Pt(10)
            bp.font.color.rgb = COLOR_CHARCOAL
            if b_idx > 0:
                bp.space_before = Pt(10)

    # =========================================================================
    # SLIDE 7: Data Preprocessing & Mathematical Scaling
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Data Preprocessing: Preparing 8D Feature Space for Distance Metrics",
               "DATA ENGINEERING",
               "Zero-mean, unit-variance standardization eliminates feature dominance in Euclidean space.")

    # 3-step pipeline cards
    prep_steps = [
        ("Step 1: Ingestion & Sanity Checks", [
            "Loaded 69 country observations with 8 core WASH indicators.",
            "Verified absence of missing values across key features.",
            "Validated percentage value ranges: 0.0% <= x <= 100.0%.",
            "Eliminated non-numerical categorical fields from distance vector."
        ]),
        ("Step 2: 8D Feature Space Isolation", [
            "Extracted 8 continuous features into vector x_i in R^8.",
            "Water access: Basic drinking water %, Safely managed water %.",
            "Hazard reliance: Unimproved water %, Surface water reliance %.",
            "Equity & Hygiene: Rural access %, Urban access %, Sanitation %, Hygiene %."
        ]),
        ("Step 3: Z-Score Standardization", [
            "StandardScaler formula: z = (x - mu) / sigma.",
            "Transforms each indicator to zero mean (mu = 0) and unit variance (sigma^2 = 1).",
            "CRITICAL: Prevents high-variance indicators from dominating Euclidean distance calculations.",
            "Ensures equal geometric weighting during centroid convergence."
        ]),
    ]

    pw = Inches(3.7)
    ph = Inches(5.0)
    px_coords = [Inches(0.8), Inches(4.8), Inches(8.8)]

    for idx, (step_title, bullets) in enumerate(prep_steps):
        x = px_coords[idx]
        add_panel(s7, x, Inches(1.7), pw, ph, bg_color=COLOR_CARD, border_color=COLOR_BORDER)

        box = s7.shapes.add_textbox(x + Inches(0.25), Inches(2.0), pw - Inches(0.5), ph - Inches(0.6))
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = step_title
        p1.font.name = FONT_HEADING
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        for b_idx, bullet in enumerate(bullets):
            bp = tf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.name = FONT_BODY
            bp.font.size = Pt(11)
            bp.font.color.rgb = COLOR_CHARCOAL
            bp.space_before = Pt(12)

    # =========================================================================
    # SLIDE 8: Machine Learning Methodology: Unsupervised Clustering
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Unsupervised Clustering: K-Means Formulation & Profile Discovery",
               "MACHINE LEARNING METHODOLOGY",
               "Discovering structural regional archetypes without pre-assigned labels or subjective ranking.")

    # Left: Mathematical Formulation
    add_panel(s8, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    lbox8 = s8.shapes.add_textbox(Inches(1.1), Inches(1.95), Inches(5.0), Inches(4.7))
    ltf8 = lbox8.text_frame
    ltf8.word_wrap = True
    ltf8.margin_left = ltf8.margin_top = ltf8.margin_right = ltf8.margin_bottom = 0

    lh = ltf8.paragraphs[0]
    lh.text = "Mathematical Formulation"
    lh.font.name = FONT_HEADING
    lh.font.size = Pt(15)
    lh.font.bold = True
    lh.font.color.rgb = COLOR_NAVY

    math_points = [
        ("Objective Function (Inertia / WCSS):", 
         "K-Means partitions n observations into k clusters S_j by minimizing intra-cluster sum of squares: J = sum_j sum_{x in S_j} ||x - c_j||^2"),
        ("Centroid Update Rule:", 
         "At each iteration, cluster centroids c_j are updated to the mean coordinate of their member feature vectors: c_j = (1 / |S_j|) sum_{x in S_j} x"),
        ("Distance Metric:", 
         "Euclidean distance in R^8: d(x, c_j) = sqrt(sum_{m=1}^8 (x_m - c_{jm})^2)"),
        ("Objective Grouping (Not Ranking):", 
         "The algorithm discovers geometric clusters based on multi-indicator similarity; it does not claim causation or subjectively rank countries.")
    ]
    for title, desc in math_points:
        pt = ltf8.add_paragraph()
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_TEAL
        pt.space_before = Pt(10)

        pd = ltf8.add_paragraph()
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(2)

    # Right: Discovered Cluster Profiles
    add_panel(s8, Inches(6.7), Inches(1.7), Inches(5.8), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    rbox8 = s8.shapes.add_textbox(Inches(7.0), Inches(1.95), Inches(5.2), Inches(4.7))
    rtf8 = rbox8.text_frame
    rtf8.word_wrap = True
    rtf8.margin_left = rtf8.margin_top = rtf8.margin_right = rtf8.margin_bottom = 0

    rh = rtf8.paragraphs[0]
    rh.text = "Three Discovered Regional Clusters (k=3)"
    rh.font.name = FONT_HEADING
    rh.font.size = Pt(15)
    rh.font.bold = True
    rh.font.color.rgb = COLOR_NAVY

    clusters_info = [
        ("Cluster 0: Rural Water Access Challenges (n=26)", 
         "• 71.7% Basic Water coverage, but only 45.2% Safely Managed.\n• Significant Rural-Urban Divide: 94.1% urban vs. 63.7% rural (30.4% gap).\n• Sample nations: Ghana, Kenya, India, Senegal, Egypt."),
        ("Cluster 1: High Water Accessibility (n=22)", 
         "• 95.6% Basic Water coverage & 87.9% Safely Managed drinking water.\n• Minimal rural-urban disparity gap (6.0%).\n• Sample nations: China, Thailand, Malaysia, Japan, Germany."),
        ("Cluster 2: Severe Water-Access Deficits (n=21)", 
         "• Only 35.9% Basic Water access; critical 10.6% Safely Managed.\n• Extreme rural deficit: 26.9% rural access; 18.1% surface water reliance.\n• Sample nations: Ethiopia, Chad, Niger, South Sudan, Central African Rep.")
    ]
    for c_title, c_desc in clusters_info:
        pt = rtf8.add_paragraph()
        pt.text = c_title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_NAVY
        pt.space_before = Pt(10)

        pd = rtf8.add_paragraph()
        pd.text = c_desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 9: Model Evaluation & Validation Metrics (Exact Data)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "Model Evaluation: Empirical Validation of Cluster Quality",
               "EMPIRICAL EVALUATION",
               "Rigorous evaluation via WCSS Elbow method, Silhouette analysis, and Davies-Bouldin index.")

    # Left: Evaluation Chart
    eval_chart_path = os.path.join(ASSETS_DIR, "eval_curves_editorial.png")
    if os.path.exists(eval_chart_path):
        add_panel(s9, Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
        s9.shapes.add_picture(eval_chart_path, Inches(0.95), Inches(1.85), width=Inches(5.5))

    # Right: Metric Breakdown & Numerical Results
    add_panel(s9, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    rbox9 = s9.shapes.add_textbox(Inches(7.1), Inches(1.95), Inches(5.1), Inches(4.7))
    rtf9 = rbox9.text_frame
    rtf9.word_wrap = True
    rtf9.margin_left = rtf9.margin_top = rtf9.margin_right = rtf9.margin_bottom = 0

    rh9 = rtf9.paragraphs[0]
    rh9.text = "Mathematical Metrics at k=3"
    rh9.font.name = FONT_HEADING
    rh9.font.size = Pt(15)
    rh9.font.bold = True
    rh9.font.color.rgb = COLOR_NAVY

    eval_items = [
        ("WCSS / Inertia (73.63):", 
         "Inertia drops by 49.4% between k=2 (145.46) and k=3 (73.63), forming a distinct 'elbow'. Beyond k=3, marginal reduction diminishes."),
        ("Silhouette Score (0.5505):", 
         "Measures how well each observation fits its assigned cluster vs. the nearest neighboring cluster. Score > 0.5 confirms strong intra-cluster cohesion and clear separation."),
        ("Davies-Bouldin Index (0.5496):", 
         "Quantifies average similarity of each cluster with its most similar cluster. Lower values indicate superior separation; 0.549 confirms tight, isolated groupings."),
        ("Dimensionality Reduction (PCA):", 
         "Principal Component Analysis reduces 8D feature space to 2 principal components, capturing ~82% of overall variance for visual validation.")
    ]
    for title, desc in eval_items:
        pt = rtf9.add_paragraph()
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_TEAL
        pt.space_before = Pt(8)

        pd = rtf9.add_paragraph()
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 10: AquaScope: Interactive Regional Explorer (UI Demonstration)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_header(s10, "Application Interface: Interactive Regional Explorer",
               "PRODUCT DEMONSTRATION",
               "A clean, light-themed geospatial choropleth map powered by React and TopoJSON.")

    # Left: Feature Highlights
    add_panel(s10, Inches(0.8), Inches(1.7), Inches(4.5), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    lbox10 = s10.shapes.add_textbox(Inches(1.05), Inches(1.95), Inches(4.0), Inches(4.7))
    ltf10 = lbox10.text_frame
    ltf10.word_wrap = True
    ltf10.margin_left = ltf10.margin_top = ltf10.margin_right = ltf10.margin_bottom = 0

    lh10 = ltf10.paragraphs[0]
    lh10.text = "Key Interactive Capabilities"
    lh10.font.name = FONT_HEADING
    lh10.font.size = Pt(14)
    lh10.font.bold = True
    lh10.font.color.rgb = COLOR_NAVY

    map_features = [
        ("Light Editorial Theme:", "Clean off-white canvas with razor-sharp white borders (0.7px) following Our World in Data aesthetics."),
        ("5-Tier Gradient Palette:", "#1A9850 (Green) to #D73027 (Red), with neutral #E5E7EB for unmonitored territories."),
        ("Dynamic Indicator Switcher:", "Instant re-rendering across all 8 indicators (Basic, Safely Managed, Rural, Urban, Sanitation, Hygiene, Unimproved, Surface)."),
        ("Hover & Click Interactions:", "Hover triggers a blue outline (#2563EB) and non-clipping tooltip; clicking opens a comprehensive slide-over dossier."),
        ("Search Autocomplete:", "Instant country search with zoom focus and quick-select.")
    ]
    for title, desc in map_features:
        pt = ltf10.add_paragraph()
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_TEAL
        pt.space_before = Pt(8)

        pd = ltf10.add_paragraph()
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(1)

    # Right: Browser Frame Screenshot
    mockup_path = os.path.join(ASSETS_DIR, "app_explorer_mockup.png")
    if os.path.exists(mockup_path):
        add_panel(s10, Inches(5.5), Inches(1.7), Inches(7.0), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
        s10.shapes.add_picture(mockup_path, Inches(5.6), Inches(1.8), width=Inches(6.8))

    # =========================================================================
    # SLIDE 11: Dashboard & Country Comparison Matrix
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11)
    add_header(s11, "User-Centric Analytics: Dashboard & Country Comparison",
               "ANALYTICS & COMPARISON",
               "Dynamic multi-variable filtering, responsive charts, and side-by-side benchmarking.")

    # 3 Horizontal capability cards
    cards11 = [
        ("Dynamic Multi-Variable Filtering", [
            "Macro-Region selector (Africa, Americas, Asia, Europe, Oceania).",
            "Survey year filter (2020 Benchmark vs. 2021 Survey Cycle).",
            "Indicator focus sort dynamically reorganizes ranking charts.",
            "Real-time KPI recalculation for surveyed region averages."
        ]),
        ("Side-by-Side Country Comparison", [
            "Benchmarking matrix comparing 2 to 4 nations simultaneously.",
            "Grouped Recharts comparative bar charts across all WASH pillars.",
            "Color-coded 'Advantage' badges identifying infrastructure leaders.",
            "Automated comparative narrative highlighting key disparity gaps."
        ]),
        ("Data-Driven Insights & Glossary", [
            "Automated equity observations derived directly from active filters.",
            "Identifies critical water shortages, rural divides, and safety deficits.",
            "Interactive WHO/UNICEF JMP Indicator Glossary modal.",
            "Explains SDG 6 targets and public health thresholds."
        ]),
    ]

    cw11 = Inches(3.7)
    ch11 = Inches(5.0)
    cx11 = [Inches(0.8), Inches(4.8), Inches(8.8)]

    for idx, (title, bullets) in enumerate(cards11):
        x = cx11[idx]
        add_panel(s11, x, Inches(1.7), cw11, ch11, bg_color=COLOR_CARD, border_color=COLOR_BORDER)

        box = s11.shapes.add_textbox(x + Inches(0.25), Inches(2.0), cw11 - Inches(0.5), ch11 - Inches(0.6))
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = FONT_HEADING
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        for b_idx, bullet in enumerate(bullets):
            bp = tf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.name = FONT_BODY
            bp.font.size = Pt(11)
            bp.font.color.rgb = COLOR_CHARCOAL
            bp.space_before = Pt(12)

    # =========================================================================
    # SLIDE 12: Results & Key Findings (Cluster Comparison Chart)
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12)
    add_header(s12, "Empirical Results: Core Findings from Clustering & Survey Data",
               "EXPERIMENTAL FINDINGS",
               "Cross-national data reveals distinct structural profiles and infrastructure fault lines.")

    # Left: Cluster Profile Bar Chart
    prof_chart_path = os.path.join(ASSETS_DIR, "cluster_profiles_editorial.png")
    if os.path.exists(prof_chart_path):
        add_panel(s12, Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
        s12.shapes.add_picture(prof_chart_path, Inches(0.95), Inches(1.85), width=Inches(5.5))

    # Right: Analytical Observations
    add_panel(s12, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    rbox12 = s12.shapes.add_textbox(Inches(7.1), Inches(1.95), Inches(5.1), Inches(4.7))
    rtf12 = rbox12.text_frame
    rtf12.word_wrap = True
    rtf12.margin_left = rtf12.margin_top = rtf12.margin_right = rtf12.margin_bottom = 0

    rh12 = rtf12.paragraphs[0]
    rh12.text = "Key Analytical Takeaways"
    rh12.font.name = FONT_HEADING
    rh12.font.size = Pt(15)
    rh12.font.bold = True
    rh12.font.color.rgb = COLOR_NAVY

    findings = [
        ("The Pervasive Rural Divide (Cluster 0):", 
         "In transition economies, urban water coverage reaches 94.1%, but rural coverage drops to 63.7%—a 30.4% structural gap. In nations like Angola and Ethiopia, this gap exceeds 48%."),
        ("The 'Safety Deficit' in Transition Economies:", 
         "Cluster 0 countries have achieved 71.7% basic water access, yet only 45.2% is safely managed. Over 26% of populations use improved water that is unmonitored for biological pathogens."),
        ("Severe Multi-Dimensional Deficits (Cluster 2):", 
         "Cluster 2 nations face concurrent breakdowns: 35.9% water access, 14.9% sanitation, and 18.1% reliance on untreated surface water, demonstrating that water and sanitation deficits compound."),
        ("Universal Coverage Parity (Cluster 1):", 
         "High-access nations maintain near-zero disparity between urban (98.9%) and rural (93.0%) grids, validating that equitable distribution requires dedicated rural capital investment.")
    ]
    for title, desc in findings:
        pt = rtf12.add_paragraph()
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_TEAL
        pt.space_before = Pt(8)

        pd = rtf12.add_paragraph()
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 13: Limitations & Future Scope
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_bg(s13)
    add_header(s13, "Realistic Boundaries & Future Research Roadmap",
               "LIMITATIONS & FUTURE SCOPE",
               "Honest assessment of dataset constraints and strategic avenues for production expansion.")

    # Left: Limitations
    add_panel(s13, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    lbox13 = s13.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.6))
    ltf13 = lbox13.text_frame
    ltf13.word_wrap = True
    ltf13.margin_left = ltf13.margin_top = ltf13.margin_right = ltf13.margin_bottom = 0

    lh13 = ltf13.paragraphs[0]
    lh13.text = "Current Project Limitations"
    lh13.font.name = FONT_HEADING
    lh13.font.size = Pt(15)
    lh13.font.bold = True
    lh13.font.color.rgb = COLOR_NAVY

    limitations = [
        ("Sample Size Constraints:", "Current harmonized sample covers 69 countries with complete cross-indicator records, excluding unmonitored island territories."),
        ("National-Level Granularity:", "Country-level aggregation can conceal severe micro-regional inequalities between affluent urban centers and isolated indigenous communities."),
        ("Temporal Survey Latency:", "Global WASH survey cycles occur every 2 to 5 years, limiting high-frequency real-time trend detection."),
        ("Correlation vs. Causation:", "Unsupervised clustering groups mathematically similar profiles but does not identify root economic or geopolitical drivers.")
    ]
    for title, desc in limitations:
        pt = ltf13.add_paragraph()
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_RED
        pt.space_before = Pt(10)

        pd = ltf13.add_paragraph()
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(2)

    # Right: Future Scope
    add_panel(s13, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    rbox13 = s13.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.6))
    rtf13 = rbox13.text_frame
    rtf13.word_wrap = True
    rtf13.margin_left = rtf13.margin_top = rtf13.margin_right = rtf13.margin_bottom = 0

    rh13 = rtf13.paragraphs[0]
    rh13.text = "Proposed Future Roadmap"
    rh13.font.name = FONT_HEADING
    rh13.font.size = Pt(15)
    rh13.font.bold = True
    rh13.font.color.rgb = COLOR_TEAL

    future_items = [
        ("Sub-National Geospatial Ingestion:", "Integrate district-level (ADM-1 / ADM-2) survey indicators to expose municipal and provincial disparities."),
        ("IoT Borehole Telemetry Integration:", "Connect real-time flow sensors and acoustic leak detectors on public rural water points for live operational monitoring."),
        ("Time-Series Trajectory Forecasting:", "Implement temporal autoregressive modeling to predict each country's trajectory towards UN SDG 6 by 2030."),
        ("Water Quality Parameter Inference:", "Expand the secondary classification module to predict chemical potability (pH, turbidity, dissolved solids).")
    ]
    for title, desc in future_items:
        pt = rtf13.add_paragraph()
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_NAVY
        pt.space_before = Pt(10)

        pd = rtf13.add_paragraph()
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = COLOR_CHARCOAL
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 14: Conclusion & Academic Summary
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_bg(s14)
    add_header(s14, "Conclusion & Academic Summary",
               "FINAL SYNTHESIS",
               "Translating complex survey tables into actionable data science intelligence.")

    # Central Summary Card
    add_panel(s14, Inches(1.5), Inches(1.8), Inches(10.3), Inches(4.8), bg_color=COLOR_CARD, border_color=COLOR_BORDER)
    cbox14 = s14.shapes.add_textbox(Inches(1.9), Inches(2.1), Inches(9.5), Inches(4.2))
    ctf14 = cbox14.text_frame
    ctf14.word_wrap = True
    ctf14.margin_left = ctf14.margin_top = ctf14.margin_right = ctf14.margin_bottom = 0

    cp1 = ctf14.paragraphs[0]
    cp1.text = "Summary of Project Contributions"
    cp1.font.name = FONT_HEADING
    cp1.font.size = Pt(16)
    cp1.font.bold = True
    cp1.font.color.rgb = COLOR_NAVY

    cp2 = ctf14.add_paragraph()
    cp2.text = "AquaScope demonstrates that unsupervised machine learning combined with modern geospatial web visualization can convert dense statistical surveys into intuitive, actionable public health insights. By clustering 69 nations across 8 standardized indicators, the platform objectively uncovers global water vulnerability archetypes, quantifies the rural-urban infrastructure divide, and exposes critical safety deficits that single-indicator tables obscure."
    cp2.font.name = FONT_BODY
    cp2.font.size = Pt(12)
    cp2.font.color.rgb = COLOR_CHARCOAL
    cp2.space_before = Pt(8)

    # Closing Quote Banner
    quote_panel = s14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.9), Inches(3.7), Inches(9.5), Inches(1.0))
    quote_panel.fill.solid()
    quote_panel.fill.fore_color.rgb = COLOR_CARD_ALT
    quote_panel.line.color.rgb = COLOR_TEAL
    quote_panel.line.width = Pt(1.5)

    qbox = s14.shapes.add_textbox(Inches(2.1), Inches(3.85), Inches(9.1), Inches(0.7))
    qtf = qbox.text_frame
    qtf.word_wrap = True
    qtf.margin_left = qtf.margin_top = qtf.margin_right = qtf.margin_bottom = 0
    qp = qtf.paragraphs[0]
    qp.text = '"Turning water-access data into meaningful geographical and analytical insights."'
    qp.font.name = FONT_HEADING
    qp.font.size = Pt(15)
    qp.font.bold = True
    qp.font.color.rgb = COLOR_NAVY
    qp.alignment = PP_ALIGN.CENTER

    # Project Links / Q&A Box
    qa_box = s14.shapes.add_textbox(Inches(1.9), Inches(5.0), Inches(9.5), Inches(1.2))
    qtf2 = qa_box.text_frame
    qtf2.word_wrap = True
    qtf2.margin_left = qtf2.margin_top = qtf2.margin_right = qtf2.margin_bottom = 0

    qa_p = qtf2.paragraphs[0]
    qa_p.text = "Questions & Academic Discussion"
    qa_p.font.name = FONT_HEADING
    qa_p.font.size = Pt(14)
    qa_p.font.bold = True
    qa_p.font.color.rgb = COLOR_TEAL

    qa_sub = qtf2.add_paragraph()
    qa_sub.text = "GitHub Repository: github.com/Ashishkr0618/Regional-water-access  ·  Live Web Application: http://localhost:5173"
    qa_sub.font.name = FONT_BODY
    qa_sub.font.size = Pt(10.5)
    qa_sub.font.color.rgb = COLOR_MUTED
    qa_sub.space_before = Pt(3)

    qa_thk = qtf2.add_paragraph()
    qa_thk.text = "Thank you for your time, evaluation, and feedback."
    qa_thk.font.name = FONT_HEADING
    qa_thk.font.size = Pt(11)
    qa_thk.font.bold = True
    qa_thk.font.color.rgb = COLOR_NAVY
    qa_thk.space_before = Pt(5)

    # Save to both target locations
    local_path = r"C:\Users\ashis\.gemini\antigravity\scratch\aquascope\AquaScope_Presentation.pptx"
    artifact_path = r"C:\Users\ashis\.gemini\antigravity\brain\d5da5767-81a9-4f86-9d88-e85ed4684d15\AquaScope_Presentation.pptx"

    prs.save(local_path)
    prs.save(artifact_path)
    print("Presentation saved successfully to:")
    print("  -", local_path)
    print("  -", artifact_path)

if __name__ == "__main__":
    build_presentation()
