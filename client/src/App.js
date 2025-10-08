import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// forms 
import PropertyForm from './components/forms/PropertyForm';

// Layout Components
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import TenantLayout from './layouts/TenantLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';




// Public Pages
import Home from './pages/public/Home';
import PropertySearch from './pages/seeker/PropertySearch';
import PropertyDetails from './pages/seeker/PropertyDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PropertyApprovals from './pages/admin/PropertyApprovals';
import DisputeManagement from './pages/admin/DisputeManagement';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import PropertyManagement from './pages/agent/PropertyManagement';
import TenantManagement from './pages/agent/TenantManagement';
import PaymentTracking from './pages/agent/PaymentTracking';
import MaintenanceRequests from './pages/agent/MaintenanceRequests';
import AgentAnalytics from './pages/agent/AgentAnalytics';

// Tenant Pages
import TenantDashboard from './pages/tenant/TenantDashboard';
import RentPayments from './pages/tenant/RentPayments';
import TenantMaintenanceRequests from './pages/tenant/MaintenanceRequests';
import LeaseAgreements from './pages/tenant/LeaseAgreements';
import PaymentHistory from './pages/tenant/PaymentHistory';

// Seeker Pages
import SavedProperties from './pages/seeker/SavedProperties';
import Applications from './pages/seeker/Applications';

// Shared Pages
import Profile from './pages/shared/Profile';
import Settings from './pages/shared/Settings';
import NotFound from './pages/shared/NotFound';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="properties" element={<PropertySearch />} />
              <Route path="properties/:id" element={<PropertyDetails />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />


            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="property-approvals" element={<PropertyApprovals />} />
              <Route path="disputes" element={<DisputeManagement />} />
              <Route path="analytics" element={<PlatformAnalytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Agent Routes */}
            <Route
              path="/agent/*"
              element={
                <ProtectedRoute allowedRoles={['agent', 'landlord']}>
                  <AgentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/agent/dashboard" replace />} />
              <Route path="dashboard" element={<AgentDashboard />} />
              <Route path="properties" element={<PropertyManagement />} />
              <Route path="tenants" element={<TenantManagement />} />
              <Route path="payments" element={<PaymentTracking />} />
              <Route path="maintenance" element={<MaintenanceRequests />} />
              <Route path="analytics" element={<AgentAnalytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="properties/new" element={<PropertyForm />} />

            </Route>

            {/* Tenant Routes */}
            <Route
              path="/tenant/*"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <TenantLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/tenant/dashboard" replace />} />
              <Route path="dashboard" element={<TenantDashboard />} />
              <Route path="payments" element={<RentPayments />} />
              <Route path="maintenance" element={<TenantMaintenanceRequests />} />
              <Route path="lease" element={<LeaseAgreements />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* House Seeker Routes */}
            <Route
              path="/seeker/*"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <PublicLayout />
                </ProtectedRoute>
              }
            >
              <Route path="saved" element={<SavedProperties />} />
              <Route path="applications" element={<Applications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;