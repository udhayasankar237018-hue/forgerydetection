import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  FileText, 
  Cpu, 
  User, 
  ShieldCheck, 
  LogOut, 
  ArrowRight,
  Sparkles,
  Command,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const { info } = useToast();

  const commands = [
    { id: 'dashboard', title: 'Dashboard & Metrics', subtitle: 'Overview of verified & forged documents', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
    { id: 'upload', title: 'Single Document Upload', subtitle: 'Ingest JPG, PNG, or PDF for forensic scan', icon: UploadCloud, path: '/upload', category: 'Action' },
    { id: 'batch', title: 'Multi-Document Batch Processing', subtitle: 'Queue and audit multiple documents simultaneously', icon: Sparkles, path: '/batch', category: 'Action' },
    { id: 'compare', title: 'Dual-Document Comparative Diff', subtitle: 'SSIM optical alignment against master templates', icon: Sparkles, path: '/compare', category: 'Forensics' },
    { id: 'verify', title: 'Public Cryptographic Registry', subtitle: 'Verify certificates and immutable SHA-256 digests', icon: ShieldCheck, path: '/verify', category: 'Registry' },
    { id: 'history', title: 'Detection History Archive', subtitle: 'Filter and search past forensic results', icon: History, path: '/history', category: 'Navigation' },
    { id: 'reports', title: 'Certified PDF Reports', subtitle: 'View and export certified audit certificates', icon: FileCheck2, path: '/reports', category: 'Navigation' },
    { id: 'model', title: 'ML Architecture & ELA Simulator', subtitle: 'Inspect model benchmarks and simulate inference', icon: Cpu, path: '/model-info', category: 'Forensics' },
    { id: 'profile', title: 'Analyst Profile & Security', subtitle: 'Manage analyst badge, API keys, and session', icon: User, path: '/profile', category: 'Account' },
  ];

  if (isAdmin) {
    commands.push({ id: 'admin', title: 'Administrator Console', subtitle: 'User permissions and live system audit trail', icon: ShieldCheck, path: '/admin', category: 'Admin' });
  }

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const handleSelect = (cmd) => {
    onClose();
    if (cmd.path) {
      navigate(cmd.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <Search size={20} color="var(--accent-cyan)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or forensic action..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              width: '100%',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <div style={{ 
            fontSize: '0.72rem', 
            background: 'rgba(255, 255, 255, 0.08)', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)'
          }}>
            ESC
          </div>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} color={isSelected ? '#38bdf8' : '#94a3b8'} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                        {cmd.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  <span style={{ 
                    fontSize: '0.68rem', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}>
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 16px', 
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(9, 13, 22, 0.95)',
          fontSize: '0.75rem',
          color: 'var(--text-dim)'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--accent-cyan)" />
            <span>ForgeryGuard Quick Navigation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
