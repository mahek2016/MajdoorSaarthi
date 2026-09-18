import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardHeader from '../../components/DashboardHeader';
import StatsCard from '../../components/StatsCard';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import styles from './ContractorDashboard.module.css';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    totalWorkersHired: 0,
    avgWorkerRating: 4.5,
  });
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs/my-jobs'),
      api.get('/contractors/stats').catch(() => null),
      api.get('/contractors/attendance').catch(() => [])
    ]).then(([jobsData, statsData, attendanceData]) => {
      setJobs(jobsData);
      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback calculations if API fails
        const active = jobsData.filter((j) => j.status === 'OPEN' || j.status === 'IN_PROGRESS').length;
        const completed = jobsData.filter((j) => j.status === 'COMPLETED').length;
        const hired = jobsData.reduce((sum, j) => sum + (j.workersHired || 0), 0);
        setStats({ activeJobs: active, completedJobs: completed, totalWorkersHired: hired, avgWorkerRating: 4.5 });
      }
      setAttendance(attendanceData);
    })
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const name = user?.user?.name || user?.name;

  return (
    <DashboardLayout>
      <DashboardHeader
        name={name}
        subtitle={user?.businessName || 'Independent Contractor'}
        action={<Link to="/contractor/post-job"><PrimaryButton>{t('c_dash_post_new_job')}</PrimaryButton></Link>}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* Stats Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <StatsCard icon="💼" label={t('c_dash_active_jobs')} value={stats.activeJobs} color="primary" />
            <StatsCard icon="👷" label={t('c_dash_total_hired')} value={stats.totalWorkersHired} color="secondary" />
            <StatsCard icon="✅" label="Completed Jobs" value={stats.completedJobs} color="success" />
            <StatsCard icon="⭐" label={t('c_dash_avg_rating')} value={`⭐ ${stats.avgWorkerRating?.toFixed(1)}`} color="warning" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Jobs List */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>My Posted Jobs</h3>
              {jobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p className="text-muted">No jobs posted yet.</p>
                  <Link to="/contractor/post-job" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Post your first job →</Link>
                </div>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className={`card ${styles.jobCard}`} style={{ marginBottom: '1rem' }}>
                    <div className={styles.jobHeader}>
                      <div>
                        <h4>{job.title}</h4>
                        <p className="text-muted">{job.skillRequired} · {job.location}</p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className={styles.jobStats} style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <span>Workers: <strong>{job.workersHired}/{job.workersRequired}</strong></span> · 
                      <span> Wage: <strong>{formatCurrency(job.dailyWage)}/day</strong></span> · 
                      <span> Duration: <strong>{job.duration} Days</strong></span>
                    </div>
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                      <Link to={`/contractor/jobs/${job.id}/workers`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                        Manage Workers & Matches →
                      </Link>
                    </div>
                  </div>
                ))
              )}
              {jobs.length > 5 && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Link to="/contractor/jobs" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>View all jobs →</Link>
                </div>
              )}
            </div>

            {/* Attendance Logs */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>👷 Daily Attendance</h3>
              {attendance.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  No worker attendance logs recorded today.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {attendance.map((log) => (
                    <div key={log.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{log.worker?.user?.name || 'Worker'}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            {log.job?.title || 'Job'}
                          </p>
                        </div>
                        <StatusBadge status={log.status} />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: 'var(--color-text-muted)' }}>
                        <span>In: <strong>{log.checkIn ? new Date(log.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</strong></span>
                        <span>Out: <strong>{log.checkOut ? new Date(log.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
