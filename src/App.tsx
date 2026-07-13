import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SonnerToaster } from '@/components/ui/sonner';
import * as Sheet from '@/components/ui/sheet';
import * as DropdownMenu from '@/components/ui/dropdown-menu';

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
import SrcDoc from "@/pages/SrcDoc";
import ProjectStatus from "@/pages/ProjectStatus";
import ForgotPassword from "@/pages/ForgotPassword";

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
          <Route path="/src-doc" element={<SrcDoc />} />
          <Route path="/project-status" element={<ProjectStatus />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SonnerToaster />

        <div style={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 8, zIndex: 50 }}>
          <Sheet.Sheet>
            <Sheet.SheetTrigger asChild>
              <button type="button">Open Sheet</button>
            </Sheet.SheetTrigger>
            <Sheet.SheetContent>
              <div style={{ padding: 16 }}>
                <h3>Sheet Wired</h3>
                <p>This is a wired Sheet component.</p>
                <Sheet.SheetClose asChild>
                  <button type="button">Close</button>
                </Sheet.SheetClose>
              </div>
            </Sheet.SheetContent>
          </Sheet.Sheet>
          <DropdownMenu.DropdownMenu>
            <DropdownMenu.DropdownMenuTrigger asChild>
              <button type="button">Menu</button>
            </DropdownMenu.DropdownMenuTrigger>
            <DropdownMenu.DropdownMenuContent align="end">
              <DropdownMenu.DropdownMenuLabel>Wired Menu</DropdownMenu.DropdownMenuLabel>
              <DropdownMenu.DropdownMenuSeparator />
              <DropdownMenu.DropdownMenuItem>Item 1</DropdownMenu.DropdownMenuItem>
              <DropdownMenu.DropdownMenuItem>Item 2</DropdownMenu.DropdownMenuItem>
            </DropdownMenu.DropdownMenuContent>
          </DropdownMenu.DropdownMenu>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;