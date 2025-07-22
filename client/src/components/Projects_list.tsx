// src/components/Projects_list.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Projects_list.css'; // CSS 파일 import

interface Project {
  id: number;
  name: string;
  createdAt: string;
}

interface Props {
  jwt: string | null;
}

export default function Projects({ jwt }: Props) {
  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.set({ clipperEnabled: true });
  },[]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/projects`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((list: Project[]) => setProjects(list))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, [jwt]);

  if (!jwt) {
    return (
      <div className="projects-login-prompt">
        <p className="projects-login-text">프로젝트를 보려면 로그인해주세요.</p>
        <button 
          className="projects-login-btn"
          onClick={() => chrome.runtime.sendMessage({ type: 'LOGIN_GOOGLE' })}
        >
          Google로 로그인
        </button>
      </div>
    );
  }
    
  const addProject = () => {
    if (!newName.trim()) return;
    fetch(`${API}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ name: newName }),
    })
      .then(res => res.json())
      .then((proj: Project) => {
        setProjects(prev => [proj, ...prev]);
        setNewName('');
      })
      .catch(err => setError(String(err)));
  };

  const deleteProject = (id: number) => {
    fetch(`${API}/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        setProjects(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => setError(String(err)));
  };

  const selectProject = (id: number) => {
    chrome.storage.local.set({ selectedProjectId: id });
    navigate(`/project/${id}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addProject();
    }
  };

  return (
    <div className="projects-section">
      <h2 className="projects-title">내 프로젝트</h2>
      
      {error && (
        <div className="projects-error">{error}</div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          로딩 중…
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          생성된 프로젝트가 없습니다.
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(p => (
            <div key={p.id} className="project-card">
              <div 
                className="project-info"
                onClick={() => selectProject(p.id)}
              >
                <div className="project-name">{p.name}</div>
                <div className="project-date">
                  {new Date(p.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
              <button 
                className="btn-delete"
                onClick={() => deleteProject(p.id)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="add-project-form">
        <input
          className="project-input"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="새 프로젝트 이름"
          onKeyPress={handleKeyPress}
        />
        <button className="btn-add" onClick={addProject}>
          추가
        </button>
      </div>
    </div>
  );
}