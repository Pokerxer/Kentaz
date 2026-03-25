import { apiClient, authApiClient } from './client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'therapist';
  avatar?: string;
  addresses?: Address[];
  wishlist?: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getProfile(): Promise<User> {
  return authApiClient<User>('/api/auth/me');
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return authApiClient<User>('/api/auth/profile', {
    method: 'PUT',
    body: data,
  });
}
