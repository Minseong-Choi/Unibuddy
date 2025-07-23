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
        top: '20px',
        left: '12px',
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: '600',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#3b82f6',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.color = '#1d4ed8';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.color = '#3b82f6';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.15)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
      }}
    >
      <span style={{ fontSize: '10px' }}>←</span>
    </button>
  );
}