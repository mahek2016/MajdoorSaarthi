import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getRoleOnboarding } from '../../utils/constants';
import styles from './RoleSelectionPage.module.css';

const ROLES = [
  { id: 'WORKER', icon: '👷', title: 'Worker', desc: 'Find nearby work' },
  { id: 'CONTRACTOR', icon: '🏗️', title: 'Contractor', desc: 'Hire & manage workers' },
  { id: 'COMPANY', icon: '🏢', title: 'Company', desc: 'Manage projects & workforce' },
];

export default function RoleSelectionPage() {
  const { selectRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || '';
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleSelect = async (roleId) => {
    setLoading(roleId);
    setError('');
    try {
      await selectRole(roleId);
      navigate(getRoleOnboarding(roleId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (type === 'find-work') {
      handleSelect('WORKER');
    }
  }, [type]);

  const filteredRoles = type === 'hire-workers'
    ? ROLES.filter((role) => role.id !== 'WORKER')
    : ROLES;

  if (type === 'find-work' && loading === 'WORKER') {
    return (
      <div className="auth-page">
        <div className={styles.container} style={{ textAlign: 'center' }}>
          <h2 className={styles.title}>Setting up your profile...</h2>
          <p className={styles.subtitle}>Please wait, redirecting to onboarding.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className={styles.container}>
        <div className="auth-logo">
          <h1>MajdoorSaarthi</h1>
          <p>{t('hero_tagline_1')} {t('hero_tagline_2')}</p>
        </div>

        <h2 className={styles.title}>{t('auth_choose_role')}</h2>
        <p className={styles.subtitle}>{t('auth_select_desc')}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.cards}>
          {filteredRoles.map((role) => (
            <button
              key={role.id}
              className={styles.card}
              onClick={() => handleSelect(role.id)}
              disabled={loading !== null}
            >
              <span className={styles.icon}>{role.icon}</span>
              <div className={styles.content}>
                <h3>{role.title}</h3>
                <p>{role.desc}</p>
              </div>
              <span className={styles.arrow}>{loading === role.id ? '...' : '→'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
