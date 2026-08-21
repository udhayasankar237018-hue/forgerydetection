import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  KeyRound, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [tokenOrCode, setTokenOrCode] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setTokenOrCode(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !tokenOrCode) {
      setError('Please provide your email and reset token or code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await authAPI.resetPassword(email.trim(), tokenOrCode.trim(), newPassword);
      if (res && res.data) {
        success('Password updated successfully!');
        setIsSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset password. The link or code may have expired.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto', width: '100%' }}>
      <div 
        className="glass-card" 
        style={{ 
          padding: '2.5rem 2.25rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.95) 100%)',
          border: '1px solid var(--border-glow)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '58px', 
            height: '58px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 24px rgba(14, 165, 233, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <KeyRound size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            {isSuccess ? 'Password Reset Complete' : 'Configure New Password'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {isSuccess 
              ? 'Your security credentials have been updated' 
              : 'Choose a strong security password for your analyst clearance'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', padding: '11px 14px', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        {!isSuccess ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label className="form-label">Analyst Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="analyst@forgeryguard.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!tokenParam && (
              <div>
                <label className="form-label">Verification Code or Reset Token</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="6-digit code or token"
                  value={tokenOrCode}
                  onChange={(e) => setTokenOrCode(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label">New Security Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>

            <p style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600 }}>
              Credentials Updated Successfully!
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Your account password has been updated. You can now access your forensic investigations workspace.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }}
            >
              Proceed to Sign In &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
