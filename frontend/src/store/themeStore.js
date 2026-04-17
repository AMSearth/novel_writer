import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('novel-theme') || 'tokyo-night',
  font: localStorage.getItem('novel-font') || 'inter',
  apiKey: localStorage.getItem('novel-apiKey') || '',
  setTheme: (newTheme) => {
    localStorage.setItem('novel-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },
  setFont: (newFont) => {
    localStorage.setItem('novel-font', newFont);
    document.documentElement.setAttribute('data-font', newFont);
    set({ font: newFont });
  },
  setApiKey: (newKey) => {
    localStorage.setItem('novel-apiKey', newKey);
    set({ apiKey: newKey });
  },
  initTheme: () => {
    const currentTheme = localStorage.getItem('novel-theme') || 'tokyo-night';
    const currentFont = localStorage.getItem('novel-font') || 'inter';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-font', currentFont);
    set({ theme: currentTheme, font: currentFont });
  }
}));
