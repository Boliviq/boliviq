import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Blueprint from '@/pages/Blueprint';
import Workspaces from '@/pages/Workspaces';
import Billing from '@/pages/Billing';
import Properties from '@/pages/Properties';
import Contacts from '@/pages/Contacts';
import Dashboard from '@/pages/Dashboard';
import Marketplace from '@/pages/Marketplace';
import Construction from '@/pages/Construction';
import ProjectDetail from '@/pages/ProjectDetail';
import Assistant from '@/pages/Assistant';
import Rewards from '@/pages/Rewards';
import Analytics from '@/pages/Analytics';
import Admin from '@/pages/Admin';
import DealAlerts from '@/pages/DealAlerts';
import KnowledgeBase from '@/pages/KnowledgeBase';
import ContractorTools from '@/pages/ContractorTools';
import HomeownerHome from '@/pages/HomeownerHome';
import ContractorHome from '@/pages/ContractorHome';
import AgentHome from '@/pages/AgentHome';
import InvestorHome from '@/pages/InvestorHome';
import { WorkspaceProvider } from '@/lib/workspaceContext';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blueprint" element={<Blueprint />} />
      <Route path="/workspaces" element={<WorkspaceProvider><Workspaces /></WorkspaceProvider>} />
      <Route path="/billing" element={<WorkspaceProvider><Billing /></WorkspaceProvider>} />
      <Route path="/properties" element={<WorkspaceProvider><Properties /></WorkspaceProvider>} />
      <Route path="/contacts" element={<WorkspaceProvider><Contacts /></WorkspaceProvider>} />
      <Route path="/dashboard" element={<WorkspaceProvider><Dashboard /></WorkspaceProvider>} />
      <Route path="/marketplace" element={<WorkspaceProvider><Marketplace /></WorkspaceProvider>} />
      <Route path="/construction" element={<WorkspaceProvider><Construction /></WorkspaceProvider>} />
      <Route path="/construction/:id" element={<WorkspaceProvider><ProjectDetail /></WorkspaceProvider>} />
      <Route path="/assistant" element={<WorkspaceProvider><Assistant /></WorkspaceProvider>} />
      <Route path="/rewards" element={<WorkspaceProvider><Rewards /></WorkspaceProvider>} />
      <Route path="/analytics" element={<WorkspaceProvider><Analytics /></WorkspaceProvider>} />
      <Route path="/admin" element={<WorkspaceProvider><Admin /></WorkspaceProvider>} />
      <Route path="/deal-alerts" element={<WorkspaceProvider><DealAlerts /></WorkspaceProvider>} />
      <Route path="/knowledge-base" element={<WorkspaceProvider><KnowledgeBase /></WorkspaceProvider>} />
      <Route path="/contractor-tools" element={<WorkspaceProvider><ContractorTools /></WorkspaceProvider>} />
      <Route path="/homeowner" element={<HomeownerHome />} />
      <Route path="/contractor" element={<ContractorHome />} />
      <Route path="/agent" element={<AgentHome />} />
      <Route path="/investor" element={<InvestorHome />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App