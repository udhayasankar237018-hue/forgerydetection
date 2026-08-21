import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Key, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Award,
  Sparkles,
  Lock,
  Sliders
} from 'lucide-react';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const { success } = useToast();
  
  const [apiKey, setApiKey] = useState('fg_live_sec_key_9948201a39f');
  const [copiedKey, setCopiedKey] = useState(false);
  const [defaultColormap, setDefaultColormap] = useState('jet');
  const [autoOpenReport, setAutoOpenReport] = useState(true);

  const copyAPIKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    success('Personal API Key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const regenerateKey = () => {
    const newKey = `fg_live_sec_key_${Math.random().toString(36).substring(2, 12)}`;
    setApiKey(newKey);
    success('Generated new API Key');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
          Analyst Profile & Digital Credential
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Manage your forensic security clearance, API access keys, and workspace preferences.
        </p>
      </div>

      {/* Digital Analyst Security Credential Badge */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2.25rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.95) 100%)',
          border: '1px solid var(--border-glow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '76px', 
              height: '76px', 
              borderRadius: '50%', 
              background: isAdmin ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(14, 165, 233, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <User size={38} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
                {user?.name || 'Analyst'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '3px 10px', 
                  borderRadius: '9999px',
                  background: isAdmin ? 'rgba(168,85,247,0.2)' : 'rgba(56,189,248,0.15)',
                  color: isAdmin ? '#c084fc' : '#38bdf8',
                  border: isAdmin ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(56,189,248,0.3)'
                }}>
                  {isAdmin ? 'LEVEL 5 ADMINISTRATOR' : 'LEVEL 4 CERTIFIED ANALYST'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Active Clearance
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>BADGE SERIAL</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {user?.badge_number || 'FG-ANY-8849'}
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Email Address
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#38bdf8" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Organization / Directorate
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
              {user?.organization || 'Document Forensic Directorate'}
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Account Enrolled
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#10b981" />
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Session'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer API Key Manager */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--accent-cyan)" />
              <span>Personal API Access Key</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              Use this key to authenticate programmatic scans via the Python SDK or REST API
            </p>
          </div>

          <button 
            onClick={regenerateKey}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} />
            <span>Roll Key</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#070a12', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#38bdf8', flex: 1, wordBreak: 'break-all' }}>
            {apiKey}
          </span>
          <button
            onClick={copyAPIKey}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {copiedKey ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Workspace Preferences */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="#a855f7" />
          <span>Forensic Workspace Preferences</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Default Anomaly Colormap</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Color palette used when rendering thermal anomaly overlays</div>
            </div>
            <select
              value={defaultColormap}
              onChange={(e) => setDefaultColormap(e.target.value)}
              className="form-input"
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="jet">JET (Thermal)</option>
              <option value="inferno">Inferno</option>
              <option value="cyan">Cyber Cyan</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Auto-Open Generated PDF</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Automatically trigger download when forensic certificate is generated</div>
            </div>
            <button
              onClick={() => setAutoOpenReport(!autoOpenReport)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: autoOpenReport ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                color: autoOpenReport ? '#34d399' : 'var(--text-dim)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {autoOpenReport ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
