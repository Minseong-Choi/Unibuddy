import React from 'react';

const CloseButton: React.FC = () => {
    const handleClose = () => {
        window.parent.postMessage({type: "CLOSE_SIDEBAR"}, "*");
    }
    return (
        <button
            onClick={handleClose}
            style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 9999,
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
            }}
        >
            ❌
        </button>
    );
};

export default CloseButton;