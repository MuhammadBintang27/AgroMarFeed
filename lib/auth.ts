// lib/auth.ts
import axios, { AxiosInstance } from 'axios';
import { User, ApiResponse, AuthCredentials, SignupCredentials } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: '', // Use relative URLs to hit Next.js API routes
  withCredentials: true, 
});

// Signup
export const signup = async (data: SignupCredentials): Promise<ApiResponse<User>> => {
  const response = await api.post('/api/auth/signup', data);
  return response.data;
};

// Login
export const login = async (data: AuthCredentials): Promise<ApiResponse<User>> => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

// Logout
export const logout = async (): Promise<ApiResponse<never>> => {
  const response = await api.get('/api/auth/logout');
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await api.get('/api/auth/current-user');
  return response.data;
};

// OAuth initiators
export const initiateGoogleLogin = (): void => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
};

export const initiateGitHubLogin = (): void => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/github`;
};

export default api;
