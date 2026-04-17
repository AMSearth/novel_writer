import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Sparkles, Loader2, Save } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const API_URL = 'http://127.0.0.1:8000/api';

// Simple debounce function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Editor() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Correction states
  const [grammarResult, setGrammarResult] = useState(null);
  const [paragraphResult, setParagraphResult] = useState(null);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [checkingParagraph, setCheckingParagraph] = useState(false);

  const apiKey = useThemeStore(state => state.apiKey);

  const debouncedContent = useDebounce(content, 2000); // auto-save after 2s of inactivity

  useEffect(() => {
    fetchChapter();
  }, [id]);

  // Auto-save logic
  useEffect(() => {
    if (chapter && content !== chapter.content) {
      saveChapter(content);
    }
  }, [debouncedContent]);

  const fetchChapter = async () => {
    try {
      const res = await axios.get(`${API_URL}/chapters/${id}`);
      setChapter(res.data);
      setContent(res.data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveChapter = async (textToSave) => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/chapters/${id}`, { content: textToSave });
      setChapter(prev => ({ ...prev, content: textToSave }));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!content.trim()) return;
    setCheckingGrammar(true);
    setGrammarResult(null);
    try {
      const res = await axios.post(`${API_URL}/grammar-check`, { text: content });
      setGrammarResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingGrammar(false);
    }
  };

  const handleParagraphCorrection = async () => {
    if (!content.trim()) return;
    setCheckingParagraph(true);
    setParagraphResult(null);
    
    try {
      const res = await axios.post(`${API_URL}/paragraph-correction`, { text: content, api_key: apiKey });
      setParagraphResult(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        alert("Error: " + err.response.data.detail);
      } else {
        alert("An error occurred during paragraph correction.");
      }
    } finally {
      setCheckingParagraph(false);
    }
  };

  const applyCorrection = (correctedText) => {
    setContent(correctedText);
    setGrammarResult(null);
    setParagraphResult(null);
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading editor...</div>;
  if (!chapter) return <div style={{padding: '2rem'}}>Chapter not found.</div>;

  return (
    <div className="editor-layout animate-fade-in">
      {/* Main Editing Area */}
      <div className="editor-main">
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to={`/novel/${chapter.novel_id}`} className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} /> Back to Chapter List
            </Link>
            <h2 style={{ marginTop: '0.5rem', marginBottom: 0 }}>{chapter.title}</h2>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            {saving ? (
              <span className="flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Saving...</span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1"><Save size={14} /> Saved {lastSaved.toLocaleTimeString()}</span>
            ) : null}
          </div>
        </div>

        <textarea
          className="editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin your masterpiece..."
          spellCheck="false"
        />
      </div>

      {/* AI Assistance Panel */}
      <div className="side-panel">
        <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: 'var(--text-lg)' }}>
          <Sparkles size={20} color="var(--accent-color)" /> AI Assistant
        </h3>

        {/* Action Buttons */}
        <div className="flex-col gap-4" style={{ marginBottom: '2rem' }}>
          <button className="btn-secondary flex items-center justify-center gap-2" onClick={handleGrammarCheck} disabled={checkingGrammar}>
            {checkingGrammar ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Check Grammar
          </button>

          <button className="btn-secondary flex items-center justify-center gap-2" onClick={handleParagraphCorrection} disabled={checkingParagraph}>
            {checkingParagraph ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Enhance Paragraph
          </button>
        </div>

        {/* Results Area */}
        {grammarResult && (
          <div className="correction-card animate-fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>Grammar Suggestions</h4>
              <span className="badge">Grammar</span>
            </div>
            
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
              {grammarResult.suggestions.map((sug, i) => <li key={i} style={{marginBottom: '0.25rem'}}>{sug}</li>)}
            </ul>
            
            {grammarResult.corrected_text !== grammarResult.original_text && (
              <div>
                <button className="btn-primary" style={{ width: '100%', fontSize: 'var(--text-xs)' }} onClick={() => applyCorrection(grammarResult.corrected_text)}>
                  Apply Corrections
                </button>
              </div>
            )}
          </div>
        )}

        {paragraphResult && (
          <div className="correction-card animate-fade-in" style={{ borderLeftColor: 'var(--accent-alt)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>Enhanced Paragraph</h4>
              <span className="badge" style={{ backgroundColor: 'rgba(var(--accent-alt), 0.2)', color: 'var(--accent-alt)' }}>Style</span>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
              {paragraphResult.corrected_text}
            </div>

            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
              {paragraphResult.suggestions.map((sug, i) => <li key={i} style={{marginBottom: '0.25rem'}}>{sug}</li>)}
            </ul>

            <button className="btn-primary" style={{ width: '100%', fontSize: 'var(--text-xs)', backgroundColor: 'var(--accent-alt)' }} onClick={() => applyCorrection(paragraphResult.corrected_text)}>
              Replace Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
