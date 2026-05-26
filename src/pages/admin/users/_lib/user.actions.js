import { getSearchQuery } from '/src/utils/helper';
import { toast } from 'react-hot-toast';
import { api, publicApi } from '/src/utils/api';

export const getUsers = async (queryParams) => {
  try {
    const searchQuery = getSearchQuery(queryParams);
    const res = await api.get(`/auth/users${searchQuery}`);
    return { success: true, data: res.data.data, totalRecords: res.data.meta.total };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'An unknown error occurred' },
    };
  }
};

export const createUser = async (data, isPublicRegistration = false) => {
  try {
    const { confirm_password, status, ...rest } = data;
    const res = isPublicRegistration
      ? await publicApi.post('/auth/register', rest)
      : await api.post('/auth/register', rest);

    if (!res.data.success) throw new Error(res.data.message || 'Registration failed');

    toast.success(res.data.message);
    return { success: true, data: res.data.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'An unknown error occurred' },
    };
  }
};

export const updateUserData = async (data) => {
  try {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: data.status,
    };
    const res = await api.patch(`/auth/users/${data.id || data._id}`, payload);
    toast.success(res.data.message);
    return { success: true, data: res.data.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'An unknown error occurred' },
    };
  }
};

export const deleteUserAsync = async (ids, password) => {
  try {
    const res = await api.delete('/auth/users', {
      data: { ids },
      headers: { 'X-Delete-Password': password },
    });
    toast.success(res.data.message);
    return { success: true, data: res.data.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return {
      success: false,
      error: error.response?.data || { message: 'An unknown error occurred' },
    };
  }
};
