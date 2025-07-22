import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import CloseButton from './components/CloseButton';
import BackButton from './components/BackButton';
import ProjectPage from './pages/Project';

function App() {
  return (
    <Router>
      <BackButton />
      <CloseButton />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/game' element={<Game />} />
        <Route path='/project' element={<div>Project Page</div>} />
        <Route path='/project/:projectId' element={<ProjectPage />} /> 
      </Routes>
    </Router>
  )
}

export default App;
