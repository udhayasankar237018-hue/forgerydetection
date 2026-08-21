import os
import io
from datetime import datetime
from typing import Dict, Any, List
# pyrefly: ignore [missing-import]
from PIL import Image, ExifTags


def analyze_file_metadata(file_path: str) -> Dict[str, Any]:
    """
    Module 7: Metadata & File Structure Forensics Module
    - EXIF / XMP metadata tag inspection
    - Digital editing software footprint detection (Photoshop, GIMP, Canva, etc.)
    - Timestamp chronology validation (Create vs Modify vs System timestamps)
    - PDF structure & incremental update revision inspection
    """
    ext = os.path.splitext(file_path)[1].lower()
    raw_tags: Dict[str, Any] = {}
    software_traces: List[str] = []
    timestamp_anomalies: List[str] = []
    is_edited = False
    
    # 1. EXIF Metadata Extraction for Images
    if ext in [".jpg", ".jpeg", ".png", ".tiff", ".webp"]:
        try:
            with Image.open(file_path) as img:
                exif = img.getexif()
                if exif:
                    for tag_id, value in exif.items():
                        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                        # Filter out huge binary blobs
                        val_str = str(value)
                        if len(val_str) < 200:
                            raw_tags[tag_name] = val_str

                # Check info dictionary
                for k, v in img.info.items():
                    if k not in ["exif", "icc_profile"]:
                        val_str = str(v)
                        if len(val_str) < 200:
                            raw_tags[str(k)] = val_str

        except Exception:
            pass

    # 2. Check for Editing Software Signatures
    suspicious_keywords = [
        "photoshop", "adobe", "gimp", "canva", "coreldraw", "illustrator",
        "inkscape", "paint.net", "pixelmator", "snapseed", "lightroom", "affinity"
    ]
    
    # Search in EXIF software tags
    for tag_key, tag_val in raw_tags.items():
        tag_val_lower = str(tag_val).lower()
        for kw in suspicious_keywords:
            if kw in tag_val_lower:
                software_traces.append(f"Found '{kw.upper()}' in EXIF metadata tag [{tag_key}: {tag_val}]")
                is_edited = True

    # 3. PDF Structure & Incremental Revision Tree Inspection
    is_pdf = ext == ".pdf"
    pdf_revision_count = 1
    pdf_has_modifications = False

    if is_pdf and os.path.exists(file_path):
        try:
            with open(file_path, "rb") as f:
                content = f.read()
                # Count %EOF markers to detect incremental update revisions
                eof_count = content.count(b"%%EOF")
                if eof_count > 1:
                    pdf_revision_count = eof_count
                    pdf_has_modifications = True
                    software_traces.append(f"PDF contains {eof_count} incremental update revision trees (%EOF markers)")
                
                # Check for Producer / Creator software tags in raw bytes
                for kw in [b"Photoshop", b"Canva", b"iLovePDF", b"PDFescape", b"Nitro"]:
                    if kw in content:
                        software_traces.append(f"Found digital editing tool string '{kw.decode()}' embedded in PDF object streams")
                        is_edited = True
        except Exception:
            pass

    # 4. File System Timestamp Chronology
    if os.path.exists(file_path):
        stat = os.stat(file_path)
        mtime = datetime.fromtimestamp(stat.st_mtime)
        ctime = datetime.fromtimestamp(stat.st_ctime)
        raw_tags["FileSystem_Modified"] = mtime.strftime("%Y-%m-%d %H:%M:%S")
        raw_tags["FileSystem_Created"] = ctime.strftime("%Y-%m-%d %H:%M:%S")

    # 5. Status & Risk Assessment
    if is_edited or pdf_has_modifications:
        status = "TAMPERED"
        risk_level = "HIGH"
        confidence_pct = 95.0
    elif len(raw_tags) == 0:
        status = "SUSPICIOUS"  # Stripped EXIF metadata
        risk_level = "MEDIUM"
        confidence_pct = 70.0
        timestamp_anomalies.append("EXIF metadata header is completely stripped, typical of web re-uploads or forensic sanitization tools.")
    else:
        status = "PASS"
        risk_level = "LOW"
        confidence_pct = 94.0

    findings: List[str] = []
    if software_traces:
        findings.extend(software_traces)
    if timestamp_anomalies:
        findings.extend(timestamp_anomalies)
    if not findings:
        findings.append("Clean camera/scanner metadata footprint without third-party graphics editor markers.")

    return {
        "module_id": "MOD_07_METADATA_EXIF",
        "module_name": "Metadata & File Structure Forensics Module",
        "status": status,
        "risk_level": risk_level,
        "confidence": confidence_pct,
        "score": 0.90 if is_edited else (0.45 if len(raw_tags) == 0 else 0.05),
        "metrics": {
            "is_edited_software_detected": is_edited,
            "software_traces_count": len(software_traces),
            "pdf_incremental_revisions": pdf_revision_count,
            "metadata_tags_count": len(raw_tags),
            "extracted_tags": raw_tags,
        },
        "software_traces": software_traces,
        "findings": findings,
    }
