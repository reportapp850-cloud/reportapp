import { writable } from 'svelte/store';
import { supabase } from './supabase.js';

interface User {
  id: string;
  email: string;
  full_name: string;
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

export const authService = {
  async login(email: string, password: string) {
    authStore.update(state => ({ ...state, loading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || data.user.email!
        };
        
        authStore.set({
          user,
          token: data.session.access_token,
          loading: false
        });
        
        return { user, token: data.session.access_token };
      }
    } catch (error) {
      authStore.update(state => ({ ...state, loading: false }));
      throw error;
    }
  },

  async register(email: string, password: string, fullName: string) {
    authStore.update(state => ({ ...state, loading: true }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName
        };
        
        authStore.set({
          user,
          token: data.session.access_token,
          loading: false
        });
        
        return { user, token: data.session.access_token };
      }
    } catch (error) {
      authStore.update(state => ({ ...state, loading: false }));
      throw error;
    }
  },

  logout() {
    supabase.auth.signOut();
    authStore.set({
      user: null,
      token: null,
      loading: false
    });
  },

  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
      'Content-Type': 'application/json'
    };
  }
};

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const user = {
      id: session.user.id,
      email: session.user.email!,
      full_name: session.user.user_metadata?.full_name || session.user.email!
    };
    
    authStore.set({
      user,
      token: session.access_token,
      loading: false
    });
  } else if (event === 'SIGNED_OUT') {
    authStore.set({
      user: null,
      token: null,
      loading: false
    });
  }
});