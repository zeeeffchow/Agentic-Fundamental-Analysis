import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AnalysisResults } from './components/AnalysisResults';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis/:ticker" element={<AnalysisResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;