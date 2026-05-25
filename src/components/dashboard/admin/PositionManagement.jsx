import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiTrash2, FiEye, FiX, FiCalendar, FiUsers, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../../context/authContext';
import toast from 'react-hot-toast';
import { createPosition, getPositions, deletePosition, closePosition, updatePosition } from '../../../services/positionService';
import { getApplicationsByPosition, updateApplicationStatus } from '../../../services/applicationService';
import { getUsers } from '../../../pages/admin/users/_lib/user.actions';
import { getColleges, getDepartments } from '../../../data/aauStructure';


const PositionManagement = () => {
  const { auth } = useAuth();
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDepartments, setFilterDepartments] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openApplicants, setOpenApplicants] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    college: '',
    department: '',
    positionType: 'Full-Time',
    requirements: [],
    deadline: '',
    evaluators: []
  });
  const [evaluators, setEvaluators] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  
  const colleges = getColleges();
  const positionTypes = ['Full-Time', 'Part-Time', 'Contract', 'Temporary'];

  // Filter positions based on search and filters
  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = collegeFilter === 'all' || position.college === collegeFilter;
    const matchesDepartment = departmentFilter === 'all' || position.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
    return matchesSearch && matchesCollege && matchesDepartment && matchesStatus;
  });

  const handleCollegeFilterChange = (selected) => {
    setCollegeFilter(selected);
    setDepartmentFilter('all');
    setFilterDepartments(selected === 'all' ? [] : getDepartments(selected));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'college') {
      setFormData({ ...formData, college: value, department: '' });
      setAvailableDepartments(getDepartments(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getEvaluators = async () => {
    try {
      const res = await getUsers({ role: 'evaluator' });
      if (res.success) setEvaluators(res.data);
    } catch (error) {
      toast.error('Failed to fetch evaluators');
    }
  };
  useEffect(() => {
    if (openModal) {
      getEvaluators();
    }
  }, [openModal]);


  const handleEvaluatorChange = (id) => {
    const current = formData.evaluators;
    setFormData({
      ...formData,
      evaluators: current.includes(id) ? current.filter(e => e !== id) : [...current, id]
    });
  };

  const handleSubmit = async (status) => {
    setIsLoading(true);

    try {
      const positionPayload = {
        title: formData.title,
        description: formData.description,
        college: formData.college,
        department: formData.department,
        positionType: formData.positionType,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        evaluators: formData.evaluators
      };

      let res;
      if (isEditing && editingPosition) {
        res = await updatePosition(editingPosition._id, positionPayload);
      } else {
        res = await createPosition(positionPayload);
      }

      if (!res.success) {
        throw new Error(res.error?.message || `Failed to ${isEditing ? 'update' : 'create'} position`);
      }

      await fetchPositions();
      toast.success(`Position ${isEditing ? 'updated' : 'published'} successfully!`);
      setOpenModal(false);
      resetForm();

    } catch (error) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} position`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      college: '',
      department: '',
      positionType: 'Full-Time',
      requirements: [],
      deadline: '',
      evaluators: []
    });
    setAvailableDepartments([]);
    setIsEditing(false);
    setEditingPosition(null);
    setCollegeSearch('');
    setDeptSearch('');
  };

  const handlePositionClick = (position) => {
    setSelectedPosition(position);
    setOpenDetails(true);
  };

  const handleDeleteClick = (e, position) => {
    e.stopPropagation();
    setDeleteTarget(position);
  };

  const handleEditClick = (e, position) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingPosition(position);
    setFormData({
      title: position.title,
      description: position.description,
      college: position.college,
      department: position.department,
      positionType: position.positionType,
      requirements: position.requirements || [],
      deadline: position.deadline ? new Date(position.deadline).toISOString().split('T')[0] : '',
      evaluators: position.evaluators?.map(e => e._id || e) || []
    });
    setAvailableDepartments(getDepartments(position.college));
    setCollegeSearch(position.college);
    setDeptSearch(position.department);
    setOpenModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // Check if position has applications
      const appsRes = await getApplicationsByPosition(deleteTarget._id);
      const applicationCount = appsRes.success ? appsRes.data.length : 0;
      
      if (applicationCount > 0) {
        toast.error(`Cannot delete position with ${applicationCount} existing application(s)`);
        setIsDeleting(false);
        return;
      }

      // If position is open, close it first before deleting
      if (deleteTarget.status === 'open') {
        const closeRes = await closePosition(deleteTarget._id);
        if (!closeRes.success) throw new Error('Failed to close position before deletion');
      }
      
      const res = await deletePosition(deleteTarget._id);
      if (!res.success) throw new Error(res.error?.message || 'Failed to delete position');
      toast.success('Position deleted successfully!');
      setDeleteTarget(null);
      await fetchPositions();
    } catch (error) {
      toast.error(error.message || 'Failed to delete position');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewApplicants = async (e, position) => {
    e.stopPropagation();
    setSelectedPosition(position);
    setOpenApplicants(true);
    setApplicantsLoading(true);
    const res = await getApplicationsByPosition(position._id);
    setApplicants(res.success ? res.data : []);
    setApplicantsLoading(false);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    const res = await updateApplicationStatus(applicationId, newStatus);
    if (res.success) {
      setApplicants(prev => prev.map(a =>
        a._id === applicationId ? { ...a, status: newStatus } : a
      ));
      toast.success('Status updated');
    } else {
      toast.error('Failed to update status');
    }
    setUpdatingStatus(null);
  };

  const STATUS_STYLE = {
    open: { label: 'Open', bg: '#f0fdf4', color: '#15803d' },
    draft: { label: 'Draft', bg: '#fefce8', color: '#a16207' },
    closed: { label: 'Closed', bg: '#fef2f2', color: '#dc2626' },
  };

  const getDeptColor = (dept) => {
    const colors = ['#7B1113', '#1e40af', '#15803d', '#C9A84C', '#7c3aed', '#db2777'];
    const idx = Math.abs(dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
    return colors[idx];
  };


  const fetchPositions = async () => {
    try {
      const res = await getPositions();
      if (!res.success) throw new Error(res.error.message || 'Failed to fetch positions');
      setPositions(res.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch positions');
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);
  const filteredColleges = colleges.filter(c => c.toLowerCase().includes(collegeSearch.toLowerCase()));
  const filteredDepts = availableDepartments.filter(d => d.toLowerCase().includes(deptSearch.toLowerCase()));

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              Position Management
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              Create and manage academic positions
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid #ede9e9',
                background: '#fff', color: '#374151', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {viewMode === 'grid' ? <><FiList size={14} /> List</> : <><FiGrid size={14} /> Grid</>}
            </button>
            <button
              onClick={() => setOpenModal(true)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: '#7B1113', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <FiPlus size={14} /> Post Position
            </button>
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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Search</label>
            <div style={{ position: 'relative' }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>College</label>
            <select
              value={collegeFilter}
              onChange={(e) => handleCollegeFilterChange(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
              }}
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={collegeFilter === 'all'}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                opacity: collegeFilter === 'all' ? 0.5 : 1,
              }}
            >
              <option value="all">All Departments</option>
              {filterDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
              }}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setCollegeFilter('all');
              setDepartmentFilter('all');
              setFilterDepartments([]);
              setStatusFilter('all');
            }}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Count */}
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>
        Showing {filteredPositions.length} {filteredPositions.length === 1 ? 'position' : 'positions'}
      </p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredPositions.map((pos) => {
            const s = STATUS_STYLE[pos.status] || { label: pos.status, bg: '#f1f5f9', color: '#475569' };
            const deptColor = getDeptColor(pos.department);
            return (
              <div
                key={pos._id}
                onClick={() => handlePositionClick(pos)}
                style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
                  padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px',
                    borderRadius: 4, background: '#fdf0f0', color: '#7B1113',
                  }}>
                    {pos.positionType}
                  </span>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px',
                    borderRadius: 4, background: s.bg, color: s.color,
                  }}>
                    {s.label}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
                  {pos.title}
                </h3>

                {/* Department */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, background: deptColor + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: deptColor,
                  }}>
                    {pos.department.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{pos.department}</span>
                </div>

                {/* Deadline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCalendar size={13} color="#94a3b8" />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Deadline: {new Date(pos.deadline).toLocaleDateString()}
                  </span>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12, borderTop: '1px solid #f8f5f5',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiUsers size={13} color="#7B1113" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a2e' }}>
                      {pos.applicants || 0}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>applicants</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => handleViewApplicants(e, pos)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: 'none',
                        background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <FiEye size={12} /> View
                    </button>
                    <button
                      onClick={(e) => handleEditClick(e, pos)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: 'none',
                        background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, pos)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: 'none',
                        background: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr',
            padding: '14px 20px', background: '#faf9f9', borderBottom: '1px solid #f0eded',
            fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            <span>Position</span>
            <span>Department</span>
            <span>Type</span>
            <span>Status</span>
            <span>Deadline</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          {/* Rows */}
          {filteredPositions.map((pos, i) => {
            const s = STATUS_STYLE[pos.status] || { label: pos.status, bg: '#f1f5f9', color: '#475569' };
            const deptColor = getDeptColor(pos.department);
            return (
              <div
                key={pos._id}
                onClick={() => handlePositionClick(pos)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr',
                  alignItems: 'center', padding: '14px 20px', cursor: 'pointer',
                  borderBottom: i < filteredPositions.length - 1 ? '1px solid #f8f5f5' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                    {pos.title}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                    {pos.college?.split(' ').slice(0, 4).join(' ')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, background: deptColor + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: deptColor,
                  }}>
                    {pos.department.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {pos.department.length > 18 ? pos.department.substring(0, 18) + '…' : pos.department}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{pos.positionType}</span>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 600, padding: '3px 8px',
                  borderRadius: 4, background: s.bg, color: s.color, width: 'fit-content',
                }}>
                  {s.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {new Date(pos.deadline).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => handleViewApplicants(e, pos)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <FiEye size={12} /> View
                  </button>
                  <button
                    onClick={(e) => handleEditClick(e, pos)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, pos)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Position Details Modal */}
      {openDetails && selectedPosition && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
          onClick={() => setOpenDetails(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, maxWidth: 700, width: '100%',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ background: '#7B1113', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  {selectedPosition.title}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                  {selectedPosition.department}
                </p>
              </div>
              <button
                onClick={() => setOpenDetails(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{selectedPosition.college}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position Type</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{selectedPosition.positionType}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px',
                    borderRadius: 6, background: STATUS_STYLE[selectedPosition.status]?.bg || '#f1f5f9',
                    color: STATUS_STYLE[selectedPosition.status]?.color || '#475569',
                  }}>
                    {STATUS_STYLE[selectedPosition.status]?.label || selectedPosition.status}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
                    {new Date(selectedPosition.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicants</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{selectedPosition.applicants || 0}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posted On</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
                    {new Date(selectedPosition.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ height: 1, background: '#f0eded', margin: '20px 0' }} />

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#7B1113', margin: '0 0 8px' }}>Description</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {selectedPosition.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#7B1113', margin: '0 0 8px' }}>Requirements</h3>
                {selectedPosition.requirements?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#64748b' }}>
                    {selectedPosition.requirements.map((req, i) => (
                      <li key={i} style={{ fontSize: '0.8rem', lineHeight: 1.6, marginBottom: 6 }}>{req}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No requirements specified.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0eded', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setOpenDetails(false)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={(e) => { setOpenDetails(false); handleViewApplicants(e, selectedPosition); }}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#7B1113', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                View Applicants
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post New Position Modal */}
      {openModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
          onClick={() => { setOpenModal(false); resetForm(); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, maxWidth: 700, width: '100%',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ background: '#7B1113', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  {isEditing ? 'Edit Position' : 'Post New Position'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                  {isEditing ? 'Update position details' : 'Fill in the details below'}
                </p>
              </div>
              <button
                onClick={() => { setOpenModal(false); resetForm(); }}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', background: '#f8fafc' }}>
              {/* Basic Info */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 2 }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7B1113', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Basic Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Position Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Assistant Professor of Computer Science"
                      required
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Position Type *</label>
                    <select
                      name="positionType"
                      value={formData.positionType}
                      onChange={handleInputChange}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                      }}
                    >
                      {positionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the role, responsibilities, and expectations..."
                      rows={3}
                      required
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* College & Department */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 2 }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7B1113', textTransform: 'uppercase', letterSpacing: '0.08em' }}>College & Department</span>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>College *</label>
                    <input
                      type="text"
                      placeholder="Search or select a college..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      onFocus={() => setCollegeSearch('')}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                      }}
                    />
                    {collegeSearch !== '' && filteredColleges.length > 0 && (
                      <div style={{
                        marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                        maxHeight: 200, overflow: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}>
                        {filteredColleges.map(c => (
                          <div
                            key={c}
                            onClick={() => {
                              setFormData({ ...formData, college: c, department: '' });
                              setAvailableDepartments(getDepartments(c));
                              setCollegeSearch(c);
                            }}
                            style={{
                              padding: '10px 12px', cursor: 'pointer', fontSize: '0.8rem',
                              borderBottom: '1px solid #f8f5f5',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.college && (
                      <p style={{ fontSize: '0.7rem', color: '#15803d', margin: '4px 0 0' }}>Selected: {formData.college}</p>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Department *</label>
                    <input
                      type="text"
                      placeholder={formData.college ? 'Search or select a department...' : 'Select a college first'}
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      onFocus={() => setDeptSearch('')}
                      disabled={!formData.college}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                        opacity: formData.college ? 1 : 0.5,
                      }}
                    />
                    {deptSearch !== '' && filteredDepts.length > 0 && (
                      <div style={{
                        marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                        maxHeight: 200, overflow: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}>
                        {filteredDepts.map(d => (
                          <div
                            key={d}
                            onClick={() => {
                              setFormData({ ...formData, department: d });
                              setDeptSearch(d);
                            }}
                            style={{
                              padding: '10px 12px', cursor: 'pointer', fontSize: '0.8rem',
                              borderBottom: '1px solid #f8f5f5',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.department && (
                      <p style={{ fontSize: '0.7rem', color: '#15803d', margin: '4px 0 0' }}>Selected: {formData.department}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements & Deadline */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 2 }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7B1113', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Requirements & Deadline</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Requirements</label>
                    <textarea
                      placeholder="Enter each requirement on a new line"
                      value={formData.requirements.join('\n')}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split('\n') })}
                      rows={3}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', resize: 'vertical',
                      }}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0' }}>One requirement per line</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Deadline *</label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Evaluators */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, background: '#7B1113', borderRadius: 2 }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7B1113', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assign Evaluators</span>
                </div>
                <div style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '12px', maxHeight: 200, overflow: 'auto',
                }}>
                  {evaluators.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>No evaluators found</p>
                  ) : (
                    evaluators.map(ev => (
                      <label
                        key={ev._id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px',
                          cursor: 'pointer', borderRadius: 6,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fdf9f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={formData.evaluators.includes(ev._id)}
                          onChange={() => handleEvaluatorChange(ev._id)}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{ev.fullName}</p>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0' }}>{ev.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {formData.evaluators.length > 0 && (
                  <p style={{ fontSize: '0.7rem', color: '#15803d', margin: '6px 0 0' }}>
                    {formData.evaluators.length} evaluator(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => { setOpenModal(false); resetForm(); }}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={isLoading}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: isLoading ? '#94a3b8' : '#7B1113', color: '#fff',
                  fontSize: '0.8rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                  minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Publishing...
                  </>
                ) : isEditing ? 'Update Position' : 'Publish Position'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0eded' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Delete Position</h3>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {deleteTarget.applicants > 0 ? (
                <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, margin: 0 }}>
                    ✕ Cannot delete — this position has {deleteTarget.applicants} existing application(s). Remove all applications first.
                  </p>
                </div>
              ) : deleteTarget.status === 'open' ? (
                <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600, margin: 0 }}>
                    ℹ This position is currently open. It will be closed automatically before deletion.
                  </p>
                </div>
              ) : null}
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0eded', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '0.8rem', fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting || (deleteTarget.applicants > 0)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: (isDeleting || (deleteTarget.applicants > 0)) ? '#fca5a5' : '#dc2626',
                  color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                  cursor: (isDeleting || (deleteTarget.applicants > 0)) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {isDeleting ? (
                  <>
                    <div style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Applicants Modal */}
      {openApplicants && selectedPosition && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
          onClick={() => setOpenApplicants(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, maxWidth: 1100, width: '100%',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ background: '#7B1113', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  Applicants — {selectedPosition.title}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                  {selectedPosition.department} · {applicants.length} applicant(s)
                </p>
              </div>
              <button
                onClick={() => setOpenApplicants(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 0 }}>
              {applicantsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <div style={{
                    width: 32, height: 32, border: '3px solid #f0eded',
                    borderTopColor: '#7B1113', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              ) : applicants.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>No applications submitted for this position yet.</p>
                </div>
              ) : (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#faf9f9', borderBottom: '2px solid #f0eded' }}>
                      <tr>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied On</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app) => {
                        const statusColors = {
                          shortlisted: { bg: '#f0fdf4', color: '#15803d' },
                          accepted: { bg: '#f0fdf4', color: '#15803d' },
                          rejected: { bg: '#fef2f2', color: '#dc2626' },
                          under_review: { bg: '#eff6ff', color: '#1e40af' },
                          pending: { bg: '#fefce8', color: '#a16207' },
                        };
                        const sc = statusColors[app.status] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                          <tr
                            key={app._id}
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
                                  {(app.applicant?.fullName || app.applicant?.username || '?').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e' }}>
                                  {app.applicant?.fullName || app.applicant?.username || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b' }}>
                              {app.applicant?.email || '—'}
                            </td>
                            <td style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b' }}>
                              {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {app.documents?.cv && (
                                  <a
                                    href={app.documents.cv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px',
                                      borderRadius: 4, background: '#fdf0f0', color: '#7B1113',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    CV
                                  </a>
                                )}
                                {app.documents?.coverLetter && (
                                  <a
                                    href={app.documents.coverLetter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px',
                                      borderRadius: 4, background: '#fdf0f0', color: '#7B1113',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Cover
                                  </a>
                                )}
                                {app.documents?.certificates?.map((cert, i) => (
                                  <a
                                    key={i}
                                    href={cert}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px',
                                      borderRadius: 4, background: '#fdf0f0', color: '#7B1113',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Cert {i + 1}
                                  </a>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <span style={{
                                fontSize: '0.68rem', fontWeight: 600, padding: '4px 8px',
                                borderRadius: 4, background: sc.bg, color: sc.color,
                                textTransform: 'capitalize',
                              }}>
                                {app.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td style={{ padding: '12px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <select
                                  value={app.status}
                                  disabled={updatingStatus === app._id}
                                  onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                  style={{
                                    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                                    fontSize: '0.75rem', outline: 'none', minWidth: 130,
                                    opacity: updatingStatus === app._id ? 0.5 : 1,
                                  }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="under_review">Under Review</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                                {updatingStatus === app._id && (
                                  <div style={{
                                    width: 14, height: 14, border: '2px solid #e2e8f0',
                                    borderTopColor: '#7B1113', borderRadius: '50%',
                                    animation: 'spin 0.6s linear infinite',
                                  }} />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0eded', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpenApplicants(false)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PositionManagement;