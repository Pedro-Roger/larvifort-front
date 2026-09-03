import axios, { type InternalAxiosRequestConfig } from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

export const kanbanApi = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

kanbanApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
