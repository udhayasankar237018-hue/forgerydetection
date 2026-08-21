import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  Upload, 
  LogOut, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  Layers, 
  FileText, 
  History, 
  Cpu, 
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  GitCompare,
  Lock
} from 'lucide-react';
import CommandPalette from '../components/CommandPalette';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    info('Signed out successfully');
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Layers },
    { to: '/upload', label: 'Upload & Scan', icon: Upload },
    { to: '/batch', label: 'Batch Audit', icon: Layers },
    { to: '/compare', label: 'Optical Diff', icon: GitCompare },
    { to: '/history', label: 'History', icon: History },
    { to: '/reports', label: 'Certified Reports', icon: FileCheck2 },
    { to: '/verify', label: 'Verify Portal', icon: Lock },
    { to: '/model-info', label: 'ML Model & ELA', icon: Cpu },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <>
      <header 
        className="glass-panel" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 50, 
          borderBottom: '1px solid var(--border-subtle)', 
          borderRadius: 0, 
          padding: '0.65rem 1.5rem',
          background: 'rgba(7, 10, 18, 0.85)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', margin: '0 auto' }}>
          
          {/* Brand Logo & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <ShieldCheck size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ 
                  fontWeight: 800, 
                  fontSize: '1.2rem', 
                  letterSpacing: '-0.02em', 
                  background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-display)'
                }}>
                  ForgeryGuard AI
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Document Forensics
                </div>
              </div>
            </Link>

            {/* Quick Command Palette Button */}
            {isAuthenticated && (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="btn-secondary hide-mobile"
                style={{ 
                  padding: '6px 14px', 
                  fontSize: '0.82rem', 
                  color: 'var(--text-muted)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)'
                }}
                title="Quick Search & Navigation (Ctrl+K)"
              >
                <Search size={14} color="var(--accent-cyan)" />
                <span>Search pages & tools...</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Ctrl K
                </span>
              </button>
            )}
          </div>

          {/* Action Controls & User Suite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {isAuthenticated ? (
              <>
                {/* Upload Action CTA */}
                <Link 
                  to="/upload" 
                  onClick={() => {
                    if (location.pathname === '/upload') {
                      const inspectBtn = document.getElementById('inspect-document-btn');
                      const fileInput = document.getElementById('file-upload-input');
                      if (inspectBtn && !inspectBtn.disabled) {
                        inspectBtn.click();
                      } else if (fileInput) {
                        fileInput.click();
                      }
                    }
                  }}
                  className="btn-primary hide-mobile" 
                  style={{ padding: '8px 16px', fontSize: '0.86rem', borderRadius: '10px' }}
                >
                  <Upload size={15} />
                  <span>Inspect Document</span>
                </Link>

                {/* User Profile Menu */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '4px 10px 4px 6px', 
                      background: 'rgba(15,23,42,0.8)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      color: 'inherit'
                    }}
                  >
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      background: isAdmin ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
                    }}>
                      <UserIcon size={16} color="#fff" />
                    </div>
                    <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="hide-mobile">
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || 'Analyst'}</div>
                      <div style={{ fontSize: '0.66rem', color: isAdmin ? '#c084fc' : '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>
                        {isAdmin ? 'Admin' : 'Analyst'}
                      </div>
                    </div>
                    <ChevronDown size={14} color="var(--text-dim)" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="glass-panel-elevated"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '46px',
                        width: '210px',
                        padding: '8px',
                        zIndex: 60,
                        animation: 'modal-pop 0.15s ease'
                      }}
                    >
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{user?.email}</div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <UserIcon size={14} color="var(--accent-cyan)" />
                        <span>Analyst Profile</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: 'none',
                          border: 'none',
                          color: '#fb7185',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <LogOut size={14} color="#fb7185" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Hamburger Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="btn-secondary"
                  style={{ display: 'none', padding: '8px' }}
                  title="Menu"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Command Palette Modal Component */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
};

export default Navbar;
