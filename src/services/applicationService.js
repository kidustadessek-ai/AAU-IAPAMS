import { api } from '../utils/api';
import toast from 'react-hot-toast';

export const applyToPosition = async (formData) => {
  try {
    const res = await api.post('/applications', formData, {
      headers: { 'Content-Type': undefined },
    });
    return { success: true, data: res.data };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to submit application';
    const errors = error.response?.data?.errors;
    toast.error(errors ? errors.join(', ') : msg);
    return { success: false, error: error.response?.data || { message: msg } };
  }
};

export const getMyApplications = async () => {
  try {
    const res = await api.get('/applications');
    return { success: true, data: res.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to get applications' },
    };
  }
};

export const getUserProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    return { success: true, data: res.data };
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch profile');
    return { success: false, data: null };
  }
};

export const getUserStats = async () => {
  try {
    const res = await api.get('/users/stats');
    return { success: true, data: res.data };
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch stats');
    return { success: false, data: {} };
  }
};

export const getEvaluations = async () => {
  try {
    const res = await api.get('/applications', { params: { evaluatorView: true } });
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to get evaluations' },
    };
  }
};

export const submitEvaluation = async (applicationId, evaluationData) => {
  try {
    const res = await api.post(`/applications/${applicationId}/evaluate`, evaluationData);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to submit evaluation' },
    };
  }
};

export const getApplicationsByPosition = async (positionId) => {
  try {
    const res = await api.get('/applications', { params: { position: positionId, limit: 100 } });
    return { success: true, data: res.data.data || [] };
  } catch (error) {
    return { success: false, error: error.response?.data || { message: 'Failed to fetch applicants' } };
  }
};

export const updateApplicationStatus = async (applicationId, status, notes = '') => {
  try {
    const res = await api.patch(`/applications/${applicationId}/status`, { status, notes });
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data || { message: 'Failed to update status' } };
  }
};
