import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Terrains from './pages/Terrains';
import Tournaments from './pages/Tournaments';
import Pricing from './pages/Pricing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1a3c26', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terrains" element={<Terrains />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
