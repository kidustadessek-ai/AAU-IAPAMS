import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FiTrendingUp, FiUsers, FiClock, FiAward } from 'react-icons/fi';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_CONFIG = [
  { key: 'pending',     label: 'Pending',      color: '#f59e0b' },
  { key: 'underReview', label: 'Under Review',  color: '#3b82f6' },
  { key: 'shortlisted', label: 'Shortlisted',   color: '#10b981' },
  { key: 'interviewScheduled', label: 'Interview',   color: '#8b5cf6' },
  { key: 'accepted',    label: 'Accepted',      color: '#15803d' },
  { key: 'rejected',    label: 'Rejected',      color: '#ef4444' },
];

const SectionTitle = ({ children, action, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Icon && (
        <div style={{ 
          width: 32, height: 32, borderRadius: 8, 
          background: 'linear-gradient(135deg, #7B1113 0%, #a31518 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={16} color="#fff" />
        </div>
      )}
      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e' }}>{children}</span>
    </div>
    {action}
  </div>
);

const ChartSkeleton = ({ height = 200 }) => (
  <div style={{
    height, borderRadius: 8,
    background: 'linear-gradient(90deg, #f8f7f5 25%, #f1eeee 50%, #f8f7f5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);

const StatBadge = ({ label, value, color, icon: Icon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: `${color}10`,
    borderRadius: 8,
    border: `1px solid ${color}20`,
  }}>
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 8,
      background: `${color}20`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>{value}</div>
    </div>
  </div>
);

const EnhancedChartsSection = ({ stats, loading, dateRange = '30' }) => {
  const overTime = stats?.applications?.overTime || [];
  const appStats = stats?.applications || {};
  const positionStats = stats?.positions || {};
  const userStats = stats?.users || {};

  // Filter applications based on dateRange
  const getFilteredData = () => {
    if (!overTime || overTime.length === 0) return [];
    
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0); // Reset to start of day
    
    return overTime.filter(d => {
      // Create date from the data (first day of the month)
      const itemDate = new Date(d._id.year, d._id.month - 1, 1);
      return itemDate >= cutoffDate;
    });
  };

  const filteredData = getFilteredData();
  
  // Determine how many data points to show based on date range
  const getDisplayCount = () => {
    const days = parseInt(dateRange);
    if (days <= 7) return Math.min(filteredData.length, 7);  // Show all for 7 days
    if (days <= 30) return Math.min(filteredData.length, 6); // Show last 6 months
    if (days <= 90) return Math.min(filteredData.length, 6); // Show last 6 months
    if (days <= 180) return Math.min(filteredData.length, 6); // Show last 6 months
    return Math.min(filteredData.length, 12); // Show last 12 months for year
  };
  
  const displayCount = getDisplayCount();

  // Application Trend Line Chart
  const lineLabels = filteredData.slice(-displayCount).map(d => `${MONTHS[d._id.month - 1]} '${String(d._id.year).slice(2)}`);
  const lineCounts = filteredData.slice(-displayCount).map(d => d.count);

  const lineData = {
    labels: lineLabels.length ? lineLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Applications',
      data: lineCounts.length ? lineCounts : [5, 12, 8, 15, 20, 18],
      borderColor: '#7B1113',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(123,17,19,0.4)');
        gradient.addColorStop(1, 'rgba(123,17,19,0.05)');
        return gradient;
      },
      fill: true,
      tension: 0.3,
      pointRadius: 6,
      pointHoverRadius: 10,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#7B1113',
      pointBorderWidth: 3,
      pointHoverBackgroundColor: '#7B1113',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3,
      borderWidth: 4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 14 },
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => `${item.raw} application${item.raw !== 1 ? 's' : ''} received`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        grid: { 
          display: true,
          color: '#f5f2f2',
          drawBorder: false,
        },
        border: { display: false },
        ticks: { 
          color: '#64748b', 
          font: { size: 13, weight: 600 },
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: '#f5f2f2', 
          drawBorder: false,
        },
        border: { display: false },
        ticks: { 
          color: '#64748b', 
          font: { size: 12 }, 
          precision: 0,
          padding: 8,
          callback: function(value) {
            return value;
          }
        },
        title: {
          display: true,
          text: 'Number of Applications',
          color: '#64748b',
          font: { size: 12, weight: 600 },
          padding: { bottom: 10 }
        }
      },
    },
  };

  // Status Distribution Doughnut
  const doughnutValues = STATUS_CONFIG.map(s => appStats[s.key] || 0);
  const total = doughnutValues.reduce((a, b) => a + b, 0);

  const doughnutData = {
    labels: STATUS_CONFIG.map(s => s.label),
    datasets: [{
      data: doughnutValues,
      backgroundColor: STATUS_CONFIG.map(s => s.color),
      borderWidth: 4,
      borderColor: '#fff',
      hoverBorderWidth: 4,
      hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${context.raw} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Position Status Bar Chart
  const positionBarData = {
    labels: ['Draft', 'Open', 'Closed'],
    datasets: [{
      label: 'Positions',
      data: [
        positionStats.draft || 0,
        positionStats.open || 0,
        positionStats.closed || 0,
      ],
      backgroundColor: [
        'rgba(148, 163, 184, 0.8)',
        'rgba(123, 17, 19, 0.8)',
        'rgba(201, 168, 76, 0.8)',
      ],
      borderColor: [
        '#94a3b8',
        '#7B1113',
        '#C9A84C',
      ],
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 40,
    }],
  };

  const positionBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#64748b', font: { size: 12, weight: 600 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f5f2f2', drawBorder: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12 }, precision: 0 },
      },
    },
  };

  // User Distribution Bar Chart
  const userBarData = {
    labels: ['Staff', 'Evaluators', 'Admins'],
    datasets: [{
      label: 'Users',
      data: [
        userStats.byRole?.staff || 0,
        userStats.byRole?.evaluator || 0,
        userStats.byRole?.admin || 0,
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        '#3b82f6',
        '#a855f7',
        '#ef4444',
      ],
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 40,
    }],
  };

  const userBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#64748b', font: { size: 12, weight: 600 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f5f2f2', drawBorder: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12 }, precision: 0 },
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Row - Main Trend and Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Application Trend */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #f0eded', 
          padding: '24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
        }}>
          <SectionTitle 
            icon={FiTrendingUp}
            action={
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                {dateRange === '7' ? 'Last 7 days' : 
                 dateRange === '30' ? 'Last 30 days' : 
                 dateRange === '90' ? 'Last 3 months' : 
                 dateRange === '180' ? 'Last 6 months' : 
                 dateRange === '365' ? 'Last year' : 'Last 30 days'}
              </span>
            }
          >
            Applications Over Time
          </SectionTitle>
          {loading ? <ChartSkeleton height={250} /> : (
            <div style={{ height: 250 }} key={`line-chart-${dateRange}`}>
              <Line data={lineData} options={lineOptions} />
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #f0eded', 
          padding: '24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
        }}>
          <SectionTitle icon={FiClock}>Application Status</SectionTitle>
          {loading ? <ChartSkeleton height={180} /> : (
            <>
              <div style={{ height: 160, position: 'relative', marginBottom: 16 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center', pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{total}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>TOTAL</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATUS_CONFIG.map((s, i) => {
                  const percentage = total > 0 ? ((doughnutValues[i] / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={s.key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: `${s.color}08`,
                      borderRadius: 6,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e' }}>
                          {doughnutValues[i]}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row - Position and User Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Position Status */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #f0eded', 
          padding: '24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
        }}>
          <SectionTitle icon={FiAward}>Position Status</SectionTitle>
          {loading ? <ChartSkeleton height={200} /> : (
            <>
              <div style={{ height: 200, marginBottom: 16 }}>
                <Bar data={positionBarData} options={positionBarOptions} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <StatBadge 
                  label="Draft" 
                  value={positionStats.draft || 0} 
                  color="#94a3b8" 
                  icon={FiClock}
                />
                <StatBadge 
                  label="Open" 
                  value={positionStats.open || 0} 
                  color="#7B1113" 
                  icon={FiTrendingUp}
                />
                <StatBadge 
                  label="Closed" 
                  value={positionStats.closed || 0} 
                  color="#C9A84C" 
                  icon={FiAward}
                />
              </div>
            </>
          )}
        </div>

        {/* User Distribution */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #f0eded', 
          padding: '24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
        }}>
          <SectionTitle icon={FiUsers}>User Distribution</SectionTitle>
          {loading ? <ChartSkeleton height={200} /> : (
            <>
              <div style={{ height: 200, marginBottom: 16 }}>
                <Bar data={userBarData} options={userBarOptions} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <StatBadge 
                  label="Staff" 
                  value={userStats.byRole?.staff || 0} 
                  color="#3b82f6" 
                  icon={FiUsers}
                />
                <StatBadge 
                  label="Evaluators" 
                  value={userStats.byRole?.evaluator || 0} 
                  color="#a855f7" 
                  icon={FiAward}
                />
                <StatBadge 
                  label="Admins" 
                  value={userStats.byRole?.admin || 0} 
                  color="#ef4444" 
                  icon={FiUsers}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChartsSection;
