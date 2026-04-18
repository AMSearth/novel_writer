import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, BookOpen, Edit2, Trash2, X, Save } from 'lucide-react';

// For Vite, axios config with default baseURL is now set in main.jsx, so we can just use relative paths
// However, since we used API_URL in the original, we can keep it or use defaults.
// In main.jsx we did: axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
// So we can omit API_URL or redefine it for fallback.

const API_URL = 'http://127.0.0.1:8000/api';

export default function Dashboard() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await axios.get('/novels');
      setNovels(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await axios.post('/novels', { title, synopsis });
      setNovels([...novels, res.data]);
      setShowCreate(false);
      setTitle('');
      setSynopsis('');
    } catch (err) {
      console.error(err);
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');

  const startEdit = (novel) => {
    setEditingId(novel.id);
    setEditTitle(novel.title);
    setEditSynopsis(novel.synopsis || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditSynopsis('');
  };

  const handleUpdate = async (id) => {
    try {
      const res = await axios.put(`/novels/${id}`, { title: editTitle, synopsis: editSynopsis });
      setNovels(novels.map(n => n.id === id ? res.data : n));
      cancelEdit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this novel? This action is permanent!")) return;
    try {
      await axios.delete(`/novels/${id}`);
      setNovels(novels.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading novels...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Your Library</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle size={18} />
          <span>New Novel</span>
        </button>
      </div>

      {showCreate && (
        <form className="card mb-4" onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
          <h3>Create a New Novel</h3>
          <div className="flex-col gap-4" style={{ marginTop: '1rem' }}>
            <div className="flex-col gap-2">
              <label>Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="The Great Tale"
                required
              />
            </div>
            <div className="flex-col gap-2">
              <label>Synopsis</label>
              <textarea 
                value={synopsis} 
                onChange={e => setSynopsis(e.target.value)} 
                placeholder="A brief summary of your story..."
                rows={4}
              />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary">Create</button>
            </div>
          </div>
        </form>
      )}

      {novels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <BookOpen strokeWidth={1} style={{ margin: '0 auto 1rem', width: '64px', height: '64px' }} />
          <p>No novels yet. Start your author journey today!</p>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowCreate(true)}>Create Your First Novel</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {novels.map(novel => (
            <div key={novel.id} className="card flex-col justify-between">
              <div>
                {editingId === novel.id ? (
                  <div className="flex-col gap-2">
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)} 
                      style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}
                    />
                    <textarea 
                      value={editSynopsis} 
                      onChange={e => setEditSynopsis(e.target.value)} 
                      rows={3}
                      style={{ fontSize: 'var(--text-sm)', width: '100%' }}
                    />
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>{novel.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {novel.synopsis || "No synopsis provided."}
                    </p>
                  </>
                )}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {editingId === novel.id ? (
                  <>
                    <button className="btn-primary" style={{ flex: 1, padding: '0.4rem', display: 'flex', justifyContent: 'center' }} onClick={() => handleUpdate(novel.id)}>
                      <Save size={18} />
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={cancelEdit}>
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={`/novel/${novel.id}`} style={{ flex: 1 }}>
                      <button className="btn-primary" style={{ width: '100%' }}>Open Book</button>
                    </Link>
                    <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={() => startEdit(novel)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.4rem', color: '#f87171' }} onClick={() => handleDelete(novel.id)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
