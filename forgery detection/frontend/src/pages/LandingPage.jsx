import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  FileCheck2, 
  Layers, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  FileText,
  Lock,
  Sparkles,
  Zap,
  Columns,
  Code,
  Copy,
  Check,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LandingPage = () => {
  const { success } = useToast();
  const [activeFeatureTab, setActiveFeatureTab] = useState('ela');
  const [codeCopied, setCodeCopied] = useState(false);
  const [demoSample, setDemoSample] = useState('forged'); // 'forged' | 'genuine'
  const [demoSliderPos, setDemoSliderPos] = useState(55); // percentage

  const sampleCases = {
    forged: {
      title: 'Altered Conveyance Certificate (Disbursement Tampered)',
      prediction: 'FORGED',
      confidence: 96.8,
      risk: 'CRITICAL',
      elaAnomaly: '+8.4 dB',
      noiseVar: '0.48 (High Deviation)',
      summary: 'Error Level Analysis isolated digital splicing in numerical dollar amount and authorized seal signature.'
    },
    genuine: {
      title: 'Authentic Notarized Asset Title',
      prediction: 'GENUINE',
      confidence: 98.4,
      risk: 'LOW',
      elaAnomaly: '+0.8 dB (Uniform)',
      noiseVar: '0.04 (Consistent)',
      summary: 'Uniform sensor noise and standard JPEG quantization matrix. No digital modifications detected.'
    }
  };

  const currentSample = sampleCases[demoSample];

  const features = [
    {
      id: 'ela',
      icon: Eye,
      title: 'Error Level Analysis (ELA)',
      desc: 'Detects localized JPEG compression discrepancies that reveal spliced, edited, and digitally modified text or images.',
      metric: '98.9% Splicing Recall',
      badge: 'Multi-Spectral'
    },
    {
      id: 'noise',
      icon: Layers,
      title: 'Noise Inconsistency Detection',
      desc: 'Analyzes micro-level high-frequency sensor noise distributions across document quadrants to detect composited regions.',
      metric: '0.02 Variance Threshold',
      badge: 'Sensor Forensics'
    },
    {
      id: 'orb',
      icon: Search,
      title: 'Copy-Move Feature Matching',
      desc: 'Employs ORB & SIFT keypoint descriptor clustering to expose duplicated signatures, cloned stamps, and repeated content.',
      metric: '< 50ms Match Latency',
      badge: 'Keypoint Clustering'
    },
    {
      id: 'ml',
      icon: Cpu,
      title: 'Machine Learning Classification',
      desc: 'Ensemble Random Forest & forensic feature vectors delivering high-confidence Genuine vs. Forged predictions.',
      metric: '98.6% Test Accuracy',
      badge: 'Random Forest'
    },
    {
      id: 'ocr',
      icon: FileText,
      title: 'OCR Text & Layout Inspection',
      desc: 'Extracts document typography, characters, and word coordinates with confidence scoring and diff comparison.',
      metric: 'Multilingual OCR',
      badge: 'Layout Engine'
    },
    {
      id: 'cert',
      icon: FileCheck2,
      title: 'Certified Forensic PDF Reports',
      desc: 'Generates structured audit reports complete with visual anomaly heatmaps and legal forensic disclaimers.',
      metric: 'SHA-256 Validated',
      badge: 'Legal Ready'
    }
  ];

  const pythonSnippet = `import requests

# Submit document for multi-spectral AI forgery inspection
url = "https://api.forgeryguard.ai/v1/detection/analyze"
headers = {"Authorization": "Bearer fg_live_sec_key_99482"}

with open("disputed_document.pdf", "rb") as doc:
    response = requests.post(url, files={"file": doc}, headers=headers)

result = response.json()
print(f"Verdict: {result['prediction']} ({result['confidence']}%)")
print(f"ELA Anomaly Score: {result['ela_score']}")
print(f"Suspicious Regions: {len(result['bounding_boxes'])}")`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCodeCopied(true);
    success('Python API code snippet copied to clipboard');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', padding: '1rem 0 3rem 0' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '980px', margin: '0 auto', position: 'relative' }}>
        
        {/* Glow Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 18px', 
          borderRadius: '9999px', 
          background: 'rgba(56, 189, 248, 0.1)', 
          border: '1px solid rgba(56, 189, 248, 0.35)',
          marginBottom: '1.75rem',
          boxShadow: '0 0 24px rgba(56, 189, 248, 0.2)'
        }}>
          <Sparkles size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em' }}>
            NEXT-GEN FORENSIC INTELLIGENCE SUITE
          </span>
        </div>

        {/* Hero Title */}
        <h1 style={{ 
          fontSize: '3.4rem', 
          fontWeight: 900, 
          lineHeight: 1.15, 
          letterSpacing: '-0.03em', 
          marginBottom: '1.25rem',
          background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-display)'
        }}>
          AI-Powered Document Forgery Detection & Forensic Analysis
        </h1>

        <p style={{ fontSize: '1.18rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
          Instantly verify financial invoices, government IDs, and legal deeds against digital tampering, 
          pixel-splicing, and compression discrepancies using Error Level Analysis (ELA), noise variance, and machine learning.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/upload" className="btn-primary" style={{ padding: '14px 30px', fontSize: '1.05rem', borderRadius: '12px' }}>
            <Zap size={18} />
            <span>Upload Document for Inspection</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/model-info" className="btn-secondary" style={{ padding: '14px 26px', fontSize: '1.05rem', borderRadius: '12px' }}>
            <Cpu size={18} color="var(--accent-cyan)" />
            <span>Explore ML Architecture</span>
          </Link>
        </div>

        {/* Stats Ticker */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1.25rem', 
          marginTop: '3.5rem',
          padding: '1.5rem',
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-display)' }}>98.6%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Random Forest Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>&lt; 0.4s</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inference Latency</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-display)' }}>10-D</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-Spectral Feature Vector</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-display)' }}>SHA-256</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tamper-Evident Certificates</div>
          </div>
        </div>

      </section>

      {/* Interactive Live Demo Sandbox */}
      <section className="glass-card" style={{ padding: '2.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <div className="scanner-laser" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Interactive Live Demo
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              Experience Real-Time Forensic Scanning
            </h2>
          </div>

          {/* Sample Toggle Pills */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(9,13,22,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setDemoSample('forged')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: demoSample === 'forged' ? 'rgba(244,63,94,0.2)' : 'transparent',
                color: demoSample === 'forged' ? '#fb7185' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Tampered Sample (Altered Amount)
            </button>
            <button
              onClick={() => setDemoSample('genuine')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: demoSample === 'genuine' ? 'rgba(16,185,129,0.2)' : 'transparent',
                color: demoSample === 'genuine' ? '#34d399' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Authentic Sample (Original)
            </button>
          </div>
        </div>

        {/* Live Simulation Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'center' }}>
          
          {/* Interactive Visual Graphic */}
          <div style={{ background: '#090d16', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '18px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.82rem' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Multi-Spectral Scan Overlay</span>
              <span className={demoSample === 'forged' ? 'badge-forged' : 'badge-genuine'}>
                {currentSample.prediction} ({currentSample.confidence}%)
              </span>
            </div>

            {/* Simulated Document Canvas Preview */}
            <div style={{ 
              height: '240px', 
              borderRadius: '10px', 
              background: demoSample === 'forged' 
                ? 'radial-gradient(circle at 45% 45%, rgba(244,63,94,0.4) 0%, rgba(15,23,42,0.9) 60%)' 
                : 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0.9) 70%)',
              border: `1px solid ${demoSample === 'forged' ? 'rgba(244,63,94,0.4)' : 'rgba(16,185,129,0.3)'}`,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{currentSample.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>SEC-REF-2026-LIVE-SCAN</div>
              </div>

              {demoSample === 'forged' ? (
                <div style={{ border: '2px dashed #f43f5e', background: 'rgba(244,63,94,0.15)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185' }}>🔴 SPLICE ANOMALY DETECTED</div>
                  <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>Disbursement Amount: $2,850,000.00 (Altered)</div>
                </div>
              ) : (
                <div style={{ border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>🟢 UNIFORM COMPRESSION QUANTIZATION</div>
                  <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>All 4 document quadrants verified</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>ELA Delta: {currentSample.elaAnomaly}</span>
                <span>Noise: {currentSample.noiseVar}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Forensic Summary
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {currentSample.summary}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Risk Level</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: demoSample === 'forged' ? '#fb7185' : '#34d399' }}>
                  {currentSample.risk}
                </div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Decision Engine</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                  Random Forest
                </div>
              </div>
            </div>

            <Link to="/upload" className="btn-primary" style={{ padding: '12px', width: '100%', justifyContent: 'center' }}>
              <span>Upload Custom Document to Inspect</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            End-to-End Forensic Architecture
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            A rigorous multi-layered defense blending statistical image processing, keypoint matching, and machine learning.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '12px', 
                      background: 'rgba(56, 189, 248, 0.12)', 
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Icon size={22} color="#38bdf8" />
                    </div>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', color: 'var(--accent-cyan)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {feat.desc}
                  </p>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Benchmark:</span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{feat.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Developer API & SDK Integration Box */}
      <section className="glass-card" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Code size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Developer REST API & Python SDK
            </h3>
          </div>
          <button 
            onClick={copyCode}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {codeCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{codeCopied ? 'Snippet Copied' : 'Copy Python Code'}</span>
          </button>
        </div>

        <div style={{ 
          background: '#070a12', 
          borderRadius: '12px', 
          padding: '1.25rem', 
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.84rem',
          color: '#38bdf8',
          lineHeight: 1.6
        }}>
          <pre style={{ margin: 0 }}>{pythonSnippet}</pre>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
