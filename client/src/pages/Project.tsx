// pages/Project.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipManager } from '../components/ClipManager';
import '../styles/Project.css';

interface Tag {
    id: number;
    name: string;
}

export default function ProjectPage(){
    const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const { projectId } = useParams<{projectId: string}>();
    const [jwt, setJwt] = useState<string|null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [clips, setClips] = useState<any[]>([]);
    const [clipperEnabled, setClipperEnabled] = useState<boolean>(true);
    const [projectName, setProjectName] = useState<string>('');

    useEffect(() => {
        chrome.storage.local.get('jwt', ({ jwt }) => {
          setJwt(jwt || null);
        });
    }, []);
    
    useEffect(() => {
        if (!jwt || !projectId) return;
        setLoading(true);
        fetch(`${API}/projects/${projectId}/tags`, {
            headers: { Authorization: `Bearer ${jwt}` }
        })
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(setTags)
            .catch(err => setError(String(err)))
            .finally(() => setLoading(false));
        fetch(`${API}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${jwt}`},
        })
          .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json() as Promise<{ id: number; name: string}>;
          })
          .then(data => setProjectName(data.name))
          .catch(console.error);
    }, [jwt, projectId]);

    const toggleClipper = () => {
      const next = !clipperEnabled;
      setClipperEnabled(next);
      chrome.storage.local.set({ clipperEnabled: next });
    };

    const addTag = () => {
        if (!newTag.trim() || !jwt || !projectId) return;
        fetch(`${API}/projects/${projectId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`
          },
          body: JSON.stringify({ name: newTag.trim() })
        })
          .then(res => res.json())
          .then((tag: Tag) => {
            setTags(prev => [...prev, tag]);
            setNewTag('');
          })
          .catch(err => setError(String(err)));
      };

    const deleteTag = (tagId: number) => {
        if (!jwt || !projectId) return;
        fetch(`${API}/projects/${projectId}/tags/${tagId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${jwt}` }
        })
            .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            setTags(prev => prev.filter(t => t.id !== tagId));
            })
            .catch(err => setError(String(err)));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTag();
        }
    };

    return (
      <div className="project-container">
          <div className="project-header">
              <h2 className="project-title">{projectName}</h2>
          </div>

          <div className="clipper-control-box">
              <div className="clipper-toggle-container">
                  <span className="clipper-toggle-label">클립 기능</span>
                  <div 
                      className={`toggle-switch ${clipperEnabled ? 'active' : ''}`}
                      onClick={toggleClipper}
                  >
                      <div className="toggle-switch-slider">
                          {clipperEnabled ? 'ON' : 'OFF'}
                      </div>
                  </div>
              </div>
              <span className={`toggle-status ${clipperEnabled ? 'enabled' : 'disabled'}`}>
                  {clipperEnabled ? '켜짐' : '꺼짐'}
              </span>
          </div>

          <div className="tags-section">
              <h3 className="tags-title">태그 관리</h3>
              
              {error && <div className="tags-error">{error}</div>}

              {loading ? (
                  <div className="tags-loading">태그 불러오는 중…</div>
              ) : (
                  <div className="tags-list">
                      {tags.length === 0 ? (
                          <div className="tags-empty">아직 생성된 태그가 없습니다</div>
                      ) : (
                          tags.map(t => (
                              <div key={t.id} className="tag-pill">
                                  <span className="tag-name">{t.name}</span>
                                  <button 
                                      className="tag-delete-btn"
                                      onClick={() => deleteTag(t.id)}
                                      title="태그 삭제"
                                  >
                                      ✕
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              )}

              <div className="tag-add-form">
                  <input
                      className="tag-input"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="새 태그 이름"
                      onKeyPress={handleKeyPress}
                  />
                  <button className="tag-add-btn" onClick={addTag}>
                      추가
                  </button>
              </div>
          </div>

          {jwt && projectId && (
              <ClipManager projectId={projectId} jwt={jwt} tags={tags} />
          )}
      </div>
  );
}