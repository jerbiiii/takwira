import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Terrains from './pages/Terrains';
import Tournaments from './pages/Tournaments';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestTournament from './pages/RequestTournament';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/request-tournament" element={<ProtectedRoute><RequestTournament /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;