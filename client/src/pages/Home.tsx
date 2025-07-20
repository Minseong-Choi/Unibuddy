import React, { useEffect, useState } from 'react';

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
    // 메시지 수신 리스너: Message, MessageSender 타입 사용
    const listener = (
      message: Message,
      sender: chrome.runtime.MessageSender
    ) => {
      if (message.type === 'GOOGLE_TOKEN') {
        // 받은 Google Access Token으로 백엔드에 로그인 요청
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
        // 로그인 실패 또는 사용자가 팝업을 취소했을 때
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
    <div style={{ padding: 20 }}>
      {!jwt ? (
        <>
          <button onClick={handleGoogleLogin}>Google로 로그인</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <p>로그인 성공! 🎉</p>
      )}
    </div>
  );
}
