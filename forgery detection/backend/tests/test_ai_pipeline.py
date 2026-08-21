import os
import sys
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ai.preprocessing import to_grayscale, apply_clahe, calculate_blur_metric
from app.ai.feature_extractor import compute_noise_variance_analysis, detect_copy_move_keypoints
from app.ai.forgery_detector import classify_forgery_heuristic


def test_preprocessing_functions():
    # Create sample synthetic document canvas
    img = np.ones((200, 300, 3), dtype=np.uint8) * 240
    gray = to_grayscale(img)
    assert gray.shape == (200, 300)
    
    clahe = apply_clahe(gray)
    assert clahe.shape == (200, 300)

    blur_metric = calculate_blur_metric(gray)
    assert isinstance(blur_metric, float)


def test_feature_extractors():
    img = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
    gray = to_grayscale(img)
    
    noise_res = compute_noise_variance_analysis(gray, block_size=32)
    assert "noise_inconsistency_score" in noise_res
    assert "noise_variance_mean" in noise_res

    cm_res = detect_copy_move_keypoints(img)
    assert "copy_move_detected" in cm_res


def test_heuristic_classification():
    mock_features = {
        "ela_data": {
            "ela_anomaly_ratio": 0.01,
            "mean_ela": 8.0,
            "max_ela": 24.0,
            "std_ela": 4.0
        },
        "noise_data": {
            "noise_inconsistency_score": 0.45,
            "noise_variance_mean": 120.0
        },
        "copy_move_data": {
            "copy_move_detected": False,
            "match_count": 0
        }
    }

    pred, conf, f_type, risk = classify_forgery_heuristic(mock_features)
    assert pred == "GENUINE"
    assert risk == "LOW"
    assert conf > 50.0
