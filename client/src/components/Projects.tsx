// src/components/Projects.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p>프로젝트를 보려면 로그인해주세요.</p>
        <button onClick={() => chrome.runtime.sendMessage({ type: 'LOGIN_GOOGLE' })}>
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
    navigate('/clip');
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2>내 프로젝트</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>로딩 중…</p>
      ) : projects.length === 0 ? (
        <p>생성된 프로젝트가 없습니다.</p>
      ) : (
        <ul style={{ paddingLeft: 0 }}>
          {projects.map(p => (
            <li
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
            >
              <span
                onClick={() => selectProject(p.id)}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                {p.name}
              </span>
              <button onClick={() => deleteProject(p.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', marginTop: 12 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="새 프로젝트 이름"
          style={{ flex: 1, padding: 4 }}
        />
        <button onClick={addProject} style={{ marginLeft: 8 }}>
          추가
        </button>
      </div>
    </div>
  );
}
