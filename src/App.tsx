import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Campaigns from '@/pages/Campaigns';
import CampaignView from '@/pages/CampaignView';
import Profile from '@/pages/Profile';
import ProjectStatus from '@/pages/ProjectStatus';
import UserMenu from "@/components/layout/UserMenu";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/status" element={<ProjectStatus />} />
          <Route path="/fundraisers/:slug" element={<CampaignView />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId" element={<ProtectedRoute><CampaignView /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId/edit" element={<ProtectedRoute><div>Edit Campaign (placeholder)</div></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Fallback */}
        <Route path="/user-menu" element={<UserMenu />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
