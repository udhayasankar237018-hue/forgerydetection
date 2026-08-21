import os
from typing import Dict, Any, Tuple, List, Optional
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image

try:
    # pyrefly: ignore [missing-import]
    import cv2
except ImportError:
    cv2 = None

from app.core.config import settings
from app.core.logger import logger
from app.ai.preprocessing import load_document_image, to_grayscale


def compute_ssim(img1: np.ndarray, img2: np.ndarray) -> Tuple[float, np.ndarray]:
    """
    Computes Structural Similarity Index (SSIM) and difference matrix between two aligned images.
    """
    # Convert to grayscale float
    g1 = to_grayscale(img1).astype(np.float64)
    g2 = to_grayscale(img2).astype(np.float64)

    # Ensure matching dimensions
    if g1.shape != g2.shape:
        h, w = g1.shape
        if cv2 is not None:
            g2 = cv2.resize(g2, (w, h), interpolation=cv2.INTER_LINEAR)
        else:
            g2 = np.array(Image.fromarray(g2.astype(np.uint8)).resize((w, h))).astype(np.float64)

    # SSIM Constants
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2

    # Gaussian weights / Box filter
    if cv2 is not None:
        mu1 = cv2.GaussianBlur(g1, (11, 11), 1.5)
        mu2 = cv2.GaussianBlur(g2, (11, 11), 1.5)
    else:
        mu1, mu2 = g1, g2

    mu1_sq = mu1 ** 2
    mu2_sq = mu2 ** 2
    mu1_mu2 = mu1 * mu2

    if cv2 is not None:
        sigma1_sq = cv2.GaussianBlur(g1 ** 2, (11, 11), 1.5) - mu1_sq
        sigma2_sq = cv2.GaussianBlur(g2 ** 2, (11, 11), 1.5) - mu2_sq
        sigma12 = cv2.GaussianBlur(g1 * g2, (11, 11), 1.5) - mu1_mu2
    else:
        sigma1_sq = np.zeros_like(g1)
        sigma2_sq = np.zeros_like(g2)
        sigma12 = np.zeros_like(g1)

    ssim_map = ((2 * mu1_mu2 + C1) * (2 * sigma12 + C2)) / ((mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2) + 1e-6)
    ssim_score = float(np.mean(ssim_map))
    
    # Absolute difference map
    diff = np.abs(g1 - g2).astype(np.uint8)
    return max(0.0, min(1.0, ssim_score)), diff


def perform_comparative_document_diff(
    reference_path: str,
    suspect_path: str,
    output_diff_path: str
) -> Dict[str, Any]:
    """
    Performs comparative optical & structural diffing between a reference template and a suspect document.
    Aligns both documents, extracts modified bounding boxes, and generates an annotated diff map.
    """
    img_ref = load_document_image(reference_path)
    img_sus = load_document_image(suspect_path)

    h_ref, w_ref = img_ref.shape[:2]

    # Align suspect document to reference template via ORB Homography if possible
    aligned_sus = img_sus
    alignment_success = False

    if cv2 is not None:
        try:
            orb = cv2.ORB_create(nfeatures=1500)
            kp1, des1 = orb.detectAndCompute(img_ref, None)
            kp2, des2 = orb.detectAndCompute(img_sus, None)

            if des1 is not None and des2 is not None and len(kp1) > 10 and len(kp2) > 10:
                matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                matches = matcher.match(des1, des2)
                matches = sorted(matches, key=lambda x: x.distance)

                if len(matches) > 15:
                    src_pts = np.float32([kp1[m.queryIdx].pt for m in matches[:50]]).reshape(-1, 1, 2)
                    dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches[:50]]).reshape(-1, 1, 2)

                    H, mask = cv2.findHomography(dst_pts, src_pts, cv2.RANSAC, 5.0)
                    if H is not None:
                        aligned_sus = cv2.warpPerspective(img_sus, H, (w_ref, h_ref))
                        alignment_success = True
        except Exception as e:
            logger.debug(f"Homography auto-alignment notice: {e}")

    # If alignment didn't succeed, resize suspect to reference dimensions
    if not alignment_success or aligned_sus.shape[:2] != (h_ref, w_ref):
        if cv2 is not None:
            aligned_sus = cv2.resize(img_sus, (w_ref, h_ref), interpolation=cv2.INTER_AREA)
        else:
            aligned_sus = np.array(Image.fromarray(img_sus).resize((w_ref, h_ref)))

    # Compute Structural Similarity & Differences
    ssim_score, diff_gray = compute_ssim(img_ref, aligned_sus)

    # Generate colored highlight overlay
    # Genuine regions: natural blend; Altered regions: highlighted in glowing crimson / neon amber
    diff_colored = np.copy(aligned_sus)
    diff_mask = diff_gray > 45

    diff_boxes: List[Dict[str, Any]] = []
    if cv2 is not None:
        thresh = cv2.threshold(diff_gray, 40, 255, cv2.THRESH_BINARY)[1]
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        box_id = 1
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 150 < area < (h_ref * w_ref * 0.35):
                bx, by, bw, bh = cv2.boundingRect(cnt)
                diff_boxes.append({
                    "id": box_id,
                    "x": int(bx),
                    "y": int(by),
                    "width": int(bw),
                    "height": int(bh),
                    "disparity_score": round(float(np.mean(diff_gray[by:by+bh, bx:bx+bw]) / 255.0), 3),
                    "label": f"Discrepancy #{box_id}"
                })
                # Draw on diff image
                cv2.rectangle(diff_colored, (bx, by), (bx + bw, by + bh), (239, 68, 68), 2)
                cv2.putText(diff_colored, f"DIFF #{box_id}", (bx, max(15, by - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (239, 68, 68), 1)
                box_id += 1

    os.makedirs(os.path.dirname(output_diff_path), exist_ok=True)
    Image.fromarray(diff_colored).save(output_diff_path, format="JPEG", quality=92)

    similarity_percentage = round(ssim_score * 100.0, 1)
    is_match = similarity_percentage > 88.0 and len(diff_boxes) <= 1

    return {
        "similarity_score": similarity_percentage,
        "structural_similarity_index": round(ssim_score, 4),
        "is_exact_match": is_match,
        "discrepancies_count": len(diff_boxes),
        "diff_image_path": output_diff_path,
        "discrepancy_boxes": diff_boxes,
        "alignment_applied": alignment_success
    }
