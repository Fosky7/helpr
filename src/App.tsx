import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SonnerToaster } from '@/components/ui/sonner';

import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Profile from '@/pages/Profile';
import Account from '@/pages/Account';
import Dashboard from '@/pages/Dashboard';
import CampaignNewPage from '@/pages/CampaignNewPage';
import Campaigns from '@/pages/Campaigns';
import CampaignView from '@/pages/CampaignView';
import CampaignEdit from '@/pages/CampaignEdit';
import PublicCampaigns from '@/pages/PublicCampaigns';
import Status from '@/pages/Status';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/new" element={<ProtectedRoute><CampaignNewPage /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<CampaignView />} />
          <Route path="/campaigns/:id/edit" element={<ProtectedRoute><CampaignEdit /></ProtectedRoute>} />
          <Route path="/fundraisers" element={<PublicCampaigns />} />
          <Route path="/fundraisers/:slug" element={<CampaignView />} />
          <Route path="/status" element={<Status />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SonnerToaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
