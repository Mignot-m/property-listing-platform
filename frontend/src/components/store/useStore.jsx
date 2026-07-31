// Zustand store managing authentication, properties, favorites, and global state
import { create } from 'zustand';
import api from '../../api/axios';

const useStore = create((set, get) => ({
  // State
  user: null,
  token: localStorage.getItem('token') || null,
  properties: [],
  favorites: [],
  loading: false,
  error: null,

  // ============================================
  // AUTH ACTIONS
  // ============================================

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, data } = response.data;
      localStorage.setItem('token', token);
      set({ user: data, token, loading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },


// ✅ CORRECT - Returns success for ALL roles
register: async (userData) => {
  set({ loading: true, error: null });
  try {
    const response = await api.post('/api/auth/register', userData);
    console.log('✅ Registration successful:', response.data);
    set({ loading: false });
    return { success: true, message: 'Registration successful! Please login.' };
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error response:', error.response?.data);
    set({ 
      error: error.response?.data?.message || 'Registration failed', 
      loading: false 
    });
    return { 
      success: false, 
      message: error.response?.data?.message || 'Registration failed' 
    };
  }
},
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('favorites');
    set({ user: null, token: null, favorites: [], properties: [], loading: false });
  },

  // ============================================
  // INITIALIZE - Restore session on page load
  // ============================================

  initialize: async () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Initializing store, token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      set({ loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await api.get('/api/auth/me');
      console.log('✅ User restored:', response.data.data);
      set({ 
        user: response.data.data, 
        token: token,
        loading: false 
      });
      // Fetch favorites after user is restored
      await get().fetchFavorites();
    } catch (error) {
      console.error('❌ Failed to restore user:', error);
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  // ============================================
  // PROPERTY ACTIONS
  // ============================================

  fetchProperties: async (params = {}) => {
  console.log('🔄 fetchProperties called with params:', params);
  // Don't set global loading here - let component handle it
  try {
    const response = await api.get('/api/properties', { params });
    console.log('✅ fetchProperties response:', response.data);
    set({ properties: response.data.data || [] });
    return response.data;
  } catch (error) {
    console.error('❌ fetchProperties error:', error);
    set({ 
      error: error.response?.data?.message || 'Failed to fetch properties', 
      properties: []
    });
    throw error;
  }
},

  fetchProperty: async (id) => {
    console.log('🔄 fetchProperty called for id:', id);
    try {
      const response = await api.get(`/api/properties/${id}`);
      console.log('✅ fetchProperty response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ fetchProperty error:', error);
      return null;
    }
  },

  createProperty: async (formData) => {
    console.log('🔄 createProperty called');
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ createProperty response:', response.data);
      set({ loading: false });
      // Refresh properties after creation
      await get().fetchProperties({});
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ createProperty error:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create property', 
        loading: false 
      });
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateProperty: async (id, formData) => {
    console.log('🔄 updateProperty called for id:', id);
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/properties/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ updateProperty response:', response.data);
      set({ loading: false });
      // Refresh properties after update
      await get().fetchProperties({});
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ updateProperty error:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update property', 
        loading: false 
      });
      return { success: false, message: error.response?.data?.message };
    }
  },

  publishProperty: async (id) => {
    console.log('🔄 publishProperty called for id:', id);
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/api/properties/${id}/publish`);
      console.log('✅ publishProperty response:', response.data);
      set({ loading: false });
      // Refresh properties after publish
      await get().fetchProperties({});
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ publishProperty error:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to publish property', 
        loading: false 
      });
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteProperty: async (id) => {
    console.log('🔄 deleteProperty called for id:', id);
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/properties/${id}`);
      console.log('✅ deleteProperty success');
      set({ loading: false });
      // Remove from local state
      set((state) => ({
        properties: state.properties.filter((p) => p._id !== id),
      }));
      return { success: true };
    } catch (error) {
      console.error('❌ deleteProperty error:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to delete property', 
        loading: false 
      });
      return { success: false, message: error.response?.data?.message };
    }
  },

  // ============================================
  // FAVORITE ACTIONS
  // ============================================

  addToFavorites: async (propertyId) => {
    console.log('🔄 addToFavorites called for id:', propertyId);
    try {
      await api.post(`/api/favorites/${propertyId}`);
      set((state) => ({
        favorites: [...state.favorites, propertyId],
      }));
      localStorage.setItem('favorites', JSON.stringify([...get().favorites, propertyId]));
      return { success: true };
    } catch (error) {
      console.error('❌ addToFavorites error:', error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  removeFromFavorites: async (propertyId) => {
    console.log('🔄 removeFromFavorites called for id:', propertyId);
    try {
      await api.delete(`/api/favorites/${propertyId}`);
      set((state) => ({
        favorites: state.favorites.filter((id) => id !== propertyId),
      }));
      localStorage.setItem('favorites', JSON.stringify(get().favorites));
      return { success: true };
    } catch (error) {
      console.error('❌ removeFromFavorites error:', error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  fetchFavorites: async () => {
    console.log('🔄 fetchFavorites called');
    try {
      const response = await api.get('/api/favorites');
      const favoriteIds = response.data.data.map((p) => p._id);
      set({ favorites: favoriteIds });
      localStorage.setItem('favorites', JSON.stringify(favoriteIds));
      return response.data.data;
    } catch (error) {
      console.error('❌ fetchFavorites error:', error);
      return [];
    }
  },

  syncFavorites: () => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try {
        const favorites = JSON.parse(stored);
        set({ favorites });
      } catch (e) {
        console.error('Error syncing favorites:', e);
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export default useStore;