import { useEffect, useState } from 'react';
import { api } from '../../../../utils/api';

const STATUS_STYLE = {
  pending:      { label: 'Pending',      bg: '#fefce8', color: '#a16207' },
  under_review: { label: 'In Review',    bg: '#eff6ff', color: '#1e40af' },
  shortlisted:  { label: 'Shortlisted',  bg: '#f0fdf4', color: '#15803d' },
  accepted:     { label: 'Accepted',     bg: '#f0fdf4', color: '#15803d' },
  rejected:     { label: 'Rejected',     bg: '#fef2f2', color: '#dc2626' },
};

const SkeletonRow = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0' }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: 11, width: '70%', background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 9, width: '45%', background: '#f8f7f5', borderRadius: 4 }} />
    </div>
  </div>
);

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/applications', { params: { limit: 6, sortBy: 'createdAt', order: 'desc' } });
        const apps = res.data?.data || [];
        setActivities(apps.map(app => ({
          id: app._id,
          name: app.applicant?.fullName || app.applicant?.username || 'Unknown',
          position: app.position?.title || 'a position',
          status: app.status,
          time: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })));
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #f0eded', padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>Recent Activity</span>
      </div>

      {loading ? (
        <div>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
          No activity yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.map((a, i) => {
            const s = STATUS_STYLE[a.status] || { label: a.status, bg: '#f1f5f9', color: '#475569' };
            return (
              <div key={a.id} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: i < activities.length - 1 ? '1px solid #f8f5f5' : 'none',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#fdf0f0', color: '#7B1113',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {a.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#1a1a2e', fontWeight: 600, lineHeight: 1.3 }}>
                    {a.name}
                  </p>
                  <p style={{ margin: '2px 0 4px', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Applied for {a.position}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600, padding: '1px 6px',
                      borderRadius: 4, background: s.bg, color: s.color,
                    }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#c4bfbf' }}>{a.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
