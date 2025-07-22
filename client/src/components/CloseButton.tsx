import React from 'react';
import '../styles/CloseButton.css'; // CSS 파일 import

interface CloseButtonProps {
  isDark?: boolean; // 다크 테마 옵션
}

const CloseButton: React.FC<CloseButtonProps> = ({ isDark = false }) => {
    const handleClose = () => {
        window.parent.postMessage({type: "CLOSE_SIDEBAR"}, "*");
    }

    return (
        <button
            onClick={handleClose}
            className={`close-button ${isDark ? 'dark' : ''}`}
        >
            ✕
        </button>
    );
};

export default CloseButton;