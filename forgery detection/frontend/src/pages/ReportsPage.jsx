import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  ShieldCheck, 
  FileCheck2, 
  Award, 
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  X
} from 'lucide-react';
import { reportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ReportsPage = () => {
  const { success, error: toastError } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getAll();
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (rep) => {
    try {
      const docId = rep.document_id || rep.id;
      const uuid = rep.document_uuid || `DOC-${docId}`;
      await reportAPI.downloadPDF(docId, rep);
      success(`Certified forensic PDF report generated for ${uuid}`);
    } catch (err) {
      console.error('Download error:', err);
      toastError('Failed to generate/download certified PDF report');
    }
  };

  const filteredReports = reports.filter((rep) => {
    const s = search.toLowerCase();
    return (
      (rep.filename || '').toLowerCase().includes(s) ||
      (rep.document_uuid || '').toLowerCase().includes(s) ||
      (rep.report_id || '').toLowerCase().includes(s)
    );
  });

  filteredReports.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.generated_at || b.created_at || 0) - new Date(a.generated_at || a.created_at || 0);
    if (sortBy === 'oldest') return new Date(a.generated_at || a.created_at || 0) - new Date(b.generated_at || b.created_at || 0);
    if (sortBy === 'filename') return (a.filename || '').localeCompare(b.filename || '');
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              OFFICIAL CERTIFIED ARCHIVE
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Certified Forensic Reports Archive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Exported verification certificates, ELA multi-spectral summaries, and SHA-256 audit digests.
          </p>
        </div>

        <Link to="/upload" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
          <span>Generate New Report</span>
        </Link>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 500px', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search reports by filename or UUID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', paddingRight: search ? '30px' : '12px', fontSize: '0.85rem' }}
              />
              <Search size={15} color="var(--accent-cyan)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9,13,22,0.7)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <ArrowUpDown size={14} color="var(--accent-cyan)" />
              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 600 }}>Sort:</span>
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: '0.82rem', padding: '4px 6px', outline: 'none' }}
              >
                <option value="newest" style={{ background: '#0f172a' }}>Newest Generated</option>
                <option value="oldest" style={{ background: '#0f172a' }}>Oldest Generated</option>
                <option value="filename" style={{ background: '#0f172a' }}>File Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
            Showing <b style={{ color: '#fff' }}>{filteredReports.length}</b> reports
          </div>

        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading PDF reports archive...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
          <FileText size={42} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>No Reports Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {search ? 'No reports match your search criteria.' : 'Upload and verify a document to generate your first forensic report.'}
          </p>
          {search ? (
            <button onClick={() => setSearch('')} className="btn-secondary">
              Clear Search
            </button>
          ) : (
            <Link to="/upload" className="btn-primary">
              Upload & Verify Document
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredReports.map((rep) => (
            <div key={rep.report_id || rep.document_id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56,189,248,0.25)' }}>
                    <Award size={22} color="#38bdf8" />
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    CERTIFIED PDF
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px', wordBreak: 'break-all' }}>
                  {rep.filename}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                  REF: {rep.document_uuid || `DOC-${rep.document_id}`}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>Generated {new Date(rep.generated_at || rep.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/result/${rep.document_id}`}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
                >
                  <Eye size={14} />
                  <span>Inspect Evidence</span>
                </Link>
                <button
                  onClick={() => handleDownload(rep)}
                  className="btn-primary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ReportsPage;
