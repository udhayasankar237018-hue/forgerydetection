import os
import sys
import io
# pyrefly: ignore [missing-import]
import httpx
# pyrefly: ignore [missing-import]
from PIL import Image, ImageDraw, ImageFont

BASE_URL = "http://127.0.0.1:8000/api"


def create_sample_forged_document():
    """Create a sample synthetic document image with an edited text section."""
    img = Image.new("RGB", (650, 850), color=(250, 250, 252))
    draw = ImageDraw.Draw(img)

    # Document Header
    draw.rectangle([(30, 30), (620, 90)], fill=(15, 23, 42))
    draw.text((50, 50), "OFFICIAL FINANCIAL CERTIFICATE", fill=(255, 255, 255))

    # Genuine Body Text Lines
    for y in range(130, 450, 35):
        draw.line([(50, y), (600, y)], fill=(200, 205, 215), width=2)

    # Forged Text Patch (mismatched compression / altered amount)
    draw.rectangle([(50, 300), (320, 340)], fill=(255, 255, 255), outline=(180, 180, 180))
    draw.text((60, 310), "APPROVED AMOUNT: $1,500,000.00", fill=(0, 0, 0))

    # Signature & Stamp Box
    draw.rectangle([(400, 650), (580, 780)], outline=(100, 100, 100), width=2)
    draw.ellipse([(430, 670), (550, 760)], outline=(220, 50, 50), width=3)
    draw.text((450, 710), "VERIFIED", fill=(220, 50, 50))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def run_e2e_test():
    print("\n" + "="*60)
    print("      STARTING END-TO-END SYSTEM INTEGRATION TEST")
    print("="*60)

    client = httpx.Client(base_url=BASE_URL, timeout=30.0)

    # 1. Health Check
    print("\n1. Testing Backend Health Endpoint...")
    h_res = client.get("/health")
    assert h_res.status_code == 200, f"Health check failed: {h_res.text}"
    print("   [OK] Health check passed:", h_res.json())

    # 2. Authenticate as Seed Admin
    print("\n2. Authenticating as Administrator...")
    auth_res = client.post("/auth/login", json={
        "email": "admin@forgeryguard.ai",
        "password": "Admin@123456"
    })
    assert auth_res.status_code == 200, f"Login failed: {auth_res.text}"
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   [OK] Authenticated successfully as admin@forgeryguard.ai. JWT Token acquired.")

    # 3. Create & Upload Document
    print("\n3. Generating and Uploading Test Document...")
    img_bytes = create_sample_forged_document()
    files = {"file": ("sample_certificate.jpg", img_bytes, "image/jpeg")}
    up_res = client.post("/documents/upload", files=files, headers=headers)
    assert up_res.status_code == 201, f"Upload failed: {up_res.text}"
    doc_data = up_res.json()
    doc_id = doc_data["id"]
    doc_uuid = doc_data["document_uuid"]
    print(f"   [OK] Uploaded successfully -> Document ID: {doc_id} | UUID: {doc_uuid}")

    # 4. Execute AI/ML Forgery Detection Pipeline
    print(f"\n4. Executing AI Forensic Detection Pipeline on Document {doc_id}...")
    det_res = client.post(f"/detection/analyze/{doc_id}", headers=headers)
    assert det_res.status_code == 200, f"Detection failed: {det_res.text}"
    det_data = det_res.json()
    res_obj = det_data["result"]
    print(f"   [OK] Detection Completed in {res_obj['processing_time']}s")
    print(f"     - Prediction:          {res_obj['prediction']}")
    print(f"     - Confidence:          {res_obj['confidence']}%")
    print(f"     - Forgery Category:    {res_obj['forgery_type']}")
    print(f"     - Risk Level:          {res_obj['risk_level']}")
    print(f"     - Suspicious Regions:  {res_obj['suspicious_regions']}")
    print(f"     - Model Engine:        {res_obj['model_version']}")

    # 5. Verify OCR Extraction
    print(f"\n5. Verifying OCR Extraction for Document {doc_id}...")
    ocr_res = client.get(f"/ocr/{doc_id}", headers=headers)
    assert ocr_res.status_code == 200, f"OCR failed: {ocr_res.text}"
    ocr_data = ocr_res.json()
    print(f"   [OK] OCR Extraction Verified -> Confidence: {ocr_data['ocr_confidence']}% | Words: {ocr_data['word_count']}")

    # 6. Generate Certified Forensic PDF Report
    print(f"\n6. Generating Forensic PDF Report for Document {doc_id}...")
    rep_res = client.post(f"/reports/generate/{doc_id}", headers=headers)
    assert rep_res.status_code == 200, f"Report generation failed: {rep_res.text}"
    rep_data = rep_res.json()
    print(f"   [OK] Report Generated -> Download URL: {rep_data['download_url']}")
    print(f"     - Physical File: {rep_data['report_path']}")

    # 7. Check Detection History
    print("\n7. Fetching Detection History...")
    hist_res = client.get("/history", headers=headers)
    assert hist_res.status_code == 200, f"History fetch failed: {hist_res.text}"
    hist_data = hist_res.json()
    print(f"   [OK] History Verified -> Total Records: {hist_data['total']}")

    # 8. Check Admin Dashboard Stats
    print("\n8. Fetching Admin Platform Dashboard Overview...")
    admin_res = client.get("/admin/dashboard", headers=headers)
    assert admin_res.status_code == 200, f"Admin dashboard failed: {admin_res.text}"
    dash_data = admin_res.json()
    print("   [OK] Admin Stats Verified:")
    print("     - Total Users:         ", dash_data["stats"]["total_users"])
    print("     - Total Documents:     ", dash_data["stats"]["total_documents"])
    print("     - Genuine Verified:    ", dash_data["stats"]["genuine_count"])
    print("     - Forged Identified:   ", dash_data["stats"]["forged_count"])
    print("     - Recent Activity Logs:", len(dash_data["recent_activities"]))

    print("\n" + "="*60)
    print("      ALL END-TO-END INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("="*60 + "\n")


if __name__ == "__main__":
    run_e2e_test()
