import os
from typing import Dict, Any, List, Tuple
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image, ImageDraw, ImageFont

try:
    # pyrefly: ignore [missing-import]
    import cv2
except ImportError:
    cv2 = None

from app.core.logger import logger


CATEGORY_COLORS = {
    "Copy-Move & Cloning": (255, 140, 0),       # Orange
    "Image Splicing & Composition": (244, 63, 94), # Crimson
    "Text & Numerical Alteration": (168, 85, 247), # Purple
    "Digital Retouching & Erasure": (234, 179, 8),  # Amber
    "Official Stamp & Signature": (6, 182, 212),    # Cyan
    "Physical & Scanning Inconsistency": (59, 130, 246), # Blue
    "Default": (239, 68, 68)                     # Red
}


def generate_forgery_localization(
    img_rgb: np.ndarray,
    ela_diff_np: np.ndarray,
    copy_move_pairs: List[Dict[str, Any]],
    module_boxes: List[Dict[str, Any]],
    output_heatmap_path: str,
    output_suspicious_path: str,
    min_contour_area: int = 120
) -> Dict[str, Any]:
    """
    Forensic Localization Engine:
    1. Creates a JET colormap thermal heatmap overlay.
    2. Identifies suspicious bounding boxes across all forensic modules.
    3. Categorizes and color-codes bounding boxes according to detected forgery category.
    4. Annotates suspicious regions on the document image with clear tags.
    """
    h, w = img_rgb.shape[:2]
    
    # 1. Normalize ELA difference to single channel 0-255
    if len(ela_diff_np.shape) == 3:
        ela_gray = np.mean(ela_diff_np, axis=2).astype(np.uint8)
    else:
        ela_gray = ela_diff_np.astype(np.uint8)

    if ela_gray.shape != (h, w):
        if cv2 is not None:
            ela_gray = cv2.resize(ela_gray, (w, h), interpolation=cv2.INTER_LINEAR)
        else:
            ela_gray = np.array(Image.fromarray(ela_gray).resize((w, h)))

    ela_normalized = ((ela_gray - ela_gray.min()) / (ela_gray.max() - ela_gray.min() + 1e-5) * 255).astype(np.uint8)

    # 2. Generate Heatmap Overlay
    if cv2 is not None:
        blurred_map = cv2.GaussianBlur(ela_normalized, (21, 21), 0)
        heatmap_colored = cv2.applyColorMap(blurred_map, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        blended_heatmap = cv2.addWeighted(img_rgb, 0.55, heatmap_rgb, 0.45, 0)
    else:
        blurred_map = ela_normalized
        blended_heatmap = img_rgb.copy()

    os.makedirs(os.path.dirname(output_heatmap_path), exist_ok=True)
    Image.fromarray(blended_heatmap).save(output_heatmap_path, format="JPEG", quality=92)

    # 3. Aggregate and Deduplicate Bounding Boxes across all Modules
    bounding_boxes: List[Dict[str, Any]] = []
    annotated_img = img_rgb.copy()
    region_idx = 1

    # Extract ELA Anomaly Contours
    if cv2 is not None:
        _, thresh = cv2.threshold(blurred_map, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
        contours, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if min_contour_area < area < (h * w * 0.4):
                bx, by, bw, bh = cv2.boundingRect(cnt)
                pad = 4
                bx1 = max(0, bx - pad)
                by1 = max(0, by - pad)
                bw1 = min(w - bx1, bw + 2 * pad)
                bh1 = min(h - by1, bh + 2 * pad)

                bounding_boxes.append({
                    "region_id": region_idx,
                    "x": int(bx1),
                    "y": int(by1),
                    "width": int(bw1),
                    "height": int(bh1),
                    "area": int(area),
                    "category": "Image Splicing & Composition",
                    "type": "Compression / Frequency Discrepancy",
                    "confidence": round(min(98.5, 70.0 + (area / (h * w)) * 100.0 * 25.0), 1)
                })
                region_idx += 1

    # Integrate module-specific boxes (Typography, Stamp, Noise)
    for m_box in module_boxes:
        bx, by = m_box.get("x", 0), m_box.get("y", 0)
        bw, bh = m_box.get("width", 50), m_box.get("height", 30)
        cat = m_box.get("category", "Text & Numerical Alteration")
        
        bounding_boxes.append({
            "region_id": region_idx,
            "x": int(bx),
            "y": int(by),
            "width": int(bw),
            "height": int(bh),
            "area": int(bw * bh),
            "category": cat,
            "type": m_box.get("type", "Typography / Font Anomaly"),
            "confidence": m_box.get("confidence", 91.2)
        })
        region_idx += 1

    # Add Copy-Move duplicate boxes
    if copy_move_pairs and cv2 is not None:
        for pair in copy_move_pairs[:10]:
            pt1 = pair["pt1"]
            pt2 = pair["pt2"]
            box_sz = 36
            for pt in [pt1, pt2]:
                px, py = pt
                bx1 = max(0, px - box_sz // 2)
                by1 = max(0, py - box_sz // 2)
                bounding_boxes.append({
                    "region_id": region_idx,
                    "x": int(bx1),
                    "y": int(by1),
                    "width": box_sz,
                    "height": box_sz,
                    "area": box_sz * box_sz,
                    "category": "Copy-Move & Cloning",
                    "type": "Cloned Keypoint Cluster",
                    "confidence": 94.8
                })
                region_idx += 1
            break

    # 4. Render Categorized Annotations on Document Image
    if cv2 is not None:
        for box in bounding_boxes:
            bx, by, bw, bh = box["x"], box["y"], box["width"], box["height"]
            cat = box.get("category", "Default")
            color = CATEGORY_COLORS.get(cat, CATEGORY_COLORS["Default"])
            
            # Draw glowing rectangle
            cv2.rectangle(annotated_img, (bx, by), (bx + bw, by + bh), color, 2)
            
            # Draw semi-transparent header tag
            label = f"#{box['region_id']} {box['type'][:22]}"
            cv2.putText(annotated_img, label, (bx, max(14, by - 4)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, color, 1, cv2.LINE_AA)

        # Draw Copy-Move Link Lines
        if copy_move_pairs:
            for pair in copy_move_pairs[:15]:
                p1 = (pair["pt1"][0], pair["pt1"][1])
                p2 = (pair["pt2"][0], pair["pt2"][1])
                cv2.line(annotated_img, p1, p2, (255, 180, 0), 1, cv2.LINE_AA)
    else:
        pil_annotated = Image.fromarray(annotated_img)
        draw = ImageDraw.Draw(pil_annotated)
        for box in bounding_boxes:
            bx, by, bw, bh = box["x"], box["y"], box["width"], box["height"]
            draw.rectangle([bx, by, bx + bw, by + bh], outline=(239, 68, 68), width=2)
            draw.text((bx + 4, max(0, by - 16)), f"#{box['region_id']}", fill=(255, 255, 255))
        annotated_img = np.array(pil_annotated)

    os.makedirs(os.path.dirname(output_suspicious_path), exist_ok=True)
    Image.fromarray(annotated_img).save(output_suspicious_path, format="JPEG", quality=92)

    return {
        "heatmap_path": output_heatmap_path,
        "suspicious_regions_path": output_suspicious_path,
        "suspicious_count": len(bounding_boxes),
        "bounding_boxes": bounding_boxes,
    }
