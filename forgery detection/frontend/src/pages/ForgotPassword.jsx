import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  RefreshCw,
  MailCheck
} from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Step 1: Request Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your analyst email address.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await authAPI.forgotPassword(email.trim());
      if (res && res.data) {
        success(res.data.message || `Verification code sent to ${email}`);
        setCode('');
        setStep(2);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to dispatch verification code. Please verify your email.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await authAPI.resetPassword(email.trim(), code.trim(), newPassword);
      if (res && res.data) {
        success('Password updated successfully!');
        setStep(3);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Password reset failed. The code may be invalid or expired.';
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
            {step === 2 ? <MailCheck size={30} color="#fff" /> : <KeyRound size={30} color="#fff" />}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            {step === 1 && 'Recover Access Credentials'}
            {step === 2 && 'Enter Code & Update Password'}
            {step === 3 && 'Credentials Updated'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {step === 1 && 'Enter your registered email address to receive your 6-digit verification code'}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && 'Your forensic portal account is now secured with your new password'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', padding: '11px 14px', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Analyst Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. your-email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
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
                  <span>Dispatching Email...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <Link to="/login" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter Code & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label className="form-label">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                className="form-input"
                placeholder="Enter 6-digit code from email"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}
                required
                autoFocus
              />
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '5px', textAlign: 'center' }}>
                Please check your inbox ({email}) and spam folder
              </p>
            </div>

            <div>
              <label className="form-label">New Security Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <Lock size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
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
                  <span>Verifying Code & Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.82rem' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                &larr; Change Email
              </button>
              <button 
                type="button" 
                onClick={handleRequestCode}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: 0 }}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>

            <p style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700 }}>
              Password Updated Successfully!
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Your credentials have been securely updated. You can now sign in to the forensic portal with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }}
            >
              Sign In to Account &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
