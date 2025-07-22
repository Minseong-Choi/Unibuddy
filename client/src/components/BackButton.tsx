// src/components/BackButton.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 홈 페이지에선 숨김
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        padding: '4px 8px',
        fontSize: '14px',
        borderRadius: 4,
        border: '1px solid #ccc',
        background: '#fff',
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      ← 뒤로
    </button>
  );
}
