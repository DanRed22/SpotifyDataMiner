import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Home from './pages/Home';
import Convert from './pages/Convert'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Specify the Home component for the root URL */}
        <Route path="/convert" element={<Convert />} />
      </Routes>
    </Router>
  );
}

export default App;
