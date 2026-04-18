import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios';
import App from './App.jsx'
import './index.css'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';

axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Root() {
  const initTheme = useThemeStore(state => state.initTheme);
  
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
