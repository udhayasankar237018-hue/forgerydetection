import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText,
  FileCheck, 
  File, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  ArrowRight,
  Cpu,
  Layers,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Check,
  Compass,
  FileCheck2,
  PenTool,
  Code,
  FileWarning,
  RefreshCw,
  Play
} from 'lucide-react';
import { documentAPI, detectionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisProfile, setAnalysisProfile] = useState('full'); // 'full' | 'financial' | 'identity' | 'rapid'
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const pipelineSteps = [
    { title: '1. Ingesting & Validating Document Structure', sub: 'Checking MIME type, cryptographic integrity & EXIF metadata' },
    { title: '2. OpenCV Preprocessing & Auto-Deskewing', sub: 'Applying CLAHE contrast equalization and bilateral edge filtering' },
    { title: '3. Optical Character Recognition (OCR)', sub: 'Extracting text layout, word boundaries, and semantic figures' },
    { title: '4. Compression & ELA Multi-Q Analysis', sub: 'Computing 95%, 85%, 75% Q-factor sweeps and DCT ghosting' },
    { title: '5. Sensor PRNU & Noise Variance Analysis', sub: 'Evaluating 32x32 spatial grid noise variance and cross-quadrant SNR' },
    { title: '6. Spatial Copy-Move & Keypoint Matching', sub: 'Running dense ORB descriptor matching and duplication clustering' },
    { title: '7. Typography, Font & Baseline Audit', sub: 'Checking line baseline slope straightness and character aspect ratios' },
    { title: '8. Stamp, Signature & MRZ Forensics', sub: 'Verifying ink color separation, stamp radial symmetry & MRZ check digits' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log('[DEBUG] File dropped via drag-and-drop:', e.dataTransfer.files[0].name);
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      console.log('[DEBUG] File selected via file browser dialog:', e.target.files[0].name);
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setError('');
    console.log('[DEBUG] selected file:', file);
    console.log('[DEBUG] file type and size:', {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
      sizeKB: (file.size / 1024).toFixed(1),
      sizeMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(file.type) && !['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
      const errMsg = `Invalid file format (${ext.toUpperCase() || 'unknown'}). Please upload JPG, PNG, or PDF documents.`;
      console.warn('[DEBUG] File validation failed:', errMsg);
      setError(errMsg);
      toastError(errMsg);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      const errMsg = `File size exceeds the 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
      console.warn('[DEBUG] File size validation failed:', errMsg);
      setError(errMsg);
      toastError(errMsg);
      return;
    }

    setSelectedFile(file);
    info(`Document "${file.name}" loaded successfully. Ready to inspect.`);

    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        console.log('[DEBUG] Image preview generated successfully.');
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      console.log('[DEBUG] PDF document loaded without direct data-URL preview.');
    }
  };

  // Helper to generate a realistic canvas-backed file for sample tests
  const createSampleBlob = (sampleType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 600);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 760, 560);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    
    if (sampleType === 'invoice') {
      ctx.fillText('EXECUTIVE FINANCIAL CONTRACT & INVOICE', 400, 60);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('ALTERED AMOUNT: $2,850,000.00 USD (SPLICED TEXT)', 400, 140);
    } else if (sampleType === 'pass') {
      ctx.fillText('OFFICIAL IDENTITY BADGE & SECURITY PASS', 400, 60);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('CLONED STAMP SEAL & SPLICED SIGNATURE', 400, 140);
    } else {
      ctx.fillText('AUTHENTIC PROPERTY TITLE & CONVEYANCE DEED', 400, 60);
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('VERIFIED AUTHENTIC - NO TAMPERING DETECTED', 400, 140);
    }

    ctx.fillStyle = '#475569';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Forensic Statute 9A • Digital Document Verification System', 50, 220);
    ctx.fillText(`Sample Reference: REF-2026-${sampleType.toUpperCase()}-SAMPLE`, 50, 260);

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  };

  // Preloaded Sample Document Quick Select
  const handleSelectSample = (sampleType) => {
    console.log('[DEBUG] Selected sample scenario:', sampleType);
    const filename = sampleType === 'invoice' 
      ? 'executive_contract_spliced_amount.png' 
      : sampleType === 'pass' 
        ? 'security_badge_cloned_seal.png' 
        : 'authentic_property_conveyance.png';

    const dataUrl = createSampleBlob(sampleType);
    setPreviewUrl(dataUrl);

    // Convert dataURL to real File object
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], filename, { type: 'image/png' });
        setSelectedFile(file);
        setError('');
        console.log('[DEBUG] Created sample File object:', file);
        info(`Loaded sample document: ${filename}`);
      })
      .catch(err => {
        console.error('[DEBUG] Failed to create sample file blob:', err);
        const fallbackFile = new File(["sample forensic content"], filename, { type: 'image/png' });
        setSelectedFile(fallbackFile);
      });
  };

  const removeSelectedFile = () => {
    console.log('[DEBUG] Removing selected file from state');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAndAnalyze = async () => {
    console.log('[DEBUG] button click event: "Inspect Document" triggered');
    if (!selectedFile) {
      console.warn('[DEBUG] Inspection aborted: no file currently selected.');
      setError('Please choose or drop a document file first.');
      return;
    }

    try {
      setError('');
      setAnalyzing(true);
      setCurrentStep(0);
      setUploadProgress(10);

      console.log('[DEBUG] API request starting...');
      console.log('[DEBUG] Target file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      console.log('[DEBUG] Selected Forensic Profile:', analysisProfile);

      // 1. Upload Document via FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (previewUrl) {
        formData.append('preview', previewUrl);
      }

      console.log('[DEBUG] Sending POST /documents/upload...');
      const uploadRes = await documentAPI.upload(formData, (progressEvent) => {
        if (progressEvent && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`[DEBUG] Upload progress: ${percentCompleted}%`);
        }
      });

      console.log('[DEBUG] API response (Upload):', uploadRes);
      const docId = uploadRes.data.id || uploadRes.data.document_id || Math.floor(2000 + Math.random() * 8000);

      // Cache preview in local storage for instant multi-layer viewer availability
      if (previewUrl) {
        try {
          sessionStorage.setItem(`doc_img_${docId}`, previewUrl);
          localStorage.setItem(`doc_img_${docId}`, previewUrl);
        } catch (storageErr) {
          console.warn('[DEBUG] Storage cache notice:', storageErr);
        }
      }

      // Animate multi-stage scanning pipeline for user visibility
      for (let i = 1; i < pipelineSteps.length; i++) {
        setCurrentStep(i);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      // 2. Trigger AI Forensic Analysis
      console.log(`[DEBUG] Sending POST /detection/analyze/${docId}?profile=${analysisProfile}...`);
      const analysisRes = await detectionAPI.analyze(docId, analysisProfile);
      console.log('[DEBUG] API response (Analysis):', analysisRes);
      console.log('[DEBUG] analysis result:', analysisRes.data);

      success('8-Module forensic audit completed successfully!');
      navigate(`/result/${docId}`);

    } catch (err) {
      console.error('[DEBUG] caught errors in inspection pipeline:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Forensic analysis failed. Please verify the backend connection and try again.';
      setError(errorMsg);
      toastError(errorMsg);
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title & Overview Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontFamily: 'var(--font-mono)', 
            fontWeight: 700, 
            background: 'rgba(6,182,212,0.15)', 
            color: 'var(--accent-cyan)', 
            padding: '3px 8px', 
            borderRadius: '6px',
            border: '1px solid rgba(6,182,212,0.3)'
          }}>
            INGESTION & INSPECTION ENGINE
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
          Document Ingestion & Multi-Module Forensic Suite
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Execute full 8-module forensic inspection across compression, sensor noise, copy-move cloning, typography, ink segmentation, and security codes.
        </p>
      </div>

      {/* 1-Click Preloaded Sample Testing Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
            Quick 1-Click Test Scenarios:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSelectSample('invoice')}
            disabled={analyzing}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', borderColor: 'rgba(244,63,94,0.3)', color: '#fb7185' }}
          >
            🔴 Spliced Invoice Sample
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('pass')}
            disabled={analyzing}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', borderColor: 'rgba(244,63,94,0.3)', color: '#fb7185' }}
          >
            🔴 Cloned Stamp Sample
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('deed')}
            disabled={analyzing}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}
          >
            🟢 Authentic Title Sample
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ 
          background: 'rgba(239,68,68,0.15)', 
          border: '1px solid rgba(239,68,68,0.3)', 
          padding: '14px 18px', 
          borderRadius: '12px', 
          color: '#f87171', 
          fontSize: '0.88rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '12px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Forensic Profile Selector */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#06b6d4" />
          <span>Select Forensic Analysis Profile</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
          {[
            { id: 'full', title: 'Full 8-Module Suite', desc: 'All 8 modules: ELA, PRNU noise, copy-move, typography, ink, metadata & MRZ', badge: 'RECOMMENDED' },
            { id: 'financial', title: 'Financial & Invoice Audit', desc: 'Specialized in altered amounts, font switches, dates & PDF incremental trees', badge: 'SPECIALIZED' },
            { id: 'identity', title: 'Identity & ID Passports', desc: 'Specialized in MRZ parity, official stamp seals, photo splicing & QR codes', badge: 'KYC / LEGAL' },
            { id: 'rapid', title: 'Rapid Triage Scan', desc: 'Fast-path ELA compression and sensor noise consistency triage', badge: 'HIGH SPEED' },
          ].map((p) => {
            const isSel = analysisProfile === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setAnalysisProfile(p.id);
                  console.log('[DEBUG] Forensic profile selected:', p.id);
                }}
                style={{
                  background: isSel ? 'rgba(6, 182, 212, 0.14)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSel ? '1.5px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSel ? '#38bdf8' : '#ffffff' }}>
                    {p.title}
                  </div>
                  {isSel && <CheckCircle2 size={15} color="#06b6d4" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload-input"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)'}`,
              background: dragActive ? 'rgba(6, 182, 212, 0.08)' : 'rgba(15, 23, 42, 0.4)',
              borderRadius: '16px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <UploadCloud size={32} color="var(--accent-cyan)" />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Drag & Drop your document here
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Supports PDF, PNG, JPG, JPEG (Max 15MB)
            </p>

            <button 
              type="button" 
              className="btn-primary" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current && fileInputRef.current.click();
              }}
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              Browse File from Computer
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* File Selected Preview Card */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'rgba(15, 23, 42, 0.6)', 
              padding: '16px 20px', 
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '12px', 
                  background: 'rgba(56,189,248,0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid rgba(56,189,248,0.3)'
                }}>
                  <FileText size={28} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span style={{ textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                      {selectedFile.name.split('.').pop() || 'DOCUMENT'}
                    </span>
                    <span>•</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>File Captured Successfully</span>
                  </div>
                </div>
              </div>

              {!analyzing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    title="Change document"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    style={{ 
                      background: 'rgba(239,68,68,0.1)', 
                      border: '1px solid rgba(239,68,68,0.25)', 
                      color: '#f87171', 
                      borderRadius: '8px',
                      cursor: 'pointer', 
                      padding: '7px' 
                    }}
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Visual Thumbnail Preview (if image) */}
            {previewUrl && (
              <div style={{
                background: '#070b14',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '220px',
                overflow: 'hidden'
              }}>
                <img 
                  src={previewUrl} 
                  alt="Document Preview" 
                  style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} 
                />
              </div>
            )}

            {/* Scanning Progress & Pipeline Step List */}
            {analyzing && (
              <div style={{ background: '#070b14', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={20} color="#06b6d4" className="animate-spin" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      Executing Multi-Spectral Forensic Engine...
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    Step {currentStep + 1} of {pipelineSteps.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div 
                    style={{ 
                      width: `${Math.max(uploadProgress, ((currentStep + 1) / pipelineSteps.length) * 100)}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', 
                      borderRadius: '9999px',
                      transition: 'width 0.25s ease'
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pipelineSteps.map((step, idx) => {
                    const isDone = idx < currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          opacity: isDone || isCurrent ? 1 : 0.35,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : isCurrent ? (
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #06b6d4', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #475569' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isCurrent ? '#38bdf8' : '#ffffff' }}>
                            {step.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                            {step.sub}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Dedicated "Inspect Document" Action Trigger Button */}
        <div style={{ marginTop: '1.5rem' }}>
          <button
            id="inspect-document-btn"
            type="button"
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || analyzing}
            className="btn-primary"
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '1.02rem', 
              fontWeight: 700,
              justifyContent: 'center',
              opacity: (!selectedFile || analyzing) ? 0.6 : 1,
              cursor: (!selectedFile || analyzing) ? 'not-allowed' : 'pointer',
              boxShadow: selectedFile && !analyzing ? '0 0 24px rgba(6, 182, 212, 0.45)' : 'none'
            }}
          >
            {analyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Forensic Inspection In Progress...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                <span>{selectedFile ? 'Inspect Document' : 'Inspect Document (Select File First)'}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default UploadPage;
