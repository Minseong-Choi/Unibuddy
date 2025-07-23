import React from 'react';
import { Link } from 'react-router-dom'

export default function Game() {
  const gameUrl = "https://unibuddygame.duckdns.org:8443/game/";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div className="header">
        <div className="header-brand">
          <div className="brand-icon">📎</div>
          <h1 className="brand-title">Unibuddy</h1>
        </div>
      </div>
      
      {/* Game Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <iframe
          src={gameUrl}
          title="Unity WebGL Game"
          style={{
            border: 'none',
            height: '100%',
            width: '100%',
            minHeight: 0 // Safari 호환
          }}
          allow="fullscreen"
        />

        {/* 조작법 안내 */}
        <div style={{
          padding: '0.15rem',
          backgroundColor: '#fff',
          borderTop: '1px solid #ccc',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#555',
        }}>
          🎮 <strong>조작법</strong> 
          <br />이동: 방향키, 회전: Q/E, W/S, A/D <br />
          스페이스바로 넙죽이 떨어뜨리기!
        </div>
      </div>
    </div>
  );
}
