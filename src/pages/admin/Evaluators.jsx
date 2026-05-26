import { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiUser, FiAlertCircle, FiPlus, FiEdit2, FiTrash2, FiX, FiMail, FiPhone, FiMapPin, FiAward, FiEye, FiFilter, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import { getUsers, createUser, deleteUserAsync } from '../../services/userService';
import toast from 'react-hot-toast';
import { getColleges, getDepartments } from '../../data/aauStructure';

const Evaluators = () => {
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: 'evaluator'
  });

  const fetchEvaluators = async () => {
    try {
      setLoading(true);
      const result = await getUsers(
        { page: 1, rowsPerPage: 100, role: 'evaluator' },
        auth?.tokens?.accessToken
      );
      if (result.success) {
        const evaluatorUsers = result.data.filter(user => user.role === 'evaluator');
        setEvaluators(evaluatorUsers);
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

  const handleAddEvaluator = async () => {
    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUser(formData, auth?.tokens?.accessToken);
      if (result.success) {
        toast.success('Evaluator added successfully');
        setOpenAddModal(false);
        resetForm();
        await fetchEvaluators();
      } else {
        toast.error(result.error?.message || 'Failed to add evaluator');
      }
    } catch (error) {
      toast.error('Failed to add evaluator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvaluator = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteUserAsync(
        [selectedEvaluator._id],
        deletePassword,
        auth?.tokens?.accessToken
      );
      if (result.success) {
        toast.success('Evaluator deleted successfully');
        setOpenDeleteModal(false);
        setSelectedEvaluator(null);
        setDeletePassword('');
        await fetchEvaluators();
      } else {
        toast.error(result.error?.message || 'Failed to delete evaluator');
      }
    } catch (error) {
      toast.error('Failed to delete evaluator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      role: 'evaluator'
    });
  };

  const exportToCSV = () => {
    const headers = ['Full Name', 'Username', 'Email', 'Department', 'Phone', 'Status'];
    const rows = filteredEvaluators.map(e => [
      e.fullName,
      e.username,
      e.email,
      e.department || '',
      e.phone || '',
      e.status
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluators_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const filteredEvaluators = evaluators.filter(evaluator => {
    const matchesSearch = evaluator.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluator.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || evaluator.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || evaluator.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const uniqueDepartments = [...new Set(evaluators.map(e => e.department).filter(Boolean))];

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              Manage Evaluators
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              Add, view, and manage evaluator accounts and assignments
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={exportToCSV}
              disabled={evaluators.length === 0}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #ede9e9',
                background: evaluators.length === 0 ? '#f8f7f5' : '#fff',
                color: evaluators.length === 0 ? '#94a3b8' : '#374151',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: evaluators.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FiDownload size={14} /> Export
            </button>
            <button
              onClick={fetchEvaluators}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #ede9e9',
                background: '#fff',
                color: '#374151',
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
            <button
              onClick={() => setOpenAddModal(true)}
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
              <FiPlus size={14} /> Add Evaluator
            </button>
          </div>
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
          padding: '18px 20px',
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FiFilter size={14} color="#7B1113" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1a2e' }}>Filters</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Search</label>
              <div style={{ position: 'relative' }}>
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
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setStatusFilter('all');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Stats Card */}
      {evaluators.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0eded',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  {loading ? '...' : evaluators.length}
                </p>
              </div>
            </div>
          </div>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0eded',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FiAward size={22} color="#15803d" />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                  Active
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '4px 0 0', lineHeight: 1 }}>
                  {loading ? '...' : evaluators.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0eded',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FiMapPin size={22} color="#1e40af" />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                  Departments
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '4px 0 0', lineHeight: 1 }}>
                  {loading ? '...' : uniqueDepartments.length}
                </p>
              </div>
            </div>
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
                  {['Evaluator', 'Email', 'Phone', 'Department', 'Status', 'Actions'].map(h => (
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
                    <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
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

                    {/* Phone */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {evaluator.phone || '—'}
                      </span>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {evaluator.department || '—'}
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

                    {/* Actions */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => {
                            setSelectedEvaluator(evaluator);
                            setOpenViewModal(true);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#eff6ff',
                            color: '#1e40af',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEvaluator(evaluator);
                            setOpenDeleteModal(true);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Evaluator Modal */}
      {openAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => !isSubmitting && setOpenAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ background: '#7B1113', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  Add New Evaluator
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                  Create a new evaluator account
                </p>
              </div>
              <button
                onClick={() => !isSubmitting && setOpenAddModal(false)}
                disabled={isSubmitting}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Username *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+251..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Enter department"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setOpenAddModal(false)}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvaluator}
                disabled={isSubmitting}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSubmitting ? '#94a3b8' : '#7B1113',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Evaluator'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Evaluator Modal */}
      {openViewModal && selectedEvaluator && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setOpenViewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ background: '#7B1113', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  Evaluator Details
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                  View evaluator information
                </p>
              </div>
              <button
                onClick={() => setOpenViewModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0eded' }}>
                {selectedEvaluator.profilePhoto ? (
                  <img
                    src={selectedEvaluator.profilePhoto}
                    alt={selectedEvaluator.fullName}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    background: '#7B1113',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                    {selectedEvaluator.fullName?.charAt(0).toUpperCase() || 'E'}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
                    {selectedEvaluator.fullName}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                    @{selectedEvaluator.username}
                  </p>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: selectedEvaluator.status === 'active' ? '#f0fdf4' : '#fef2f2',
                    color: selectedEvaluator.status === 'active' ? '#15803d' : '#dc2626',
                    textTransform: 'capitalize',
                    display: 'inline-block',
                    marginTop: 8,
                  }}>
                    {selectedEvaluator.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FiMail size={18} color="#1e40af" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      Email
                    </p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                      {selectedEvaluator.email}
                    </p>
                  </div>
                </div>

                {selectedEvaluator.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FiPhone size={18} color="#15803d" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        Phone
                      </p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                        {selectedEvaluator.phone}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvaluator.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: '#fdf0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FiMapPin size={18} color="#7B1113" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        Department
                      </p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                        {selectedEvaluator.department}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FiAward size={18} color="#92400e" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      Role
                    </p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0', textTransform: 'capitalize' }}>
                      {selectedEvaluator.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpenViewModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && selectedEvaluator && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => !isSubmitting && setOpenDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0eded' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Delete Evaluator</h3>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
                Are you sure you want to delete <strong>{selectedEvaluator.fullName}</strong>? This action cannot be undone.
              </p>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Enter your password to confirm *</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your admin password"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    outline: 'none',
                    opacity: isSubmitting ? 0.5 : 1,
                  }}
                />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0eded', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => {
                  setOpenDeleteModal(false);
                  setDeletePassword('');
                }}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvaluator}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSubmitting ? '#fca5a5' : '#dc2626',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluators;