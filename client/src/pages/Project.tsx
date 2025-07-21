import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
    }, [jwt, projectId]);

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

    return (
    <div style={{ padding: 20 }}>
      <h2>프로젝트 {projectId} - 태그 관리</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading
        ? <p>태그 불러오는 중…</p>
        : (
          <ul style={{ paddingLeft: 0 }}>
            {tags.map(t => (
              <li key={t.id} style={{ display:'flex', alignItems:'center', marginBottom:4 }}>
                <span style={{ flex:1 }}>{t.name}</span>
                <button onClick={() => deleteTag(t.id)}>삭제</button>
              </li>
            ))}
          </ul>
        )
      }

      <div style={{ display:'flex', marginTop:12 }}>
        <input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="새 태그 이름"
          style={{ flex:1, padding:4 }}
        />
        <button onClick={addTag} style={{ marginLeft:8 }}>추가</button>
      </div>
    </div>
  );
}