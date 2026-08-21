import os
import math
from typing import Tuple, Dict, Any, Optional
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


def load_document_image(file_path: str, max_dimension: int = 1600) -> np.ndarray:
    """
    Load an image or rasterize a PDF page into a standard RGB NumPy array.
    Normalizes size to maintain fast processing while retaining high forensic fidelity.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Document file not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        img_np = None
        # Try PyMuPDF (fitz)
        try:
            # pyrefly: ignore [missing-import]
            import fitz
            doc = fitz.open(file_path)
            if len(doc) > 0:
                page = doc[0]
                pix = page.get_pixmap(dpi=150)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                img_np = np.array(img)
                doc.close()
        except Exception as e:
            logger.debug(f"PyMuPDF load failed: {e}. Trying PIL / pdf2image.")
        
        # Fallback to pdf2image
        if img_np is None:
            try:
                # pyrefly: ignore [missing-import]
                from pdf2image import convert_from_path
                pages = convert_from_path(file_path, first_page=1, last_page=1, dpi=150)
                if pages:
                    img_np = np.array(pages[0].convert("RGB"))
            except Exception as e:
                logger.debug(f"pdf2image fallback failed: {e}")

        # If PDF rasterization libraries are absent, create an informational document canvas
        if img_np is None:
            canvas = Image.new("RGB", (800, 1050), color=(255, 255, 255))
            img_np = np.array(canvas)
    else:
        # Standard image (JPG, PNG, TIFF, etc.)
        if cv2 is not None:
            bgr = cv2.imread(file_path)
            if bgr is not None:
                img_np = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            else:
                pil_img = Image.open(file_path).convert("RGB")
                img_np = np.array(pil_img)
        else:
            pil_img = Image.open(file_path).convert("RGB")
            img_np = np.array(pil_img)

    # Resize if extremely large while preserving aspect ratio
    h, w = img_np.shape[:2]
    if max(h, w) > max_dimension:
        scale = max_dimension / float(max(h, w))
        new_w, new_h = int(w * scale), int(h * scale)
        if cv2 is not None:
            img_np = cv2.resize(img_np, (new_w, new_h), interpolation=cv2.INTER_AREA)
        else:
            pil_img = Image.fromarray(img_np).resize((new_w, new_h), Image.Resampling.LANCZOS)
            img_np = np.array(pil_img)

    return img_np


def to_grayscale(img_rgb: np.ndarray) -> np.ndarray:
    """Convert RGB NumPy image to Grayscale."""
    if cv2 is not None:
        return cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    else:
        # Standard luminance weights
        return (0.2989 * img_rgb[:, :, 0] + 0.5870 * img_rgb[:, :, 1] + 0.1140 * img_rgb[:, :, 2]).astype(np.uint8)


def apply_clahe(gray_img: np.ndarray, clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """Contrast Limited Adaptive Histogram Equalization for document text/stamp enhancement."""
    if cv2 is not None:
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        return clahe.apply(gray_img)
    else:
        # Fallback linear normalization
        norm = ((gray_img - gray_img.min()) / (gray_img.max() - gray_img.min() + 1e-5) * 255).astype(np.uint8)
        return norm


def denoise_image(img_rgb: np.ndarray) -> np.ndarray:
    """Bilateral / Gaussian noise filtering preserving fine document edges."""
    if cv2 is not None:
        return cv2.bilateralFilter(img_rgb, d=9, sigmaColor=75, sigmaSpace=75)
    else:
        pil_img = Image.fromarray(img_rgb)
        # pyrefly: ignore [missing-import]
        from PIL import ImageFilter
        return np.array(pil_img.filter(ImageFilter.SMOOTH_MORE))


def sharpen_image(img_rgb: np.ndarray) -> np.ndarray:
    """Unsharp masking to highlight character boundaries and stamp seals."""
    if cv2 is not None:
        gaussian = cv2.GaussianBlur(img_rgb, (0, 0), 2.0)
        unsharp = cv2.addWeighted(img_rgb, 1.5, gaussian, -0.5, 0)
        return np.clip(unsharp, 0, 255).astype(np.uint8)
    else:
        pil_img = Image.fromarray(img_rgb)
        # pyrefly: ignore [missing-import]
        from PIL import ImageFilter
        return np.array(pil_img.filter(ImageFilter.SHARPEN))


def detect_edges(gray_img: np.ndarray) -> np.ndarray:
    """Canny edge detection for structural integrity analysis."""
    if cv2 is not None:
        return cv2.Canny(gray_img, 50, 150)
    else:
        # Fallback Sobel-like gradient magnitude
        gy, gx = np.gradient(gray_img.astype(float))
        mag = np.hypot(gx, gy)
        mag = (mag / (mag.max() + 1e-5) * 255).astype(np.uint8)
        return mag


def calculate_blur_metric(gray_img: np.ndarray) -> float:
    """
    Variance of Laplacian: measures image sharpness/focus.
    Low value (< 100) indicates blurry or compressed artifact image.
    """
    if cv2 is not None:
        laplacian = cv2.Laplacian(gray_img, cv2.CV_64F)
        return float(laplacian.var())
    else:
        gy, gx = np.gradient(gray_img.astype(float))
        return float(np.var(np.hypot(gx, gy)))


def correct_skew(img_rgb: np.ndarray) -> Tuple[np.ndarray, float]:
    """
    Detect document skew using Hough Line Transform and auto-straighten.
    Returns (straightened_image, detected_skew_angle_degrees).
    """
    if cv2 is None:
        return img_rgb, 0.0

    gray = to_grayscale(img_rgb)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)

    angle = 0.0
    if lines is not None and len(lines) > 0:
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if x2 != x1:
                deg = math.degrees(math.atan2(y2 - y1, x2 - x1))
                if abs(deg) < 45:  # Only horizontal document lines
                    angles.append(deg)
        if angles:
            angle = float(np.median(angles))

    # If minor angle detected, rotate
    if abs(angle) > 0.5 and abs(angle) < 30:
        h, w = img_rgb.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            img_rgb, matrix, (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(255, 255, 255)
        )
        return rotated, round(angle, 2)

    return img_rgb, round(angle, 2)


def preprocess_document_pipeline(file_path: str, output_path: str) -> Dict[str, Any]:
    """
    Full OpenCV Preprocessing Pipeline:
    1. Multi-format ingestion (JPG/PNG/PDF)
    2. Document Skew Detection & Auto-Orientation
    3. Noise Filtering & Edge Enhancement
    4. CLAHE Contrast Equalization
    5. Sharpness & Blur Quality Assessment
    """
    img_rgb = load_document_image(file_path)
    straightened_img, skew_angle = correct_skew(img_rgb)
    gray = to_grayscale(straightened_img)
    clahe_gray = apply_clahe(gray)
    denoised = denoise_image(straightened_img)
    sharpened = sharpen_image(denoised)
    blur_score = calculate_blur_metric(gray)
    edges = detect_edges(clahe_gray)

    # Save enhanced preprocessed image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if cv2 is not None:
        cv2.imwrite(output_path, cv2.cvtColor(sharpened, cv2.COLOR_RGB2BGR))
    else:
        Image.fromarray(sharpened).save(output_path, format="JPEG", quality=95)

    return {
        "original_shape": img_rgb.shape,
        "preprocessed_path": output_path,
        "skew_angle": skew_angle,
        "blur_laplacian_var": round(blur_score, 2),
        "is_blurry": blur_score < 80.0,
        "image_rgb": straightened_img,
        "gray_img": gray,
        "clahe_gray": clahe_gray,
        "edges": edges,
    }
