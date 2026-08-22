import { getGreeting } from '../utils/constants';

export default function DashboardHeader({ name, subtitle, action }) {
  return (
    <div className="dashboard-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>{getGreeting()}, {name || 'User'} 👋</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
