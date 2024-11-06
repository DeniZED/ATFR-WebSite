import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import About from './components/About';
import Achievements from './components/Achievements';
import Activities from './components/Activities';
import PlannedEvents from './components/PlannedEvents';
import Join from './components/Join';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Dashboard/Login';
import { useAuthStore } from './stores/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function MainLayout() {
  return (
    <div className="bg-wot-dark text-wot-light">
      <Navbar />
      <Hero />
      <About />
      <Achievements />
      <Activities />
      <PlannedEvents />
      <Join />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard/*" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;