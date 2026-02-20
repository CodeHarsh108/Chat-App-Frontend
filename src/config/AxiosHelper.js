import axios from "axios";

// 🔥 Get API URL from environment variable
export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance with default config
export const httpClient = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - Add token to every request
httpClient.interceptors.request.use(
  (config) => {
    // Don't add token to public endpoints if needed
    const publicEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/health'];
    const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (!isPublic) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log requests in development only
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
httpClient.interceptors.response.use(
  (response) => {
    // Log responses in development only
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 🔥 Token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't try to refresh on auth endpoints
      if (originalRequest.url.includes('/auth/')) {
        // Clear storage and redirect to login
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(error);
      }
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting to refresh token...');
          
          const response = await axios.post(`${baseURL}/api/v1/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Refresh failed - clear everything and redirect
        localStorage.clear();
        window.location.href = '/';
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with error
      console.error(`❌ ${error.response.status} ${error.config?.url}:`, 
        error.response.data?.message || error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('❌ No response from server:', error.request);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format time ago
export function timeAgo(date) {
  if (!date) return "just now";
  
  const now = new Date();
  const past = new Date(date);
  const secondsAgo = Math.floor((now - past) / 1000);

  // Time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  if (secondsAgo < 10) return "just now";
  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(secondsAgo / seconds);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return "just now";
}

// Helper to get WebSocket URL
export function getWebSocketUrl() {
  const wsUrl = import.meta.env.VITE_WS_URL || baseURL;
  // Convert http:// to ws://, https:// to wss://
  return wsUrl.replace(/^http/, 'ws');
}

export default httpClient;