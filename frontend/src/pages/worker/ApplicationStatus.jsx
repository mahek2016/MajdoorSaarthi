import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { APPLICATION_STATUSES, STATUS_LABELS, formatCurrency } from '../../utils/constants';
import api from '../../services/api';
import styles from './ApplicationStatus.module.css';

export default function ApplicationStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    api.get('/workers/applications')
      .then(setApplications)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRespond = async (appId, action) => {
    try {
      await api.post(`/workers/applications/${appId}/respond`, { action });
      fetchApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStepIndex = (status) => {
    // Treat CONFIRMED as WORK_STARTED in terms of timeline mapping if WORK_STARTED isn't explicitly set
    if (status === 'CONFIRMED') return APPLICATION_STATUSES.indexOf('CONFIRMED');
    return APPLICATION_STATUSES.indexOf(status);
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>My Applications</h1>
      {loading && <LoadingState />}
      {!loading && applications.length === 0 && (
        <EmptyState 
          title="No applications yet" 
          message="Browse jobs and apply to track your status here." 
          action={<Link to="/worker/jobs">Browse Jobs</Link>} 
        />
      )}
      {!loading && applications.map((app) => (
        <div 
          key={app.id} 
          className={`card ${styles.card}`}
          style={{ 
            border: app.status === 'SHORTLISTED' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: app.status === 'SHORTLISTED' ? '0 4px 12px rgba(249, 115, 22, 0.15)' : 'none'
          }}
        >
          <div className={styles.header}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {app.job?.title}
                {app.status === 'SHORTLISTED' && (
                  <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    Hiring Offer Received!
                  </span>
                )}
              </h3>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #eee' }}>
            {app.matchScore > 0 && (
              <p className={styles.match} style={{ margin: 0 }}>Match Score: <strong>{Math.round(app.matchScore)}%</strong></p>
            )}
            
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Start Date: {app.job?.startDate ? new Date(app.job.startDate).toLocaleDateString('en-IN') : ''}
            </span>
          </div>

          {app.status === 'SHORTLISTED' && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
              <button 
                style={{ 
                  background: '#166534', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '6px', 
                  flex: 1, 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: '0.85rem' 
                }} 
                onClick={() => handleRespond(app.id, 'ACCEPT')}
              >
                ✓ ACCEPT OFFER
              </button>
              <button 
                style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '6px', 
                  flex: 1, 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: '0.85rem' 
                }} 
                onClick={() => handleRespond(app.id, 'REJECT')}
              >
                ✗ DECLINE
              </button>
            </div>
          )}
        </div>
      ))}
    </DashboardLayout>
  );
}
