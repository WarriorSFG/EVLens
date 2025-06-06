import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'
import Dashboard from './Dashboard';
import Stations from './Stations';
import Signup from './Signup';
import Map from './Map';
import Login from './Login';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Router>
  )
}

export default App
