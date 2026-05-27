import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserStats } from '../../../services/applicationService';
import { FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import StatsCards from './_components/StatsCards';
import EnhancedChartsSection from './_components/EnhancedChartsSection';
import RecentActivities from './_components/RecentActivities';
import RecentJobPosts from './_components/RecentJobPosts';

const Overview = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetchStats();
  }, [auth, dateRange]);

  const fetchStats = async () => {
    const res = await getUserStats();
    if (res.success && res.data?.data) setStats(res.data.data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div style={{ minHeight: '100%' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
                Dashboard Overview
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #ede9e9',
                  background: '#fff', color: '#64748b', cursor: refreshing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                title="Refresh data"
              >
                <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <FiCalendar size={13} color="#94a3b8" />
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontWeight: 400 }}>
                {today}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Date Range Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '8px 32px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid #ede9e9',
                  background: '#fff',
                  color: '#374151',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
              <FiFilter size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => navigate('/admin/positions')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #ede9e9',
                background: '#fff',
                color: '#374151',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Post Position
            </button>
            <button
              onClick={() => navigate('/admin/interviews')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#7B1113',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Schedule Interviews
            </button>
          </div>
        </div>

        {/* Maroon divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', marginTop: 16, opacity: 0.3 }} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Stats */}
      <StatsCards stats={stats} loading={loading} />

      {/* Enhanced Charts Section */}
      <EnhancedChartsSection stats={stats} loading={loading} dateRange={dateRange} />

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginTop: 20 }}>
        <RecentJobPosts />
        <RecentActivities />
      </div>
    </div>
  );
};

export default Overview;
