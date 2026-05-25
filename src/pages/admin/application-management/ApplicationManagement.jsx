import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { getColleges } from '../../../data/aauStructure';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiChevronDown, FiDownload, FiCheck, FiX } from 'react-icons/fi';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      bg: '#fefce8', color: '#a16207', dot: '#ca8a04' },
  under_review: { label: 'Under Review', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  shortlisted:  { label: 'Shortlisted',  bg: '#fdf0f0', color: '#7B1113', dot: '#7B1113' },
  accepted:     { label: 'Accepted',     bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
  rejected:     { label: 'Rejected',     bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
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
    {[...Array(7)].map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <div style={{ height: 12, borderRadius: 4, background: '#f1f5f9', width: i === 0 ? 140 : i === 6 ? 80 : 100 }} />
      </td>
    ))}
  </tr>
);

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', college: 'all', search: '' });

  const colleges = getColleges();

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      const apps = res.data?.data || [];
      setApplications(apps.map(app => ({
        id: app._id,
        name: app.applicant?.fullName || app.applicant?.username || 'Unknown',
        email: app.applicant?.email || '—',
        position: app.position?.title || '—',
        college: app.position?.college || '—',
        department: app.position?.department || '—',
        date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: app.status,
        cv: app.documents?.cv || null,
      })));
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
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
              {applications.length}
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
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
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
        <div style={{ position: 'relative' }}>
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
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <FiChevronDown size={12} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* College filter */}
        <div style={{ position: 'relative' }}>
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

        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
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
                {['Applicant', 'Position', 'College', 'Department', 'Applied', 'Status', 'Actions'].map(h => (
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No applications match your filters
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
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#fdf0f0', color: '#7B1113',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {app.name.charAt(0).toUpperCase()}
                      </div>
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
                      {app.college?.split(' ').slice(0, 3).join(' ')}
                    </span>
                  </td>

                  {/* Department */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {app.department?.length > 22 ? app.department.substring(0, 22) + '…' : app.department}
                    </span>
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
                      {/* Shortlist */}
                      <button
                        onClick={() => handleStatus(app.id, 'shortlisted')}
                        disabled={updatingId === app.id || app.status === 'shortlisted'}
                        title="Shortlist"
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none',
                          background: app.status === 'shortlisted' ? '#f0fdf4' : '#f8f7f5',
                          color: '#15803d', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          opacity: updatingId === app.id ? 0.5 : 1,
                        }}
                      >
                        <FiCheck size={13} />
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => handleStatus(app.id, 'rejected')}
                        disabled={updatingId === app.id || app.status === 'rejected'}
                        title="Reject"
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none',
                          background: app.status === 'rejected' ? '#fef2f2' : '#f8f7f5',
                          color: '#dc2626', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          opacity: updatingId === app.id ? 0.5 : 1,
                        }}
                      >
                        <FiX size={13} />
                      </button>

                      {/* Download CV */}
                      {app.cv && (
                        <a
                          href={app.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download CV"
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: '#f8f7f5', color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            textDecoration: 'none',
                          }}
                        >
                          <FiDownload size={13} />
                        </a>
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
              Showing <strong style={{ color: '#374151' }}>{filtered.length}</strong> of <strong style={{ color: '#374151' }}>{applications.length}</strong> applications
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
