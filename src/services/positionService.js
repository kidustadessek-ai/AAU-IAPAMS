import { api } from '../utils/api';
import toast from 'react-hot-toast';

export const createPosition = async (positionData) => {
  try {
    const res = await api.post('/positions/create', positionData);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to create position' },
    };
  }
};

export const getPositions = async (queryParams = {}) => {
  try {
    const res = await api.get('/positions', { params: queryParams });
    return { success: true, data: res.data.data, totalRecords: res.data.meta.total };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch positions' },
    };
  }
};

export const getPositionById = async (id) => {
  try {
    const res = await api.get(`/positions/${id}`);
    return { success: true, data: res.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch position' },
    };
  }
};

export const updatePosition = async (id, updateData) => {
  try {
    const res = await api.patch(`/positions/${id}`, updateData);
    toast.success('Position updated successfully!');
    return { success: true, data: res.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to update position' },
    };
  }
};

export const closePosition = async (id) => {
  try {
    const res = await api.patch(`/positions/${id}/close`, {});
    toast.success('Position closed successfully!');
    return { success: true, data: res.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to close position' },
    };
  }
};

export const deletePosition = async (id) => {
  try {
    const res = await api.delete(`/positions/${id}`);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to delete position' },
    };
  }
};
