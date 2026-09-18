import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './navigation/ProtectedRoute';
import LoadingState from './components/LoadingState';
import SaarthiWidget from './components/SaarthiWidget';

// Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import OTPPage from './pages/auth/OTPPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';

// Worker
import WorkerOnboarding from './pages/worker/WorkerOnboarding';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerJobs from './pages/worker/WorkerJobs';
import JobDetails from './pages/worker/JobDetails';
import ApplicationStatus from './pages/worker/ApplicationStatus';
import WorkerProfile from './pages/worker/WorkerProfile';

// Contractor
import ContractorOnboarding from './pages/contractor/ContractorOnboarding';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorJobs from './pages/contractor/ContractorJobs';
import PostJob from './pages/contractor/PostJob';
import SuggestedWorkers from './pages/contractor/SuggestedWorkers';
import WorkerDetailsContractor from './pages/contractor/WorkerDetailsContractor';
import WorkerSearch from './pages/contractor/WorkerSearch';
import HouseholdRequest from './pages/contractor/HouseholdRequest';
import ContractorAnalytics from './pages/contractor/ContractorAnalytics';

// Company
import CompanyOnboarding from './pages/company/CompanyOnboarding';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProjects from './pages/company/CompanyProjects';
import CreateProject from './pages/company/CreateProject';
import WorkforceOverview from './pages/company/WorkforceOverview';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading MajdoorSaarthi..." />;
  }

  return (
    <>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/otp" element={<OTPPage />} />
      <Route path="/role-selection" element={
        <ProtectedRoute><RoleSelectionPage /></ProtectedRoute>
      } />

      {/* Worker Routes */}
      <Route path="/worker/onboarding" element={
        <ProtectedRoute allowedRoles={['WORKER']}><WorkerOnboarding /></ProtectedRoute>
      } />
      <Route path="/worker/dashboard" element={
        <ProtectedRoute allowedRoles={['WORKER']}><WorkerDashboard /></ProtectedRoute>
      } />
      <Route path="/worker/jobs" element={
        <ProtectedRoute allowedRoles={['WORKER']}><WorkerJobs /></ProtectedRoute>
      } />
      <Route path="/worker/jobs/:id" element={
        <ProtectedRoute allowedRoles={['WORKER']}><JobDetails /></ProtectedRoute>
      } />
      <Route path="/worker/applications" element={
        <ProtectedRoute allowedRoles={['WORKER']}><ApplicationStatus /></ProtectedRoute>
      } />
      <Route path="/worker/profile" element={
        <ProtectedRoute allowedRoles={['WORKER']}><WorkerProfile /></ProtectedRoute>
      } />

      {/* Contractor Routes */}
      <Route path="/contractor/onboarding" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><ContractorOnboarding /></ProtectedRoute>
      } />
      <Route path="/contractor/dashboard" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><ContractorDashboard /></ProtectedRoute>
      } />
      <Route path="/contractor/jobs" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><ContractorJobs /></ProtectedRoute>
      } />
      <Route path="/contractor/post-job" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><PostJob /></ProtectedRoute>
      } />
      <Route path="/contractor/jobs/:id/workers" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><SuggestedWorkers /></ProtectedRoute>
      } />
      <Route path="/contractor/workers" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><WorkerSearch /></ProtectedRoute>
      } />
      <Route path="/contractor/household" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><HouseholdRequest /></ProtectedRoute>
      } />
      <Route path="/contractor/analytics" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><ContractorAnalytics /></ProtectedRoute>
      } />
      <Route path="/contractor/workers/:id" element={
        <ProtectedRoute allowedRoles={['CONTRACTOR']}><WorkerDetailsContractor /></ProtectedRoute>
      } />

      {/* Company Routes */}
      <Route path="/company/onboarding" element={
        <ProtectedRoute allowedRoles={['COMPANY']}><CompanyOnboarding /></ProtectedRoute>
      } />
      <Route path="/company/dashboard" element={
        <ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>
      } />
      <Route path="/company/projects" element={
        <ProtectedRoute allowedRoles={['COMPANY']}><CompanyProjects /></ProtectedRoute>
      } />
      <Route path="/company/create-project" element={
        <ProtectedRoute allowedRoles={['COMPANY']}><CreateProject /></ProtectedRoute>
      } />
      <Route path="/company/workforce" element={
        <ProtectedRoute allowedRoles={['COMPANY']}><WorkforceOverview /></ProtectedRoute>
      } />
      <Route path="/company/projects/:id/workforce" element={
        <ProtectedRoute allowedRoles={['COMPANY']}><WorkforceOverview /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <SaarthiWidget />
    </>
  );
}

export default App;
