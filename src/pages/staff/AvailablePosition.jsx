import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiSearch, FiCalendar, FiX, FiUpload, FiCheckCircle, FiFilter, FiArrowRight, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getPositions } from '../../services/positionService';
import { useAuth } from '../../context/authContext';
import { getMyApplications, applyToPosition } from '../../services/applicationService';
import { getColleges } from '../../data/aauStructure';
import DocumentPreview from '../../components/common/DocumentPreview';

const STATUS_STYLE = {
  pending:      { text: 'Applied',      bg: '#fefce8', color: '#a16207' },
  under_review: { text: 'Under Review', bg: '#eff6ff', color: '#1e40af' },
  shortlisted:  { text: 'Shortlisted',  bg: '#f0fdf4', color: '#15803d' },
  rejected:     { text: 'Not Selected', bg: '#fef2f2', color: '#dc2626' },
  accepted:     { text: 'Accepted',     bg: '#f0fdf4', color: '#15803d' },
};

const TABS = [
  { value: 'all',      label: 'All Positions' },
  { value: 'eligible', label: 'Eligible to Apply' },
  { value: 'applied',  label: 'My Applications' },
];

const AvailablePositions = () => {
  const { auth } = useAuth();
  const [positions, setPositions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({ cv: null, coverLetter: null, certificates: [] });
  const [previewDoc, setPreviewDoc] = useState(null);

  const colleges = getColleges();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [posRes, appRes] = await Promise.all([getPositions({ status: 'open' }), getMyApplications()]);
      if (posRes.success) setPositions(posRes.data || []);
      if (appRes.success) setApplications(Array.isArray(appRes.data.data) ? appRes.data.data : []);
      else setApplications([]);
    } catch (error) {
      console.error('Fetch data error:', error);
      setPositions([]);
      setApplications([]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const appliedIds = applications.map(a => typeof a.position === 'object' ? a.position?._id : a.position).filter(Boolean);
    let result = [...positions];
    if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
    if (college) result = result.filter(p => p.college === college);
    if (tab === 'applied') result = result.filter(p => appliedIds.includes(p._id));
    else if (tab === 'eligible') result = result.filter(p => !appliedIds.includes(p._id));
    setFiltered(result);
  }, [positions, applications, search, college, tab]);

  const getAppStatus = (positionId) => {
    const app = applications.find(a => (typeof a.position === 'object' ? a.position?._id : a.position) === positionId);
    return app ? (STATUS_STYLE[app.status] || { text: 'Applied', bg: '#fefce8', color: '#a16207' }) : null;
  };

  const getAppDetails = (positionId) =>
    applications.find(a => (typeof a.position === 'object' ? a.position?._id : a.position) === positionId) || null;

  const handleApply = async () => {
    if (!files.cv) { toast.error('CV is required'); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('positionId', selected._id);
      formData.append('cv', files.cv);
      if (files.coverLetter) formData.append('coverLetter', files.coverLetter);
      files.certificates.forEach(c => formData.append('certificates', c));
      const res = await applyToPosition(formData);
      if (res.success) {
        toast.success('Application submitted successfully!');
        setSelected(null);
        setFiles({ cv: null, coverLetter: null, certificates: [] });
        fetchData();
      }
    } catch (e) { toast.error(e.message || 'Failed to submit'); }
    finally { setIsSubmitting(false); }
  };

  const closeDialog = () => { setSelected(null); setFiles({ cv: null, coverLetter: null, certificates: [] }); };

  const Shimmer = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ height: 200, borderRadius: 12, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100%' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Available Positions</h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>Browse and apply for open positions at Addis Ababa University</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#fdf0f0', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiBriefcase size={14} color="#7B1113" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7B1113' }}>{filtered.length} positions</span>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right,#7B1113,transparent)', marginTop: 16, opacity: 0.3 }} />
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0eded', padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <FiSearch size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search positions..."
              style={{ width: '100%', paddingLeft: 34, paddingRight: 12, height: 38, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', color: '#1a1a2e' }}
            />
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <select
              value={college} onChange={e => setCollege(e.target.value)}
              style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', padding: '0 12px', outline: 'none', color: college ? '#1a1a2e' : '#94a3b8', background: '#fff', boxSizing: 'border-box' }}
            >
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {(search || college) && (
            <button onClick={() => { setSearch(''); setCollege(''); }}
              style={{ height: 38, padding: '0 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiX size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #f0eded', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            style={{
              padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: 'none', background: 'none', borderBottom: tab === t.value ? '2px solid #7B1113' : '2px solid transparent',
              color: tab === t.value ? '#7B1113' : '#94a3b8', transition: 'all 0.15s', marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? <Shimmer /> : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0eded', padding: '48px 24px', textAlign: 'center' }}>
          <FiBriefcase size={32} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            {tab === 'applied' ? "You haven't applied to any positions yet" : 'No positions match your criteria'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(pos => {
            const appStatus = getAppStatus(pos._id);
            const expired = new Date(pos.deadline) < new Date();
            return (
              <div key={pos._id} style={{
                background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
                padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 12,
                transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,17,19,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Top badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: '#fdf0f0', color: '#7B1113' }}>
                    {pos.positionType}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {expired && <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: '#fef2f2', color: '#dc2626' }}>Closed</span>}
                    {appStatus && <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: appStatus.bg, color: appStatus.color }}>{appStatus.text}</span>}
                  </div>
                </div>

                {/* Title & dept */}
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>{pos.title}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.72rem', fontWeight: 600, color: '#7B1113' }}>{pos.college}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{pos.department}</p>
                </div>

                {/* Description */}
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, flexGrow: 1 }}>
                  {pos.description?.length > 110 ? `${pos.description.substring(0, 110)}...` : pos.description}
                </p>

                {/* Deadline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FiCalendar size={12} color="#94a3b8" />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Deadline: {new Date(pos.deadline).toLocaleDateString()}</span>
                </div>

                {/* Divider + Actions */}
                <div style={{ borderTop: '1px solid #f8f5f5', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setSelected(pos)}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <FiFileText size={12} /> Details
                  </button>
                  {!appStatus && !expired && (
                    <button onClick={() => setSelected(pos)}
                      style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: '#7B1113', border: 'none', borderRadius: 7, padding: '5px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      Apply Now <FiArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Apply Dialog */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeDialog(); }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Dialog header */}
            <div style={{ background: '#7B1113', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{selected.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{selected.college} · {selected.department}</p>
              </div>
              <button onClick={closeDialog} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FiX size={15} />
              </button>
            </div>

            {/* Dialog body */}
            <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  ['Position Type', selected.positionType],
                  ['Deadline', new Date(selected.deadline).toLocaleDateString()],
                  ['College', selected.college],
                  ['Department', selected.department],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a2e' }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, color: '#1a1a2e' }}>Description</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7 }}>{selected.description}</p>
              </div>

              {/* Requirements */}
              {selected.requirements?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, color: '#1a1a2e' }}>Requirements</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {selected.requirements.map((r, i) => (
                      <li key={i} style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Already applied */}
              {getAppStatus(selected._id) && (() => {
                const s = getAppStatus(selected._id);
                const app = getAppDetails(selected._id);
                return (
                  <div style={{ borderTop: '1px solid #f0eded', paddingTop: 16 }}>
                    <div style={{ background: s.bg, borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiCheckCircle size={14} color={s.color} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: s.color }}>Application Status: {s.text}</span>
                    </div>
                    {app?.documents && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {app.documents.cv && <button onClick={() => setPreviewDoc(app.documents.cv)} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#fdf0f0', color: '#7B1113', border: 'none', cursor: 'pointer' }}>View CV</button>}
                        {app.documents.coverLetter && <button onClick={() => setPreviewDoc(app.documents.coverLetter)} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#fdf0f0', color: '#7B1113', border: 'none', cursor: 'pointer' }}>Cover Letter</button>}
                        {app.documents.certificates?.map((c, i) => <button key={i} onClick={() => setPreviewDoc(c)} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#fdf0f0', color: '#7B1113', border: 'none', cursor: 'pointer' }}>Certificate {i + 1}</button>)}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Upload form */}
              {!getAppStatus(selected._id) && new Date(selected.deadline) >= new Date() && (
                <div style={{ borderTop: '1px solid #f0eded', paddingTop: 16 }}>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 700, color: '#1a1a2e' }}>Upload Documents</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      { id: 'cv', label: 'CV / Resume', required: true, accept: '.pdf,.doc,.docx', multiple: false },
                      { id: 'coverLetter', label: 'Cover Letter', required: false, accept: '.pdf,.doc,.docx', multiple: false },
                      { id: 'certificates', label: 'Certificates', required: false, accept: '.pdf,.jpg,.jpeg,.png', multiple: true },
                    ].map(({ id, label, required, accept, multiple }) => {
                      const val = id === 'certificates' ? (files.certificates.length > 0 ? `${files.certificates.length} file(s)` : null) : files[id]?.name || null;
                      return (
                        <div key={id}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                            {label} {required && <span style={{ color: '#7B1113' }}>*</span>}
                            {!required && <span style={{ color: '#94a3b8', fontWeight: 400 }}> (optional)</span>}
                          </p>
                          <label htmlFor={id} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 6, padding: '14px 8px', borderRadius: 8, cursor: 'pointer',
                            border: `2px dashed ${val ? '#7B1113' : '#e2e8f0'}`,
                            background: val ? '#fdf8f8' : '#f8fafc', transition: 'all 0.15s',
                          }}>
                            <input id={id} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }}
                              onChange={e => {
                                if (id === 'certificates') setFiles(f => ({ ...f, certificates: [...e.target.files] }));
                                else setFiles(f => ({ ...f, [id]: e.target.files[0] }));
                              }} />
                            {val
                              ? <><FiCheckCircle size={16} color="#7B1113" /><span style={{ fontSize: '0.68rem', color: '#7B1113', fontWeight: 600, textAlign: 'center', wordBreak: 'break-all' }}>{val}</span></>
                              : <><FiUpload size={16} color="#94a3b8" /><span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Click to upload</span></>
                            }
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dialog footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f0eded', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeDialog}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                Close
              </button>
              {!getAppStatus(selected._id) && new Date(selected.deadline) >= new Date() && (
                <button onClick={handleApply} disabled={!files.cv || isSubmitting}
                  style={{
                    padding: '8px 22px', borderRadius: 8, border: 'none', fontSize: '0.8rem', fontWeight: 600,
                    background: !files.cv || isSubmitting ? '#e2e8f0' : '#7B1113',
                    color: !files.cv || isSubmitting ? '#94a3b8' : '#fff',
                    cursor: !files.cv || isSubmitting ? 'not-allowed' : 'pointer', minWidth: 150,
                  }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview */}
      {previewDoc && <DocumentPreview url={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
};

export default AvailablePositions;
