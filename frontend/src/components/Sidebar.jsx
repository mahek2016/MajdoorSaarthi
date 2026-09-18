import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Sidebar.module.css';

const NAV_CONFIG = {
  WORKER: [
    { to: '/worker/dashboard', key: 'side_dashboard', icon: '🏠' },
    { to: '/worker/jobs', key: 'side_jobs', icon: '💼' },
    { to: '/worker/applications', key: 'side_applications', icon: '📋' },
    { to: '/worker/profile', key: 'side_profile', icon: '👤' },
  ],
  CONTRACTOR: [
    { to: '/contractor/dashboard', key: 'side_dashboard', icon: '🏠' },
    { to: '/contractor/jobs', key: 'side_jobs', icon: '💼' },
    { to: '/contractor/post-job', key: 'side_post_job', icon: '➕' },
    { to: '/contractor/workers', key: 'side_workers', icon: '👷' },
    { to: '/contractor/household', key: 'side_household', icon: '🏡' },
    { to: '/contractor/analytics', key: 'side_analytics', icon: '📊' },
  ],
  COMPANY: [
    { to: '/company/dashboard', key: 'side_dashboard', icon: '🏠' },
    { to: '/company/projects', key: 'side_projects', icon: '🏗️' },
    { to: '/company/workforce', key: 'side_workforce', icon: '👥' },
  ],
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { role, logout, user } = useAuth();
  const { t } = useLanguage();
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
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.userName}>{user?.name || user?.user?.name}</p>
          <button className={styles.logout} onClick={handleLogout}>
            🚪 {t('side_logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
