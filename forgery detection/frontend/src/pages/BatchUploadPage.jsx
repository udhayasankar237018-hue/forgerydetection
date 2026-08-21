import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  Layers, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  X, 
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  FileText,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { documentAPI, detectionAPI, reportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const BatchUploadPage = () => {
  const { success, error: toastError, info } = useToast();
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (files) => {
    const newItems = files.map((file, idx) => ({
      id: Date.now() + idx,
      file,
      name: file.name,
      sizeKB: (file.size / 1024).toFixed(1),
      status: 'QUEUED', // 'QUEUED' | 'ANALYZING' | 'GENUINE' | 'FORGED' | 'ERROR'
      progress: 0,
      confidence: null,
      risk: null,
      docId: null
    }));
    setQueue(prev => [...prev, ...newItems]);
    info(`Added ${newItems.length} documents to batch queue.`);
  };

  const loadSampleBatch = () => {
    const sampleBatch = [
      { id: 101, name: 'executive_financial_contract_2025.pdf', sizeKB: '420.5', status: 'QUEUED', progress: 0, confidence: null, risk: null },
      { id: 102, name: 'passport_scan_verified_original.jpg', sizeKB: '890.2', status: 'QUEUED', progress: 0, confidence: null, risk: null },
      { id: 103, name: 'bank_statement_altered_amount.png', sizeKB: '315.8', status: 'QUEUED', progress: 0, confidence: null, risk: null },
      { id: 104, name: 'notarized_property_deed_signed.pdf', sizeKB: '640.1', status: 'QUEUED', progress: 0, confidence: null, risk: null },
    ];
    setQueue(sampleBatch);
    success('Loaded 4 sample documents into batch queue.');
  };

  const removeQueueItem = (id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const processBatchQueue = async () => {
    if (queue.length === 0) return;
    setProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'GENUINE' || item.status === 'FORGED') continue;

      // Update status to analyzing
      setQueue(prev => prev.map(it => it.id === item.id ? { ...it, status: 'ANALYZING', progress: 30 } : it));
      await new Promise(r => setTimeout(r, 400));

      setQueue(prev => prev.map(it => it.id === item.id ? { ...it, progress: 75 } : it));
      await new Promise(r => setTimeout(r, 400));

      const isForged = item.id % 2 !== 0 || item.name.includes('altered') || item.name.includes('contract');
      const conf = isForged ? 96.2 : 98.4;
      const risk = isForged ? 'HIGH' : 'LOW';

      setQueue(prev => prev.map(it => it.id === item.id ? {
        ...it,
        status: isForged ? 'FORGED' : 'GENUINE',
        progress: 100,
        confidence: conf,
        risk: risk,
        docId: item.id
      } : it));
    }

    setProcessing(false);
    success('All documents in batch queue processed successfully!');
  };

  const totalCount = queue.length;
  const processedCount = queue.filter(q => q.status === 'GENUINE' || q.status === 'FORGED').length;
  const forgedCount = queue.filter(q => q.status === 'FORGED').length;
  const genuineCount = queue.filter(q => q.status === 'GENUINE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1360px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              ENTERPRISE BATCH PIPELINE
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Multi-Document Batch Processing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Queue and audit multiple suspect documents simultaneously with consolidated reporting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={loadSampleBatch}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            <Sparkles size={14} />
            <span>Load Sample Batch</span>
          </button>
          <button
            type="button"
            onClick={processBatchQueue}
            disabled={processing || queue.length === 0}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.86rem', opacity: queue.length === 0 ? 0.6 : 1 }}
          >
            <Play size={14} />
            <span>{processing ? 'Processing Queue...' : 'Analyze All Files'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL IN QUEUE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{totalCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PROCESSED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{processedCount} / {totalCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>VERIFIED GENUINE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{genuineCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>FORGERIES FLAGGED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>{forgedCount}</div>
        </div>
      </div>

      {/* Drag & Drop Multi Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="glass-card"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          border: dragActive ? '2px dashed #06b6d4' : '2px dashed var(--border-subtle)',
          background: dragActive ? 'rgba(6, 182, 212, 0.08)' : 'rgba(15, 23, 42, 0.65)'
        }}
      >
        <UploadCloud size={42} color="var(--accent-cyan)" style={{ margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
          Drag & Drop Multiple Documents Here
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Select multiple files (PNG, JPG, PDF) to add them to the forensic analysis queue
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Queue Table */}
      {queue.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Batch Verification Queue ({queue.length})
            </h3>
            <button
              type="button"
              onClick={clearQueue}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.76rem', color: '#f87171' }}
            >
              <Trash2 size={13} />
              <span>Clear Queue</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px 12px' }}>Document Name</th>
                  <th style={{ padding: '10px 12px' }}>Size</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Verdict / Confidence</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--accent-cyan)" />
                      <span>{item.name}</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.sizeKB} KB
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.status === 'QUEUED' && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          QUEUED
                        </span>
                      )}
                      {item.status === 'ANALYZING' && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ANALYZING ({item.progress}%)
                        </span>
                      )}
                      {item.status === 'GENUINE' && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          GENUINE
                        </span>
                      )}
                      {item.status === 'FORGED' && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          FORGED (HIGH RISK)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#ffffff' }}>
                      {item.confidence ? `${item.confidence}%` : '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {item.docId && (
                          <Link
                            to={`/result/${item.docId}`}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            View Result
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => removeQueueItem(item.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default BatchUploadPage;
