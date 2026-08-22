import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import MatchScore from '../../components/MatchScore';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import { formatCurrency } from '../../utils/constants';
import api from '../../services/api';
import styles from './WorkerDetailsContractor.module.css';

export default function WorkerDetailsContractor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    const endpoint = jobId ? `/jobs/${jobId}/workers` : `/workers/${id}`;
    if (jobId) {
      api.get(`/jobs/${jobId}/workers`).then((workers) => {
        setWorker(workers.find((w) => w.id === parseInt(id)));
      }).finally(() => setLoading(false));
    } else {
      api.get(`/workers/${id}`).then(setWorker).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id, jobId]);

  const handleHire = async () => {
    if (!jobId) return;
    setHiring(true);
    try {
      await api.post(`/jobs/${jobId}/hire`, { workerId: parseInt(id) });
      navigate(`/contractor/jobs/${jobId}/workers`);
    } catch (err) {
      alert(err.message);
    } finally {
      setHiring(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (!worker) return <DashboardLayout><div className="alert alert-error">Worker not found</div></DashboardLayout>;

  const name = worker.user?.name || worker.name;
  const skill = worker.skills?.[0]?.skill || worker.skill;

  return (
    <DashboardLayout>
      <div className={`card ${styles.card}`}>
        <div className={styles.header}>
          <div className={styles.avatar}>{name?.charAt(0)}</div>
          <div>
            <h1>{name}</h1>
            <p className={styles.skill}>{skill}</p>
            <p>⭐ {worker.rating?.toFixed(1)} · {worker.experience} years experience</p>
          </div>
          {worker.matchScore != null && <MatchScore score={worker.matchScore} breakdown={worker.matchBreakdown} />}
        </div>

        <div className={styles.details}>
          <div><strong>Location:</strong> {worker.location}</div>
          <div><strong>Availability:</strong> {worker.availability}</div>
          <div><strong>Expected Wage:</strong> {formatCurrency(worker.expectedWage)}/day</div>
          <div><strong>Jobs Completed:</strong> {worker.jobsCompleted}</div>
          <div><strong>Attendance:</strong> {worker.attendance}%</div>
        </div>

        {worker.previousWork && (
          <div className={styles.previous}>
            <h3>Previous Work</h3>
            <p>{worker.previousWork}</p>
          </div>
        )}

        {jobId && (
          <PrimaryButton fullWidth onClick={handleHire} disabled={hiring}>
            {hiring ? 'Hiring...' : 'HIRE'}
          </PrimaryButton>
        )}
      </div>
    </DashboardLayout>
  );
}
