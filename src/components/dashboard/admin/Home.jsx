import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserStats } from '../../../services/applicationService';
import StatsCards from './_components/StatsCards';
import ApplicationsChart from './_components/ApplicationsChart';
import RecentActivities from './_components/RecentActivities';
import RecentJobPosts from './_components/RecentJobPosts';

const Overview = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetch = async () => {
      const res = await getUserStats();
      if (res.success && res.data?.data) setStats(res.data.data);
      setLoading(false);
    };
    if (auth?.tokens?.accessToken) fetch();
  }, [auth]);

  return (
    <div style={{ minHeight: '100%' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              Dashboard Overview
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              {today}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/admin/positions')}
              style={{
                padding: '7px 16px', borderRadius: 8, border: '1px solid #ede9e9',
                background: '#fff', color: '#374151', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              + Post Position
            </button>
            <button
              onClick={() => navigate('/admin/applications')}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: '#7B1113', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Applications
            </button>
          </div>
        </div>

        {/* Maroon divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', marginTop: 16, opacity: 0.3 }} />
      </div>

      {/* Stats */}
      <StatsCards stats={stats} loading={loading} />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
        <ApplicationsChart stats={stats} loading={loading} />
        <RecentActivities />
      </div>

      {/* Bottom row */}
      <RecentJobPosts />
    </div>
  );
};

export default Overview;
