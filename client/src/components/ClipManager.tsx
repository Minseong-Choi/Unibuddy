// components/ClipManager.tsx - Compact Version
import React, { useEffect, useState } from 'react';
import '../styles/ClipManager.css';

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

      const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          action();
        }
      };

      const openUrl = (url: string) => {
        window.open(url, '_blank');
      };

      const truncateUrl = (url: string) => {
        if (url.length <= 25) return url;
        return url.substring(0, 25) + '...';
      };

    return (
        <section className="clip-manager-section">
            <h3 className="clip-manager-title">클립 관리</h3>
            
            {error && <div className="clip-error">{error}</div>}

            {loading ? (
                <div className="clip-loading">
                    <div className="clip-loading-spinner"></div>
                    로딩 중...
                </div>
            ) : clips.length === 0 ? (
                <div className="clips-empty">
                    <div className="clips-empty-icon">📎</div>
                    <div className="clips-empty-text">저장된 클립이 없습니다</div>
                </div>
            ) : (
                <div className="clips-list">
                    {clips.map(c => (
                        <div key={c.id} className="clip-item">
                            <div className="clip-header">
                                <div className="clip-meta">
                                    <span className={`clip-tag ${!c.tag ? 'no-tag' : ''}`}>
                                        {c.tag || '태그 없음'}
                                    </span>
                                    <span className="clip-date">
                                        {new Date(c.createdAt).toLocaleDateString('ko-KR', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <button 
                                    className="clip-delete-btn"
                                    onClick={() => deleteClip(c.id)}
                                >
                                    삭제
                                </button>
                            </div>
                            
                            <div className="clip-url">
                                <button 
                                    className="clip-url-btn"
                                    onClick={() => openUrl(c.url)}
                                    title={c.url}
                                >
                                    <span className="clip-url-text">
                                        {truncateUrl(c.url)}
                                    </span>
                                </button>
                            </div>
                            
                            <div className="clip-content">{c.content}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="clip-add-form">
                <h4 className="clip-add-title">새 클립 추가</h4>
                
                <div className="clip-form-group">
                    <select 
                        className="clip-select"
                        value={newClipTag} 
                        onChange={e => setNewClipTag(e.target.value)}
                    >
                        <option value="">🏷️ 태그 선택 (선택사항)</option>
                        {tags.map(t => (
                            <option key={t.id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    
                    <input
                        className="clip-input"
                        type="text"
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                        placeholder="🔗 URL 입력"
                        onKeyPress={e => handleKeyPress(e, addClip)}
                    />
                    
                    <textarea
                        className="clip-textarea"
                        rows={3}
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                        placeholder="📝 클립 내용을 입력하세요..."
                        onKeyPress={e => handleKeyPress(e, addClip)}
                    />
                    
                    <button 
                        className="clip-submit-btn"
                        onClick={addClip}
                        disabled={!newUrl.trim() || !newContent.trim()}
                    >
                        ✨ 클립 추가
                    </button>
                </div>
            </div>
        </section>
    );
};