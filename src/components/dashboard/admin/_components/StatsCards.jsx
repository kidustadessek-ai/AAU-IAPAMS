import { ArrowUpIcon } from '@heroicons/react/16/solid';

const CARD_CONFIG = [
  { key: 'openPositions',    label: 'Open Positions',    accent: '#7B1113', bg: '#fdf8f8' },
  { key: 'totalApplications', label: 'Total Applications', accent: '#1e40af', bg: '#eff6ff' },
  { key: 'shortlisted',      label: 'Shortlisted',       accent: '#15803d', bg: '#f0fdf4' },
  { key: 'evaluators',       label: 'Active Evaluators', accent: '#C9A84C', bg: '#fefce8' },
];

const StatsCards = ({ stats, loading }) => {
  const d = stats;
  const values = {
    openPositions:     loading ? null : (d?.positions?.open ?? 0),
    totalApplications: loading ? null : (d?.applications?.total ?? 0),
    shortlisted:       loading ? null : (d?.applications?.shortlisted ?? 0),
    evaluators:        loading ? null : (d?.users?.byRole?.evaluator ?? 0),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {CARD_CONFIG.map(({ key, label, accent, bg }) => (
        <div key={key} style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          border: '1px solid #f0eded',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Accent top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accent, borderRadius: '12px 12px 0 0' }} />

          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            {label}
          </p>

          {loading ? (
            <div style={{ height: 36, width: 60, backgroundColor: '#f1f5f9', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
                {values[key]}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: accent, fontWeight: 600 }}>
                <ArrowUpIcon style={{ width: 12, height: 12 }} />
              </span>
            </div>
          )}

          {/* Background accent circle */}
          <div style={{
            position: 'absolute', bottom: -16, right: -16,
            width: 64, height: 64, borderRadius: '50%',
            backgroundColor: bg, opacity: 0.8,
          }} />
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
