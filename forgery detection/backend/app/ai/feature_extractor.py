import os
import io
from typing import Dict, Any, List, Tuple
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image, ImageChops, ImageEnhance

try:
    # pyrefly: ignore [missing-import]
    import cv2
except ImportError:
    cv2 = None

from app.core.logger import logger


def compute_error_level_analysis(image_path: str, output_ela_path: str, quality: int = 90, scale: int = 15) -> Dict[str, Any]:
    """
    Error Level Analysis (ELA):
    Resaves the image at a known JPEG quality and computes the absolute difference.
    Different compression levels highlight modified/forged regions as glowing pixels.
    """
    original = Image.open(image_path).convert("RGB")
    
    # Save temporary compressed JPEG in-memory
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    compressed = Image.open(buffer)

    # Compute difference
    diff = ImageChops.difference(original, compressed)
    
    # Scale difference to make compression disparities visible
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0:
        max_diff = 1
    
    scale_factor = min(scale, int(255.0 / max_diff)) if max_diff > 0 else scale
    enhancer = ImageEnhance.Brightness(diff)
    ela_enhanced = enhancer.enhance(scale_factor)
    
    # Save ELA visualization
    os.makedirs(os.path.dirname(output_ela_path), exist_ok=True)
    ela_enhanced.save(output_ela_path, format="JPEG", quality=95)
    
    # Compute ELA statistics
    diff_np = np.array(diff).astype(float)
    mean_ela = float(np.mean(diff_np))
    max_ela = float(np.max(diff_np))
    std_ela = float(np.std(diff_np))
    ela_anomaly_ratio = float(np.sum(diff_np > (mean_ela + 2.5 * std_ela)) / diff_np.size)

    return {
        "ela_path": output_ela_path,
        "mean_ela": round(mean_ela, 3),
        "max_ela": round(max_ela, 3),
        "std_ela": round(std_ela, 3),
        "ela_anomaly_ratio": round(ela_anomaly_ratio, 5),
        "diff_array": diff_np,
    }


def compute_noise_variance_analysis(gray_img: np.ndarray, block_size: int = 32) -> Dict[str, Any]:
    """
    Local Noise Variance Inconsistency Analysis:
    Splits image into blocks and computes noise standard deviation.
    High standard deviation across local variances indicates spliced regions with different sensor/capture noise.
    """
    h, w = gray_img.shape[:2]
    variances = []
    
    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block = gray_img[y:y+block_size, x:x+block_size].astype(float)
            # High-pass filter or median diff
            mean_val = np.mean(block)
            var_val = np.var(block - mean_val)
            variances.append(var_val)
            
    if not variances:
        return {"noise_variance_mean": 0.0, "noise_inconsistency_score": 0.0, "noise_std": 0.0}

    var_arr = np.array(variances)
    noise_mean = float(np.mean(var_arr))
    noise_std = float(np.std(var_arr))
    # Normalized inconsistency ratio
    inconsistency_score = round(noise_std / (noise_mean + 1e-5), 4)

    return {
        "noise_variance_mean": round(noise_mean, 2),
        "noise_variance_std": round(noise_std, 2),
        "noise_inconsistency_score": inconsistency_score,
    }


def detect_copy_move_keypoints(img_rgb: np.ndarray, min_distance: float = 40.0) -> Dict[str, Any]:
    """
    Copy-Move Forgery Detection using ORB / Feature Matching:
    Detects duplicated content (e.g. copied signatures, stamps, amounts) by matching keypoint descriptors
    and filtering out geometrically co-located neighbors.
    """
    if cv2 is None:
        return {"copy_move_detected": False, "match_count": 0, "pairs": []}

    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    orb = cv2.ORB_create(nfeatures=1500, scaleFactor=1.2, nlevels=8)
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    if descriptors is None or len(keypoints) < 10:
        return {"copy_move_detected": False, "match_count": 0, "pairs": []}

    # Match descriptors with Brute-Force Hamming Distance
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    matches = bf.knnMatch(descriptors, descriptors, k=3)

    duplicate_pairs = []
    for match in matches:
        if len(match) >= 2:
            # First match is the keypoint itself (dist=0); check 2nd best match
            m1 = match[1] if len(match) > 1 else None
            m2 = match[2] if len(match) > 2 else None
            
            if m1 and (m2 is None or m1.distance < 0.72 * m2.distance):
                pt1 = keypoints[m1.queryIdx].pt
                pt2 = keypoints[m1.trainIdx].pt
                # Calculate spatial distance between matches
                dist = np.hypot(pt1[0] - pt2[0], pt1[1] - pt2[1])
                # Must be sufficiently far apart to not be adjacent texture
                if dist > min_distance:
                    duplicate_pairs.append({
                        "pt1": [int(pt1[0]), int(pt1[1])],
                        "pt2": [int(pt2[0]), int(pt2[1])],
                        "distance": round(float(dist), 2)
                    })

    # Filter out isolated false matches; genuine copy-move has clustered points
    is_detected = len(duplicate_pairs) >= 6

    return {
        "copy_move_detected": is_detected,
        "match_count": len(duplicate_pairs),
        "pairs": duplicate_pairs[:20],  # Return top matches
    }


def extract_comprehensive_features(
    image_path: str,
    output_ela_path: str,
    gray_img: np.ndarray,
    img_rgb: np.ndarray
) -> Dict[str, Any]:
    """
    Extracts forensic feature vector for ML classification and localization.
    Features:
    - ELA compression divergence
    - Noise inconsistency ratio
    - Copy-move descriptor clusters
    - Edge anomaly and sharpness gradients
    - Color channel variance
    """
    ela_res = compute_error_level_analysis(image_path, output_ela_path)
    noise_res = compute_noise_variance_analysis(gray_img)
    copy_move_res = detect_copy_move_keypoints(img_rgb)

    # Color channel variance
    r_mean, g_mean, b_mean = np.mean(img_rgb[:, :, 0]), np.mean(img_rgb[:, :, 1]), np.mean(img_rgb[:, :, 2])
    color_balance_std = float(np.std([r_mean, g_mean, b_mean]))

    # Edge density
    if cv2 is not None:
        edges = cv2.Canny(gray_img, 60, 180)
        edge_density = float(np.sum(edges > 0) / edges.size)
    else:
        edge_density = 0.05

    feature_vector = [
        ela_res["mean_ela"],
        ela_res["max_ela"],
        ela_res["std_ela"],
        ela_res["ela_anomaly_ratio"],
        noise_res["noise_variance_mean"],
        noise_res["noise_variance_std"],
        noise_res["noise_inconsistency_score"],
        float(copy_move_res["match_count"]),
        color_balance_std,
        edge_density,
    ]

    return {
        "feature_vector": feature_vector,
        "feature_names": [
            "mean_ela", "max_ela", "std_ela", "ela_anomaly_ratio",
            "noise_mean", "noise_std", "noise_inconsistency",
            "copy_move_matches", "color_balance_std", "edge_density"
        ],
        "ela_data": ela_res,
        "noise_data": noise_res,
        "copy_move_data": copy_move_res,
    }
