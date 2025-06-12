// lib/api.ts
import axios, { AxiosInstance } from 'axios';
import { User, ApiResponse, AuthCredentials, SignupCredentials } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Include cookies for sessions
});

export const signup = async (data: SignupCredentials): Promise<ApiResponse<User>> => {
  const response = await api.post<ApiResponse<User>>('/api/auth/signup', data);
  return response.data;
};

export const login = async (data: AuthCredentials): Promise<ApiResponse<User>> => {
  const response = await api.post<ApiResponse<User>>('/api/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<ApiResponse<never>> => {
  const response = await api.get<ApiResponse<never>>('/api/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/api/auth/current-user');
  return response.data;
};

// Google and GitHub OAuth initiators
export const initiateGoogleLogin = (): void => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
};

export const initiateGitHubLogin = (): void => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/github`;
};

export default api;