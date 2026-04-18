import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Book, LogOut } from 'lucide-react';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Pages
import Dashboard from './pages/Dashboard';
import NovelDetail from './pages/NovelDetail';
import Editor from './pages/Editor';
import Auth from './pages/Auth';

function ThemeSelector() {
  const { theme, font, apiKey, setTheme, setFont, setApiKey } = useThemeStore();

  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <label htmlFor="apiKey" style={{ fontSize: 'var(--text-sm)' }}>Gemini Key:</label>
        <input 
          id="apiKey" 
          type="password"
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="AI API Key"
          style={{ width: '120px' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="theme" style={{ fontSize: 'var(--text-sm)' }}>Theme:</label>
        <select 
          id="theme" 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="tokyo-night">Tokyo Night</option>
          <option value="cappuccino">Cappuccino</option>
          <option value="dark">Dark Standard</option>
          <option value="vscode">VSCode</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="font" style={{ fontSize: 'var(--text-sm)' }}>Font:</label>
        <select 
          id="font" 
          value={font} 
          onChange={(e) => setFont(e.target.value)}
        >
          <option value="inter">Inter (Sans)</option>
          <option value="merriweather">Merriweather (Serif)</option>
          <option value="firacode">Fira Code (Mono)</option>
          <option value="outfit">Outfit (Display)</option>
        </select>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = useAuthStore(state => state.token);
  if (!token) {
    // If not authenticated, we just show Auth page instead of children. 
    // Ideally we use Navigate, but returning Auth works perfectly inside Routes without flashing.
    return <Auth />;
  }
  return children;
}

function Layout() {
  const { token, logout, username } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="header justify-between">
        <Link to="/" className="flex items-center gap-2 animate-fade-in">
          <Book size={24} color="var(--accent-color)" />
          <h1 style={{ marginBottom: 0, fontSize: 'var(--text-xl)' }}>Novel Writer</h1>
        </Link>
        <div className="flex items-center gap-6">
          <ThemeSelector />
          {token && (
            <div className="flex items-center gap-4 border-l" style={{ paddingLeft: '1.5rem', borderColor: 'var(--border-color)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Hi, {username}</span>
              <button className="btn-secondary flex items-center gap-2" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/novel/:id" element={<ProtectedRoute><NovelDetail /></ProtectedRoute>} />
          <Route path="/chapter/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
