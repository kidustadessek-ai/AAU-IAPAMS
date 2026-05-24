import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_CONFIG = [
  { key: 'pending',     label: 'Pending',      color: '#C9A84C' },
  { key: 'underReview', label: 'Under Review',  color: '#3b82f6' },
  { key: 'shortlisted', label: 'Shortlisted',   color: '#7B1113' },
  { key: 'accepted',    label: 'Accepted',      color: '#15803d' },
  { key: 'rejected',    label: 'Rejected',      color: '#e5e7eb' },
];

const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 4 }} />
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>{children}</span>
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

const ApplicationsChart = ({ stats, loading }) => {
  const overTime = stats?.applications?.overTime || [];
  const appStats = stats?.applications || {};

  // Line chart data
  const lineLabels = overTime.map(d => `${MONTHS[d._id.month - 1]} '${String(d._id.year).slice(2)}`);
  const lineCounts = overTime.map(d => d.count);

  const lineData = {
    labels: lineLabels.length ? lineLabels : ['No data'],
    datasets: [{
      data: lineCounts.length ? lineCounts : [0],
      borderColor: '#7B1113',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(123,17,19,0.15)');
        gradient.addColorStop(1, 'rgba(123,17,19,0)');
        return gradient;
      },
      fill: true,
      tension: 0.45,
      pointBackgroundColor: '#7B1113',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
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
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => ` ${item.raw} applications`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f5f2f2', drawBorder: false },
        border: { display: false, dash: [4, 4] },
        ticks: { color: '#94a3b8', font: { size: 11 }, precision: 0 },
      },
    },
  };

  // Doughnut data
  const doughnutValues = STATUS_CONFIG.map(s => appStats[s.key] || 0);
  const total = doughnutValues.reduce((a, b) => a + b, 0);

  const doughnutData = {
    labels: STATUS_CONFIG.map(s => s.label),
    datasets: [{
      data: doughnutValues,
      backgroundColor: STATUS_CONFIG.map(s => s.color),
      borderWidth: 3,
      borderColor: '#fff',
      hoverBorderWidth: 3,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

      {/* Line chart */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0eded', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <SectionTitle
          action={
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Last 6 months</span>
          }
        >
          Application Trend
        </SectionTitle>
        {loading ? <ChartSkeleton height={180} /> : (
          <div style={{ height: 180 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        )}
      </div>

      {/* Doughnut */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0eded', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <SectionTitle>Status Breakdown</SectionTitle>
        {loading ? <ChartSkeleton height={140} /> : (
          <>
            <div style={{ height: 140, position: 'relative' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
              {/* Center label */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>Total</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STATUS_CONFIG.map((s, i) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a1a2e' }}>
                    {doughnutValues[i]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationsChart;
