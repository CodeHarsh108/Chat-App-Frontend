import { httpClient } from "../config/AxiosHelper";

export const registerApi = async (userData) => {
  try {
    const response = await httpClient.post('/api/v1/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('displayName', response.data.displayName || response.data.username);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const loginApi = async (credentials) => {
  try {
    const response = await httpClient.post('/api/v1/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('displayName', response.data.displayName || response.data.username);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logoutApi = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  localStorage.removeItem('displayName');
  localStorage.removeItem('roomId');
};

export const getCurrentUserApi = async () => {
  try {
    const response = await httpClient.get('/api/v1/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const getUsername = () => {
  return localStorage.getItem('username') || localStorage.getItem('displayName') || 'User';
};