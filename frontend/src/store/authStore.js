import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('novel-token') || null,
  username: localStorage.getItem('novel-username') || null,
  
  login: (token, username) => {
    localStorage.setItem('novel-token', token);
    localStorage.setItem('novel-username', username);
    set({ token, username });
  },
  
  logout: () => {
    localStorage.removeItem('novel-token');
    localStorage.removeItem('novel-username');
    set({ token: null, username: null });
  }
}));
