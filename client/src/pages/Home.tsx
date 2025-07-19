"use client"

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleGoToClip = () => {
    navigate('clip');
  }

  const [message, setMessage] = useState('');

  const fetchMessageFromServer = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/message');
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching from server:', error);
    }
  };

  return (
    <div>
      <h1>Chrome Extension with React and Express</h1>
      <button onClick={fetchMessageFromServer}>
        Fetch Message from Server
      </button>
      {message && <p>{message}</p>}
      <button onClick={handleGoToClip}> Go To clip </button>
    </div>
  );
}