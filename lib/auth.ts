// lib/auth.ts
import axios, { AxiosInstance } from 'axios';
import { User, ApiResponse, AuthCredentials, SignupCredentials } from '@/types';

// Create API instance with empty baseURL for regular auth requests (mobile compatible)
const api: AxiosInstance = axios.create({
  baseURL: '', // Use relative URLs to hit Next.js API routes (for mobile compatibility)
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

// OAuth initiators - use direct backend URLs (required for OAuth to work)
export const initiateGoogleLogin = (): void => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.error('❌ NEXT_PUBLIC_BACKEND_URL not set');
    alert('Backend URL not configured. Please contact administrator.');
    return;
  }
  console.log('🔗 Initiating Google OAuth to:', `${backendUrl}/api/auth/google`);
  window.location.href = `${backendUrl}/api/auth/google`;
};

export const initiateGitHubLogin = (): void => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.error('❌ NEXT_PUBLIC_BACKEND_URL not set');
    alert('Backend URL not configured. Please contact administrator.');
    return;
  }
  console.log('🔗 Initiating GitHub OAuth to:', `${backendUrl}/api/auth/github`);
  window.location.href = `${backendUrl}/api/auth/github`;
};

export default api;
