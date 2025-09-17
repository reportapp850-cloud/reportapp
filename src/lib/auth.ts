import { writable } from 'svelte/store';

interface User {
  id: number;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const authStore = writable<AuthState>({
  user: null,
  token: localStorage.getItem('token'),
  loading: false
});

const API_BASE = 'http://localhost:3001/api';

export const authService = {
  async login(email: string, password: string) {
    authStore.update(state => ({ ...state, loading: true }));
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      authStore.set({
        user: data.user,
        token: data.token,
        loading: false
      });

      return data;
    } catch (error) {
      authStore.update(state => ({ ...state, loading: false }));
      throw error;
    }
  },

  async register(email: string, password: string, fullName: string) {
    authStore.update(state => ({ ...state, loading: true }));
    
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      authStore.set({
        user: data.user,
        token: data.token,
        loading: false
      });

      return data;
    } catch (error) {
      authStore.update(state => ({ ...state, loading: false }));
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    authStore.set({
      user: null,
      token: null,
      loading: false
    });
  },

  async getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }
};

// Initialize auth state from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    // You might want to verify the token here
    authStore.update(state => ({ ...state, token }));
  }
}