# 🧠 Backend Tools & AI Core Manifest

**Project Component**: ForgeryGuard AI — Forensic Backend Core & Machine Learning Engine  
**Location**: `forgery detection/backend`  
**Runtime**: Python 3.11+ / FastAPI / Uvicorn ASGI Server

---

## 🛠️ Backend Technologies & Toolings Used

| Category | Tool / Library | Version | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **API Framework** | `FastAPI` | `^0.115.8` | High-performance asynchronous REST API framework with OpenAPI / Swagger integration. |
| **ASGI Server** | `Uvicorn` | `^0.34.0` | Lightning-fast ASGI web server implementation with auto-reload capabilities. |
| **Data Validation** | `Pydantic` | `^2.10.6` | Schema validation, type enforcement, and settings management via `pydantic-settings`. |
| **Computer Vision** | `OpenCV (opencv-python)` | `^4.11.0` | Multi-spectral image processing, Error Level Analysis (ELA), illumination consistency, noise variance, and cloning detection. |
| **Image Processing** | `Pillow (PIL)` | `^11.1.0` | High-precision JPEG resaving, differential compression analysis, and heatmap generation. |
| **Machine Learning** | `Scikit-Learn` | `^1.6.1` | Random Forest classifier trained on multi-dimensional forensic feature vectors with probability calibration. |
| **Scientific Computing**| `NumPy` & `SciPy` | `^2.2.3` | Matrix manipulation, FFT frequency analysis, Laplacian noise computation, and statistical feature extraction. |
| **Model Persistence** | `Joblib` | `^1.4.2` | Serialization and rapid deserialization of trained ML model checkpoints (`forgery_detector.joblib`). |
| **OCR Engine** | `Pytesseract` | `^0.3.13` | Optical Character Recognition for document text extraction and font inconsistency auditing. |
| **PDF Processing** | `PyPDF2` & `pdfplumber`| `^3.0.1` | PDF rasterization, metadata inspection, incremental modification detection, and stream analysis. |
| **Database ORM** | `SQLAlchemy` | `^2.0.38` | SQL ORM supporting dual-engine persistence (MySQL default with automatic SQLite fallback). |
| **Security & Auth** | `PyJWT` & `PBKDF2 HMAC` | `^2.10.1` | Cryptographic password hashing (PBKDF2 SHA-256) and signed JWT bearer tokens. |
| **Email Delivery** | `smtplib` & `email.mime`| Built-in Python | Dispatching password reset verification codes (OTP) and recovery links via SMTP. |
| **Testing Suite** | `Pytest` & `httpx` | `^8.3.4` | Comprehensive automated unit, integration, and E2E API testing suite. |

---

## 📁 Directory Structure & Organization

```text
backend/
├── app/
│   ├── ai/                     # AI Pipeline (forgery_detector.py, ela_extractor.py, noise_analyzer.py, copy_move.py)
│   ├── core/                   # Security, configuration, logger, JWT token utilities
│   ├── database/               # Database engine, connection pooling, SQLite fallback, session management
│   ├── models/                 # SQLAlchemy ORM models (User, Document, DetectionResult, ActivityLog)
│   ├── routes/                 # FastAPI API endpoints (auth.py, documents.py, admin.py, report.py, health.py)
│   ├── schemas/                # Pydantic request/response schemas (user, document, detection, report, admin)
│   ├── services/               # Core business services (document_service, admin_service, email_service)
│   ├── utils/                  # Cryptographic hashing, PDF generators, image format converters
│   └── main.py                 # FastAPI application entry point & CORS configuration
├── models/                     # Trained ML model binaries (.joblib)
├── uploads/                    # Encrypted incoming document storage
├── processed/                  # Multi-spectral visual output (ELA maps, noise maps, heatmaps)
├── reports/                    # Generated forensic certificates & PDF reports
├── tests/                      # Automated test suite (test_auth.py, test_ai_pipeline.py)
├── requirements.txt            # Complete Python package requirements
└── .env                        # Environment variables & SMTP email configuration
```

---

## 🚀 Development Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Train the Random Forest Forensic Model
python train_model.py

# Seed default Admin and Analyst accounts
python seed_db.py

# Start FastAPI backend server (Port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Run Automated Test Suite
pytest
```
