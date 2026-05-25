import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiUserCheck, FiEye, FiBarChart2, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../../context/authContext';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

const EvaluationManagement = () => {
  const { auth } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchEvaluations();
  }, [auth]);

  const fetchEvaluations = async () => {
    try {
      const res = await api.get('/applications', {
        headers: { Authorization: `Bearer ${auth?.tokens?.accessToken}` }
      });
      const apps = res.data?.data || [];
      setEvaluations(apps.map(app => ({
        id: app._id,
        applicant: app.applicant?.fullName || app.applicant?.username || 'Unknown',
        position: app.position?.title || 'Unknown Position',
        evaluators: app.evaluations?.map(e => e.evaluator?.fullName || 'Unknown') || [],
        criteria: [],
        status: app.evaluations?.length === 0 ? 'Pending' : 
                app.status === 'shortlisted' ? 'Completed' : 'In Progress',
        overallScore: Math.round(app.averageScore * 10) || 0,
        deadline: app.position?.deadline ? new Date(app.position.deadline).toLocaleDateString() : 'N/A'
      })));
    } catch (error) {
      console.error('Fetch evaluations error:', error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_STYLE = {
    'Pending': { label: 'Pending', bg: '#fefce8', color: '#a16207', icon: FiClock },
    'In Progress': { label: 'In Progress', bg: '#eff6ff', color: '#1e40af', icon: FiAlertCircle },
    'Completed': { label: 'Completed', bg: '#f0fdf4', color: '#15803d', icon: FiCheckCircle },
  };

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];

  const handleAssignEvaluator = (id) => {
    // Implementation for assigning evaluators
    console.log(`Assign evaluator to application ${id}`);
  };

  const handleViewDetails = (id) => {
    // Implementation for viewing evaluation details
    console.log(`View details for evaluation ${id}`);
  };

  const filteredEvaluations = evaluations.filter(evalu => {
    return (
      (filters.status === 'all' || evalu.status === filters.status) &&
      (filters.search === '' || 
       evalu.applicant.toLowerCase().includes(filters.search.toLowerCase()) ||
       evalu.position.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              Evaluation Management
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              Monitor and manage application evaluations
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', opacity: 0.3 }} />
      </div>
      
      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
        padding: '20px 22px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <FiFilter size={14} color="#7B1113" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e' }}>Filters</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Search</label>
            <div style={{ position: 'relative' }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search evaluations..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{
                  width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
              }}
            >
              {statusOptions.map(option => (
                <option key={option} value={option === 'All' ? 'all' : option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Count */}
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>
        Showing {filteredEvaluations.length} {filteredEvaluations.length === 1 ? 'evaluation' : 'evaluations'}
      </p>
      
      {/* Evaluations Table */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32, border: '3px solid #f0eded',
              borderTopColor: '#7B1113', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto',
            }} />
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 12 }}>Loading evaluations...</p>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>No evaluations found matching your criteria</p>
          </div>
        ) : (
          <>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#faf9f9', borderBottom: '2px solid #f0eded' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluators</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvaluations.map((evalu) => {
                    const statusStyle = STATUS_STYLE[evalu.status] || { label: evalu.status, bg: '#f1f5f9', color: '#475569', icon: FiAlertCircle };
                    const StatusIcon = statusStyle.icon;
                    return (
                      <tr
                        key={evalu.id}
                        style={{ borderBottom: '1px solid #f8f5f5' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, background: '#7B1113',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                            }}>
                              {evalu.applicant.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e' }}>
                              {evalu.applicant}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.8rem', color: '#64748b' }}>
                          {evalu.position}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {evalu.evaluators.length === 0 ? (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>No evaluators assigned</span>
                            ) : (
                              evalu.evaluators.map((evaluator, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px',
                                    borderRadius: 4, background: '#fdf0f0', color: '#7B1113',
                                    width: 'fit-content',
                                  }}
                                >
                                  {evaluator}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 600, padding: '4px 10px',
                            borderRadius: 6, background: statusStyle.bg, color: statusStyle.color,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            <StatusIcon size={12} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: '0.85rem', fontWeight: 700,
                              color: evalu.overallScore >= 90 ? '#15803d' :
                                     evalu.overallScore >= 75 ? '#1e40af' : '#a16207',
                            }}>
                              {evalu.overallScore}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/100</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b' }}>
                          {evalu.deadline}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleAssignEvaluator(evalu.id)}
                              title="Assign Evaluator"
                              style={{
                                padding: '6px', borderRadius: 6, border: 'none',
                                background: '#eff6ff', color: '#1e40af',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}
                            >
                              <FiUserCheck size={14} />
                            </button>
                            <button
                              onClick={() => handleViewDetails(evalu.id)}
                              title="View Details"
                              style={{
                                padding: '6px', borderRadius: 6, border: 'none',
                                background: '#f0fdf4', color: '#15803d',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              title="Evaluation Report"
                              style={{
                                padding: '6px', borderRadius: 6, border: 'none',
                                background: '#fdf0f0', color: '#7B1113',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}
                            >
                              <FiBarChart2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              padding: '14px 20px', background: '#faf9f9', borderTop: '1px solid #f0eded',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Showing <span style={{ fontWeight: 600 }}>1</span> to <span style={{ fontWeight: 600 }}>{filteredEvaluations.length}</span> of{' '}
                <span style={{ fontWeight: 600 }}>{evaluations.length}</span> evaluations
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Previous
                </button>
                <button style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EvaluationManagement;
