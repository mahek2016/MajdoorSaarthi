import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/constants';
import api from '../../services/api';
import styles from './ContractorJobs.module.css';

export default function ContractorJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my-jobs').then(setJobs).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>My Jobs</h1>
      {loading && <LoadingState />}
      {!loading && jobs.map((job) => (
        <div key={job.id} className={`card ${styles.card}`}>
          <div className={styles.header}>
            <div>
              <h3>{job.title}</h3>
              <p className="text-muted">{job.skillRequired} · {job.location}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className={styles.stats}>
            <span>Workers: {job.workersHired}/{job.workersRequired}</span>
            <span>{formatCurrency(job.dailyWage)}/day</span>
            <span>{job.duration} days</span>
          </div>
          <Link to={`/contractor/jobs/${job.id}/workers`}>Find Workers →</Link>
        </div>
      ))}
    </DashboardLayout>
  );
}
