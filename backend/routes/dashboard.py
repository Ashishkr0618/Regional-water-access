"""
backend/routes/dashboard.py
Flask Blueprint for high-level dashboard summaries, metrics, and dynamic filtering.
Aggregates indicators across all surveyed countries and macro-regions.
Supports optional filtering by region, year, and custom sort indicator.
"""

import os
from flask import Blueprint, jsonify, request
import pandas as pd

dashboard_bp = Blueprint("dashboard_bp", __name__)

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "wash_dataset.csv")


def _load_df():
    return pd.read_csv(os.path.abspath(_DATA_PATH))


@dashboard_bp.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """
    GET /api/dashboard
    Returns summary statistics, top/bottom regions with full indicators,
    regional breakdown, all records, and supports optional query params:
      - region: filter by macro-region (e.g., 'Africa', 'Asia', 'ALL')
      - year: filter by year (e.g., 2020)
      - indicator: column name for sorting top/bottom regions
    """
    try:
        raw_df = _load_df()
        df = raw_df.copy()

        # Optional filtering from query parameters
        req_region = request.args.get("region")
        if req_region and req_region.upper() != "ALL" and "region" in df.columns:
            df = df[df["region"].str.lower() == req_region.strip().lower()]

        req_year = request.args.get("year")
        if req_year and req_year.upper() != "ALL" and "year" in df.columns:
            try:
                df = df[df["year"] == int(req_year)]
            except ValueError:
                pass

        sort_indicator = request.args.get("indicator", "basic_water_access_pct")
        if sort_indicator not in df.columns:
            sort_indicator = "basic_water_access_pct"

        total_regions = int(df["country"].nunique()) if "country" in df.columns else int(len(df))
        dataset_records = int(len(df))

        def safe_avg(col):
            if col in df.columns and len(df) > 0:
                val = df[col].mean()
                return round(float(val), 2) if pd.notna(val) else 0.0
            return 0.0

        avg_basic = safe_avg("basic_water_access_pct")
        avg_safely = safe_avg("safely_managed_water_pct")
        avg_sanitation = safe_avg("sanitation_access_pct")
        avg_hygiene = safe_avg("hygiene_availability_pct")
        avg_rural = safe_avg("rural_water_access_pct")
        avg_urban = safe_avg("urban_water_access_pct")
        avg_unimproved = safe_avg("unimproved_water_pct")
        avg_surface = safe_avg("surface_water_pct")

        # Top and bottom regions with full indicator attributes
        desired_cols = [
            "country", "region", "basic_water_access_pct", "safely_managed_water_pct",
            "urban_water_access_pct", "rural_water_access_pct",
            "sanitation_access_pct", "hygiene_availability_pct",
            "unimproved_water_pct", "surface_water_pct", "year"
        ]
        available_cols = [c for c in desired_cols if c in df.columns]

        top_regions = []
        bottom_regions = []
        if sort_indicator in df.columns and len(df) > 0:
            sorted_df = df[available_cols].dropna(subset=[sort_indicator])
            sorted_df = sorted_df.sort_values(sort_indicator, ascending=False)
            top_regions = sorted_df.head(15).to_dict(orient="records")
            bottom_regions = sorted_df.tail(10).to_dict(orient="records")

        # Regional breakdown by continent / world region (from raw_df for broad context)
        by_region = []
        if "region" in raw_df.columns:
            grouped = raw_df.groupby("region")
            for reg, grp in grouped:
                by_region.append({
                    "region": reg,
                    "countries_count": int(len(grp)),
                    "avg_water": round(float(grp["basic_water_access_pct"].mean()), 1) if "basic_water_access_pct" in grp.columns else 0,
                    "avg_sanitation": round(float(grp["sanitation_access_pct"].mean()), 1) if "sanitation_access_pct" in grp.columns else 0,
                    "avg_hygiene": round(float(grp["hygiene_availability_pct"].mean()), 1) if "hygiene_availability_pct" in grp.columns else 0,
                    "avg_rural": round(float(grp["rural_water_access_pct"].mean()), 1) if "rural_water_access_pct" in grp.columns else 0,
                    "avg_urban": round(float(grp["urban_water_access_pct"].mean()), 1) if "urban_water_access_pct" in grp.columns else 0,
                })

        year_range = [int(raw_df["year"].min()), int(raw_df["year"].max())] if "year" in raw_df.columns else [2020, 2022]
        available_years = sorted(list(raw_df["year"].unique())) if "year" in raw_df.columns else [2020]

        return jsonify({
            "total_regions": total_regions,
            "avg_basic_water_access": avg_basic,
            "avg_safely_managed_water": avg_safely,
            "avg_sanitation_access": avg_sanitation,
            "avg_hygiene_availability": avg_hygiene,
            "avg_rural_access": avg_rural,
            "avg_urban_access": avg_urban,
            "avg_unimproved_water": avg_unimproved,
            "avg_surface_water": avg_surface,
            "dataset_records": dataset_records,
            "top_regions": top_regions,
            "bottom_regions": bottom_regions,
            "regional_breakdown": by_region,
            "year_range": year_range,
            "available_years": [int(y) for y in available_years],
            "all_records": df[available_cols].to_dict(orient="records"),
            "active_indicator": sort_indicator,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
