import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { getColleges } from '../../../data/aauStructure';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiChevronDown, FiEye, FiCheck, FiX, FiDownload } from 'react-icons/fi';
import DocumentPreview from '../../../components/common/DocumentPreview';

const STATUS_CONFIG = {
  pending:             { label: 'Pending',             bg: '#fefce8', color: '#a16207', dot: '#ca8a04' },
  under_review:        { label: 'Under Review',        bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  shortlisted:         { label: 'Shortlisted',         bg: '#fdf0f0', color: '#7B1113', dot: '#7B1113' },
  approved:            { label: 'Approved',            bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
  accepted:            { label: 'Accepted',            bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
  interview_scheduled: { label: 'Interview Scheduled', bg: '#f0f9ff', color: '#0369a1', dot: '#0284c7' },
  rejected:            { label: 'Rejected',            bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const raw = status?.toLowerCase().replace(' ', '_') || 'pending';
  const cfg = STATUS_CONFIG[raw] || { label: status, bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: '0.7rem', fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const SkeletonRow = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <div style={{ height: 12, borderRadius: 4, background: '#f1f5f9', width: i === 0 ? 140 : i === 7 ? 80 : 100 }} />
      </td>
    ))}
  </tr>
);

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', college: 'all', search: '' });
  const [previewDoc, setPreviewDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const colleges = getColleges();

  useEffect(() => { fetchApplications(); }, [page]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications', { params: { page, limit } });
      const apps = res.data?.data || [];
      setTotal(res.data?.meta?.total || 0);
      setApplications(apps.map(app => ({
        id: app._id,
        name: app.applicant?.fullName || app.applicant?.username || 'Unknown',
        email: app.applicant?.email || '—',
        profilePhoto: app.applicant?.profilePhoto || null,
        position: app.position?.title || '—',
        college: app.position?.college || '—',
        department: app.position?.department || '—',
        evaluators: app.position?.evaluators || [],
        date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: app.status,
        cv: app.documents?.cv || null,
      })));
    } catch (error) {
      console.error('Fetch applications error:', error);
      setApplications([]);
      setTotal(0);
    } finally {
      setTimeout(() => setLoading(false), 100); // Small delay to prevent flash
    }
  };

  const handleStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDoc = (docUrl) => {
    setPreviewDoc(docUrl);
  };

  const exportToCSV = () => {
    const headers = ['Applicant', 'Email', 'Position', 'College', 'Department', 'Evaluators', 'Applied', 'Status'];
    const rows = filtered.map(app => [
      app.name,
      app.email,
      app.position,
      app.college,
      app.department,
      app.evaluators?.map(e => e.fullName || e.username).join(', ') || 'None',
      app.date,
      app.status
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const filtered = applications.filter(a =>
    (filters.status === 'all' || a.status === filters.status) &&
    (filters.college === 'all' || a.college === filters.college) &&
    (filters.search === '' ||
      a.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      a.position.toLowerCase().includes(filters.search.toLowerCase()))
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 22, background: '#7B1113', borderRadius: 4 }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                Application Management
              </h1>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 11px' }}>
              Review, evaluate and manage all submitted applications
            </p>
          </div>
          <div style={{
            background: '#fdf0f0', borderRadius: 8, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7B1113', lineHeight: 1 }}>
              {total}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Total<br />Applications</span>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', marginTop: 16, opacity: 0.2 }} />
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
        padding: '14px 18px', marginBottom: 16,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 200 }}>
          <FiSearch size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name or position..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              border: '1px solid #ede9e9', borderRadius: 8, fontSize: '0.8rem',
              outline: 'none', color: '#1a1a2e', background: '#faf9f9',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative', flex: '0 1 auto' }}>
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            style={{
              appearance: 'none', padding: '8px 32px 8px 12px',
              border: '1px solid #ede9e9', borderRadius: 8,
              fontSize: '0.8rem', color: '#374151', background: '#faf9f9',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="approved">Approved</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <FiChevronDown size={12} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* College filter */}
        <div style={{ position: 'relative', flex: '0 1 auto' }}>
          <select
            value={filters.college}
            onChange={e => setFilters({ ...filters, college: e.target.value })}
            style={{
              appearance: 'none', padding: '8px 32px 8px 12px',
              border: '1px solid #ede9e9', borderRadius: 8,
              fontSize: '0.8rem', color: '#374151', background: '#faf9f9',
              cursor: 'pointer', outline: 'none', maxWidth: 200,
            }}
          >
            <option value="all">All Colleges</option>
            {colleges.map(c => <option key={c} value={c}>{c.length > 30 ? c.substring(0, 30) + '…' : c}</option>)}
          </select>
          <FiChevronDown size={12} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Clear */}
        {(filters.search || filters.status !== 'all' || filters.college !== 'all') && (
          <button
            onClick={() => setFilters({ status: 'all', college: 'all', search: '' })}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #ede9e9',
              background: '#fff', color: '#94a3b8', fontSize: '0.78rem',
              cursor: 'pointer', fontWeight: 500,
            }}
          >
            Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, flex: '0 0 auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>

        <button
          onClick={exportToCSV}
          disabled={filtered.length === 0}
          style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #ede9e9',
            background: filtered.length === 0 ? '#f8f7f5' : '#7B1113', 
            color: filtered.length === 0 ? '#94a3b8' : '#fff',
            fontSize: '0.78rem', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf9f9', borderBottom: '2px solid #f0eded' }}>
                {['Applicant', 'Position', 'College', 'Department', 'Evaluators', 'Applied', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No applications found
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No applications match your filters. <button onClick={() => setFilters({ status: 'all', college: 'all', search: '' })} style={{ color: '#7B1113', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Clear filters</button>
                  </td>
                </tr>
              ) : filtered.map((app, i) => (
                <tr
                  key={app.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f8f5f5' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Applicant */}
                  <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {app.profilePhoto ? (
                        <img
                          src={app.profilePhoto}
                          alt={app.name}
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            objectFit: 'cover', flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: '#fdf0f0', color: '#7B1113',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {app.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a1a2e' }}>{app.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{app.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>
                      {app.position.length > 28 ? app.position.substring(0, 28) + '…' : app.position}
                    </span>
                  </td>

                  {/* College */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {app.college && app.college !== '—' ? app.college.split(' ').slice(0, 3).join(' ') : 'N/A'}
                    </span>
                  </td>

                  {/* Department */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {app.department?.length > 22 ? app.department.substring(0, 22) + '…' : app.department}
                    </span>
                  </td>

                  {/* Evaluators */}
                  <td style={{ padding: '13px 16px' }}>
                    {app.evaluators && app.evaluators.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ display: 'flex', marginRight: 4 }}>
                          {app.evaluators.slice(0, 3).map((evaluator, idx) => (
                            <div
                              key={evaluator._id || idx}
                              title={evaluator.fullName || evaluator.username}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: '#7B1113',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                border: '2px solid #fff',
                                marginLeft: idx > 0 ? -8 : 0,
                                position: 'relative',
                                zIndex: app.evaluators.length - idx,
                              }}
                            >
                              {(evaluator.fullName || evaluator.username || 'E').charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                        {app.evaluators.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                            +{app.evaluators.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No evaluators
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{app.date}</span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '13px 16px' }}>
                    <StatusBadge status={app.status} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatus(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        style={{
                          padding: '5px 8px', borderRadius: 6,
                          border: '1px solid #ede9e9',
                          fontSize: '0.75rem', cursor: 'pointer',
                          background: '#fff', color: '#374151',
                          outline: 'none',
                          opacity: updatingId === app.id ? 0.5 : 1,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="approved">Approved</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      {/* View CV */}
                      {app.cv && (
                        <button
                          onClick={() => handleViewDoc(app.cv)}
                          title="View CV"
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none',
                            background: '#f8f7f5', color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiEye size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '10px 16px', borderTop: '1px solid #f0eded',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#faf9f9',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Showing <strong style={{ color: '#374151' }}>{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</strong> of <strong style={{ color: '#374151' }}>{total}</strong> applications
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #ede9e9',
                  background: page === 1 ? '#f8f7f5' : '#fff', color: page === 1 ? '#94a3b8' : '#374151',
                  fontSize: '0.75rem', cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Page {page} of {Math.ceil(total / limit) || 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / limit) || total === 0}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #ede9e9',
                  background: (page >= Math.ceil(total / limit) || total === 0) ? '#f8f7f5' : '#fff',
                  color: (page >= Math.ceil(total / limit) || total === 0) ? '#94a3b8' : '#374151',
                  fontSize: '0.75rem', cursor: (page >= Math.ceil(total / limit) || total === 0) ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && <DocumentPreview url={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
};

export default ApplicationManagement;
