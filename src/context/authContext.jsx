import { createContext, useContext, useState } from 'react';
import { publicApi } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedTokens = localStorage.getItem('tokens');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      tokens: storedTokens ? JSON.parse(storedTokens) : null,
    };
  });

  const login = async (username, password) => {
    try {
      console.log('Attempting login to:', publicApi.defaults.baseURL);
      const res = await publicApi.post('/auth/login', { username, password });
      const { data } = res;
      if (!data?.success) throw new Error(data?.message || 'Login failed');

      const { user, tokens } = data.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
      setAuth({ user, tokens });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Network error. Please try again later.');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setAuth({ user: null, tokens: null });
  };

  const updateUser = (updatedUser) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newUser = {
      ...currentUser,
      ...updatedUser,
      education: updatedUser.education ?? currentUser.education ?? [],
      experience: updatedUser.experience ?? currentUser.experience ?? [],
      skills: updatedUser.skills ?? currentUser.skills ?? [],
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setAuth(prev => ({ ...prev, user: newUser }));
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
