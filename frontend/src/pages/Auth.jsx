import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const loginApp = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill all fields.");
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login requires FormData for OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const res = await axios.post('/login', formData);
        loginApp(res.data.access_token, username);
        navigate('/');
      } else {
        // Signup
        await axios.post('/register', { username, password });
        // After signup, optionally log them in or ask to login
        setIsLogin(true);
        setError("Successfully registered! Please login.");
        setPassword('');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div style={{ backgroundColor: 'var(--accent-color)', color: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="flex-col gap-2">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="author123"
            />
          </div>
          
          <div className="flex-col gap-2">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', padding: 0, textDecoration: 'underline' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }}
          >
            {isLogin ? 'Signup here' : 'Login here'}
          </button>
        </div>
      </div>
    </div>
  );
}
