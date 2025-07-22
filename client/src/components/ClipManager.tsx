import React, { useEffect, useState } from 'react';

export interface Clip {
  id: number;
  tag?: string;
  url: string;
  content: string;
  createdAt: string;
}

interface ClipManagerProps {
  projectId: string;
  jwt: string;
  tags: { id: number; name: string }[];
}

export const ClipManager: React.FC<ClipManagerProps> = ({ projectId, jwt, tags }) => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const [clips, setClips] = useState<Clip[]>([]);
    const [newClipTag, setNewClipTag] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jwt) return;
        setLoading(true);
        fetch(`${API}/projects/${projectId}/clips`, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
          .then(r => (r.ok ? r.json() : Promise.reject(r.statusText)))
          .then((list: Clip[]) => setClips(list))
          .catch(e => setError(String(e)))
          .finally(() => setLoading(false));
      }, [projectId, jwt]);

      useEffect(() => {
        const handler = (message: any) => {
          if (
            message.type === 'CLIP_SAVED' &&
            message.projectId === Number(projectId)
          ){
            setClips(prev => [message.clip as Clip, ...prev]);
          }
        };
        chrome.runtime.onMessage.addListener(handler);
        return () => {
          chrome.runtime.onMessage.removeListener(handler);
        };
      }, [projectId]);
    
      const addClip = () => {
        if (!newUrl.trim() || !newContent.trim()) return;
        fetch(`${API}/projects/${projectId}/clips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            tag: newClipTag || undefined,
            url: newUrl.trim(),
            content: newContent.trim(),
          }),
        })
          .then(r => {
            if (!r.ok) throw new Error(r.statusText);
            return r.json() as Promise<Clip>;
          })
          .then(c => {
            setClips(prev => [c, ...prev]);
            setNewClipTag('');
            setNewUrl('');
            setNewContent('');
          })
          .catch(e => setError(String(e)));
      };

      const deleteClip = (id: number) => {
        fetch(`${API}/projects/${projectId}/clips/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${jwt}` },
        })
          .then(r => {
            if (!r.ok) throw new Error(r.statusText);
            setClips(prev => prev.filter(c => c.id !== id));
          })
          .catch(e => setError(String(e)));
      };

    return (
    <section>
        <h3>클립 관리</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {loading ? (
        <p>클립 불러오는 중…</p>
        ) : (
        <ul style={{ paddingLeft: 0 }}>
            {clips.map(c => (
            <li
                key={c.id}
                style={{
                marginBottom: 12,
                borderBottom: '1px solid #eee',
                paddingBottom: 8,
                }}
            >
                <div>
                <strong>{c.tag || '—'}</strong>{' '}
                <small>{new Date(c.createdAt).toLocaleString()}</small>
                </div>
                <div>
                <a href={c.url} target="_blank" rel="noreferrer">
                    {c.url}
                </a>
                </div>
                <div style={{ margin: '4px 0' }}>{c.content}</div>
                <button onClick={() => deleteClip(c.id)}>삭제</button>
            </li>
            ))}
        </ul>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <select value={newClipTag} onChange={e => setNewClipTag(e.target.value)}>
            <option value="">-- 태그 선택 (선택사항) --</option>
            {tags.map(t => (
            <option key={t.id} value={t.name}>
                {t.name}
            </option>
            ))}
        </select>
        <input
            style={{ padding: 4 }}
            type="text"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="URL 입력"
        />
        <textarea
            style={{ padding: 4 }}
            rows={3}
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Content 입력"
        />
        <button onClick={addClip}>클립 추가</button>
        </div>
    </section>
    );
};