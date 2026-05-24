import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/authContext';
import toast from 'react-hot-toast';
import { createPosition, getPositions, deletePosition, closePosition } from '../../../services/positionService';
import { getApplicationsByPosition, updateApplicationStatus } from '../../../services/applicationService';
import { getUsers } from '../../../pages/admin/users/_lib/user.actions';
import { aauStructure, getColleges, getDepartments } from '../../../data/aauStructure';


const PositionManagement = () => {
  const { auth } = useAuth();
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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

  const user = auth?.user;
  // Form state
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

  const handleCollegeFilterChange = (e) => {
    const selected = e.target.value;
    setCollegeFilter(selected);
    setDepartmentFilter('all');
    setFilterDepartments(selected === 'all' ? [] : getDepartments(selected));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If college changes, reset department and update available departments
    if (name === 'college') {
      setFormData({
        ...formData,
        college: value,
        department: '' // Reset department when college changes
      });
      setAvailableDepartments(getDepartments(value));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
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


  const handleEvaluatorChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      evaluators: value
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

      const res = await createPosition(positionPayload);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create position');
      }

      await fetchPositions();
      toast.success('Position published successfully!');
      setOpenModal(false);
      resetForm();

    } catch (error) {
      toast.error(error.message || 'Failed to create position');
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
  };

  const handlePositionClick = (position) => {
    setSelectedPosition(position);
    setOpenDetails(true);
  };

  const handleDeleteClick = (e, position) => {
    e.stopPropagation();
    setDeleteTarget(position);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'draft': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getDepartmentLabel = (dept) => {
    return dept.charAt(0).toUpperCase() + dept.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getDepartmentColor = (dept) => {
    const colors = [
      '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
      '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'
    ];
    const index = Math.abs(dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };


  //    get positions
  const fetchPositions = async () => {
    try {
      const res = await getPositions();
      if (!res.success) {
        throw new Error(res.error.message || 'Failed to fetch positions');
      }
      setPositions(res.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch positions');
    }
  };

  React.useEffect(() => {
    fetchPositions();
  }, []);
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Position Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              mr: 2,
              bgcolor: '#7B1113',
              '&:hover': { bgcolor: '#5a0d0f' }
            }}
          >
            Post New Job
          </Button>
          <Button
            variant="outlined"
            startIcon={viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            sx={{
              borderColor: '#7B1113',
              color: '#7B1113',
              '&:hover': { borderColor: '#5a0d0f', bgcolor: '#fdf8f8' }
            }}
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>College</InputLabel>
              <Select
                label="College"
                value={collegeFilter}
                onChange={handleCollegeFilterChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Colleges</MenuItem>
                {colleges.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth disabled={collegeFilter === 'all'}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {filterDepartments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setCollegeFilter('all');
                setDepartmentFilter('all');
                setFilterDepartments([]);
                setStatusFilter('all');
              }}
              sx={{ height: '56px', borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Positions Count */}
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Showing {filteredPositions.length} {filteredPositions.length === 1 ? 'position' : 'positions'}
      </Typography>

      {/* Positions Grid View */}
      {viewMode === 'grid' && (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
          <Grid container spacing={3}>
            {filteredPositions.map((position) => (
              <Grid item key={position.id} xs={12} sm={6} md={4} lg={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onClick={() => handlePositionClick(position)}
                  elevation={3}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={position.positionType}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                      <Chip
                        label={position.status}
                        size="small"
                        color={getStatusColor(position.status)}
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                      {position.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: getDepartmentColor(position.department),
                          width: 24,
                          height: 24,
                          mr: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {position.department.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {getDepartmentLabel(position.department)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Deadline: {new Date(position.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{
                    justifyContent: 'space-between',
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Badge
                      badgeContent={position.applicants}
                      color="primary"
                      sx={{ '& .MuiBadge-badge': { right: -5, top: 5, fontWeight: 'bold' } }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Applicants</Typography>
                    </Badge>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: 'primary.main' }}
                        onClick={(e) => handleViewApplicants(e, position)}>
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => handleDeleteClick(e, position)}
                        sx={{ color: 'error.main' }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

      )}

      {/* Positions List View */}
      {viewMode === 'list' && (
        <Paper sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)'
        }}>
          <Grid
            container
            spacing={2}
            sx={{
              mb: 2,
              fontWeight: 'bold',
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1
            }}
          >
            <Grid item xs={4}>Position</Grid>
            <Grid item xs={2}>Department</Grid>
            <Grid item xs={2}>Type</Grid>
            <Grid item xs={2}>Status</Grid>
            <Grid item xs={2}>Actions</Grid>
          </Grid>
          {filteredPositions.map((position) => (
            <Paper
              key={position.id}
              sx={{
                p: 2,
                mb: 2,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                borderRadius: 2
              }}
              onClick={() => handlePositionClick(position)}
              elevation={0}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography fontWeight="medium" sx={{ mb: 0.5 }}>
                    {position.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {new Date(position.deadline).toLocaleDateString()}
                    </Box>
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: getDepartmentColor(position.department),
                        width: 24,
                        height: 24,
                        mr: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {position.department.charAt(0).toUpperCase()}
                    </Avatar>
                    {getDepartmentLabel(position.department)}
                  </Box>
                </Grid>
                <Grid item xs={2}>
                  <Chip
                    label={position.positionType}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Chip
                    label={position.status}
                    size="small"
                    color={getStatusColor(position.status)}
                    sx={{ fontWeight: 'medium' }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: 'primary.main' }}
                      onClick={(e) => handleViewApplicants(e, position)}>
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => handleDeleteClick(e, position)}
                      sx={{ color: 'error.main' }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>
      )}

      {/* Position Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {selectedPosition?.title}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDetails(false)}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedPosition && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>Department:</Box>
                  {getDepartmentLabel(selectedPosition.department)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>Position Type:</Box>
                  {selectedPosition.positionType}
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>Status:</Box>
                  <Chip
                    label={selectedPosition.status}
                    size="small"
                    color={getStatusColor(selectedPosition.status)}
                    sx={{ ml: 1, fontWeight: 'medium' }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>Deadline:</Box>
                  {new Date(selectedPosition.deadline).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>Applicants:</Box>
                  <Badge
                    badgeContent={selectedPosition.applicants}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -5,
                        top: 5,
                        fontWeight: 'bold'
                      }
                    }}
                  />
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>Posted on:</Box>
                  {new Date(selectedPosition.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Description
                </Typography>
                <Typography paragraph sx={{ color: 'text.secondary' }}>
                  {selectedPosition.description || 'No description provided.'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Requirements
                </Typography>
                {selectedPosition.requirements?.length > 0 ? (
                  <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                    {selectedPosition.requirements.map((req, index) => (
                      <Box component="li" key={index} sx={{ mb: 1 }}>
                        <Typography variant="body1">{req}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography paragraph sx={{ color: 'text.secondary' }}>
                    No requirements specified.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDetails(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => { setOpenDetails(false); handleViewApplicants(e, selectedPosition); }}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            View Applicants
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post New Position Modal */}
      <Dialog
        open={openModal}
        onClose={() => { setOpenModal(false); resetForm(); }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: '#7B1113', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.3 }}>
              Post New Position
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Fill in the details below to publish a new position
            </Typography>
          </Box>
          <IconButton onClick={() => { setOpenModal(false); resetForm(); }} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          <Box sx={{ p: 3 }}>

            {/* Section: Basic Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" sx={{ color: '#7B1113', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.7rem' }}>
                Basic Information
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 2, borderColor: '#e2e8f0' }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Position Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    size="small"
                    placeholder="e.g. Assistant Professor of Computer Science"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Position Type</InputLabel>
                    <Select name="positionType" value={formData.positionType} label="Position Type" onChange={handleInputChange}>
                      {positionTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    size="small"
                    placeholder="Describe the role, responsibilities, and expectations..."
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section: College & Department */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 3, height: 18, bgcolor: '#7B1113', borderRadius: 1 }} />
                <Typography variant="overline" sx={{ color: '#7B1113', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.7rem' }}>
                  College &amp; Department
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5, borderColor: '#e2e8f0' }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={colleges}
                    value={formData.college || null}
                    onChange={(_, newValue) => {
                      setFormData({ ...formData, college: newValue || '', department: '' });
                      setAvailableDepartments(newValue ? getDepartments(newValue) : []);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="College"
                        required
                        placeholder="Search or select a college..."
                        helperText="Type to search through AAU colleges"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{option}</Typography>
                        </Box>
                      </Box>
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                    noOptionsText="No colleges found"
                    clearOnEscape
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={availableDepartments}
                    value={formData.department || null}
                    disabled={!formData.college}
                    onChange={(_, newValue) => {
                      setFormData({ ...formData, department: newValue || '' });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        required
                        placeholder={formData.college ? 'Search or select a department...' : 'Select a college first'}
                        helperText={formData.college ? `${availableDepartments.length} departments available` : 'Select a college to see departments'}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ py: 1.2, borderBottom: '1px solid #f1f5f9' }}>
                        <Typography variant="body2">{option}</Typography>
                      </Box>
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                    noOptionsText="No departments found"
                    clearOnEscape
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section: Requirements & Deadline */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" sx={{ color: '#7B1113', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.7rem' }}>
                Requirements & Deadline
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 2, borderColor: '#e2e8f0' }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Requirements"
                    size="small"
                    placeholder="Enter each requirement on a new line"
                    value={formData.requirements.join('\n')}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split('\n') })}
                    helperText="One requirement per line"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Application Deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section: Evaluators */}
            <Box>
              <Typography variant="overline" sx={{ color: '#7B1113', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.7rem' }}>
                Assign Evaluators
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 2, borderColor: '#e2e8f0' }} />
              <FormControl fullWidth size="small">
                <InputLabel>Select Evaluators (optional)</InputLabel>
                <Select
                  multiple
                  name="evaluators"
                  value={formData.evaluators}
                  onChange={handleEvaluatorChange}
                  label="Select Evaluators (optional)"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const ev = evaluators.find(e => e._id === id);
                        return <Chip key={id} label={ev ? ev.fullName : id} size="small" sx={{ bgcolor: '#fdf0f0', color: '#7B1113' }} />;
                      })}
                    </Box>
                  )}
                >
                  {evaluators.length === 0
                    ? <MenuItem disabled>No evaluators found</MenuItem>
                    : evaluators.map(ev => (
                        <MenuItem key={ev._id} value={ev._id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{ev.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{ev.email}</Typography>
                          </Box>
                        </MenuItem>
                      ))
                  }
                </Select>
              </FormControl>
            </Box>

          </Box>
        </DialogContent>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => { setOpenModal(false); resetForm(); }}
            sx={{ borderColor: '#cbd5e1', color: '#64748b', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit('published')}
            disabled={isLoading}
            sx={{ bgcolor: '#7B1113', '&:hover': { bgcolor: '#5a0d0f' }, minWidth: 140 }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Publish Position'}
          </Button>
        </Box>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          Delete Position
        </DialogTitle>
        <DialogContent>
          {deleteTarget?.applicationCount > 0 ? (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#991b1b' }} fontWeight="medium">
                ✕ Cannot delete — this position has {deleteTarget.applicationCount} existing application(s). Remove all applications first.
              </Typography>
            </Box>
          ) : deleteTarget?.status === 'open' ? (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#1e40af' }} fontWeight="medium">
                ℹ This position is currently open. It will be closed automatically before deletion.
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to permanently delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting || deleteTarget?.applicationCount > 0}
            onClick={handleDeleteConfirm}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Applicants Dialog */}
      <Dialog
        open={openApplicants}
        onClose={() => setOpenApplicants(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <Box sx={{ bgcolor: '#7B1113', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
              Applicants — {selectedPosition?.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {selectedPosition?.department} · {applicants.length} applicant(s)
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenApplicants(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {applicantsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#7B1113' }} />
            </Box>
          ) : applicants.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No applications submitted for this position yet.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#fdf8f8' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Documents</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Update Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applicants.map((app) => (
                    <TableRow key={app._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#7B1113', fontSize: '0.8rem' }}>
                            {(app.applicant?.fullName || app.applicant?.username || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {app.applicant?.fullName || app.applicant?.username || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{app.applicant?.email || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {app.documents?.cv && (
                            <Chip label="CV" size="small" component="a" href={app.documents.cv} target="_blank"
                              clickable sx={{ bgcolor: '#fdf0f0', color: '#7B1113', fontSize: '0.7rem' }} />
                          )}
                          {app.documents?.coverLetter && (
                            <Chip label="Cover Letter" size="small" component="a" href={app.documents.coverLetter} target="_blank"
                              clickable sx={{ bgcolor: '#fdf0f0', color: '#7B1113', fontSize: '0.7rem' }} />
                          )}
                          {app.documents?.certificates?.map((cert, i) => (
                            <Chip key={i} label={`Cert ${i + 1}`} size="small" component="a" href={cert} target="_blank"
                              clickable sx={{ bgcolor: '#fdf0f0', color: '#7B1113', fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status?.replace('_', ' ')}
                          size="small"
                          color={
                            app.status === 'shortlisted' ? 'success' :
                            app.status === 'accepted' ? 'success' :
                            app.status === 'rejected' ? 'error' :
                            app.status === 'under_review' ? 'info' : 'warning'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={app.status}
                          disabled={updatingStatus === app._id}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                          sx={{ fontSize: '0.75rem', minWidth: 130 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="under_review">Under Review</MenuItem>
                          <MenuItem value="shortlisted">Shortlisted</MenuItem>
                          <MenuItem value="accepted">Accepted</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                        {updatingStatus === app._id && <CircularProgress size={14} sx={{ ml: 1, color: '#7B1113' }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenApplicants(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PositionManagement;