import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { APPLICATION_STATUSES, STATUS_LABELS, formatCurrency } from '../../utils/constants';
import api from '../../services/api';
import styles from './ApplicationStatus.module.css';

export default function ApplicationStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workers/applications').then(setApplications).finally(() => setLoading(false));
  }, []);

  const getStepIndex = (status) => APPLICATION_STATUSES.indexOf(status);

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>My Applications</h1>
      {loading && <LoadingState />}
      {!loading && applications.length === 0 && (
        <EmptyState title="No applications yet" message="Browse jobs and apply to track your status here." action={<Link to="/worker/jobs">Browse Jobs</Link>} />
      )}
      {!loading && applications.map((app) => (
        <div key={app.id} className={`card ${styles.card}`}>
          <div className={styles.header}>
            <div>
              <h3>{app.job?.title}</h3>
              <p className="text-muted">{app.job?.contractor?.businessName} · {formatCurrency(app.job?.dailyWage)}/day</p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          <div className={styles.timeline}>
            {APPLICATION_STATUSES.map((step, i) => {
              const current = getStepIndex(app.status);
              const isActive = i <= current;
              const isCurrent = i === current;
              return (
                <div key={step} className={`${styles.step} ${isActive ? styles.active : ''} ${isCurrent ? styles.current : ''}`}>
                  <div className={styles.dot} />
                  <span>{STATUS_LABELS[step]}</span>
                </div>
              );
            })}
          </div>

          {app.matchScore > 0 && (
            <p className={styles.match}>Match Score: <strong>{Math.round(app.matchScore)}%</strong></p>
          )}
        </div>
      ))}
    </DashboardLayout>
  );
}
