import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PricesPage from './pages/PricesPage';
import BuyPage from './pages/BuyPage';
import SellPage from './pages/SellPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

// Layout
import Layout from './components/Layout';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Default route — redirect to login if not authenticated, otherwise to home/dashboard */}
      <Route path="/" element={user ? <ProtectedRoute><Layout /></ProtectedRoute> : <Navigate to="/login" replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="prices" element={<PricesPage />} />
        <Route path="buy" element={<BuyPage />} />
        <Route path="buy/:id" element={<ProductDetailPage />} />
        <Route path="sell" element={<SellPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

      {/* Fallback for unknown routes — redirect to login or home */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
