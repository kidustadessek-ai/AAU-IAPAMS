import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPositions } from '../../../../services/positionService';

const STATUS_STYLE = {
  open:   { label: 'Open',   bg: '#f0fdf4', color: '#15803d' },
  closed: { label: 'Closed', bg: '#fef2f2', color: '#dc2626' },
  filled: { label: 'Filled', bg: '#eff6ff', color: '#1e40af' },
};

const SkeletonRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f8f5f5' }}>
    <div style={{ flex: 1 }}>
      <div style={{ height: 11, width: '55%', background: '#f1f5f9', borderRadius: 4, marginBottom: 5 }} />
      <div style={{ height: 9, width: '35%', background: '#f8f7f5', borderRadius: 4 }} />
    </div>
    <div style={{ height: 20, width: 52, background: '#f1f5f9', borderRadius: 4 }} />
    <div style={{ height: 9, width: 40, background: '#f8f7f5', borderRadius: 4 }} />
  </div>
);

const RecentJobPosts = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPositions({ limit: 6, sortBy: 'createdAt', order: 'desc' });
        if (res.success) {
          setJobs((res.data || []).map(pos => ({
            id: pos._id,
            title: pos.title,
            college: pos.college,
            department: pos.department,
            type: pos.positionType,
            status: pos.status,
            deadline: new Date(pos.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            evaluators: pos.evaluators?.length || 0,
          })));
        }
      } catch {
        setJobs([]);
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
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>Recent Positions</span>
        </div>
        <button
          onClick={() => navigate('/admin/positions')}
          style={{
            fontSize: '0.75rem', fontWeight: 600, color: '#7B1113',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          View all →
        </button>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 160px 90px 80px 70px',
        padding: '0 0 8px', borderBottom: '1px solid #f0eded',
        fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>
        <span>Position</span>
        <span>Department</span>
        <span>Type</span>
        <span>Deadline</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      {/* Rows */}
      {loading ? (
        <div>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
          No positions posted yet
        </div>
      ) : (
        <div>
          {jobs.map((job, i) => {
            const s = STATUS_STYLE[job.status] || { label: job.status, bg: '#f1f5f9', color: '#475569' };
            return (
              <div
                key={job.id}
                onClick={() => navigate('/admin/positions')}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 160px 90px 80px 70px',
                  alignItems: 'center', padding: '11px 0',
                  borderBottom: i < jobs.length - 1 ? '1px solid #f8f5f5' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                    {job.title}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
                    {job.college?.split(' ').slice(0, 3).join(' ')}
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                  {job.department?.length > 22 ? job.department.substring(0, 22) + '…' : job.department}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{job.type}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{job.deadline}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px',
                    borderRadius: 4, background: s.bg, color: s.color,
                  }}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentJobPosts;
