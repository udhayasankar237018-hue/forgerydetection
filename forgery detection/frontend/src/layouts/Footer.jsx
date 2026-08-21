import React from 'react';
import { ShieldCheck, Cpu, Database, Sparkles, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--border-subtle)', 
      background: 'rgba(7, 10, 18, 0.95)', 
      padding: '1.25rem 2rem',
      fontSize: '0.8rem',
      color: 'var(--text-dim)',
      marginTop: 'auto',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Brand & System */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="#06b6d4" />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            ForgeryGuard AI Forensic Platform
          </span>
          <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
            v2.4 LTS
          </span>
        </div>

        {/* Cryptographic and ML Stack Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="#3b82f6" />
            <span>Multi-Spectral ELA + Noise Variance + RF</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} color="#10b981" />
            <span>SHA-256 Verified Certificates</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} color="#a855f7" />
            <span>FastAPI Secure Vault</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
