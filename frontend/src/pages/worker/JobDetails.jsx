import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import MatchScore from '../../components/MatchScore';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/constants';
import api from '../../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/workers/jobs/${id}`).then(setJob).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/workers/jobs/${id}/apply`);
      setMessage('Application submitted successfully.');
      setTimeout(() => navigate('/worker/applications'), 1500);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (!job) return <DashboardLayout><div className="alert alert-error">Job not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="card" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{job.title}</h1>
            <p className="text-muted">{job.contractor?.businessName || 'Contractor'}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><strong>Location:</strong> {job.location}</div>
          <div><strong>Daily Wage:</strong> {formatCurrency(job.dailyWage)}</div>
          <div><strong>Duration:</strong> {job.duration} Days</div>
          <div><strong>Start Date:</strong> {formatDate(job.startDate)}</div>
          <div><strong>Skill Required:</strong> {job.skillRequired}</div>
          {job.distance != null && <div><strong>Distance:</strong> {job.distance} km</div>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
          <p className="text-muted">{job.description}</p>
        </div>

        {job.matchBreakdown && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Match Analysis</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Rule-based scoring (not ML). Weights: Skill 40%, Experience 20%, Location 15%, Availability 15%, Wage 10%.
            </p>
            <MatchScore score={job.matchScore} breakdown={job.matchBreakdown} size="lg" />
          </div>
        )}

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>{message}</div>
        )}

        <PrimaryButton fullWidth onClick={handleApply} disabled={applying || job.alreadyApplied}>
          {job.alreadyApplied ? 'Already Applied' : applying ? 'Applying...' : 'APPLY NOW'}
        </PrimaryButton>
      </div>
    </DashboardLayout>
  );
}
