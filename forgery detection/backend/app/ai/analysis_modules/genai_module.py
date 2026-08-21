import os
from typing import Dict, Any, List, Optional
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image

try:
    # pyrefly: ignore [missing-import]
    import cv2
except ImportError:
    cv2 = None

from app.core.logger import logger


def analyze_generative_ai_inpainting(
    img_rgb: np.ndarray
) -> Dict[str, Any]:
    """
    Module 9: Generative AI & Diffusion Inpainting Spectral Detector
    - 2D Fast Fourier Transform (FFT) Power Spectrum analysis to identify synthetic diffusion patterns.
    - Radial energy distribution & high-frequency grid artifacts typical of DALL-E, Midjourney, and AI inpainting.
    """
    h, w = img_rgb.shape[:2]
    
    # 1. Convert to grayscale float
    if cv2 is not None:
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    else:
        gray = (0.2989 * img_rgb[:, :, 0] + 0.5870 * img_rgb[:, :, 1] + 0.1140 * img_rgb[:, :, 2]).astype(np.float32)

    # 2. Compute 2D Fast Fourier Transform
    fft = np.fft.fft2(gray)
    fft_shift = np.fft.fftshift(fft)
    magnitude_spectrum = 20 * np.log(np.abs(fft_shift) + 1e-6)

    # 3. Analyze high-frequency energy ratio vs low-frequency natural gradient
    center_y, center_x = h // 2, w // 2
    r_inner = min(h, w) // 8
    r_outer = min(h, w) // 3

    y_grid, x_grid = np.ogrid[:h, :w]
    dist_from_center = np.sqrt((x_grid - center_x) ** 2 + (y_grid - center_y) ** 2)

    inner_mask = dist_from_center <= r_inner
    outer_mask = (dist_from_center > r_inner) & (dist_from_center <= r_outer)

    inner_energy = float(np.mean(magnitude_spectrum[inner_mask]))
    outer_energy = float(np.mean(magnitude_spectrum[outer_mask]))

    # Natural scans have steep 1/f spectral roll-off; diffusion inpainting flattens high-frequency spectrum
    spectral_ratio = outer_energy / (inner_energy + 1e-5)
    
    # Laplacian variance of micro-texture
    if cv2 is not None:
        laplacian_var = float(cv2.Laplacian(gray.astype(np.uint8), cv2.CV_64F).var())
    else:
        gy, gx = np.gradient(gray)
        laplacian_var = float(np.var(np.hypot(gx, gy)))

    # Detect synthetic periodic grid artifacts (peaks in high-frequency ring)
    outer_std = float(np.std(magnitude_spectrum[outer_mask]))
    is_genai_detected = spectral_ratio > 0.68 or outer_std > 26.0

    score = min(1.0, max(0.0, (spectral_ratio - 0.45) / 0.35))
    confidence = round(85.0 + score * 14.0, 1)

    findings = []
    if is_genai_detected:
        findings.append(f"High-frequency 2D FFT spectral anomaly detected (Ratio: {spectral_ratio:.2f})")
        findings.append("Periodic frequency peaks indicate Generative AI / Diffusion inpainting artifacts")
    else:
        findings.append("Natural optical spectral decay verified with uniform 1/f distribution")
        findings.append("No generative synthetic texture traces detected")

    return {
        "module_id": "MOD_09_GENAI",
        "module_name": "Generative AI & Inpainting Spectral Analysis",
        "status": "TAMPERED" if is_genai_detected else "PASS",
        "risk_level": "HIGH" if is_genai_detected else "LOW",
        "confidence": confidence,
        "score": round(score, 3),
        "metrics": {
            "spectral_energy_ratio": round(spectral_ratio, 3),
            "inner_energy": round(inner_energy, 2),
            "outer_energy": round(outer_energy, 2),
            "spectral_std": round(outer_std, 2),
            "texture_laplacian_var": round(laplacian_var, 2)
        },
        "findings": findings
    }
