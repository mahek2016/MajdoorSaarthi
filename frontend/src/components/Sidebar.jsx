import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV_CONFIG = {
  WORKER: [
    { to: '/worker/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/worker/jobs', label: 'Jobs', icon: '💼' },
    { to: '/worker/applications', label: 'Applications', icon: '📋' },
    { to: '/worker/profile', label: 'Profile', icon: '👤' },
  ],
  CONTRACTOR: [
    { to: '/contractor/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/contractor/jobs', label: 'Jobs', icon: '💼' },
    { to: '/contractor/post-job', label: 'Post Job', icon: '➕' },
    { to: '/contractor/workers', label: 'Workers', icon: '👷' },
  ],
  COMPANY: [
    { to: '/company/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/company/projects', label: 'Projects', icon: '🏗️' },
    { to: '/company/workforce', label: 'Workforce', icon: '👥' },
  ],
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const links = NAV_CONFIG[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}>M</span>
          <div>
            <span className={styles.logoText}>MajdoorSaarthi</span>
            <span className={styles.role}>{role?.toLowerCase()}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              onClick={onClose}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.userName}>{user?.name || user?.user?.name}</p>
          <button className={styles.logout} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}
