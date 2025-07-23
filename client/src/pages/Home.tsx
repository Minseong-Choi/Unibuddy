// pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Projects from '../components/Projects_list.tsx';
import '../styles/Home.css'; // CSS 파일 import

// Background ↔ UI 간에 오갈 메시지 타입 정의
type GoogleTokenMessage = {
  type: 'GOOGLE_TOKEN';
  token: string;
};
type GoogleTokenErrorMessage = {
  type: 'GOOGLE_TOKEN_ERROR';
  error: string;
};
type Message = GoogleTokenMessage | GoogleTokenErrorMessage;

export default function Home() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['jwt'], (result) => {
      if(result.jwt){
        setJwt(result.jwt as string);
      }
    })
  }, []);

  useEffect(() => {
    const listener = (
      message: Message,
      sender: chrome.runtime.MessageSender
    ) => {
      if (message.type === 'GOOGLE_TOKEN') {
        fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: message.token }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Server responded ${res.status}`);
            }
            return res.json() as Promise<{ token: string }>;
          })
          .then(({ token }) => {
            setJwt(token);
            chrome.storage.local.set({ jwt: token });
          })
          .catch((e: Error) => {
            setError(e.message);
          });
      } else if (message.type === 'GOOGLE_TOKEN_ERROR') {
        setError(message.error);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [API_URL]);

  const handleGoogleLogin = () => {
    setError(null);
    chrome.runtime.sendMessage({ type: 'LOGIN_GOOGLE' });
  };

  return (
    <div className="home-container">
      {/* Header */}
      <div className="header">
        <div className="header-brand">
          <div className="brand-icon">📎</div>
          <h1 className="brand-title">Unibuddy</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!jwt ? (
          <div className="welcome-container">
            <div className="welcome-card">
              <div className="welcome-icon">🚀</div>
              <h2 className="welcome-title">환영합니다!</h2>
              <p className="welcome-description">
                웹 자료조사와 게임을 즐겨보세요. 시작하려면 구글 계정으로 로그인해주세요.
              </p>
              
              <div className="login-section">
                <button className="btn-primary" onClick={handleGoogleLogin}>
                  🔐 Google로 로그인
                </button>
              </div>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">또는</span>
                <div className="divider-line"></div>
              </div>

              <Link to="/game">
                <button className="btn-secondary">
                  🎮 게임 시작하기
                </button>
              </Link>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="success-card">
              <div className="success-header">
                <div className="success-info">
                  <span className="success-icon">🎉</span>
                  <span className="success-text">로그인 성공!</span>
                </div>
                <Link to="/game">
                  <button className="btn-game">🎮 게임 시작</button>
                </Link>
              </div>
              <p className="success-description">
                프로젝트를 관리하고 웹 자료를 수집해보세요.
              </p>
            </div>

            <Projects jwt={jwt} />
          </div>
        )}
      </div>
    </div>
  );
}