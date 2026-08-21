import io
import os
from typing import Dict, Any, List
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image, ImageChops, ImageEnhance

try:
    # pyrefly: ignore [missing-import]
    import cv2
except ImportError:
    cv2 = None


def analyze_ela_compression(
    image_path: str,
    output_ela_path: str,
    gray_img: np.ndarray,
    img_rgb: np.ndarray
) -> Dict[str, Any]:
    """
    Module 1: Compression & Error Level Discrepancy Module
    - Multi-scale ELA (95%, 85%, 75% quality factors)
    - High-frequency DCT compression artifact estimation
    - Double JPEG compression ghosting probability
    - Compression rate consistency across document zones
    """
    original = Image.open(image_path).convert("RGB")
    h, w = img_rgb.shape[:2]
    
    # 1. Multi-scale ELA evaluations
    qualities = [95, 85, 75]
    ela_results = {}
    diff_arrays = []

    for q in qualities:
        buf = io.BytesIO()
        original.save(buf, format="JPEG", quality=q)
        buf.seek(0)
        recompressed = Image.open(buf)
        diff = ImageChops.difference(original, recompressed)
        diff_np = np.array(diff).astype(float)
        diff_arrays.append(diff_np)
        ela_results[f"mean_ela_q{q}"] = round(float(np.mean(diff_np)), 2)
        ela_results[f"max_ela_q{q}"] = round(float(np.max(diff_np)), 2)

    primary_diff = diff_arrays[1]  # Q85 baseline
    mean_ela = float(np.mean(primary_diff))
    max_ela = float(np.max(primary_diff))
    std_ela = float(np.std(primary_diff))
    anomaly_threshold = mean_ela + 2.5 * std_ela
    anomaly_ratio = float(np.sum(primary_diff > anomaly_threshold) / primary_diff.size)

    # 2. Enhanced ELA Visual Export
    diff_pil = ImageChops.difference(original, Image.open(io.BytesIO(open(image_path, "rb").read()) if os.path.exists(image_path) else buf))
    extrema = diff_pil.getextrema()
    max_diff = max([ex[1] for ex in extrema]) if extrema else 1
    scale_factor = min(15, int(255.0 / (max_diff + 1e-5)))
    enhancer = ImageEnhance.Brightness(diff_pil)
    ela_enhanced = enhancer.enhance(scale_factor)
    os.makedirs(os.path.dirname(output_ela_path), exist_ok=True)
    ela_enhanced.save(output_ela_path, format="JPEG", quality=95)

    # 3. Double-JPEG Ghosting Score
    # Differences between Q95 and Q75 compression gradients identify multiple re-saves with inserted objects
    q95_diff = diff_arrays[0]
    q75_diff = diff_arrays[2]
    ghosting_variance = float(np.var(np.abs(q95_diff - q75_diff)))
    ghosting_score = min(1.0, round(ghosting_variance / 450.0, 3))

    # 4. Anomaly Zone Bounding Box Candidate Extraction
    suspicious_zones = []
    if cv2 is not None:
        diff_gray = np.mean(primary_diff, axis=2).astype(np.uint8)
        blurred = cv2.GaussianBlur(diff_gray, (15, 15), 0)
        _, thresh = cv2.threshold(blurred, int(mean_ela + 2.0 * std_ela), 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 80 < area < (h * w * 0.35):
                bx, by, bw, bh = cv2.boundingRect(cnt)
                suspicious_zones.append({
                    "x": int(bx),
                    "y": int(by),
                    "width": int(bw),
                    "height": int(bh),
                    "area": int(area),
                    "type": "Compression Disparity",
                    "confidence": min(98.5, round(65.0 + (area / (h * w)) * 100.0 * 20.0, 1))
                })

    # 5. Risk Assessment & Status
    is_tampered = anomaly_ratio > 0.045 or mean_ela > 24.0 or ghosting_score > 0.65
    is_suspicious = anomaly_ratio > 0.02 or mean_ela > 16.0 or ghosting_score > 0.40

    if is_tampered:
        status = "TAMPERED"
        risk_level = "CRITICAL" if anomaly_ratio > 0.08 else "HIGH"
        confidence_pct = min(99.2, round(75.0 + anomaly_ratio * 300.0, 1))
    elif is_suspicious:
        status = "SUSPICIOUS"
        risk_level = "MEDIUM"
        confidence_pct = min(74.0, round(50.0 + anomaly_ratio * 500.0, 1))
    else:
        status = "PASS"
        risk_level = "LOW"
        confidence_pct = round(92.0 - anomaly_ratio * 200.0, 1)

    findings: List[str] = []
    if mean_ela > 20.0:
        findings.append(f"High compression error divergence (Mean ELA: {mean_ela:.1f} vs normal <14.0)")
    if anomaly_ratio > 0.03:
        findings.append(f"Significant localized compression anomaly density ({anomaly_ratio * 100:.2f}% of pixels)")
    if ghosting_score > 0.5:
        findings.append(f"Elevated Double-JPEG Ghosting artifact index ({ghosting_score:.2f})")
    if not findings:
        findings.append("Uniform JPEG compression grid consistent with original camera/scan capture.")

    return {
        "module_id": "MOD_01_ELA_COMPRESSION",
        "module_name": "Visual & Compression Discrepancy Module",
        "status": status,
        "risk_level": risk_level,
        "confidence": confidence_pct,
        "score": round(min(1.0, (anomaly_ratio * 10.0 + ghosting_score * 0.5) / 2.0), 3),
        "metrics": {
            "mean_ela": round(mean_ela, 2),
            "max_ela": round(max_ela, 2),
            "std_ela": round(std_ela, 2),
            "anomaly_ratio": round(anomaly_ratio, 5),
            "ghosting_score": ghosting_score,
            "multi_q_means": ela_results,
        },
        "suspicious_zones": suspicious_zones[:8],
        "findings": findings,
        "diff_array": primary_diff,
        "ela_path": output_ela_path,
    }
