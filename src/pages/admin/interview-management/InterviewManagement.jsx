import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { getColleges } from '../../../data/aauStructure';
import toast from 'react-hot-toast';
import { FiSearch, FiChevronDown, FiCalendar, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  pending:             { label: 'Pending',             bg: '#fefce8', color: '#a16207', dot: '#ca8a04' },
  under_review:        { label: 'Under Review',        bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  shortlisted:         { label: 'Shortlisted',         bg: '#fdf0f0', color: '#7B1113', dot: '#7B1113' },
  approved:            { label: 'Approved',            bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
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
    {[...Array(6)].map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <div style={{ height: 12, borderRadius: 4, background: '#f1f5f9', width: i === 0 ? 40 : 100 }} />
      </td>
    ))}
  </tr>
);

const InterviewModal = ({ onClose, onSubmit, selectedCount }) => {
  const [formData, setFormData] = useState({ date: '', time: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  const formatTimeTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    // Determine time of day
    let timeOfDay = '';
    if (hour >= 5 && hour < 12) {
      timeOfDay = ' (Morning)';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = ' (Afternoon)';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = ' (Evening)';
    } else {
      timeOfDay = ' (Night)';
    }
    
    return `${hour12}:${minutes} ${ampm}${timeOfDay}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.location) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    const formattedData = {
      ...formData,
      time: formatTimeTo12Hour(formData.time)
    };
    await onSubmit(formattedData);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, maxWidth: 500, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f0eded',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#fdf0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiCalendar size={20} color="#7B1113" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                Schedule Interview
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
                {selectedCount} candidate{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: '#f8f7f5', color: '#64748b', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Interview Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #ede9e9', fontSize: '0.85rem',
                  outline: 'none', color: '#1a1a2e',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Interview Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #ede9e9', fontSize: '0.85rem',
                  outline: 'none', color: '#1a1a2e',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Interview Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Building, Room 301"
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #ede9e9', fontSize: '0.85rem',
                  outline: 'none', color: '#1a1a2e',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 8,
                border: '1px solid #ede9e9', background: '#fff',
                color: '#64748b', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 8,
                border: 'none', background: submitting ? '#94a3b8' : '#7B1113',
                color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InterviewManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', college: 'all', search: '' });
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
        phone: app.applicant?.phone || '—',
        profilePhoto: app.applicant?.profilePhoto || null,
        position: app.position?.title || '—',
        college: app.position?.college || '—',
        date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: app.status,
      })));
    } catch (error) {
      console.error('Fetch applications error:', error);
      setApplications([]);
      setTotal(0);
    } finally {
      setTimeout(() => setLoading(false), 100);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filtered.map(a => a.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleScheduleInterview = async (interviewDetails) => {
    try {
      await api.post('/applications/schedule-interviews', {
        applicationIds: selected,
        interviewDetails,
      });
      toast.success(`Interview scheduled for ${selected.length} candidate(s)`);
      setShowModal(false);
      setSelected([]);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interviews');
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
                Interview Management
              </h1>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 11px' }}>
              Schedule interviews and manage candidate invitations
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={selected.length === 0}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: selected.length === 0 ? '#f8f7f5' : '#7B1113',
              color: selected.length === 0 ? '#94a3b8' : '#fff',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <FiCalendar size={16} />
            Call for Interview ({selected.length})
          </button>
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
            <option value="shortlisted">Shortlisted</option>
            <option value="approved">Approved</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <FiChevronDown size={12} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

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
                <th style={{ padding: '11px 16px', textAlign: 'left', width: 40 }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                </th>
                {['Applicant', 'Position', 'College', 'Phone', 'Applied', 'Status'].map(h => (
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
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No applications found
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No applications match your filters. <button onClick={() => setFilters({ status: 'all', college: 'all', search: '' })} style={{ color: '#7B1113', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Clear filters</button>
                  </td>
                </tr>
              ) : filtered.map((app, i) => (
                <tr
                  key={app.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f8f5f5' : 'none',
                    transition: 'background 0.1s',
                    background: selected.includes(app.id) ? '#fdf9f9' : 'transparent',
                  }}
                  onMouseEnter={e => !selected.includes(app.id) && (e.currentTarget.style.background = '#fdf9f9')}
                  onMouseLeave={e => !selected.includes(app.id) && (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '13px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(app.id)}
                      onChange={() => handleSelect(app.id)}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                  </td>

                  <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {app.profilePhoto ? (
                        <img
                          src={app.profilePhoto}
                          alt={app.name}
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
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

                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>
                      {app.position.length > 28 ? app.position.substring(0, 28) + '…' : app.position}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {app.college && app.college !== '—' ? app.college.split(' ').slice(0, 3).join(' ') : 'N/A'}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.phone}</span>
                  </td>

                  <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{app.date}</span>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <StatusBadge status={app.status} />
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

      {/* Interview Modal */}
      <AnimatePresence>
        {showModal && (
          <InterviewModal
            onClose={() => setShowModal(false)}
            onSubmit={handleScheduleInterview}
            selectedCount={selected.length}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewManagement;
