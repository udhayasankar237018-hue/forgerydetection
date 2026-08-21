import os
import time
from typing import Dict, Any, Tuple, List
# pyrefly: ignore [missing-import]
import numpy as np

try:
    # pyrefly: ignore [missing-import]
    import joblib
except ImportError:
    joblib = None

from app.core.config import settings
from app.core.logger import logger
from app.ai.preprocessing import preprocess_document_pipeline
from app.ai.ocr_service import extract_document_text
from app.ai.localization import generate_forgery_localization
from app.ai.analysis_modules import (
    analyze_ela_compression,
    analyze_noise_variance,
    analyze_copymove_cloning,
    analyze_typography_alignment,
    analyze_color_illumination,
    analyze_stamp_signature,
    analyze_file_metadata,
    analyze_security_codes,
    analyze_generative_ai_inpainting
)


_trained_model = None


def load_trained_model():
    """Load trained scikit-learn ML model if available on disk."""
    global _trained_model
    if _trained_model is None and joblib is not None and os.path.exists(settings.MODEL_PATH):
        try:
            _trained_model = joblib.load(settings.MODEL_PATH)
            logger.info(f"Loaded trained ML model from {settings.MODEL_PATH}")
        except Exception as e:
            logger.warning(f"Could not load ML model from {settings.MODEL_PATH}: {e}")
            _trained_model = None
    return _trained_model


def determine_detected_categories(
    modules_dict: Dict[str, Any]
) -> Tuple[List[Dict[str, Any]], str, float, str, str]:
    """
    Multi-Category Forgery Classification & Diagnostic Engine:
    Evaluates results across all 8 forensic modules to detect specific categories of forgery.
    Returns: (detected_categories_list, primary_prediction, overall_confidence, primary_forgery_type, overall_risk)
    """
    mod_ela = modules_dict.get("ela", {})
    mod_noise = modules_dict.get("noise", {})
    mod_copy = modules_dict.get("copymove", {})
    mod_typo = modules_dict.get("typography", {})
    mod_illum = modules_dict.get("illumination", {})
    mod_stamp = modules_dict.get("stamp_signature", {})
    mod_meta = modules_dict.get("metadata", {})
    mod_sec = modules_dict.get("security_codes", {})

    detected_categories: List[Dict[str, Any]] = []

    # Category 1: Copy-Move & Cloning
    if mod_copy.get("status") in ["TAMPERED", "SUSPICIOUS"]:
        match_cnt = mod_copy.get("metrics", {}).get("match_count", 0)
        detected_categories.append({
            "category_id": "CAT_COPY_MOVE",
            "category_name": "Copy-Move & Cloning Forgery",
            "severity": "CRITICAL" if match_cnt > 8 else "HIGH",
            "confidence": mod_copy.get("confidence", 94.0),
            "affected_element": "Duplicated stamps, cloned signatures, or patched numerical blocks",
            "description": f"Identified {match_cnt} duplicate keypoint vectors geometrically matched across distinct spatial document locations.",
            "indicators": mod_copy.get("findings", [])
        })

    # Category 2: Image Splicing & Composition
    if (mod_ela.get("status") in ["TAMPERED", "SUSPICIOUS"] and mod_noise.get("status") in ["TAMPERED", "SUSPICIOUS"]) or mod_illum.get("status") == "TAMPERED":
        detected_categories.append({
            "category_id": "CAT_IMAGE_SPLICING",
            "category_name": "Image Splicing & Composition",
            "severity": "HIGH",
            "confidence": max(mod_ela.get("confidence", 85.0), mod_noise.get("confidence", 85.0)),
            "affected_element": "Inserted photograph, external header logo, or cross-document spliced elements",
            "description": "Compression discrepancies and discordant sensor noise profiles indicate elements pasted from an external image source.",
            "indicators": mod_ela.get("findings", []) + mod_noise.get("findings", [])
        })

    # Category 3: Text & Numerical Alteration
    if mod_typo.get("status") in ["TAMPERED", "SUSPICIOUS"]:
        detected_categories.append({
            "category_id": "CAT_TEXT_ALTERATION",
            "category_name": "Text & Numerical Alteration",
            "severity": "HIGH",
            "confidence": mod_typo.get("confidence", 90.0),
            "affected_element": "Financial amount, dates, or altered name/title fields",
            "description": "Baseline slope variation and character aspect ratio discrepancies reveal localized font substitutions.",
            "indicators": mod_typo.get("findings", [])
        })

    # Category 4: Digital Retouching & Erasure
    if mod_ela.get("metrics", {}).get("anomaly_ratio", 0) > 0.04 and not mod_copy.get("metrics", {}).get("is_detected"):
        detected_categories.append({
            "category_id": "CAT_DIGITAL_RETOUCH",
            "category_name": "Digital Retouching, Inpainting & Erasure",
            "severity": "MEDIUM",
            "confidence": mod_ela.get("confidence", 88.0),
            "affected_element": "Background pixel smudging, white-out erasing, or content-aware fill patches",
            "description": "Localized high-frequency compression gradient indicates pixel-level smoothing and content masking.",
            "indicators": mod_ela.get("findings", [])
        })

    # Category 5: Metadata & File Structure Forgery
    if mod_meta.get("status") == "TAMPERED":
        detected_categories.append({
            "category_id": "CAT_METADATA_FORGERY",
            "category_name": "Metadata & File Structure Forgery",
            "severity": "HIGH",
            "confidence": mod_meta.get("confidence", 95.0),
            "affected_element": "EXIF software header tags, PDF revision trees, or timestamp chronology",
            "description": "Digital image manipulation tool footprints (e.g. Photoshop/GIMP/Canva) and incremental update revision trees detected.",
            "indicators": mod_meta.get("findings", [])
        })

    # Category 6: Official Stamp & Signature Forgery
    if mod_stamp.get("status") == "TAMPERED":
        detected_categories.append({
            "category_id": "CAT_STAMP_SIGNATURE",
            "category_name": "Official Stamp & Signature Forgery",
            "severity": "HIGH",
            "confidence": mod_stamp.get("confidence", 92.0),
            "affected_element": "Official seal boundaries, stamp ink bleed, or digitized signature cutouts",
            "description": "Asymmetrical stamp seal geometry and unnatural rectangular cut boundaries indicate digital signature transplantation.",
            "indicators": mod_stamp.get("findings", [])
        })

    # Category 7: Generative AI & Diffusion Inpainting
    mod_genai = modules_dict.get("genai_inpainting", {})
    if mod_genai.get("status") == "TAMPERED":
        detected_categories.append({
            "category_id": "CAT_GENAI_INPAINTING",
            "category_name": "Generative AI & Inpainting Synthesis",
            "severity": "HIGH",
            "confidence": mod_genai.get("confidence", 91.0),
            "affected_element": "AI-generated text blocks, synthetic stamps, or inpainting fills",
            "description": "2D Fast Fourier Transform (FFT) reveals synthetic spectral grid harmonics typical of Generative Diffusion models.",
            "indicators": mod_genai.get("findings", [])
        })

    # Category 8: Security Code & MRZ Discrepancies
    if mod_sec.get("status") == "TAMPERED":
        detected_categories.append({
            "category_id": "CAT_SECURITY_CODE",
            "category_name": "Security Features & MRZ Discrepancy",
            "severity": "CRITICAL",
            "confidence": mod_sec.get("confidence", 97.0),
            "affected_element": "Passport/ID MRZ check digits or Barcode payload parity",
            "description": "Cryptographic check digit validation failure or discrepancy between machine-readable payload and visual document text.",
            "indicators": mod_sec.get("findings", [])
        })

    # Overall Verdict Calculation
    if len(detected_categories) > 0:
        prediction = "FORGED"
        top_cat = detected_categories[0]
        primary_forgery_type = top_cat["category_name"]
        
        # Aggregate confidence
        confs = [c["confidence"] for c in detected_categories]
        overall_confidence = round(float(np.mean(confs)), 1)
        
        severities = [c["severity"] for c in detected_categories]
        if "CRITICAL" in severities:
            overall_risk = "CRITICAL"
        elif "HIGH" in severities:
            overall_risk = "HIGH"
        else:
            overall_risk = "MEDIUM"
    else:
        prediction = "GENUINE"
        overall_confidence = 96.4
        primary_forgery_type = "None (Authentic Baseline)"
        overall_risk = "LOW"

    return detected_categories, prediction, overall_confidence, primary_forgery_type, overall_risk


def analyze_document_forgery(document_path: str, doc_uuid: str, profile: str = "full") -> Dict[str, Any]:
    """
    End-to-End Multi-Module Forensic Analysis Pipeline:
    1. OpenCV Multi-Spectral Preprocessing & Auto-Orientation
    2. Optical Character Recognition (OCR) Text & Layout Extraction
    3. Multi-Module Execution (8 Dedicated Forensic Modules):
       - Mod 1: Visual & Compression Discrepancy (ELA & DCT)
       - Mod 2: Noise Variance & Sensor PRNU Fingerprint
       - Mod 3: Copy-Move & Keypoint Clone Clustering
       - Mod 4: Typography, Font & Baseline Alignment
       - Mod 5: Color Space & Illumination Gradients
       - Mod 6: Signature & Official Seal Verification
       - Mod 7: Metadata, File Structure & EXIF Traces
       - Mod 8: Security Codes, Barcode & MRZ Cryptography
    4. Multi-Category Forgery Taxonomy Classification
    5. Multi-Layer Forensic Visual Artifact Generation
    """
    start_time = time.time()
    
    # Target visual artifact file paths
    preprocessed_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_preprocessed.jpg")
    ela_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_ela.jpg")
    heatmap_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_heatmap.jpg")
    suspicious_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_suspicious.jpg")
    noise_map_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_noise_map.jpg")
    clone_map_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_clone_map.jpg")
    typography_map_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_typography_map.jpg")
    illumination_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_illumination_map.jpg")
    ink_path = os.path.join(settings.PROCESSED_DIR, f"{doc_uuid}_ink_map.jpg")

    # 1. Preprocessing
    prep_res = preprocess_document_pipeline(document_path, preprocessed_path)
    img_rgb = prep_res["image_rgb"]
    gray_img = prep_res["gray_img"]

    # 2. OCR Text Extraction
    ocr_res = extract_document_text(img_rgb, file_path=document_path)
    extracted_text = ocr_res.get("extracted_text", "")
    word_boxes = ocr_res.get("word_boxes", [])

    # 3. Execute 8 Forensic Modules
    mod_ela = analyze_ela_compression(document_path, ela_path, gray_img, img_rgb)
    mod_noise = analyze_noise_variance(gray_img, img_rgb, noise_map_path)
    mod_copy = analyze_copymove_cloning(img_rgb, clone_map_path)
    mod_typo = analyze_typography_alignment(gray_img, img_rgb, extracted_text, word_boxes, typography_map_path)
    mod_illum = analyze_color_illumination(img_rgb, illumination_path)
    mod_stamp = analyze_stamp_signature(img_rgb, ink_path)
    mod_meta = analyze_file_metadata(document_path)
    mod_sec = analyze_security_codes(img_rgb, extracted_text)
    mod_genai = analyze_generative_ai_inpainting(img_rgb)

    modules_dict = {
        "ela": mod_ela,
        "noise": mod_noise,
        "copymove": mod_copy,
        "typography": mod_typo,
        "illumination": mod_illum,
        "stamp_signature": mod_stamp,
        "metadata": mod_meta,
        "security_codes": mod_sec,
        "genai_inpainting": mod_genai,
    }

    # 4. Multi-Category Forgery Diagnosis
    detected_cats, prediction, confidence, forgery_type, risk_level = determine_detected_categories(modules_dict)

    # 5. Localization & Categorized Bounding Box Annotation
    extra_boxes = []
    # Collect typography boxes
    for tb in mod_typo.get("suspicious_text_boxes", []):
        bb = tb.get("bbox", [0, 0, 10, 10])
        extra_boxes.append({
            "x": bb[0], "y": bb[1], "width": bb[2], "height": bb[3],
            "category": "Text & Numerical Alteration",
            "type": "Font / Kerning Disparity",
            "confidence": tb.get("confidence", 88.0)
        })
    # Collect stamp boxes
    for sb in mod_stamp.get("suspicious_artifacts", []):
        bb = sb.get("bbox", [0, 0, 10, 10])
        extra_boxes.append({
            "x": bb[0], "y": bb[1], "width": bb[2], "height": bb[3],
            "category": "Official Stamp & Signature",
            "type": sb.get("type", "Seal Anomaly"),
            "confidence": sb.get("confidence", 92.0)
        })

    loc_res = generate_forgery_localization(
        img_rgb=img_rgb,
        ela_diff_np=mod_ela["diff_array"],
        copy_move_pairs=mod_copy["metrics"]["duplicate_pairs"],
        module_boxes=extra_boxes,
        output_heatmap_path=heatmap_path,
        output_suspicious_path=suspicious_path,
    )

    elapsed_time = round(time.time() - start_time, 3)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "forgery_type": forgery_type,
        "risk_level": risk_level,
        "suspicious_regions": loc_res["suspicious_count"],
        "bounding_boxes": loc_res["bounding_boxes"],
        "detected_categories": detected_cats,
        "processing_time": elapsed_time,
        "profile": profile,
        "applied_profile": profile,
        "model_version": f"MultiSpectral-Forensic-v2.0 (8-Module Ensemble // Profile: {profile.upper()})",
        "preprocessed_path": preprocessed_path,
        "heatmap_path": heatmap_path,
        "suspicious_regions_path": suspicious_path,
        "ela_path": ela_path,
        "noise_map_path": noise_map_path,
        "clone_map_path": clone_map_path,
        "typography_map_path": typography_map_path,
        "illumination_map_path": illumination_path,
        "ink_map_path": ink_path,
        "extracted_text": extracted_text,
        "ocr_confidence": ocr_res.get("ocr_confidence", 92.5),
        "ocr_boxes": word_boxes,
        "modules": {
            "ela_compression": {
                "id": mod_ela["module_id"],
                "name": mod_ela["module_name"],
                "status": mod_ela["status"],
                "risk_level": mod_ela["risk_level"],
                "confidence": mod_ela["confidence"],
                "score": mod_ela["score"],
                "metrics": mod_ela["metrics"],
                "findings": mod_ela["findings"],
            },
            "noise_variance": {
                "id": mod_noise["module_id"],
                "name": mod_noise["module_name"],
                "status": mod_noise["status"],
                "risk_level": mod_noise["risk_level"],
                "confidence": mod_noise["confidence"],
                "score": mod_noise["score"],
                "metrics": mod_noise["metrics"],
                "findings": mod_noise["findings"],
            },
            "copymove_cloning": {
                "id": mod_copy["module_id"],
                "name": mod_copy["module_name"],
                "status": mod_copy["status"],
                "risk_level": mod_copy["risk_level"],
                "confidence": mod_copy["confidence"],
                "score": mod_copy["score"],
                "metrics": mod_copy["metrics"],
                "findings": mod_copy["findings"],
            },
            "typography_alignment": {
                "id": mod_typo["module_id"],
                "name": mod_typo["module_name"],
                "status": mod_typo["status"],
                "risk_level": mod_typo["risk_level"],
                "confidence": mod_typo["confidence"],
                "score": mod_typo["score"],
                "metrics": mod_typo["metrics"],
                "findings": mod_typo["findings"],
            },
            "color_illumination": {
                "id": mod_illum["module_id"],
                "name": mod_illum["module_name"],
                "status": mod_illum["status"],
                "risk_level": mod_illum["risk_level"],
                "confidence": mod_illum["confidence"],
                "score": mod_illum["score"],
                "metrics": mod_illum["metrics"],
                "findings": mod_illum["findings"],
            },
            "stamp_signature": {
                "id": mod_stamp["module_id"],
                "name": mod_stamp["module_name"],
                "status": mod_stamp["status"],
                "risk_level": mod_stamp["risk_level"],
                "confidence": mod_stamp["confidence"],
                "score": mod_stamp["score"],
                "metrics": mod_stamp["metrics"],
                "findings": mod_stamp["findings"],
            },
            "metadata_structure": {
                "id": mod_meta["module_id"],
                "name": mod_meta["module_name"],
                "status": mod_meta["status"],
                "risk_level": mod_meta["risk_level"],
                "confidence": mod_meta["confidence"],
                "score": mod_meta["score"],
                "metrics": mod_meta["metrics"],
                "findings": mod_meta["findings"],
            },
            "security_codes": {
                "id": mod_sec["module_id"],
                "name": mod_sec["module_name"],
                "status": mod_sec["status"],
                "risk_level": mod_sec["risk_level"],
                "confidence": mod_sec["confidence"],
                "score": mod_sec["score"],
                "metrics": mod_sec["metrics"],
                "findings": mod_sec["findings"],
            },
            "genai_inpainting": {
                "id": mod_genai["module_id"],
                "name": mod_genai["module_name"],
                "status": mod_genai["status"],
                "risk_level": mod_genai["risk_level"],
                "confidence": mod_genai["confidence"],
                "score": mod_genai["score"],
                "metrics": mod_genai["metrics"],
                "findings": mod_genai["findings"],
            }
        },
        "features": {
            "mean_ela": mod_ela["metrics"]["mean_ela"],
            "max_ela": mod_ela["metrics"]["max_ela"],
            "ela_anomaly_ratio": mod_ela["metrics"]["anomaly_ratio"],
            "noise_inconsistency": mod_noise["metrics"]["noise_inconsistency_score"],
            "copy_move_matches": mod_copy["metrics"]["match_count"],
            "blur_score": prep_res["blur_laplacian_var"],
            "skew_angle": prep_res["skew_angle"],
            "chromatic_score": mod_illum["metrics"]["chromatic_aberration_score"],
            "baseline_var": mod_typo["metrics"]["mean_baseline_variance"],
        }
    }


def classify_forgery_heuristic(extracted_features: Dict[str, Any]) -> Tuple[str, float, str, str]:
    """
    Fallback heuristic classification based on extracted feature dictionary.
    Returns: (prediction, confidence, forgery_type, risk_level)
    """
    ela = extracted_features.get("ela_data", {})
    noise = extracted_features.get("noise_data", {})
    cm = extracted_features.get("copy_move_data", {})

    is_ela_tampered = ela.get("ela_anomaly_ratio", 0) > 0.05 or ela.get("mean_ela", 0) > 15.0
    is_noise_tampered = noise.get("noise_inconsistency_score", 0) > 0.6
    is_cm_tampered = cm.get("copy_move_detected", False) or cm.get("match_count", 0) >= 6

    if is_cm_tampered:
        return "FORGED", 95.0, "Copy-Move & Cloning Forgery", "CRITICAL"
    elif is_ela_tampered and is_noise_tampered:
        return "FORGED", 92.0, "Image Splicing & Digital Retouch", "HIGH"
    elif is_ela_tampered:
        return "FORGED", 88.0, "Error Level Compression Discrepancy", "HIGH"
    elif is_noise_tampered:
        return "FORGED", 85.0, "Noise Inconsistency / Splicing", "MEDIUM"
    else:
        return "GENUINE", 96.5, "None (Authentic Baseline)", "LOW"

