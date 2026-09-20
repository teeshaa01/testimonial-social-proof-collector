import axiosClient from './axiosClient';

export const authApi = {
  signup: (data) => axiosClient.post('/auth/signup', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  refreshToken: () => axiosClient.post('/auth/refresh'),
  getMe: () => axiosClient.get('/auth/me'),
  verifyEmail: (token) => axiosClient.post('/auth/verify-email', { token }),
  resendVerification: (email) => axiosClient.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data)
};
