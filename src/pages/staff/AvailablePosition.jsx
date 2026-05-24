import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, Paper, Grid, Card, CardContent,
  CardActions, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, CircularProgress, Divider, Alert, Tabs, Tab,
  Link, Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon, CalendarToday as CalendarTodayIcon,
  Close as CloseIcon, Description as DescriptionIcon,
  HowToReg as AppliedIcon, EventBusy as ClosedIcon, FilterList as FilterListIcon,
  CloudUpload as UploadIcon, CheckCircle as CheckIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getPositions } from '../../services/positionService';
import { useAuth } from '../../context/authContext';
import { getMyApplications, applyToPosition } from '../../services/applicationService';
import { getColleges } from '../../data/aauStructure';

const AvailablePositions = () => {
  const { auth } = useAuth();
  const [positions, setPositions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [files, setFiles] = useState({ cv: null, coverLetter: null, certificates: [] });

  const colleges = getColleges();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [positionsRes, applicationsRes] = await Promise.all([
        getPositions({ status: 'open' }),
        getMyApplications(),
      ]);
      if (positionsRes.success) setPositions(positionsRes.data || []);
      if (applicationsRes.success) {
        setApplications(Array.isArray(applicationsRes.data.data) ? applicationsRes.data.data : []);
      } else {
        setApplications([]);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...positions];
    if (searchTerm) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (collegeFilter) {
      result = result.filter(p => p.college === collegeFilter);
    }
    if (tabValue === 'applied') {
      const ids = applications.map(a =>
        typeof a.position === 'object' ? a.position?._id : a.position
      ).filter(Boolean);
      result = result.filter(p => ids.includes(p._id));
    } else if (tabValue === 'eligible') {
      const ids = applications.map(a =>
        typeof a.position === 'object' ? a.position?._id : a.position
      ).filter(Boolean);
      result = result.filter(p => !ids.includes(p._id));
    }
    setFilteredPositions(result);
  }, [positions, applications, searchTerm, collegeFilter, tabValue]);

  const handleApply = async (positionId) => {
    if (!files.cv) { toast.error('CV is required'); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('positionId', positionId);
      formData.append('cv', files.cv);
      if (files.coverLetter) formData.append('coverLetter', files.coverLetter);
      files.certificates.forEach(cert => formData.append('certificates', cert));

      const res = await applyToPosition(formData);
      if (res.success) {
        toast.success('Application submitted successfully!');
        setOpenDialog(false);
        setFiles({ cv: null, coverLetter: null, certificates: [] });
        fetchData();
      }
      // error toast is shown inside applyToPosition
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getApplicationStatus = (positionId) => {
    if (!Array.isArray(applications)) return null;
    const app = applications.find(a => {
      const id = typeof a.position === 'object' ? a.position?._id : a.position;
      return id === positionId;
    });
    if (!app) return null;
    const map = {
      pending: { text: 'Applied', color: 'warning' },
      under_review: { text: 'Under Review', color: 'info' },
      shortlisted: { text: 'Shortlisted', color: 'success' },
      rejected: { text: 'Not Selected', color: 'error' },
      accepted: { text: 'Accepted', color: 'success' },
    };
    return map[app.status] || { text: 'Applied', color: 'warning' };
  };

  const getApplicationDetails = (positionId) => {
    if (!Array.isArray(applications)) return null;
    return applications.find(a => {
      const id = typeof a.position === 'object' ? a.position?._id : a.position;
      return id === positionId;
    }) || null;
  };

  const FileUploadBox = ({ id, label, accept, value, onChange, multiple = false }) => (
    <Box sx={{
      border: '2px dashed', borderColor: value ? '#7B1113' : '#cbd5e1',
      borderRadius: 2, p: 2, textAlign: 'center', bgcolor: value ? '#fdf8f8' : '#f8fafc',
      cursor: 'pointer', transition: 'all 0.2s',
      '&:hover': { borderColor: '#7B1113', bgcolor: '#fdf8f8' }
    }}>
      <input accept={accept} style={{ display: 'none' }} id={id} type="file"
        multiple={multiple} onChange={onChange} />
      <label htmlFor={id} style={{ cursor: 'pointer', display: 'block' }}>
        {value ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckIcon sx={{ color: '#7B1113', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#7B1113', fontWeight: 500 }}>
              {multiple ? `${value} file(s) selected` : value}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <UploadIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        )}
      </label>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#7B1113' }}>
          Available Positions
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Apply for open positions at Addis Ababa University
        </Typography>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth variant="outlined" placeholder="Search positions..."
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={colleges}
              value={collegeFilter}
              onChange={(_, v) => setCollegeFilter(v)}
              renderInput={(params) => (
                <TextField {...params} label="Filter by College" placeholder="All Colleges"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ py: 1, whiteSpace: 'normal' }}>
                  <Typography variant="body2">{option}</Typography>
                </Box>
              )}
              clearOnEscape
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" startIcon={<FilterListIcon />}
              onClick={() => { setSearchTerm(''); setCollegeFilter(null); }}
              sx={{ height: '56px', borderRadius: 2 }}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="All Positions" value="all" />
          <Tab label="Eligible to Apply" value="eligible" />
          <Tab label="My Applications" value="applied" />
        </Tabs>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress sx={{ color: '#7B1113' }} />
        </Box>
      )}

      {!isLoading && filteredPositions.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {tabValue === 'applied' ? "You haven't applied to any positions yet" : "No available positions match your criteria"}
          </Typography>
        </Paper>
      )}

      {/* Position Cards */}
      <Grid container spacing={3}>
        {filteredPositions.map((position) => {
          const applicationStatus = getApplicationStatus(position._id);
          const deadlinePassed = new Date(position.deadline) < new Date();
          return (
            <Grid item key={position._id} xs={12} sm={6} md={4}>
              <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip label={position.positionType} size="small" variant="outlined" color="primary" />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {deadlinePassed && <Chip icon={<ClosedIcon fontSize="small" />} label="Closed" size="small" color="error" />}
                      {applicationStatus && <Chip icon={<AppliedIcon fontSize="small" />} label={applicationStatus.text} size="small" color={applicationStatus.color} />}
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 1 }}>
                    {position.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7B1113', fontWeight: 500, display: 'block', mb: 0.5 }}>
                    {position.college}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {position.department}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {position.description?.length > 120
                      ? `${position.description.substring(0, 120)}...`
                      : position.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Deadline: {new Date(position.deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
                  <Button size="small" startIcon={<DescriptionIcon />}
                    onClick={() => { setSelectedPosition(position); setOpenDialog(true); }}>
                    Details
                  </Button>
                  {!applicationStatus && !deadlinePassed && (
                    <Button variant="contained" size="small"
                      onClick={() => { setSelectedPosition(position); setOpenDialog(true); }}
                      sx={{ ml: 'auto', bgcolor: '#7B1113', '&:hover': { bgcolor: '#5a0d0f' } }}>
                      Apply Now
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Position Detail & Apply Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setFiles({ cv: null, coverLetter: null, certificates: [] }); }}
        maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>

        <Box sx={{ bgcolor: '#7B1113', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{selectedPosition?.title}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {selectedPosition?.college} · {selectedPosition?.department}
            </Typography>
          </Box>
          <IconButton onClick={() => { setOpenDialog(false); setFiles({ cv: null, coverLetter: null, certificates: [] }); }} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {selectedPosition && (
            <Grid container spacing={3}>
              {/* Info */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Position Type</Typography>
                <Typography variant="body1" fontWeight={500} mb={1}>{selectedPosition.positionType}</Typography>
                <Typography variant="body2" color="text.secondary">Deadline</Typography>
                <Typography variant="body1" fontWeight={500}>{new Date(selectedPosition.deadline).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">College</Typography>
                <Typography variant="body1" fontWeight={500} mb={1}>{selectedPosition.college}</Typography>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedPosition.department}</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Description</Typography>
                <Typography variant="body2" color="text.secondary">{selectedPosition.description}</Typography>
              </Grid>

              {selectedPosition.requirements?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Requirements</Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {selectedPosition.requirements.map((req, i) => (
                      <Box component="li" key={i} sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{req}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Already applied */}
              {getApplicationStatus(selectedPosition._id) && (
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity={getApplicationStatus(selectedPosition._id).color === 'warning' ? 'warning' : 'info'} sx={{ mb: 2 }}>
                    Your application status: <strong>{getApplicationStatus(selectedPosition._id).text}</strong>
                  </Alert>
                  {(() => {
                    const app = getApplicationDetails(selectedPosition._id);
                    if (!app) return null;
                    return (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {app.documents?.cv && <Chip label="View CV" component="a" href={app.documents.cv} target="_blank" clickable size="small" sx={{ bgcolor: '#fdf0f0', color: '#7B1113' }} />}
                        {app.documents?.coverLetter && <Chip label="Cover Letter" component="a" href={app.documents.coverLetter} target="_blank" clickable size="small" sx={{ bgcolor: '#fdf0f0', color: '#7B1113' }} />}
                        {app.documents?.certificates?.map((c, i) => (
                          <Chip key={i} label={`Certificate ${i + 1}`} component="a" href={c} target="_blank" clickable size="small" sx={{ bgcolor: '#fdf0f0', color: '#7B1113' }} />
                        ))}
                      </Box>
                    );
                  })()}
                </Grid>
              )}

              {/* Apply form */}
              {!getApplicationStatus(selectedPosition._id) && new Date(selectedPosition.deadline) >= new Date() && (
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Upload Documents</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        CV / Resume <span style={{ color: '#7B1113' }}>*</span>
                      </Typography>
                      <FileUploadBox
                        id="cv-upload" label="Click to upload CV"
                        accept=".pdf,.doc,.docx"
                        value={files.cv?.name || null}
                        onChange={(e) => setFiles({ ...files, cv: e.target.files[0] })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Cover Letter <span style={{ color: '#94a3b8' }}>(optional)</span>
                      </Typography>
                      <FileUploadBox
                        id="cover-letter-upload" label="Click to upload Cover Letter"
                        accept=".pdf,.doc,.docx"
                        value={files.coverLetter?.name || null}
                        onChange={(e) => setFiles({ ...files, coverLetter: e.target.files[0] })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Certificates <span style={{ color: '#94a3b8' }}>(optional)</span>
                      </Typography>
                      <FileUploadBox
                        id="certificates-upload" label="Click to upload Certificates"
                        accept=".pdf,.jpg,.jpeg,.png"
                        value={files.certificates.length > 0 ? files.certificates.length : null}
                        onChange={(e) => setFiles({ ...files, certificates: [...e.target.files] })}
                        multiple
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => { setOpenDialog(false); setFiles({ cv: null, coverLetter: null, certificates: [] }); }}
            sx={{ borderColor: '#cbd5e1', color: '#64748b' }}>
            Close
          </Button>
          {!getApplicationStatus(selectedPosition?._id) && new Date(selectedPosition?.deadline) >= new Date() && (
            <Button variant="contained" onClick={() => handleApply(selectedPosition._id)}
              disabled={!files.cv || isSubmitting}
              sx={{ bgcolor: '#7B1113', '&:hover': { bgcolor: '#5a0d0f' }, minWidth: 160 }}>
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Application'}
            </Button>
          )}
        </Box>
      </Dialog>
    </Container>
  );
};

export default AvailablePositions;
