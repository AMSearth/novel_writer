import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, FileText, ArrowLeft } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

export default function NovelDetail() {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  useEffect(() => {
    fetchNovel();
  }, [id]);

  const fetchNovel = async () => {
    try {
      const res = await axios.get(`${API_URL}/novels/${id}`);
      setNovel(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle) return;
    try {
      const res = await axios.post(`${API_URL}/novels/${id}/chapters`, {
        title: newChapterTitle,
        content: ""
      });
      setNovel({ ...novel, chapters: [...novel.chapters, res.data] });
      setShowCreate(false);
      setNewChapterTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container" style={{padding: '2rem'}}>Loading...</div>;
  if (!novel) return <div className="container" style={{padding: '2rem'}}>Novel not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <Link to="/" className="flex items-center gap-2" style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Library
      </Link>
      
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)' }}>{novel.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginTop: '1rem' }}>
          {novel.synopsis || "No synopsis available."}
        </p>
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Chapters ({novel.chapters.length})</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle size={18} />
          <span>New Chapter</span>
        </button>
      </div>

      {showCreate && (
        <form className="card mb-4" onSubmit={handleCreateChapter} style={{ marginBottom: '2rem' }}>
          <div className="flex gap-4 items-center">
            <input 
              type="text" 
              value={newChapterTitle} 
              onChange={e => setNewChapterTitle(e.target.value)} 
              placeholder="Chapter Title"
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      )}

      {novel.chapters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <p>No chapters yet. Start writing your first chapter!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
          {novel.chapters.map((chapter, index) => (
            <Link to={`/chapter/${chapter.id}`} key={chapter.id}>
              <div className="card flex items-center gap-4 hover-effect" style={{ padding: '1rem 1.5rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--bg-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{chapter.title}</h3>
                </div>
                <FileText color="var(--text-muted)" size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
