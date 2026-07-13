import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Campaigns from '@/pages/Campaigns';
import CampaignView from '@/pages/CampaignView';
import ProjectStatus from '@/pages/ProjectStatus';
import ForgotPassword from "@/pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/fundraisers/:slug" element={<CampaignView />} />
        <Route path="/status" element={<ProjectStatus />} />

        {/* Protected routes – only accessible when authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<div>Create Campaign Page</div>} /> {/* Replace with actual CreateCampaign component */}
          <Route path="/campaigns/:id" element={<CampaignView />} />
          <Route path="/campaigns/:id/edit" element={<div>Edit Campaign Page</div>} /> {/* Replace with actual EditCampaign component */}
        </Route>

        {/* 404 fallback */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
