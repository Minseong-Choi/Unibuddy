import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import CloseButton from './components/CloseButton';
import Clip from './pages/Clip';

function App() {
  return (
    <Router>
      <CloseButton />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/game' element={<Game />} />
        <Route path='/clip' element={<div>Clip Page</div>} />
        <Route path='/clip/:projectId' element={<Clip />} /> 
      </Routes>
    </Router>
  )
}

export default App;
