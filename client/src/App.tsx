import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx'
import CloseButton from './components/CloseButton';

function App() {
  return (
    <Router>
      <CloseButton />
      <Routes>
        <Route path='' element={<Home />} />
        <Route path='/clip' element={<div>Clip Page</div>} />
      </Routes>
    </Router>
  )
}

export default App;
