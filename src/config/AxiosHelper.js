import axios from "axios";

export const baseURL = "http://localhost:8080";

export const httpClient = axios.create({
  baseURL: baseURL,
});

// Add token to requests if it exists
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401 errors
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${baseURL}/api/v1/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('displayName');
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export function timeAgo(date) {
  if (!date) return "just now";
  
  const now = new Date();
  const past = new Date(date);
  const secondsAgo = Math.floor((now - past) / 1000);

  if (secondsAgo < 10) return "just now";
  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
  
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
}