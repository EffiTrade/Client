import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BinanceActions from './BinanceActions';
import AutomatedTrading from './AutomatedTrading';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
              <Link to="/">Dashboard</Link>
              <br></br>
              <Link to="/automated">Strategies</Link>

          </nav>
          <Routes>
            <Route path="/" element={<BinanceActions />} />
            <Route path="/automated" element={<AutomatedTrading />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
