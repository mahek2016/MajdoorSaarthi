import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleOnboarding } from '../../utils/constants';
import styles from './RoleSelectionPage.module.css';

const ROLES = [
  { id: 'WORKER', icon: '👷', title: 'Worker', desc: 'Find nearby work' },
  { id: 'CONTRACTOR', icon: '🏗️', title: 'Contractor', desc: 'Hire & manage workers' },
  { id: 'COMPANY', icon: '🏢', title: 'Company', desc: 'Manage projects & workforce' },
];

export default function RoleSelectionPage() {
  const { selectRole } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="auth-page">
      <div className={styles.container}>
        <div className="auth-logo">
          <h1>MajdoorSaarthi</h1>
          <p>Kaam bhi. Kaamgar bhi.</p>
        </div>

        <h2 className={styles.title}>Choose Your Role</h2>
        <p className={styles.subtitle}>Select how you want to use MajdoorSaarthi</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.cards}>
          {ROLES.map((role) => (
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
