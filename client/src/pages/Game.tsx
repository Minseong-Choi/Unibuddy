import React from 'react';
import { Link } from 'react-router-dom';

export default function Game() {
  // 로컬 서버에서 호스팅되는 게임의 URL
  const gameUrl = process.env.REACT_APP_API_URL + "/gama/" ;
  

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
