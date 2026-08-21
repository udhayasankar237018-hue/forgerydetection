import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  Download, 
  Eye, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert,
  Calendar,
  Layers,
  Trash2,
  LayoutGrid,
  List,
  FileSpreadsheet,
  X,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { historyAPI, documentAPI, reportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const HistoryPage = () => {
  const { success, warning, error: toastError } = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [page, predictionFilter, riskFilter, fileTypeFilter, sortBy, sortOrder]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await historyAPI.getHistory({
        page,
        limit: 12,
        search: search || undefined,
        prediction_filter: predictionFilter || undefined,
        risk_filter: riskFilter || undefined,
        file_type: fileTypeFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    setTimeout(() => {
      fetchHistory();
    }, 0);
  };

  const handleResetAllFilters = () => {
    setSearch('');
    setPredictionFilter('');
    setRiskFilter('');
    setFileTypeFilter('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  const hasActiveFilters = search || predictionFilter || riskFilter || fileTypeFilter || sortBy !== 'date' || sortOrder !== 'desc';

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document and its forensic analysis?')) {
      try {
        await documentAPI.delete(docId);
        success('Document deleted from archive');
        fetchHistory();
      } catch (err) {
        toastError('Failed to delete document');
      }
    }
  };

  const handleDownloadPDF = (docId, uuid) => {
    const url = reportAPI.getDownloadUrl(docId);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Forensic_Report_${uuid}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Downloaded certificate for ${uuid}`);
  };

  const exportCSV = () => {
    if (items.length === 0) return;
    const headers = 'Document ID,UUID,Filename,Prediction,Confidence,Risk Level,Date\n';
    const rows = items.map(i => `"${i.document_id}","${i.document_uuid}","${i.original_filename}","${i.prediction}","${i.confidence || ''}","${i.risk_level || ''}","${i.upload_date}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Forensic_Archive_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    success('History log exported as CSV');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1380px', margin: '0 auto' }}>
      
      {/* Title & Top Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              FORENSIC AUDIT TRAIL
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            Detection History Archive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Search, filter, and sort analyzed documents, risk assessments, and forensic certificates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={exportCSV} 
            className="btn-secondary" 
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
            title="Export archive to CSV"
          >
            <FileSpreadsheet size={15} color="#10b981" />
            <span>Export CSV</span>
          </button>

          <Link to="/upload" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            <span>Scan New Document</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Main Controls Row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Left Controls: Search Bar + Filter Options + Sort Options */}
            <div style={{ display: 'flex', gap: '10px', flex: '1 1 700px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* 1. Search Box */}
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search filename, UUID, pattern..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: search ? '34px' : '12px' }}
                />
                <Search size={16} color="var(--accent-cyan)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* 2. Filter: Authenticity */}
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={predictionFilter}
                  onChange={(e) => { setPredictionFilter(e.target.value); setPage(1); }}
                  style={{ padding: '10px 14px', fontSize: '0.85rem', width: '150px' }}
                >
                  <option value="">All Predictions</option>
                  <option value="GENUINE">Genuine Only</option>
                  <option value="FORGED">Forged Only</option>
                </select>
              </div>

              {/* 3. Filter: Risk Level */}
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={riskFilter}
                  onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                  style={{ padding: '10px 14px', fontSize: '0.85rem', width: '140px' }}
                >
                  <option value="">All Risk Levels</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="CRITICAL">Critical Risk</option>
                </select>
              </div>

              {/* 4. Filter: File Type */}
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={fileTypeFilter}
                  onChange={(e) => { setFileTypeFilter(e.target.value); setPage(1); }}
                  style={{ padding: '10px 14px', fontSize: '0.85rem', width: '135px' }}
                >
                  <option value="">All Formats</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="png">PNG (.png)</option>
                  <option value="jpg">JPG / JPEG</option>
                </select>
              </div>

              {/* 5. Sort Option Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9,13,22,0.7)', padding: '4px 6px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '6px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  <ArrowUpDown size={14} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 600 }}>Sort:</span>
                </div>
                <select
                  className="form-input"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="date" style={{ background: '#0f172a' }}>Date Uploaded</option>
                  <option value="confidence" style={{ background: '#0f172a' }}>Confidence Score</option>
                  <option value="filename" style={{ background: '#0f172a' }}>File Name (A-Z)</option>
                  <option value="risk" style={{ background: '#0f172a' }}>Risk Severity</option>
                  <option value="prediction" style={{ background: '#0f172a' }}>Authenticity Verdict</option>
                </select>

                {/* Sort Direction Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  style={{
                    background: 'rgba(56,189,248,0.15)',
                    border: '1px solid rgba(56,189,248,0.3)',
                    color: '#38bdf8',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                  title={sortOrder === 'desc' ? 'Descending (High to Low / Newest)' : 'Ascending (Low to High / Oldest)'}
                >
                  {sortOrder === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                  <span>{sortOrder === 'desc' ? 'DESC' : 'ASC'}</span>
                </button>
              </div>

              {/* Submit Search Button */}
              <button type="submit" className="btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                <Search size={15} />
                <span>Search</span>
              </button>

            </div>

            {/* Right Controls: View Mode Toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(9,13,22,0.8)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'rgba(56,189,248,0.2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'table' ? '#38bdf8' : 'var(--text-dim)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem'
                }}
                title="Table View"
              >
                <List size={16} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'rgba(56,189,248,0.2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'grid' ? '#38bdf8' : 'var(--text-dim)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem'
                }}
                title="Grid Card View"
              >
                <LayoutGrid size={16} />
                <span>Cards</span>
              </button>
            </div>

          </div>

          {/* Active Filter Badges & Summary Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-dim)' }}>
                Showing <b style={{ color: '#ffffff' }}>{items.length}</b> of <b style={{ color: '#ffffff' }}>{total}</b> records
              </span>

              {/* Badges */}
              {search && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56,189,248,0.2)' }}>
                  Search: "{search}"
                  <X size={12} style={{ cursor: 'pointer' }} onClick={handleClearSearch} />
                </span>
              )}

              {predictionFilter && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: predictionFilter === 'FORGED' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', color: predictionFilter === 'FORGED' ? '#fb7185' : '#34d399', padding: '2px 8px', borderRadius: '4px' }}>
                  {predictionFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setPredictionFilter(''); setPage(1); }} />
                </span>
              )}

              {riskFilter && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px' }}>
                  Risk: {riskFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setRiskFilter(''); setPage(1); }} />
                </span>
              )}

              {fileTypeFilter && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(192,132,252,0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px' }}>
                  Format: .{fileTypeFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setFileTypeFilter(''); setPage(1); }} />
                </span>
              )}

              {(sortBy !== 'date' || sortOrder !== 'desc') && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', padding: '2px 8px', borderRadius: '4px' }}>
                  Sorted: {sortBy} ({sortOrder.toUpperCase()})
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setSortBy('date'); setSortOrder('desc'); }} />
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            )}

          </div>

        </form>
      </div>

      {/* Main Records Container */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>Document UUID</th>
                  <th style={{ padding: '12px 14px' }}>Filename</th>
                  <th style={{ padding: '12px 14px' }}>Authenticity</th>
                  <th style={{ padding: '12px 14px' }}>Confidence</th>
                  <th style={{ padding: '12px 14px' }}>Detected Pattern</th>
                  <th style={{ padding: '12px 14px' }}>Risk</th>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Loading forensic history...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      No matching detection records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.document_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                        {item.document_uuid}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 500, color: '#ffffff' }}>
                        {item.original_filename}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {item.prediction === 'FORGED' ? (
                          <span className="badge-forged">FORGED</span>
                        ) : item.prediction === 'GENUINE' ? (
                          <span className="badge-genuine">GENUINE</span>
                        ) : (
                          <span className="badge-processing">{item.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {item.confidence ? `${item.confidence}%` : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {item.forgery_type || 'None (Authentic)'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {item.risk_level === 'CRITICAL' && <span className="badge-risk-critical">CRITICAL</span>}
                        {item.risk_level === 'HIGH' && <span className="badge-risk-high">HIGH</span>}
                        {item.risk_level === 'MEDIUM' && <span className="badge-risk-medium">MEDIUM</span>}
                        {item.risk_level === 'LOW' && <span className="badge-risk-low">LOW</span>}
                        {!item.risk_level && <span style={{ color: 'var(--text-dim)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {new Date(item.upload_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <Link
                            to={`/result/${item.document_id}`}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                            title="Inspect Evidence"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </Link>
                          <button
                            onClick={() => handleDownloadPDF(item.document_id, item.document_uuid)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                            title="Download PDF Certificate"
                          >
                            <Download size={13} color="#38bdf8" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.document_id)}
                            className="btn-danger"
                            style={{ padding: '5px 8px', borderRadius: '6px' }}
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {items.map((item) => (
            <div key={item.document_id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                    {item.document_uuid}
                  </span>
                  {item.prediction === 'FORGED' ? (
                    <span className="badge-forged">FORGED</span>
                  ) : (
                    <span className="badge-genuine">GENUINE</span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '6px', wordBreak: 'break-all' }}>
                  {item.original_filename}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  <span>Confidence: <b style={{ color: '#fff' }}>{item.confidence}%</b></span>
                  <span>Risk: <b style={{ color: item.prediction === 'FORGED' ? '#fb7185' : '#34d399' }}>{item.risk_level || 'LOW'}</b></span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>{new Date(item.upload_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/result/${item.document_id}`}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                >
                  <Eye size={14} />
                  <span>Inspect</span>
                </Link>
                <button
                  onClick={() => handleDownloadPDF(item.document_id, item.document_uuid)}
                  className="btn-primary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                >
                  <Download size={14} />
                  <span>PDF Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Showing Page {page} of {totalPages} ({total} Total Records)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: page <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: page >= totalPages ? 0.5 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
