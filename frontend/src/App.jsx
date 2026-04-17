import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Book, Settings } from 'lucide-react';
import { useThemeStore } from './store/themeStore';

// Pages
import Dashboard from './pages/Dashboard';
import NovelDetail from './pages/NovelDetail';
import Editor from './pages/Editor';

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

function Layout() {
  return (
    <div className="app-container">
      <header className="header justify-between">
        <Link to="/" className="flex items-center gap-2 animate-fade-in">
          <Book size={24} color="var(--accent-color)" />
          <h1 style={{ marginBottom: 0, fontSize: 'var(--text-xl)' }}>Novel Writer</h1>
        </Link>
        <ThemeSelector />
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/novel/:id" element={<NovelDetail />} />
          <Route path="/chapter/:id" element={<Editor />} />
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
