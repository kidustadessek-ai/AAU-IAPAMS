import { FiBriefcase, FiFileText, FiCheckSquare, FiUsers } from 'react-icons/fi';

const CARDS = [
  {
    key: 'openPositions',
    label: 'Open Positions',
    sub: 'Currently accepting',
    icon: FiBriefcase,
    accent: '#7B1113',
    light: '#fdf0f0',
  },
  {
    key: 'totalApplications',
    label: 'Total Applications',
    sub: 'All time',
    icon: FiFileText,
    accent: '#1e40af',
    light: '#eff6ff',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    sub: 'Qualified candidates',
    icon: FiCheckSquare,
    accent: '#15803d',
    light: '#f0fdf4',
  },
  {
    key: 'evaluators',
    label: 'Active Evaluators',
    sub: 'Assigned reviewers',
    icon: FiUsers,
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

const StatsCards = ({ stats, loading }) => {
  const d = stats;
  const values = {
    openPositions:     d?.positions?.open ?? 0,
    totalApplications: d?.applications?.total ?? 0,
    shortlisted:       d?.applications?.shortlisted ?? 0,
    evaluators:        d?.users?.byRole?.evaluator ?? 0,
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}>
        {CARDS.map(({ key, label, sub, icon: Icon, accent, light }) => (
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
            {loading ? <Skeleton /> : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, letterSpacing: -1 }}>
                  {values[key]}
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
    </>
  );
};

export default StatsCards;
