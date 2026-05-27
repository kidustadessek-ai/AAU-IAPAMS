import React, { useState, useEffect } from 'react';
import { FiFileText, FiCalendar, FiUser, FiDownload, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { getMyApplications } from '../../services/applicationService';
import DocumentPreview from '../../components/common/DocumentPreview';

const STATUS_STYLE = {
  pending:             { text: 'Applied',             bg: '#fefce8', color: '#a16207', icon: FiClock },
  under_review:        { text: 'Under Review',        bg: '#eff6ff', color: '#1e40af', icon: FiClock },
  shortlisted:         { text: 'Shortlisted',         bg: '#f0fdf4', color: '#15803d', icon: FiCheckCircle },
  interview_scheduled: { text: 'Interview Scheduled', bg: '#f0f9ff', color: '#0369a1', icon: FiCalendar },
  rejected:            { text: 'Not Selected',        bg: '#fef2f2', color: '#dc2626', icon: FiXCircle },
  accepted:            { text: 'Accepted',            bg: '#f0fdf4', color: '#15803d', icon: FiCheckCircle },
};

const MyApplications = () => {
  const { auth } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await getMyApplications(auth.tokens.accessToken).catch(err => {
        console.error('Applications fetch error:', err);
        return { success: false, data: [] };
      });
      if (res.success) {
        const apps = Array.isArray(res.data.data) ? [...res.data.data] : [];
        setApplications(apps);
      } else {
        setApplications([]);
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const Shimmer = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 180, borderRadius: 12, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>My Applications</h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>View the status and details of your submitted applications</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#fdf0f0', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiFileText size={14} color="#7B1113" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7B1113' }}>{applications.length} applications</span>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right,#7B1113,transparent)', marginTop: 16, opacity: 0.3 }} />
      </div>

      {/* Loading */}
      {isLoading && <Shimmer />}

      {/* Empty State */}
      {!isLoading && applications.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0eded', padding: '48px 24px', textAlign: 'center' }}>
          <FiFileText size={32} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a2e', margin: '0 0 6px' }}>You haven't applied to any positions yet.</p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Explore available positions to submit your application.</p>
        </div>
      )}

      {/* Applications List */}
      {!isLoading && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map(app => {
            const status = STATUS_STYLE[app.status] || { text: 'Applied', bg: '#fefce8', color: '#a16207', icon: FiClock };
            const StatusIcon = status.icon;
            return (
              <div key={app._id} style={{
                background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
                padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,17,19,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Top row: title + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>{app.position.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#7B1113', fontWeight: 600 }}>{app.position.department}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: status.bg }}>
                    <StatusIcon size={13} color={status.color} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: status.color }}>{status.text}</span>
                  </div>
                </div>

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <FiCalendar size={14} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied At</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e' }}>{new Date(app.appliedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <FiUser size={14} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e' }}>{app.applicant.username}</p>
                      <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{app.applicant.email}</p>
                    </div>
                  </div>
                </div>

                {/* Interview Details */}
                {(app.status === 'interview_scheduled' || app.interview) && app.interview && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '2px solid #0284c7',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <FiCalendar size={16} color="#fff" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0369a1' }}>Interview Scheduled</h4>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#0c4a6e' }}>{app.interview.date || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#0c4a6e' }}>{app.interview.time || 'N/A'}</p>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#0c4a6e' }}>{app.interview.location || 'N/A'}</p>
                      </div>
                    </div>
                    <div style={{
                      marginTop: 12,
                      padding: 10,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      color: '#0c4a6e',
                      lineHeight: 1.5,
                    }}>
                      <strong>📌 Important:</strong> Please arrive 15 minutes early and bring a valid ID and copies of your credentials.
                    </div>
                  </div>
                )}

                {/* Documents section */}
                <div style={{ borderTop: '1px solid #f8f5f5', paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <FiFileText size={13} color="#7B1113" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e' }}>Submitted Documents</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {app.documents.cv ? (
                      <button onClick={() => setPreviewDoc(app.documents.cv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#fdf0f0', color: '#7B1113', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #f8e5e5', transition: 'all 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fce5e5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fdf0f0'}>
                        <FiDownload size={12} /> View CV
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1', padding: '6px 12px', borderRadius: 7, background: '#f8fafc' }}>No CV uploaded</span>
                    )}
                    {app.documents.coverLetter ? (
                      <button onClick={() => setPreviewDoc(app.documents.coverLetter)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#fdf0f0', color: '#7B1113', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #f8e5e5', transition: 'all 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fce5e5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fdf0f0'}>
                        <FiDownload size={12} /> Cover Letter
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1', padding: '6px 12px', borderRadius: 7, background: '#f8fafc' }}>No cover letter</span>
                    )}
                    {app.documents.certificates && app.documents.certificates.length > 0 ? (
                      app.documents.certificates.map((cert, i) => (
                        <button key={i} onClick={() => setPreviewDoc(cert)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#fdf0f0', color: '#7B1113', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #f8e5e5', transition: 'all 0.15s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fce5e5'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fdf0f0'}>
                          <FiDownload size={12} /> Certificate {i + 1}
                        </button>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1', padding: '6px 12px', borderRadius: 7, background: '#f8fafc' }}>No certificates</span>
                    )}
                  </div>
                </div>

                {/* Footer: Application ID */}
                <div style={{ borderTop: '1px solid #f8f5f5', marginTop: 14, paddingTop: 10 }}>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: '#cbd5e1', fontFamily: 'monospace' }}>Application ID: {app._id}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview */}
      {previewDoc && <DocumentPreview url={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
};

export default MyApplications;
