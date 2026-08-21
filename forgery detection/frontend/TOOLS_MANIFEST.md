# 🎨 Frontend Tools & Architecture Manifest

**Project Component**: ForgeryGuard AI — Forensic Frontend Client  
**Location**: `forgery detection/frontend`  
**Runtime**: Node.js & Vite Build Tool

---

## 🛠️ Frontend Technologies & Toolings Used

| Category | Tool / Library | Version | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Core Framework** | `React` | `^19.0.0` | Declarative, component-based user interface architecture. |
| **DOM Engine** | `React-DOM` | `^19.0.0` | Efficient Virtual DOM reconciliation and document rendering. |
| **Routing** | `React Router DOM` | `^7.2.0` | Client-side routing with guarded public and role-protected private routes. |
| **Build & Dev Tool** | `Vite` | `^8.2.1` | Ultra-fast Hot Module Replacement (HMR) and optimized Rollup/ESBuild bundler. |
| **HTTP Client** | `Axios` | `^1.7.9` | Promise-based HTTP client for API communications, JWT bearer interception, and progress tracking. |
| **Icons & Visuals** | `Lucide React` | `^0.475.0` | High-fidelity vector iconography system across forensic inspection tools. |
| **DOM Sanitization** | `DOMPurify` | `^3.2.4` | Enterprise-grade XSS prevention and safe SVG/HTML sanitization. |
| **Canvas & Export** | `HTML2Canvas` | `^1.4.1` | High-DPI canvas capturing for legal certificates and visual forensic export. |
| **Styling & Theme** | `Vanilla CSS Glassmorphism` | Modern CSS3 | Custom dark-mode design system with CSS custom properties, backdrop blur, and neon glowing accents. |

---

## 📁 Directory Structure & Organization

```text
frontend/
├── public/                     # Static web assets & public symbols
├── src/
│   ├── assets/                 # SVGs, banners, and sample document assets
│   ├── components/             # Reusable UI widgets (Navbar, Footer, Modals, FileDropzone, CommandPalette)
│   ├── context/                # Global React state (AuthContext, ToastContext)
│   ├── layouts/                # Base layout templates (MainLayout, Navbar, Footer)
│   ├── pages/                  # Route views (LandingPage, Login, Register, ForgotPassword, Dashboard, UploadPage, ResultPage, HistoryPage, ReportsPage, AdminDashboard, MLModelInfoPage)
│   ├── services/               # API integration modules (api.js, adminAPI, documentAPI, authAPI)
│   ├── utils/                  # Forensic formatting, hash helpers, and color mapping utilities
│   ├── App.jsx                 # Master application router & route guards
│   ├── main.jsx                # Application root mount point
│   └── index.css               # Global theme tokens, typography, animations, glassmorphism styles
├── index.html                  # HTML5 entry template
├── vite.config.js              # Vite configuration & dev server port bindings
└── package.json                # NPM dependency manifest & npm run scripts
```

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start local Vite development server (Port 5173)
npm run dev

# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
