import React from 'react';
import { Link } from 'react-router-dom'

export default function Game() {
  const gameUrl = process.env.REACT_APP_API_URL + '/game/' || "http://localhost:4000/game/";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#333' }}>
      <div style={{ padding: '10px', backgroundColor: '#444' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          홈으로 돌아가기
        </Link>
      </div>
      <iframe
        src={gameUrl}
        title="Unity WebGL Game"
        style={{ flexGrow: 1, border: 'none' }}
        allow="fullscreen"
      />
    </div>
  );
}
