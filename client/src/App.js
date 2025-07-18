import React, { useState } from 'react';

function App() {
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
    <div className="App">
      <h1>Chrome Extension with React and Express</h1>
      <button onClick={fetchMessageFromServer}>
        Fetch Message from Server
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
