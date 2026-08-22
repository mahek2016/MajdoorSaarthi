import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardHeader from '../../components/DashboardHeader';
import StatsCard from '../../components/StatsCard';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './ContractorDashboard.module.css';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my-jobs').then(setJobs).finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'OPEN' || j.status === 'IN_PROGRESS');
  const totalWorkers = jobs.reduce((sum, j) => sum + (j.workersHired || 0), 0);

  return (
    <DashboardLayout>
      <DashboardHeader
        name={user?.user?.name || user?.name}
        subtitle={user?.businessName}
        action={<Link to="/contractor/post-job"><PrimaryButton>+ POST NEW JOB</PrimaryButton></Link>}
      />

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <StatsCard icon="💼" label="Active Jobs" value={activeJobs.length} color="primary" />
        <StatsCard icon="👷" label="Total Workers Hired" value={totalWorkers} color="secondary" />
      </div>

      <h3 style={{ marginBottom: '1rem' }}>My Jobs</h3>
      {loading && <LoadingState />}
      {!loading && jobs.length === 0 && (
        <p className="text-muted">No jobs posted yet. <Link to="/contractor/post-job">Post your first job</Link></p>
      )}
      {!loading && jobs.map((job) => (
        <div key={job.id} className={`card ${styles.jobCard}`}>
          <div className={styles.jobHeader}>
            <div>
              <h4>{job.title}</h4>
              <p className="text-muted">{job.skillRequired} · {job.location}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className={styles.jobStats}>
            <span>Workers: {job.workersHired}/{job.workersRequired}</span>
            <span>{formatCurrency(job.dailyWage)}/day</span>
          </div>
          <Link to={`/contractor/jobs/${job.id}/workers`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            View Suggested Workers →
          </Link>
        </div>
      ))}
    </DashboardLayout>
  );
}
