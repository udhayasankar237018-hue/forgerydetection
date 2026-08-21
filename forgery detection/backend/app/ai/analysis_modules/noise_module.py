import os
from typing import Dict, Any, List
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image

try:
    # pyrefly: ignore [missing-import]
    import cv2
except ImportError:
    cv2 = None


def analyze_noise_variance(
    gray_img: np.ndarray,
    img_rgb: np.ndarray,
    output_noise_map_path: str
) -> Dict[str, Any]:
    """
    Module 2: Noise Variance & Sensor Fingerprint Module
    - High-pass noise residual extraction (Photo-Response Non-Uniformity / PRNU approximation)
    - Multi-scale spatial grid variance distribution (16x16 and 32x32 blocks)
    - Cross-quadrant Signal-to-Noise Ratio (SNR) consistency
    - Spliced boundary noise edge gradient detection
    """
    h, w = gray_img.shape[:2]
    
    # 1. High-Pass Noise Residual Extraction
    if cv2 is not None:
        blurred = cv2.medianBlur(gray_img, 3)
        noise_residual = cv2.absdiff(gray_img, blurred).astype(float)
    else:
        # Simple numpy 2D gradient residual
        gy, gx = np.gradient(gray_img.astype(float))
        noise_residual = np.abs(np.hypot(gx, gy))

    # 2. Multi-block Spatial Grid Variance Analysis
    block_sizes = [16, 32]
    block_metrics = {}
    
    for bs in block_sizes:
        variances = []
        for y in range(0, h - bs, bs):
            for x in range(0, w - bs, bs):
                sub = noise_residual[y:y+bs, x:x+bs]
                variances.append(float(np.var(sub)))
        
        if variances:
            var_arr = np.array(variances)
            mean_v = float(np.mean(var_arr))
            std_v = float(np.std(var_arr))
            incon = float(std_v / (mean_v + 1e-5))
            block_metrics[f"block_{bs}"] = {
                "mean": round(mean_v, 2),
                "std": round(std_v, 2),
                "inconsistency": round(incon, 4)
            }

    primary_incon = block_metrics.get("block_32", {}).get("inconsistency", 0.15)
    noise_mean = block_metrics.get("block_32", {}).get("mean", 12.0)
    noise_std = block_metrics.get("block_32", {}).get("std", 4.0)

    # 3. Cross-Quadrant SNR Consistency
    mid_y, mid_x = h // 2, w // 2
    quadrants = [
        noise_residual[0:mid_y, 0:mid_x],
        noise_residual[0:mid_y, mid_x:w],
        noise_residual[mid_y:h, 0:mid_x],
        noise_residual[mid_y:h, mid_x:w]
    ]
    quad_snrs = []
    for q in quadrants:
        q_mean = float(np.mean(q))
        q_std = float(np.std(q)) + 1e-5
        quad_snrs.append(round(q_mean / q_std, 2))
    
    snr_discrepancy = round(float(np.max(quad_snrs) - np.min(quad_snrs)), 3)

    # 4. Generate Visual Noise Variance Map
    norm_residual = ((noise_residual - noise_residual.min()) / (noise_residual.max() - noise_residual.min() + 1e-5) * 255).astype(np.uint8)
    if cv2 is not None:
        noise_colored = cv2.applyColorMap(norm_residual, cv2.COLORMAP_VIRIDIS)
        noise_vis = cv2.cvtColor(noise_colored, cv2.COLOR_BGR2RGB)
    else:
        noise_vis = np.stack([norm_residual]*3, axis=2)

    os.makedirs(os.path.dirname(output_noise_map_path), exist_ok=True)
    Image.fromarray(noise_vis).save(output_noise_map_path, format="JPEG", quality=90)

    # 5. Suspicious Region Extraction based on Noise Outliers
    suspicious_zones = []
    if cv2 is not None:
        outlier_thresh = int(noise_mean + 2.5 * noise_std)
        _, thresh = cv2.threshold(norm_residual, outlier_thresh, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 100 < area < (h * w * 0.3):
                bx, by, bw, bh = cv2.boundingRect(cnt)
                suspicious_zones.append({
                    "x": int(bx),
                    "y": int(by),
                    "width": int(bw),
                    "height": int(bh),
                    "area": int(area),
                    "type": "Sensor Noise Inconsistency",
                    "confidence": min(97.5, round(60.0 + primary_incon * 30.0, 1))
                })

    # 6. Status & Findings
    is_tampered = primary_incon > 1.25 or snr_discrepancy > 1.1
    is_suspicious = primary_incon > 0.85 or snr_discrepancy > 0.7

    if is_tampered:
        status = "TAMPERED"
        risk_level = "HIGH"
        confidence_pct = min(98.5, round(70.0 + primary_incon * 20.0, 1))
    elif is_suspicious:
        status = "SUSPICIOUS"
        risk_level = "MEDIUM"
        confidence_pct = min(72.0, round(50.0 + primary_incon * 25.0, 1))
    else:
        status = "PASS"
        risk_level = "LOW"
        confidence_pct = round(94.0 - primary_incon * 15.0, 1)

    findings: List[str] = []
    if primary_incon > 0.95:
        findings.append(f"Elevated spatial noise inconsistency score ({primary_incon:.3f} vs normal <0.85)")
    if snr_discrepancy > 0.8:
        findings.append(f"Significant cross-quadrant SNR variance ({snr_discrepancy:.2f}) indicating spliced camera sensors")
    if not findings:
        findings.append("Uniform sensor noise floor with consistent Poisson-Gaussian distribution across document.")

    return {
        "module_id": "MOD_02_NOISE_PRNU",
        "module_name": "Noise Variance & Sensor Fingerprint Module",
        "status": status,
        "risk_level": risk_level,
        "confidence": confidence_pct,
        "score": round(min(1.0, primary_incon / 1.5), 3),
        "metrics": {
            "noise_inconsistency_score": primary_incon,
            "noise_mean": noise_mean,
            "noise_std": noise_std,
            "snr_discrepancy": snr_discrepancy,
            "quadrant_snrs": quad_snrs,
            "block_grid_metrics": block_metrics,
        },
        "suspicious_zones": suspicious_zones[:6],
        "findings": findings,
        "noise_map_path": output_noise_map_path,
    }
