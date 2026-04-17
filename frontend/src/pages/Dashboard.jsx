import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, BookOpen } from 'lucide-react';

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
      const res = await axios.get(`${API_URL}/novels`);
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
      const res = await axios.post(`${API_URL}/novels`, { title, synopsis });
      setNovels([...novels, res.data]);
      setShowCreate(false);
      setTitle('');
      setSynopsis('');
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
                <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>{novel.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {novel.synopsis || "No synopsis provided."}
                </p>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to={`/novel/${novel.id}`}>
                  <button className="btn-secondary" style={{ width: '100%' }}>Open Book</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
