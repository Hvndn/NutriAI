import { create } from 'zustand';
import api from './api';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  daily_calorie_goal: number;
  is_admin: boolean;
  created_at: string;
}

interface Scan {
  id: number;
  user_id: number;
  image_url: string | null;
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  weight_grams: number;
  health_score: number;
  health_advice: string | null;
  created_at: string;
  ingredients: Array<{
    id: number;
    ingredient_name: string;
    amount: string | null;
    is_healthy: boolean;
  }>;
}

interface DailyTracker {
  date: string;
  calories_consumed: number;
  calories_goal: number;
  remaining_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  scans_count: number;
}

interface AdminStats {
  total_users: number;
  total_scans: number;
  average_calories: number;
  top_foods: Array<{ food_name: string; scan_count: number }>;
  scan_growth: Array<{ date: string; scans: number }>;
}

interface AppState {
  user: User | null;
  token: string | null;
  dailyTracker: DailyTracker | null;
  history: Scan[];
  adminStats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  language: 'vi' | 'en';
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: str, full_name: string, daily_calorie_goal: number) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  fetchDailyTracker: () => Promise<void>;
  fetchHistory: (search?: string) => Promise<void>;
  fetchAdminStats: () => Promise<void>;
  uploadAndAnalyzeImage: (file: File) => Promise<Scan | null>;
  updateDailyGoal: (goal: number) => Promise<void>;
  deleteScan: (id: number) => Promise<void>;
  setLanguage: (lang: 'vi' | 'en') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  dailyTracker: null,
  history: [],
  adminStats: null,
  isLoading: false,
  error: null,
  language: typeof window !== 'undefined' ? (localStorage.getItem('lang') as 'vi' | 'en' || 'vi') : 'vi',

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ token: access_token, user, isLoading: false });
      
      // Load thêm tracker & history ngay sau khi login thành công
      get().fetchDailyTracker();
      get().fetchHistory();
      
      return true;
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.' 
      });
      return false;
    }
  },

  register: async (email, password, full_name, daily_calorie_goal) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', { 
        email, 
        password, 
        full_name, 
        daily_calorie_goal 
      });
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.' 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, dailyTracker: null, history: [], adminStats: null });
  },

  fetchMe: async () => {
    try {
      const response = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data });
    } catch (err) {
      get().logout();
    }
  },

  fetchDailyTracker: async () => {
    try {
      const response = await api.get('/scans/daily-tracker');
      set({ dailyTracker: response.data });
    } catch (err) {}
  },

  fetchHistory: async (search = '') => {
    try {
      const response = await api.get(`/scans/?search=${search}`);
      set({ history: response.data });
    } catch (err) {}
  },

  fetchAdminStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      set({ adminStats: response.data });
    } catch (err) {}
  },

  uploadAndAnalyzeImage: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/scans/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newScan = response.data;
      
      // Cập nhật lại list lịch sử và daily tracker sau khi quét
      set((state) => ({
        history: [newScan, ...state.history],
        isLoading: false
      }));
      
      await get().fetchDailyTracker();
      
      return newScan;
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.response?.data?.detail || 'Lỗi phân tích hình ảnh thực phẩm.' 
      });
      return null;
    }
  },

  updateDailyGoal: async (goal) => {
    try {
      const response = await api.put('/auth/me', { daily_calorie_goal: goal });
      set({ user: response.data });
      await get().fetchDailyTracker();
    } catch (err) {}
  },

  deleteScan: async (id) => {
    try {
      await api.delete(`/scans/${id}`);
      set((state) => ({
        history: state.history.filter((scan) => scan.id !== id)
      }));
      await get().fetchDailyTracker();
    } catch (err) {}
  },

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
    set({ language: lang });
  }
}));
