"""
backend/ml/preprocessing.py
Handles loading and preprocessing of the WASH (Water, Sanitation and Hygiene) dataset.
Provides functions to load CSV data, fill missing values, and scale features.
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler


def load_wash_dataset(filepath):
    """
    Load the WASH dataset from a CSV file.

    Args:
        filepath (str): Path to the CSV file.

    Returns:
        pd.DataFrame: The loaded dataframe.
    """
    df = pd.read_csv(filepath)
    return df


def preprocess_wash(df):
    """
    Preprocess the WASH dataframe for clustering.

    Steps:
      1. Select numeric feature columns (percentage columns).
      2. Fill missing values with the column mean.
      3. Scale features using StandardScaler (zero mean, unit variance).

    Args:
        df (pd.DataFrame): Raw WASH dataframe.

    Returns:
        tuple:
            - scaled_array (np.ndarray): Scaled feature matrix.
            - feature_names (list[str]): Names of the selected feature columns.
            - original_df (pd.DataFrame): The original dataframe (unchanged, for reference).
    """
    # Define the numeric feature columns we want to use for clustering
    feature_names = [
        "basic_water_access_pct",
        "safely_managed_water_pct",
        "unimproved_water_pct",
        "surface_water_pct",
        "rural_water_access_pct",
        "urban_water_access_pct",
        "sanitation_access_pct",
        "hygiene_availability_pct",
    ]

    # Keep only columns that actually exist in the dataframe
    feature_names = [f for f in feature_names if f in df.columns]

    # Extract the feature matrix
    feature_df = df[feature_names].copy()

    # Fill any missing values with the column mean
    for col in feature_names:
        col_mean = feature_df[col].mean()
        feature_df[col] = feature_df[col].fillna(col_mean)

    # Convert to numpy array
    feature_array = feature_df.values.astype(float)

    # Scale the features: each column becomes zero-mean, unit-variance
    scaler = StandardScaler()
    scaled_array = scaler.fit_transform(feature_array)

    return scaled_array, feature_names, df
