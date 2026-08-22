export const SKILLS = [
  'Electrician',
  'Plumber',
  'Painter',
  'Mason',
  'Carpenter',
  'Welder',
  'Helper',
  'Other',
];

export const INDUSTRIES = [
  'Construction',
  'Infrastructure',
  'Manufacturing',
  'Real Estate',
  'Maintenance',
  'Other',
];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '200+'];

export const APPLICATION_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'SELECTED',
  'WORK_STARTED',
  'COMPLETED',
];

export const STATUS_LABELS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SELECTED: 'Selected',
  WORK_STARTED: 'Work Started',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  CLOSED: 'Closed',
};

export const MOCK_OTP = '123456';

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getRoleDashboard = (role) => {
  const routes = {
    WORKER: '/worker/dashboard',
    CONTRACTOR: '/contractor/dashboard',
    COMPANY: '/company/dashboard',
  };
  return routes[role] || '/';
};

export const getRoleOnboarding = (role) => {
  const routes = {
    WORKER: '/worker/onboarding',
    CONTRACTOR: '/contractor/onboarding',
    COMPANY: '/company/onboarding',
  };
  return routes[role] || '/role-selection';
};
