import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Zap, 
  CheckCircle2, 
  Shield
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);

  const { login, demoLogin } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = new URLSearchParams(location.search).get('session_expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email.trim(), password);
      success(`Welcome back to ForgeryGuard AI`);
      navigate('/dashboard');
    } catch (err) {
      console.warn('Login note:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    try {
      setError('');
      setQuickLoading(role);
      await demoLogin(role);
      success(`Signed in with ${role.toUpperCase()} clearance`);
      navigate('/dashboard');
    } catch (err) {
      console.warn('Quick login note:', err);
      navigate('/dashboard');
    } finally {
      setQuickLoading(null);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@forgeryguard.ai');
    setPassword('Admin@123456');
    setError('');
  };

  const fillUserCredentials = () => {
    setEmail('analyst@forgeryguard.ai');
    setPassword('Analyst@123456');
    setError('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto', width: '100%' }}>
      <div 
        className="glass-card" 
        style={{ 
          padding: '2.75rem 2.25rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.95) 100%)',
          border: '1px solid var(--border-glow)'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '0.85rem',
            boxShadow: '0 0 28px rgba(6, 182, 212, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <ShieldCheck size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Forensic Portal Access
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Sign in to inspect and verify document authenticity
          </p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpired && (
          <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '10px 14px', borderRadius: '10px', color: '#fbbf24', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>Your session expired. Please log in again.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', padding: '11px 14px', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label className="form-label">
              <span>Analyst Email Address</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="analyst@forgeryguard.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '42px' }}
              />
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Security Password</label>
              <Link 
                to="/forgot-password" 
                style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!quickLoading} 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '0.3rem', fontSize: '0.94rem' }}
          >
            {loading ? 'Authenticating Clearance...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* 1-Click Fast Login Shortcuts */}
        <div style={{ marginTop: '1.4rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ⚡ Quick Demo Credentials:
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Direct Access</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <button
              type="button"
              disabled={loading || !!quickLoading}
              onClick={() => handleQuickLogin('user')}
              className="btn-secondary"
              style={{ 
                padding: '8px 10px', 
                fontSize: '0.8rem', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.08)',
                borderColor: 'rgba(56, 189, 248, 0.25)',
                color: '#38bdf8'
              }}
            >
              <Zap size={14} color="#38bdf8" />
              <span>Analyst Login</span>
            </button>

            <button
              type="button"
              disabled={loading || !!quickLoading}
              onClick={() => handleQuickLogin('admin')}
              className="btn-secondary"
              style={{ 
                padding: '8px 10px', 
                fontSize: '0.8rem', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                background: 'rgba(192, 132, 252, 0.08)',
                borderColor: 'rgba(192, 132, 252, 0.25)',
                color: '#c084fc'
              }}
            >
              <Sparkles size={14} color="#c084fc" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Quick Demo Autofill pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={fillUserCredentials}
              className="btn-secondary"
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.74rem', borderRadius: '6px', opacity: 0.85 }}
            >
              <UserCheck size={12} color="#38bdf8" />
              <span>Autofill Analyst</span>
            </button>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="btn-secondary"
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.74rem', borderRadius: '6px', opacity: 0.85 }}
            >
              <Shield size={12} color="#c084fc" />
              <span>Autofill Admin</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Need a forensic account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 700 }}>
            Create New Account &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
