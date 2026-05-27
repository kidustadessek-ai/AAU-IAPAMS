import { FiBriefcase, FiFileText, FiCheckSquare, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
    accent: '#3b82f6',
    light: '#eff6ff',
  },
  {
    key: 'interviewScheduled',
    label: 'Interviews Scheduled',
    sub: 'Pending interviews',
    icon: FiCheckSquare,
    accent: '#0284c7',
    light: '#f0f9ff',
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
    openPositions:        d?.positions?.open ?? 0,
    totalApplications:    d?.applications?.total ?? 0,
    interviewScheduled:   d?.applications?.interviewScheduled ?? 0,
    evaluators:           d?.users?.byRole?.evaluator ?? 0,
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        {CARDS.map(({ key, label, sub, icon: Icon, accent, light }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #f0eded',
              padding: '22px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `${accent}08`,
              filter: 'blur(30px)',
            }} />

            {/* Top row: label + icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  {label}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#c4bfbf', margin: '3px 0 0', fontWeight: 400 }}>
                  {sub}
                </p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${accent}40`,
              }}>
                <Icon size={20} color="#fff" />
              </div>
            </div>

            {/* Value */}
            {loading ? <Skeleton /> : (
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, letterSpacing: -1.5 }}>
                  {values[key]}
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 4, background: `${accent}15`,
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${accent} 0%, ${accent}cc 100%)`,
                  borderRadius: '0 0 12px 12px',
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default StatsCards;
