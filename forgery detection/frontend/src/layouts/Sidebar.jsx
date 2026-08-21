import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  User, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  GitCompare,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Single Upload', icon: UploadCloud, highlight: true },
    { to: '/batch', label: 'Batch Audit', icon: Layers },
    { to: '/compare', label: 'Comparative Diff', icon: GitCompare },
    { to: '/history', label: 'Detection History', icon: History },
    { to: '/verify', label: 'Verify Portal', icon: Lock },
    { to: '/model-info', label: 'ML Model & ELA', icon: Cpu },
    { to: '/profile', label: 'Analyst Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Console', icon: ShieldCheck, isAdminOnly: true });
  }

  return (
    <aside 
      style={{ 
        width: collapsed ? '76px' : '250px', 
        minHeight: 'calc(100vh - 65px)', 
        background: 'rgba(9, 13, 22, 0.75)', 
        borderRight: '1px solid var(--border-subtle)',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        
        {/* Section Header & Collapse Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between', 
          padding: '0 8px 12px 8px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '6px'
        }}>
          {!collapsed && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Forensic Suite
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn-secondary"
            style={{ 
              padding: '4px 6px', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              color: 'var(--text-dim)' 
            }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav Links */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '12px',
                padding: collapsed ? '12px 0' : '10px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.2) 0%, rgba(99, 102, 241, 0.12) 100%)' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                position: 'relative'
              })}
            >
              <Icon size={18} color={item.isAdminOnly ? '#c084fc' : (item.highlight ? '#06b6d4' : '#38bdf8')} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.isAdminOnly && (
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  ADMIN
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* System Telemetry Monitor Box */}
      {!collapsed ? (
        <div 
          className="glass-card" 
          style={{ 
            padding: '14px', 
            background: 'rgba(11, 17, 32, 0.8)', 
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="#06b6d4" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Engine Core</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
              ONLINE
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ELA & Noise:</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Latency:</span>
              <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>~0.38s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Model Acc:</span>
              <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>98.6%</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '8px 0' }} title="Engine Online (98.6% Acc)">
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', margin: '0 auto', boxShadow: '0 0 10px #10b981' }} />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
