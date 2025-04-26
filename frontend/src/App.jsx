// src/App.jsx
/**
 * App Component
 * 
 * This is the main application component that configures all routes
 * for the ESG Panel application. It sets up the routing structure using
 * React Router, defining paths for authentication, dashboard, reports,
 * history, and user guide.
 */
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import UserGuidePage from './pages/UserGuidePage';

/**
 * App Component
 * 
 * Configures the application's routing structure with React Router.
 * Routes are organized into logical groups:
 * - Authentication routes (register, login)
 * - Main application routes (dashboard, report)
 * - Utility routes (history, user guide)
 * 
 * @returns {JSX.Element} The router configuration with all application routes
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard Page */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Report Page */}
        <Route path="/report" element={<ReportPage />} />
        {/* History Page - New */}
        <Route path="/history" element={<HistoryPage />} />
        {/* User Guide Page */}
        <Route path="/guide" element={<UserGuidePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;