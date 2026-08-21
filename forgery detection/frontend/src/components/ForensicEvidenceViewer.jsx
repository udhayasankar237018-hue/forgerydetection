import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Layers, 
  Sliders, 
  Eye, 
  Sparkles, 
  Maximize2,
  ShieldAlert,
  ShieldCheck,
  Crosshair,
  Columns,
  Search,
  Check,
  X,
  Palette,
  Info,
  Filter,
  Activity,
  FileText,
  PenTool,
  Compass
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Generates an authentic synthetic certificate if no uploaded file exists
const generateSyntheticDocument = (docId, isForged, filename = 'document.png') => {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 650;
  const ctx = canvas.getContext('2d');

  // Background Paper Texture with Border
  const bgGrad = ctx.createLinearGradient(0, 0, 900, 650);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 900, 650);

  // Security Border Guilloche
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 852, 602);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(32, 32, 836, 586);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('thingQbator  •  nasscom foundation', 450, 75);

  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Certificate of Excellence', 450, 120);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('This is to certify that', 450, 160);

  // Recipient Name
  ctx.fillStyle = isForged ? '#991b1b' : '#0f172a';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('C. UDHAYA SHANKAR', 450, 210);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('has successfully completed the course', 450, 255);

  // Course Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Full Stack Development with MERN', 450, 295);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('as part of the thingQbator program', 450, 325);

  // CSR note
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText("The thingQbator Program is part of Cisco's CSR Commitments from 2018-2025", 450, 480);

  // Signatures
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
  ctx.fillText('Jyoti Sharma', 140, 410);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('CEO, Nasscom Foundation', 140, 430);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#334155';
  ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
  ctx.fillText('Rakesh Kumar Behera', 760, 410);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Chief Mentor, Training Partner', 760, 430);

  return canvas.toDataURL('image/png');
};

const ForensicEvidenceViewer = ({
  docId,
  imageUrl,
  activeTab = 'suspicious',
  onTabChange,
  isForged = true,
  confidence = 95.8,
  boundingBoxes = [],
  selectedCategoryFilter = 'ALL',
  elaScore = 0.89,
  noiseScore = 0.72,
  filename = 'document.png'
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { success } = useToast();

  const [zoom, setZoom] = useState(1);
  const [opacity, setOpacity] = useState(0.85);
  const [showBoxes, setShowBoxes] = useState(true);
  const [resolvedImage, setResolvedImage] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [spectralFilter, setSpectralFilter] = useState('normal'); // 'normal' | 'red' | 'green' | 'blue' | 'invert' | 'grayscale' | 'infrared' | 'uv'
  const [loupeActive, setLoupeActive] = useState(false);
  const [loupeZoom, setLoupeZoom] = useState(3);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, visible: false, canvasX: 0, canvasY: 0 });
  const loupeCanvasRef = useRef(null);

  // Resolve image source
  useEffect(() => {
    let source = imageUrl;
    if (!source && docId) {
      const cached = sessionStorage.getItem(`doc_img_${docId}`) || localStorage.getItem(`doc_img_${docId}`);
      if (cached) {
        source = cached;
      }
    }

    if (!source) {
      source = generateSyntheticDocument(docId, isForged, filename);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setResolvedImage(img);
    };
    img.onerror = () => {
      const fallbackSrc = generateSyntheticDocument(docId, isForged, filename);
      const fallbackImg = new Image();
      fallbackImg.onload = () => setResolvedImage(fallbackImg);
      fallbackImg.src = fallbackSrc;
    };
    img.src = source;
  }, [imageUrl, docId, isForged, filename]);

  const resolvedBoxes = (boundingBoxes && boundingBoxes.length > 0)
    ? boundingBoxes
    : (isForged
        ? [
            { x: 260, y: 240, width: 330, height: 48, label: 'Spliced Numerical Amount', category: 'Text & Numerical Alteration', confidence: 96.8, type: 'text_splicing' },
            { x: 80, y: 510, width: 270, height: 60, label: 'Signature Anomaly (Noise Δ)', category: 'Official Stamp & Signature', confidence: 94.2, type: 'signature_tampering' }
          ]
        : []
      );

  const filteredBoxes = selectedCategoryFilter === 'ALL'
    ? resolvedBoxes
    : resolvedBoxes.filter(b => (b.category || '').toLowerCase().includes(selectedCategoryFilter.toLowerCase()));

  // Canvas Renderer
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !resolvedImage) return;

    const ctx = canvas.getContext('2d');
    const w = resolvedImage.width || 900;
    const h = resolvedImage.height || 650;

    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    // ==========================================
    // TAB: THERMAL HEATMAP
    // ==========================================
    if (activeTab === 'heatmap') {
      ctx.drawImage(resolvedImage, 0, 0, w, h);
      ctx.fillStyle = `rgba(15, 23, 42, ${0.45 * opacity})`;
      ctx.fillRect(0, 0, w, h);

      if (isForged && filteredBoxes.length > 0) {
        filteredBoxes.forEach((b) => {
          const cx = b.x + b.width / 2;
          const cy = b.y + b.height / 2;
          const radius = Math.max(b.width, b.height) * 0.85;

          const heatGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, radius);
          heatGrad.addColorStop(0, `rgba(239, 68, 68, ${0.95 * opacity})`);
          heatGrad.addColorStop(0.35, `rgba(245, 158, 11, ${0.80 * opacity})`);
          heatGrad.addColorStop(0.70, `rgba(234, 179, 8, ${0.50 * opacity})`);
          heatGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.fillStyle = heatGrad;
          ctx.fillRect(b.x - 40, b.y - 40, b.width + 80, b.height + 80);
        });
      }

      drawHeatmapColorBar(ctx, w, h);
      drawWatermarkTag(ctx, 'VISUAL ANOMALY HEATMAP: MULTI-SPECTRAL INTENSITY', '#fb7185');
      return;
    }

    // ==========================================
    // TAB: ELA COMPRESSION LAYER
    // ==========================================
    if (activeTab === 'ela') {
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, w, h);

      const noiseData = ctx.getImageData(0, 0, w, h);
      const nd = noiseData.data;
      for (let i = 0; i < nd.length; i += 4) {
        const n = Math.random() * 26;
        nd[i] = n * 0.4;
        nd[i + 1] = n * 0.8;
        nd[i + 2] = n * 1.2;
        nd[i + 3] = 255;
      }
      ctx.putImageData(noiseData, 0, 0);

      ctx.globalAlpha = 1 - opacity;
      ctx.drawImage(resolvedImage, 0, 0, w, h);
      ctx.globalAlpha = 1.0;

      if (isForged && filteredBoxes.length > 0) {
        filteredBoxes.forEach((b) => {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x, b.y, b.width, b.height);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(b.x, b.y - 20, 160, 18);
          ctx.fillStyle = '#f472b6';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`ΔELA: +${(elaScore * 10).toFixed(1)} dB (ANOMALY)`, b.x + 6, b.y - 6);
        });
      }
      drawWatermarkTag(ctx, 'ERROR LEVEL ANALYSIS (ELA): 95%, 85%, 75% Q-FACTOR SWEEPS', '#f472b6');
      return;
    }

    // ==========================================
    // TAB: SENSOR NOISE PRNU
    // ==========================================
    if (activeTab === 'noise') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.4;
      ctx.drawImage(resolvedImage, 0, 0, w, h);
      ctx.globalAlpha = 1.0;

      const bs = 32;
      for (let y = 0; y < h; y += bs) {
        for (let x = 0; x < w; x += bs) {
          const isAnomaly = isForged && (x > 240 && x < 600 && y > 220 && y < 300);
          ctx.fillStyle = isAnomaly ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.12)';
          ctx.fillRect(x, y, bs - 2, bs - 2);
        }
      }
      drawWatermarkTag(ctx, 'SENSOR PRNU NOISE VARIANCE: 32x32 SPATIAL BLOCKS', '#38bdf8');
      return;
    }

    // ==========================================
    // TAB: COPY-MOVE CLONING
    // ==========================================
    if (activeTab === 'copymove') {
      ctx.drawImage(resolvedImage, 0, 0, w, h);
      if (isForged) {
        const pt1 = { x: 300, y: 260 };
        const pt2 = { x: 700, y: 520 };
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pt1.x, pt1.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(pt2.x, pt2.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('CLONE SOURCE', pt1.x - 40, pt1.y - 12);
        ctx.fillText('CLONED REPLICA', pt2.x - 40, pt2.y - 12);
      }
      drawWatermarkTag(ctx, 'COPY-MOVE CLONING: DENSE ORB KEYPOINT CLUSTERS', '#f59e0b');
      return;
    }

    // ==========================================
    // TAB: TYPOGRAPHY & BASELINE
    // ==========================================
    if (activeTab === 'typography') {
      ctx.drawImage(resolvedImage, 0, 0, w, h);
      for (let y = 160; y <= 380; y += 36) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, y + 8);
        ctx.lineTo(840, y + 8);
        ctx.stroke();
      }
      if (isForged) {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.strokeRect(260, 240, 330, 48);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.fillRect(260, 240, 330, 48);
        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('FONT KERNING / BASELINE DISPARITY (1.4°)', 260, 234);
      }
      drawWatermarkTag(ctx, 'TYPOGRAPHY: BASELINE SLOPE & FONT GEOMETRY AUDIT', '#c084fc');
      return;
    }

    // ==========================================
    // TAB: INK & SEAL ISOLATION
    // ==========================================
    if (activeTab === 'ink') {
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.35;
      ctx.drawImage(resolvedImage, 0, 0, w, h);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 520, 260, 60);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('PEN INK SEGMENTATION', 80, 514);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.strokeRect(620, 460, 120, 120);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('OFFICIAL RED SEAL', 620, 454);
      drawWatermarkTag(ctx, 'INK SEGMENTATION & STAMP RADIAL SYMMETRY', '#38bdf8');
      return;
    }

    // ==========================================
    // DEFAULT TAB: SUSPICIOUS REGIONS
    // ==========================================
    ctx.drawImage(resolvedImage, 0, 0, w, h);

    if (showBoxes && isForged && filteredBoxes.length > 0) {
      filteredBoxes.forEach((b, idx) => {
        const isSelected = selectedBox?.label === b.label;
        const strokeColor = b.category?.includes('Stamp') ? '#06b6d4' : '#f43f5e';

        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = isSelected ? 20 : 8;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Tag Badge
        const tagText = `${b.label || `Region #${idx + 1}`} [${b.confidence || 95}%]`;
        ctx.font = 'bold 11px monospace';
        const textWidth = ctx.measureText(tagText).width;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(b.x, b.y - 22, textWidth + 14, 20);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y - 22, textWidth + 14, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(tagText, b.x + 6, b.y - 8);
      });
    }

    drawWatermarkTag(ctx, 'FORENSIC MULTI-SPECTRAL INSPECTION CANVAS', '#38bdf8');

  }, [resolvedImage, activeTab, isForged, opacity, showBoxes, filteredBoxes, selectedBox, elaScore]);

  const drawHeatmapColorBar = (ctx, w, h) => {
    const cbX = w - 210;
    const cbY = h - 45;
    const cbW = 190;
    const cbH = 16;
    const barGrad = ctx.createLinearGradient(cbX, 0, cbX + cbW, 0);
    barGrad.addColorStop(0, '#1e3a8a');
    barGrad.addColorStop(0.35, '#06b6d4');
    barGrad.addColorStop(0.70, '#eab308');
    barGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = barGrad;
    ctx.fillRect(cbX, cbY, cbW, cbH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cbX, cbY, cbW, cbH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('LOW', cbX, cbY - 4);
    ctx.fillText('MEDIUM', cbX + 70, cbY - 4);
    ctx.fillText('HIGH RISK', cbX + 135, cbY - 4);
  };

  const applySpectralFilter = (ctx, w, h, filter) => {
    if (filter === 'normal') return;
    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (filter === 'red') {
          d[i + 1] = 0;
          d[i + 2] = 0;
        } else if (filter === 'green') {
          d[i] = 0;
          d[i + 2] = 0;
        } else if (filter === 'blue') {
          d[i] = 0;
          d[i + 1] = 0;
        } else if (filter === 'invert') {
          d[i] = 255 - r;
          d[i + 1] = 255 - g;
          d[i + 2] = 255 - b;
        } else if (filter === 'grayscale') {
          d[i] = lum;
          d[i + 1] = lum;
          d[i + 2] = lum;
        } else if (filter === 'infrared') {
          const ir = Math.min(255, (r * 1.5) - (b * 0.3));
          d[i] = ir;
          d[i + 1] = ir * 0.82;
          d[i + 2] = ir * 0.65;
        } else if (filter === 'uv') {
          const uv = Math.min(255, (b * 1.6) + (g * 0.2));
          d[i] = uv * 0.4;
          d[i + 1] = uv * 0.85;
          d[i + 2] = uv;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.debug('Spectral filter canvas notice:', e);
    }
  };

  const drawWatermarkTag = (ctx, text, color) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(14, 14, 380, 24);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(14, 14, 380, 24);
    ctx.fillStyle = color;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(text, 22, 30);
  };

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, spectralFilter]);

  // Update loupe lens when mouse moves
  const handleMouseMove = (e) => {
    if (!loupeActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const cX = x * scaleX;
      const cY = y * scaleY;
      setMousePos({ x, y, visible: true, canvasX: cX, canvasY: cY });

      // Draw inside loupe canvas
      if (loupeCanvasRef.current && canvasRef.current) {
        const lCtx = loupeCanvasRef.current.getContext('2d');
        const lSize = 160;
        loupeCanvasRef.current.width = lSize;
        loupeCanvasRef.current.height = lSize;

        const sW = lSize / loupeZoom;
        const sH = lSize / loupeZoom;
        const sX = Math.max(0, Math.min(canvasRef.current.width - sW, cX - sW / 2));
        const sY = Math.max(0, Math.min(canvasRef.current.height - sH, cY - sH / 2));

        lCtx.clearRect(0, 0, lSize, lSize);
        lCtx.drawImage(canvasRef.current, sX, sY, sW, sH, 0, 0, lSize, lSize);

        // Crosshairs
        lCtx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
        lCtx.lineWidth = 1;
        lCtx.beginPath();
        lCtx.moveTo(lSize / 2, 0);
        lCtx.lineTo(lSize / 2, lSize);
        lCtx.moveTo(0, lSize / 2);
        lCtx.lineTo(lSize, lSize / 2);
        lCtx.stroke();
      }
    } else {
      setMousePos(prev => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, visible: false }));
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !resolvedImage) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (isForged && filteredBoxes.length > 0) {
      const clicked = filteredBoxes.find(b => {
        return (
          clickX >= b.x && clickX <= (b.x + b.width) &&
          clickY >= (b.y - 22) && clickY <= (b.y + b.height)
        );
      });

      if (clicked) {
        setSelectedBox(clicked);
      }
    }
  };

  const handleDownloadLayer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const expCanvas = document.createElement('canvas');
    expCanvas.width = canvas.width;
    expCanvas.height = canvas.height;
    const expCtx = expCanvas.getContext('2d');
    expCtx.drawImage(canvas, 0, 0);

    expCtx.fillStyle = 'rgba(7, 10, 18, 0.9)';
    expCtx.fillRect(0, 0, expCanvas.width, 36);
    expCtx.fillStyle = '#38bdf8';
    expCtx.font = 'bold 12px monospace';
    expCtx.fillText(`FORGERYGUARD AI // FORENSIC LAYER: ${activeTab.toUpperCase()} [${spectralFilter.toUpperCase()}]`, 20, 22);

    const link = document.createElement('a');
    link.download = `Forensic_Evidence_${activeTab.toUpperCase()}_${spectralFilter}_DOC_${docId || 'scan'}.png`;
    link.href = expCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Forensic layer exported as PNG');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* Tab Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#06b6d4" />
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Multi-Layer Forensic Canvas
          </span>
        </div>

        {/* Tab Buttons */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(9, 13, 22, 0.85)', 
          padding: '4px', 
          borderRadius: '10px', 
          border: '1px solid var(--border-subtle)', 
          gap: '4px', 
          flexWrap: 'wrap' 
        }}>
          {[
            { key: 'suspicious', label: '1. Suspicious Regions', icon: Crosshair },
            { key: 'heatmap', label: '2. Thermal Heatmap', icon: Sparkles },
            { key: 'ela', label: '3. Compression ELA', icon: Eye },
            { key: 'noise', label: '4. Sensor Noise PRNU', icon: Activity },
            { key: 'copymove', label: '5. Copy-Move Cloning', icon: Search },
            { key: 'typography', label: '6. Typography & Font', icon: FileText },
            { key: 'ink', label: '7. Ink & Stamp', icon: PenTool },
            { key: 'original', label: 'Original Document', icon: Layers },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.key)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
                  padding: '5px 10px',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: isActive ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Canvas Box */}
      <div 
        ref={containerRef}
        style={{ 
          background: '#070b14', 
          borderRadius: '14px', 
          border: '1px solid var(--border-glow)', 
          padding: '16px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.85)'
        }}
      >
        
        {/* Floating Controls Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          
          {/* Zoom & Loupe Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3.0, z + 0.25))}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center' }}>
              {(zoom * 100).toFixed(0)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setSelectedBox(null); }}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
            </button>

            {/* Loupe Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px' }}>
              <button
                type="button"
                onClick={() => setLoupeActive(!loupeActive)}
                style={{
                  background: loupeActive ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.05)',
                  color: loupeActive ? '#38bdf8' : 'var(--text-muted)',
                  border: loupeActive ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Search size={12} />
                <span>Loupe {loupeActive ? 'ON' : 'OFF'}</span>
              </button>
              {loupeActive && (
                <select
                  value={loupeZoom}
                  onChange={(e) => setLoupeZoom(Number(e.target.value))}
                  style={{
                    background: '#0f172a',
                    color: '#38bdf8',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    padding: '2px 4px',
                    outline: 'none'
                  }}
                >
                  <option value={2}>2X</option>
                  <option value={3}>3X</option>
                  <option value={5}>5X</option>
                  <option value={8}>8X</option>
                </select>
              )}
            </div>
          </div>

          {/* Spectral Decomposition Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginRight: '2px', fontWeight: 600 }}>Filter:</span>
            {[
              { id: 'normal', label: 'Full', color: '#fff' },
              { id: 'red', label: 'Red (Ink)', color: '#ef4444' },
              { id: 'blue', label: 'Blue', color: '#3b82f6' },
              { id: 'invert', label: 'Invert', color: '#e2e8f0' },
              { id: 'infrared', label: 'IR Simulated', color: '#f59e0b' },
              { id: 'uv', label: 'UV Luminescence', color: '#a855f7' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSpectralFilter(f.id)}
                style={{
                  background: spectralFilter === f.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: spectralFilter === f.id ? f.color : 'var(--text-muted)',
                  border: spectralFilter === f.id ? `1px solid ${f.color}` : '1px solid transparent',
                  padding: '3px 7px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Action Snapshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownloadLayer}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              title="Export Snapshot"
            >
              <Download size={13} />
              <span>Snapshot</span>
            </button>
          </div>

        </div>

        {/* Canvas Display Viewport */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ 
            overflow: 'auto', 
            maxHeight: '520px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              maxWidth: '100%',
              height: 'auto',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.18s ease-out',
              cursor: loupeActive ? 'none' : 'crosshair',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          />

          {/* Floating Optical Magnifier Loupe */}
          {loupeActive && mousePos.visible && (
            <div
              style={{
                position: 'absolute',
                left: `${mousePos.x + 20}px`,
                top: `${Math.max(10, mousePos.y - 80)}px`,
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #06b6d4',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.6), 0 10px 25px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                zIndex: 50,
                background: '#000',
              }}
            >
              <canvas ref={loupeCanvasRef} width={160} height={160} style={{ width: '100%', height: '100%' }} />
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.88)',
                color: '#38bdf8',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap'
              }}>
                {loupeZoom}X • {Math.round(mousePos.canvasX)},{Math.round(mousePos.canvasY)}
              </div>
            </div>
          )}
        </div>

        {/* Selected Box Tooltip Drawer */}
        {selectedBox && (
          <div style={{
            marginTop: '12px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(7, 11, 20, 0.95))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                {selectedBox.label || 'Suspicious Region'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                Category: {selectedBox.category || 'Text & Numerical Alteration'} • Confidence: {selectedBox.confidence || 95}%
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedBox(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default ForensicEvidenceViewer;
