# AI-Based Document Forgery Detection Using Image Processing and Machine Learning

![Forensic Pipeline](https://img.shields.io/badge/System-Production--Grade-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)
![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20SQLite-4479A1.svg)
![ML](https://img.shields.io/badge/AI%2FML-OpenCV%20%2B%20RandomForest%20%2B%20ELA-F7931E.svg)

A complete, production-ready full-stack academic and industrial system for automated **Document Forgery Detection and Tampering Localization** using Error Level Analysis (ELA), spatial noise inconsistency profiling, copy-move keypoint matching, and trained ensemble Machine Learning classifiers.

---

## 📑 Table of Contents

1. [Key Features](#-key-features)
2. [Forensic AI/ML Architecture](#-forensic-aiml-architecture)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Installation & Setup](#-installation--setup)
   - [Prerequisites](#prerequisites)
   - [Database Setup (MySQL / SQLite)](#database-setup-mysql--sqlite)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
6. [Seed Accounts & Test Credentials](#-seed-accounts--test-credentials)
7. [Running the Application](#-running-the-application)
8. [API Documentation](#-api-documentation)
9. [Automated Testing](#-automated-testing)
10. [Docker Deployment](#-docker-deployment)
11. [Troubleshooting](#-troubleshooting)

---

## 🌟 Key Features

* **Multi-Format Ingestion**: Upload and inspect `.jpg`, `.jpeg`, `.png`, and `.pdf` files.
* **OpenCV Preprocessing**: Contrast enhancement (CLAHE), adaptive noise filtering, sharpening, skew angle correction, and focus/blur assessment.
* **Error Level Analysis (ELA)**: Re-compresses documents at calibrated JPEG quality factors and amplifies compression disparities to expose pasted text or digital modifications.
* **Noise Inconsistency Analysis**: Measures spatial noise variance across grid tiles to detect spliced imagery from different camera sensors.
* **Copy-Move Forgery Detection**: ORB/SIFT keypoint clustering with Lowe's ratio test to reveal duplicated signatures, stamps, and altered digits.
* **Machine Learning Classification**: Trained scikit-learn Random Forest model on 10-D forensic feature vectors returning `GENUINE` vs `FORGED` predictions with percentage confidence.
* **Forgery Localization**: High-contrast **JET thermal colormap heatmaps** and annotated glowing forensic **bounding boxes** highlighting exact altered patches.
* **Optical Character Recognition (OCR)**: Extracts character tokens, word counts, and coordinates with confidence ratings.
* **Forensic PDF Certificates**: Generates downloadable, structured verification certificates with visual evidence thumbnails and legal audit disclaimers via ReportLab.
* **Administrator Oversight**: System analytics, user role administration (`user` / `admin`), and security activity logs.

---

## 🔬 Forensic AI/ML Architecture

```text
Uploaded Document (JPG / PNG / PDF)
                ↓
    Document Validation & Hash Storage
                ↓
  OpenCV Preprocessing & Skew Correction
                ↓
    ┌───────────────────────────┐
    │ Forensic Feature Vector   │
    │  • ELA Mean / Max / Ratio │
    │  • Noise Inconsistency    │
    │  • Copy-Move Matches      │
    │  • Focus / Edge Density   │
    └─────────────┬─────────────┘
                  │
        OCR Text Extraction
                  │
       Trained Random Forest
        ML Classifier Engine
                  │
   ┌──────────────┴──────────────┐
   ▼                             ▼
Authenticity Verdict       Forgery Localization
• GENUINE vs FORGED        • Thermal Heatmap Overlay
• Confidence Score (%)     • Suspicious Bounding Boxes
• Identified Category      • Region Coordinate Indices
• Risk Level (LOW-CRITICAL)
                  │
  Structured MySQL Record & PDF Forensic Certificate
```

---

## 💻 Technology Stack

### Frontend
- **React 19** + **Vite 8**
- **JavaScript (ES6+)**, **HTML5**, **CSS3**
- **React Router v7**
- **Axios** (JWT interceptors & progress tracking)
- **Recharts** (Authenticity distribution & category charts)
- **Lucide React** (Forensic & security iconography)

### Backend
- **Python 3.11+**
- **FastAPI** + **Uvicorn** (Asynchronous REST API)
- **SQLAlchemy 2.0 ORM**
- **Pydantic v2** & **Pydantic-Settings**
- **PyJWT** (Secure JWT token authorization)
- **Passlib & PBKDF2 HMAC SHA-256** (Password hashing)
- **ReportLab** (Forensic PDF generator)

### Database
- **MySQL 8.0** (with automatic SQLite fallback for zero-configuration testing)

### Computer Vision & ML
- **scikit-learn** (Random Forest classifier)
- **Pillow (PIL)** & **NumPy** (Error Level Analysis & matrix operations)
- **OpenCV** (CLAHE, bilateral filtering, Canny edge detection, Hough skew correction)

---

## 📁 Project Structure

```text
project-3/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point & CORS configuration
│   │   ├── core/
│   │   │   ├── config.py         # Application settings & environment variables
│   │   │   ├── security.py       # Password hashing & JWT token management
│   │   │   └── logger.py         # Structured logging service
│   │   ├── database/
│   │   │   ├── base.py           # SQLAlchemy declarative base
│   │   │   └── session.py        # Database engine & session generator
│   │   ├── models/               # Relational ORM models (User, Document, Detection, etc.)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── ai/
│   │   │   ├── preprocessing.py  # OpenCV computer vision pipeline
│   │   │   ├── feature_extractor.py # ELA, noise analysis, copy-move matching
│   │   │   ├── localization.py   # Heatmap overlay & suspicious bounding boxes
│   │   │   ├── ocr_service.py    # OCR text extraction
│   │   │   └── forgery_detector.py # Real ML classifier & fallback engine
│   │   ├── services/             # Upload, PDF report, and admin services
│   │   └── routes/               # API endpoints (Auth, Documents, Detection, Admin)
│   ├── models/                   # Serialized ML model weights & metrics JSON
│   ├── tests/                    # Pytest test suite
│   ├── train_model.py            # Model training & metrics calculation script
│   ├── evaluate_model.py         # Model evaluation script
│   ├── seed_db.py                # Database seeder for demo admin & user
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend Docker configuration
│   └── .env.example
│
├── forgery detection/            # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   ├── context/AuthContext.jsx # Authentication state provider
│   │   ├── layouts/              # Navbar, Sidebar, Footer, MainLayout
│   │   ├── pages/                # Landing, Dashboard, Upload, Result, History, Admin
│   │   ├── services/api.js       # Axios HTTP client
│   │   ├── App.jsx               # Application routes
│   │   └── index.css             # Forensic design system & animations
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml            # Multi-container orchestration
├── .env.example
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) MySQL Server 8.0 or Docker

### 1. Backend Setup

```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Train the Random Forest Forensic Model
python train_model.py

# Seed default Admin and User accounts
python seed_db.py

# Start the FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be accessible at: `http://localhost:8000`  
Swagger Interactive API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd "forgery detection"

# Install node dependencies
npm install

# Start development server
npm run dev
```

Frontend application will launch at: `http://localhost:5173`

---

## 🔑 Seed Accounts & Test Credentials

The database seeder automatically creates the following demo credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@forgeryguard.ai` | `Admin@123456` | Full Access, User Management, Activity Logs, Global Metrics |
| **Forensic Analyst** | `user@forgeryguard.ai` | `User@123456` | Upload, Scan, Visual Inspection, PDF Reports, History |

*Note: You can also register a brand-new account on the `/register` page.*

---

## 📡 API Documentation

### Authentication
* `POST /api/auth/register` - Create user account
* `POST /api/auth/login` - Authenticate and get JWT token
* `GET  /api/auth/me` - Get current user profile

### Document Processing
* `POST /api/documents/upload` - Upload JPG/PNG/PDF document
* `GET  /api/documents` - List user documents
* `GET  /api/documents/{id}` - Get document details
* `DELETE /api/documents/{id}` - Delete document

### Forensic Analysis & Localization
* `POST /api/detection/analyze/{id}` - Execute complete AI/ML pipeline
* `GET  /api/detection/result/{id}` - Retrieve analysis prediction & metrics
* `GET  /api/detection/artifact/{id}/{type}` - Serve visual evidence maps (Heatmap, ELA, Bounding Boxes)

### Reports & Admin
* `POST /api/reports/generate/{id}` - Generate official PDF certificate
* `GET  /api/reports/{id}/download` - Download PDF report
* `GET  /api/admin/dashboard` - Administrator oversight metrics and audit logs
* `PATCH /api/admin/users/{id}/role` - Toggle user permissions

---

## 🧪 Automated Testing

To run the backend test suite:

```bash
cd backend
pytest tests
```

---

## 🐳 Docker Deployment

To launch the full stack (MySQL + FastAPI Backend + React Frontend) with Docker Compose:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
