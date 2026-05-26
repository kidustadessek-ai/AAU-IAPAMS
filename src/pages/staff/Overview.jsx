import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { getMyApplications } from '../../services/applicationService';
import { getUserProfile } from '../../services/userService';
import { getPositions } from '../../services/positionService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiClock, FiBell, FiArrowRight } from 'react-icons/fi';

const StaffHome = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetchData();
  }, [auth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userRes, appsRes, positionsRes] = await Promise.all([
        getUserProfile(),
        getMyApplications(),
        getPositions()
      ]);
      
      console.log('User profile response:', userRes);
      
      if (userRes.success && userRes.data) {
        const userData = userRes.data.data || userRes.data;
        console.log('Setting user data:', userData);
        setUser(userData);
      }
      if (appsRes.success) setApplications(Array.isArray(appsRes.data.data) ? appsRes.data.data : []);
      if (positionsRes.success) setPositions(positionsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const completeness = user ? calculateCompleteness(user) : 0;
  const stats = getApplicationStats();

  function calculateCompleteness(user) {
    if (!user) return 0;
    
    const fields = [
      { key: 'fullName', weight: 1 },
      { key: 'email', weight: 1 },
      { key: 'phone', weight: 1 },
      { key: 'profilePhoto', weight: 1 },
      { key: 'education', weight: 2 },
      { key: 'experience', weight: 2 },
      { key: 'skills', weight: 1 },
      { key: 'bio', weight: 0.5 },
      { key: 'department', weight: 0.5 }
    ];
    
    const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
    let filledWeight = 0;
    
    fields.forEach(f => {
      const value = user[f.key];
      const isFilled = value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '');
      if (isFilled) {
        filledWeight += f.weight;
        console.log(`Field ${f.key} is filled, adding weight ${f.weight}`);
      } else {
        console.log(`Field ${f.key} is empty`);
      }
    });
    
    const percentage = Math.round((filledWeight / totalWeight) * 100);
    console.log(`Profile completeness: ${filledWeight}/${totalWeight} = ${percentage}%`);
    console.log('User data:', user);
    
    return percentage;
  }

  function getApplicationStats() {
    return {
      positionsAvailable: positions?.length || 0,
      applications: applications?.length || 0,
      inReview: applications.filter(a => a.status === 'under_review').length
    };
  }

  const appliedPositionIds = applications.map(app =>
    typeof app.position === 'object' ? app.position?._id : app.position
  ).filter(Boolean);
  const newPositions = positions.filter(pos => !appliedPositionIds.includes(pos._id));

  const STATUS_STYLE = {
    open: { label: 'Open', bg: '#f0fdf4', color: '#15803d' },
    closed: { label: 'Closed', bg: '#fef2f2', color: '#dc2626' },
    pending: { label: 'Pending', bg: '#fefce8', color: '#a16207' },
    under_review: { label: 'Under Review', bg: '#eff6ff', color: '#1e40af' },
    accepted: { label: 'Accepted', bg: '#f0fdf4', color: '#15803d' },
    rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626' },
  };

  const handlePositionClick = (id) => {
    navigate(`/staff/positions/${id}`);
  };

  const STATS_CARDS = [
    {
      key: 'positionsAvailable',
      label: 'Available Positions',
      sub: 'Open for application',
      icon: FiBriefcase,
      accent: '#7B1113',
      light: '#fdf0f0',
    },
    {
      key: 'applications',
      label: 'My Applications',
      sub: 'Total submitted',
      icon: FiFileText,
      accent: '#1e40af',
      light: '#eff6ff',
    },
    {
      key: 'inReview',
      label: 'In Review',
      sub: 'Being evaluated',
      icon: FiClock,
      accent: '#C9A84C',
      light: '#fefce8',
    },
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
              Welcome back, {user?.fullName || 'Staff Member'}!
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              {today}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/staff/positions')}
              style={{
                padding: '7px 16px', borderRadius: 8, border: '1px solid #ede9e9',
                background: '#fff', color: '#374151', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              Browse Positions
            </button>
            <button
              onClick={() => navigate('/staff/applications')}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: '#7B1113', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              My Applications
            </button>
          </div>
        </div>

        {/* Maroon divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', marginTop: 16, opacity: 0.3 }} />
      </div>

      {/* Profile Completeness Banner */}
      <div style={{
        background: '#7B1113', borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        boxShadow: '0 2px 8px rgba(123,17,19,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Profile Completeness
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
              Complete your profile to improve application success
            </p>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{completeness}%</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            width: `${completeness}%`, height: '100%', background: '#C9A84C',
            transition: 'width 0.5s ease', borderRadius: 8,
          }} />
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}>
        {STATS_CARDS.map(({ key, label, sub, icon: Icon, accent, light }) => (
          <div key={key} style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0eded',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top row: label + icon */}
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
                width: 36, height: 36, borderRadius: 10,
                background: light,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={17} color={accent} />
              </div>
            </div>

            {/* Value */}
            {isLoading ? <Skeleton /> : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, letterSpacing: -1 }}>
                  {stats[key]}
                </span>
              </div>
            )}

            {/* Bottom accent line */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 3, background: accent, opacity: 0.15, borderRadius: '0 0 12px 12px',
            }} />
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Newly Posted Positions */}
        <div style={{
          background: '#fff', borderRadius: 12,
          border: '1px solid #f0eded', padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>Newly Posted Positions</span>
            </div>
            <button
              onClick={() => navigate('/staff/positions')}
              style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#7B1113',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              View all <FiArrowRight size={12} />
            </button>
          </div>

          {newPositions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              No new positions available
            </div>
          ) : (
            <div>
              {newPositions.slice(0, 5).map((pos, i) => {
                const s = STATUS_STYLE[pos.status] || { label: pos.status, bg: '#f1f5f9', color: '#475569' };
                return (
                  <div
                    key={pos._id}
                    onClick={() => handlePositionClick(pos._id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '11px 0',
                      borderBottom: i < newPositions.slice(0, 5).length - 1 ? '1px solid #f8f5f5' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                        {pos.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
                        {pos.department} • {pos.positionType}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px',
                      borderRadius: 4, background: s.bg, color: s.color,
                    }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div style={{
          background: '#fff', borderRadius: 12,
          border: '1px solid #f0eded', padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FiBell size={14} color="#7B1113" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>Recent Notifications</span>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              No recent notifications
            </div>
          ) : (
            <div>
              {applications.slice(0, 5).map((app, i) => {
                const s = STATUS_STYLE[app.status] || { label: app.status, bg: '#f1f5f9', color: '#475569' };
                return (
                  <div
                    key={app.id}
                    style={{
                      padding: '11px 0',
                      borderBottom: i < applications.slice(0, 5).length - 1 ? '1px solid #f8f5f5' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                        {app.positionTitle || 'Application Update'}
                      </p>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px',
                        borderRadius: 4, background: s.bg, color: s.color,
                      }}>
                        {s.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8' }}>
                      {app.updatedAt ? new Date(app.updatedAt).toLocaleString() : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
