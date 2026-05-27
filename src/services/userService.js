import { api } from '../utils/api';
import { getSearchQuery } from '../utils/helper';

export const getUsers = async (queryParams, token) => {
    try {
        const searchQuery = getSearchQuery(queryParams);
        const res = await api.get(`/auth/users${searchQuery}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        });
        return { success: true, data: res.data.data, totalRecords: res.data.meta.total };
    }
    catch (error) {
        // toast.error(error.response?.data?.message || error.message);
        return { 
        success: false, 
        error: error.response?.data || { message: 'An unknown error occurred' } 
        };
    }
}

export const createUser = async (data, token, isPublicRegistration = false) => {
    try {
        const { confirm_password, status, ...rest } = data;
        let res = '';

        if (isPublicRegistration) {
            res = await publicApi.post(`/auth/register`, rest);
        } else {
            res = await api.post(`/auth/register`, rest, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        if (!res.data.success) {
            throw new Error(res.data.message || 'Registration failed');
        }

        // toast.success(res.data.message);
        return { success: true, data: res.data.data };
    } catch (error) {
        // toast.error(error.response?.data?.message || error.message);
        return { 
            success: false, 
            error: error.response?.data || { message: 'An unknown error occurred' } 
        };
    }
}




export const updateUserProfile = async (data) => {
  try {
    console.log('updateUserProfile called with:', data);
    
    const formData = new FormData();
    
    const simpleFields = [
      'fullName', 'email', 'phone', 'department', 
      'positionType', 'bio', 'address', 'website'
    ];
    
    simpleFields.forEach(field => {
      if (data[field] !== undefined) {
        formData.append(field, data[field] || '');
      }
    });

    // Handle socialMedia
    let socialMedia = {};
    if (data.socialMedia) {
      try {
        socialMedia = typeof data.socialMedia === 'string' ? 
          (data.socialMedia === '' ? {} : JSON.parse(data.socialMedia)) : 
          data.socialMedia;
      } catch {
        socialMedia = {};
      }
    }
    formData.append('socialMedia', JSON.stringify(socialMedia));

    // Handle education array
    const education = Array.isArray(data.education) ? data.education : [];
    console.log('=== FRONTEND: Appending education:', JSON.stringify(education, null, 2));
    formData.append('education', JSON.stringify(education));

    // Handle experience array
    const experience = Array.isArray(data.experience) ? data.experience : [];
    console.log('=== FRONTEND: Appending experience:', JSON.stringify(experience, null, 2));
    formData.append('experience', JSON.stringify(experience));

    // Handle skills array
    const skills = Array.isArray(data.skills) ? data.skills : [];
    console.log('=== FRONTEND: Appending skills:', JSON.stringify(skills, null, 2));
    formData.append('skills', JSON.stringify(skills));

    // Only append profilePhoto if there's actually a file
    if (data.profilePhotoFile && data.profilePhotoFile instanceof File) {
      formData.append('profilePhoto', data.profilePhotoFile);
    }
    // Don't send profilePhoto in body at all - let backend keep existing one

    const res = await api.patch(`/auth/me`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('updateUserProfile API response:', res.data);

    if (!res.data.success) {
      throw new Error(res.data.message || 'Update failed');
    }

    return { 
      success: true, 
      data: res.data.data,
      message: res.data.message
    };
  } catch (error) {
    console.error('updateUserProfile error:', error);
    return { 
      success: false, 
      error: error.response?.data || { message: error.message || 'An unknown error occurred' } 
    };
  }
};
export const forgotPassword = async (email) => {
    try {
        const res = await api.post('/auth/forgot-password', { email });
        if (!res.data.success) {
            throw new Error(res.data.message || 'Forgot password failed');
        }
        return { success: true, data: res.data.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || { message: 'An unknown error occurred' } 
        };
    }
};


export const resetPassword = async (token,newPassword) => {
    try {
        const res = await api.post('/auth/reset-password', {resetToken: token, newPassword
        });
        if (!res.data.success) {
            throw new Error(res.data.message || 'Reset password failed');
        }
        // toast.success(res.data.message);
        return { success: true, data: res.data.data };
    } catch (error) {
        // toast.error(error.response?.data?.message || error.message);
        return { 
            success: false, 
            error: error.response?.data || { message: 'An unknown error occurred' } 
        };
    }
}


export const deleteUserAsync = async (ids, password, token) => {
    try {
        const res = await api.delete(`/auth/users`, {
            data: { ids: ids },
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Delete-Password': password
            }
        });

        if (!res.data.success) {
            throw new Error(res.data.message || 'Delete failed');
        }

        // toast.success(res.data.message);
        return { success: true, data: res.data.data };
    } catch (error) {
        // toast.error(error.response?.data?.message || error.message);
        return { 
            success: false, 
            error: error.response?.data || { message: 'An unknown error occurred' } 
        };
    }
}


export const changePassword = async (data, token) => {
    try {
        const res = await api.patch('/auth/change-password', data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return { success: true, data: res.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || { message: 'An unknown error occurred' },
        };
    }
};



export const getMyApplications = async (token) => {
  try {
    const res = await api.get('/applications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: res.data };
  } catch (error) {
    // toast.error(error.response?.data?.message || error.message);
    return { 
      success: false, 
      error: error.response?.data || { message: 'Failed to get applications' } 
    };
  }
};

export const getUserProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    console.log('getUserProfile API response:', res.data);
    return { success: true, data: res.data };
  } catch (error) {
    console.error('getUserProfile error:', error);
    return { success: false, data: null, error: error.response?.data };
  }
};