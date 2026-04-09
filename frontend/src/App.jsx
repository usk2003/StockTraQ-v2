import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { TickerTape } from './components/TickerTape';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Analysis } from './pages/Analysis';
import { Listings } from './pages/Listings';
import { Chatbot } from './pages/Chatbot';
import { Roadmap } from './pages/Roadmap';
import { IpoModel } from './pages/IpoModel';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Listings1 } from './pages/Listings1';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Blogs } from './pages/Blogs';
import { BlogDetail } from './pages/BlogDetail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { Team } from './pages/Team';
import { Research } from './pages/Research';


const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
  return isAuth ? children : <Navigate to="/login" replace />;
};

const ProtectedAdminRoute = ({ children }) => {
  const isAdminAuth = localStorage.getItem('adminToken');
  return isAdminAuth ? children : <Navigate to="/admin" replace />;
};




function App() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar
        toggleTheme={toggleTheme}
        theme={theme}
      />
      <div className="pt-[72px]"> {/* Add padding to prevent overlap with fixed navbar */}
        {!location.pathname.startsWith('/admin') && <TickerTape />}
      </div>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/research" element={<Research />} />
          <Route path="/ipo" element={<Listings />} />
          <Route path="/ipo1" element={<Navigate to="/ipo" replace />} />
          <Route path="/ipo-model" element={<IpoModel />} />
          <Route path="/insight" element={<Chatbot />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/team" element={<Team />} />

          <Route path="*" element={<Home />} />



        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
