import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='' element={<Home />} />
        <Route path='/clip' element={<div>Clip Page</div>} />
      </Routes>
    </Router>
  )
}

export default App;
