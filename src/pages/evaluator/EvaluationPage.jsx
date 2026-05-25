import { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Paper, Divider, TextField, Button, Rating, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, Avatar } from '@mui/material';
import { Download as DownloadIcon, Check as CheckIcon, Close as CloseIcon, Edit as EditIcon, Visibility as VisibilityIcon, RefreshOutlined } from '@mui/icons-material';
import { FiFileText, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import { getUserProfile, submitEvaluation, getEvaluations } from '../../services/applicationService';
import toast from 'react-hot-toast';



const EvaluationPage = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState({ position: {}, applicant: {}, documents: {}, evaluations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scores, setScores] = useState({ experience: 0, education: 0, skills: 0 });
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const { auth } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = auth?.tokens?.accessToken;
      const [profileRes, evalRes] = await Promise.all([
        getUserProfile(token),
        getEvaluations(token)
      ]);
      if (profileRes.success) setUserProfile(profileRes.data);
      if (evalRes.success) setApplications(evalRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
      toast.error(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth]);

  const getStats = () => ({
    total: applications.length,
    evaluated: applications.filter(a => a.averageScore && a.averageScore !== 0).length,
    pending: applications.filter(a => !a.averageScore || a.averageScore === 0).length,
  });

  const handleOpenDialog = (type, app = null) => {
    if (app) {
      setSelectedApp(app);
      const existingEval = app.evaluations?.find(
        e => e.evaluator._id === userProfile?._id
      );
      if (existingEval) {
        setScores(existingEval.scores);
        setComments(existingEval.comments);
      } else {
        // Reset form when no existing evaluation
        setScores({
          experience: 0,
          education: 0,
          skills: 0
        });
        setComments('');
      }
    }
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleScoreChange = (criteria, value) => {
    setScores(prev => ({
      ...prev,
      [criteria]: value
    }));
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedApp) return;

    setIsSubmitting(true);

    try {
      const res = await submitEvaluation(
        selectedApp._id,
        { scores, comments },
        auth?.tokens?.accessToken
      );

      if (res.success) {
        toast.success('Evaluation submitted successfully!');
        handleCloseDialog();
        await fetchData(); 
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasEvaluated = (app) => app.averageScore && app.averageScore !== 0;

  const stats = getStats();

  const STATS_CARDS = [
    { key: 'total', label: 'Total Applications', sub: 'Assigned to you', icon: FiFileText, accent: '#7B1113', light: '#fdf0f0' },
    { key: 'evaluated', label: 'Evaluated', sub: 'Completed reviews', icon: FiCheckCircle, accent: '#15803d', light: '#f0fdf4' },
    { key: 'pending', label: 'Pending Review', sub: 'Awaiting evaluation', icon: FiClock, accent: '#C9A84C', light: '#fefce8' },
  ];

  const Skeleton = () => (
    <div style={{
      height: 28, width: 56, borderRadius: 6,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );



  return (
    <div style={{ minHeight: '100%' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              Evaluation Dashboard
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              {today}
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: '#7B1113', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RefreshOutlined style={{ fontSize: 16 }} /> Refresh
          </button>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', marginTop: 16, opacity: 0.3 }} />
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {STATS_CARDS.map(({ key, label, sub, icon: Icon, accent, light }) => (
          <div key={key} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
            padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                  {label}
                </p>
                <p style={{ fontSize: '0.68rem', color: '#c4bfbf', margin: '2px 0 0', fontWeight: 400 }}>
                  {sub}
                </p>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: light,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={17} color={accent} />
              </div>
            </div>
            {loading ? <Skeleton /> : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, letterSpacing: -1 }}>
                  {stats[key]}
                </span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: accent, opacity: 0.15, borderRadius: '0 0 12px 12px' }} />
          </div>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" style={{ marginBottom: 20 }}>{error}</Alert>
      ) : applications.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
          padding: 40, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <FiUsers size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: '0 0 8px' }}>
            No Applications Assigned
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            You currently don't have any applications to evaluate.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
          padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>Applications to Evaluate</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {applications.map(app => (
              <div key={app._id} style={{
                background: '#fff', borderRadius: 10, border: '1px solid #f0eded',
                padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(123,17,19,0.1)';
                e.currentTarget.style.borderColor = '#7B1113';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#f0eded';
              }}>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {app?.position?.title}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px' }}>
                    Applicant: {app?.applicant?.username}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 4px' }}>
                    Department: {app?.position?.department}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
                    Applied: {new Date(app?.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenDialog('details', app)}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb',
                      background: '#fff', color: '#374151', fontSize: '0.72rem', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <VisibilityIcon style={{ fontSize: 14 }} /> Details
                  </button>

                  {hasEvaluated(app) ? (
                    <button
                      onClick={() => handleOpenDialog('evaluate', app)}
                      style={{
                        padding: '6px 12px', borderRadius: 6, border: 'none',
                        background: '#15803d', color: '#fff', fontSize: '0.72rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <CheckIcon style={{ fontSize: 14 }} /> Re-evaluate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenDialog('evaluate', app)}
                      style={{
                        padding: '6px 12px', borderRadius: 6, border: 'none',
                        background: '#7B1113', color: '#fff', fontSize: '0.72rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <EditIcon style={{ fontSize: 14 }} /> Evaluate
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDialog('summary', app)}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb',
                      background: '#fff', color: '#374151', fontSize: '0.72rem', fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Summary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog 
        open={openDialog && dialogType === 'details'} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle style={{
          background: 'linear-gradient(135deg, #7B1113 0%, #5a0c0e 100%)',
          color: '#fff',
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <VisibilityIcon style={{ fontSize: 22 }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Application Details</span>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            style={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: '#fff',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: '24px', background: '#fafafa' }}>
          {selectedApp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Applicant Information */}
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: '18px 20px',
                border: '1px solid #f0eded',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    Applicant Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px 16px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Name:</span>
                  <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 500 }}>
                    {selectedApp.applicant?.username}
                  </span>
                  
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Email:</span>
                  <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 500 }}>
                    {selectedApp.applicant?.email}
                  </span>
                </div>
              </div>

              {/* Position Information */}
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: '18px 20px',
                border: '1px solid #f0eded',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    Position Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px 16px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Title:</span>
                  <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 500 }}>
                    {selectedApp.position?.title}
                  </span>
                  
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Department:</span>
                  <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 500 }}>
                    {selectedApp.position?.department}
                  </span>
                </div>
              </div>

              {/* Application Documents */}
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: '18px 20px',
                border: '1px solid #f0eded',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    Application Documents
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href={selectedApp.documents?.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #7B1113',
                      background: '#fff',
                      color: '#7B1113',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#7B1113';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.color = '#7B1113';
                    }}
                  >
                    <DownloadIcon style={{ fontSize: 16 }} />
                    Download CV
                  </a>
                  
                  {selectedApp.documents?.coverLetter && (
                    <a
                      href={selectedApp.documents?.coverLetter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #7B1113',
                        background: '#fff',
                        color: '#7B1113',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7B1113';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#7B1113';
                      }}
                    >
                      <DownloadIcon style={{ fontSize: 16 }} />
                      Download Cover Letter
                    </a>
                  )}
                  
                  {selectedApp.documents?.certificates?.map((cert, index) => (
                    <a
                      key={index}
                      href={cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #7B1113',
                        background: '#fff',
                        color: '#7B1113',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7B1113';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#7B1113';
                      }}
                    >
                      <DownloadIcon style={{ fontSize: 16 }} />
                      Certificate {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #f0eded' }}>
          <button
            onClick={handleCloseDialog}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: '#7B1113',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>

      {/* Evaluation Form Dialog */}
      <Dialog 
        open={openDialog && dialogType === 'evaluate'} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle style={{
          background: 'linear-gradient(135deg, #7B1113 0%, #5a0c0e 100%)',
          color: '#fff',
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EditIcon style={{ fontSize: 22 }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Evaluation Form</span>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            style={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: '#fff',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: '24px', background: '#fafafa' }}>
          {selectedApp && (
            <div>
              {/* Application Info Banner */}
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 20,
                border: '1px solid #f0eded',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Position
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '4px 0 0', lineHeight: 1.3 }}>
                    {selectedApp.position?.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Applicant:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e' }}>
                    {selectedApp.applicant?.username}
                  </span>
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Experience */}
                <div style={{
                  background: '#fff',
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid #f0eded',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>
                      Experience
                    </label>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#7B1113',
                      background: '#fdf0f0',
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}>
                      {scores.experience}/10
                    </span>
                  </div>
                  <Rating
                    name="experience"
                    value={scores.experience}
                    onChange={(e, newValue) => handleScoreChange('experience', newValue)}
                    max={10}
                    precision={0.5}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': { color: '#7B1113' },
                      '& .MuiRating-iconHover': { color: '#7B1113' },
                    }}
                  />
                </div>

                {/* Education */}
                <div style={{
                  background: '#fff',
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid #f0eded',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>
                      Education
                    </label>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#7B1113',
                      background: '#fdf0f0',
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}>
                      {scores.education}/10
                    </span>
                  </div>
                  <Rating
                    name="education"
                    value={scores.education}
                    onChange={(e, newValue) => handleScoreChange('education', newValue)}
                    max={10}
                    precision={0.5}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': { color: '#7B1113' },
                      '& .MuiRating-iconHover': { color: '#7B1113' },
                    }}
                  />
                </div>

                {/* Skills */}
                <div style={{
                  background: '#fff',
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid #f0eded',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>
                      Skills
                    </label>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#7B1113',
                      background: '#fdf0f0',
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}>
                      {scores.skills}/10
                    </span>
                  </div>
                  <Rating
                    name="skills"
                    value={scores.skills}
                    onChange={(e, newValue) => handleScoreChange('skills', newValue)}
                    max={10}
                    precision={0.5}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': { color: '#7B1113' },
                      '& .MuiRating-iconHover': { color: '#7B1113' },
                    }}
                  />
                </div>

                {/* Average Score Display */}
                <div style={{
                  background: 'linear-gradient(135deg, #7B1113 0%, #5a0c0e 100%)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    Average Score
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C9A84C' }}>
                    {((scores.experience + scores.education + scores.skills) / 3).toFixed(1)}/10
                  </span>
                </div>

                {/* Comments */}
                <div style={{
                  background: '#fff',
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid #f0eded',
                }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 10 }}>
                    Comments & Feedback
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide detailed feedback about the applicant's qualifications..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7B1113'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #f0eded' }}>
          <button
            onClick={handleCloseDialog}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitEvaluation}
            disabled={isSubmitting}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: isSubmitting ? '#94a3b8' : '#7B1113',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={16} style={{ color: '#fff' }} />
                Submitting...
              </>
            ) : (
              <>
                <CheckIcon style={{ fontSize: 18 }} />
                Submit Evaluation
              </>
            )}
          </button>
        </DialogActions>
      </Dialog>

      {/* Evaluation Summary Dialog */}
      <Dialog 
        open={openDialog && dialogType === 'summary'} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle style={{
          background: 'linear-gradient(135deg, #7B1113 0%, #5a0c0e 100%)',
          color: '#fff',
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCheckCircle size={22} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Evaluation Summary</span>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            style={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: '#fff',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: '24px', background: '#fafafa' }}>
          {selectedApp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Application Header */}
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: '18px 20px',
                border: '1px solid #f0eded',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' }}>
                  {selectedApp.position?.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Applicant: <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{selectedApp?.applicant?.username}</span>
                </p>
              </div>

              {/* Score & Status Card */}
              <div style={{
                background: 'linear-gradient(135deg, #7B1113 0%, #5a0c0e 100%)',
                borderRadius: 10,
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(123,17,19,0.2)',
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Average Score
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#C9A84C', lineHeight: 1 }}>
                      {selectedApp.averageScore?.toFixed(1) || 'N/A'}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>/10</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </p>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '6px 16px',
                    borderRadius: 8,
                    background: selectedApp?.status === 'accepted' ? '#15803d' :
                      selectedApp?.status === 'rejected' ? '#dc2626' : '#C9A84C',
                    color: '#fff',
                    textTransform: 'capitalize',
                  }}>
                    {selectedApp?.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Evaluator Feedback Section */}
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: '18px 20px',
                border: '1px solid #f0eded',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    Evaluator Feedback
                  </h3>
                </div>

                {selectedApp.evaluations?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selectedApp.evaluations.map((evalItem, index) => (
                      <div
                        key={index}
                        style={{
                          background: '#fafafa',
                          borderRadius: 8,
                          padding: '16px',
                          border: '1px solid #f0eded',
                        }}
                      >
                        {/* Evaluator Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#7B1113',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 700,
                          }}>
                            {evalItem.evaluator?.username?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                              {evalItem.evaluator?.username}
                            </p>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>
                              {new Date(evalItem.submittedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Scores Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 10,
                          marginBottom: 12,
                        }}>
                          <div style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '10px 12px',
                            textAlign: 'center',
                            border: '1px solid #f0eded',
                          }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase' }}>
                              Experience
                            </p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7B1113', margin: 0 }}>
                              {evalItem.scores.experience}
                            </p>
                          </div>
                          <div style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '10px 12px',
                            textAlign: 'center',
                            border: '1px solid #f0eded',
                          }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase' }}>
                              Education
                            </p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7B1113', margin: 0 }}>
                              {evalItem.scores.education}
                            </p>
                          </div>
                          <div style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '10px 12px',
                            textAlign: 'center',
                            border: '1px solid #f0eded',
                          }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase' }}>
                              Skills
                            </p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7B1113', margin: 0 }}>
                              {evalItem.scores.skills}
                            </p>
                          </div>
                        </div>

                        {/* Comments */}
                        {evalItem.comments && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '12px 14px',
                            border: '1px solid #f0eded',
                          }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase' }}>
                              Comments
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#1a1a2e', margin: 0, lineHeight: 1.5 }}>
                              {evalItem.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <FiUsers size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      No evaluations submitted yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #f0eded' }}>
          <button
            onClick={handleCloseDialog}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: '#7B1113',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EvaluationPage;