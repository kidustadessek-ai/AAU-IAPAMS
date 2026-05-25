import { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import { getUsers } from '../../services/userService';
import toast from 'react-hot-toast';

const Evaluators = () => {
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { auth } = useAuth();

  const fetchEvaluators = async () => {
    try {
      setLoading(true);
      // Fetch all users first to see what we have
      const result = await getUsers(
        { page: 1, rowsPerPage: 100 },
        auth?.tokens?.accessToken
      );
      if (result.success) {
        // Filter only evaluators on the frontend
        const evaluatorUsers = result.data.filter(user => user.role === 'evaluator');
        setEvaluators(evaluatorUsers);
        console.log('All users:', result.data);
        console.log('Evaluators only:', evaluatorUsers);
      } else {
        toast.error('Failed to load evaluators');
      }
    } catch (error) {
      console.error('Error fetching evaluators:', error);
      toast.error('Failed to load evaluators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const filteredEvaluators = evaluators.filter(evaluator =>
    evaluator.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluator.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SkeletonRow = () => (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{
            height: 12,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            width: i === 0 ? 140 : 100
          }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ minHeight: '100%' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              Manage Evaluators
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              View and manage evaluator profiles
            </p>
          </div>
          <button
            onClick={fetchEvaluators}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#7B1113',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', opacity: 0.3 }} />
      </div>

      {/* Info Banner if no evaluators */}
      {!loading && evaluators.length === 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <FiAlertCircle size={20} color="#f59e0b" />
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', margin: 0 }}>
              No evaluators found in the system
            </p>
            <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '4px 0 0' }}>
              Create users with the "evaluator" role in the User Management page to see them here.
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {evaluators.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #f0eded',
          padding: '14px 18px',
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <FiSearch size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                border: '1px solid #ede9e9',
                borderRadius: 8,
                fontSize: '0.8rem',
                outline: 'none',
                color: '#1a1a2e',
                background: '#faf9f9',
              }}
            />
          </div>
        </div>
      )}

      {/* Stats Card */}
      {evaluators.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #f0eded',
          padding: '20px 22px',
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#fdf0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FiUser size={22} color="#7B1113" />
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              Total Evaluators
            </p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '4px 0 0', lineHeight: 1 }}>
              {loading ? '...' : filteredEvaluators.length}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {evaluators.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #f0eded',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf9f9', borderBottom: '2px solid #f0eded' }}>
                  {['Evaluator', 'Email', 'Department', 'Role', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px',
                      textAlign: 'left',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : filteredEvaluators.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {searchTerm ? 'No evaluators match your search.' : 'No evaluators found.'}
                    </td>
                  </tr>
                ) : filteredEvaluators.map((evaluator, i) => (
                  <tr
                    key={evaluator._id}
                    style={{
                      borderBottom: i < filteredEvaluators.length - 1 ? '1px solid #f8f5f5' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Evaluator */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {evaluator.profilePhoto ? (
                          <img
                            src={evaluator.profilePhoto}
                            alt={evaluator.fullName}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#7B1113',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#fff',
                          }}>
                            {evaluator.fullName?.charAt(0).toUpperCase() || 'E'}
                          </div>
                        )}
                        <div>
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                            {evaluator.fullName}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                            {evaluator.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                        {evaluator.email}
                      </span>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {evaluator.department || '—'}
                      </span>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#eff6ff',
                        color: '#1e40af',
                        textTransform: 'capitalize',
                      }}>
                        {evaluator.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: evaluator.status === 'active' ? '#f0fdf4' : '#fef2f2',
                        color: evaluator.status === 'active' ? '#15803d' : '#dc2626',
                        textTransform: 'capitalize',
                      }}>
                        {evaluator.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluators;