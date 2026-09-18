import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import PrimaryButton from '../../components/PrimaryButton';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import { formatCurrency, formatDate } from '../../utils/constants';
import api from '../../services/api';
import styles from './ContractorJobs.module.css';

export default function ContractorJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job Completion / Rating State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [hiredWorkers, setHiredWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  
  // Rating form state
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [ratingForm, setRatingForm] = useState({
    rating: '5',
    quality: '5',
    reliability: '5',
    behaviour: '5',
    review: '',
  });
  const [ratingMessage, setRatingMessage] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    api.get('/jobs/my-jobs')
      .then(setJobs)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCompleteJob = async (job) => {
    if (!window.confirm(`Are you sure you want to complete "${job.title}"? This will mark all worker shifts as finished.`)) return;
    try {
      await api.post(`/jobs/${job.id}/complete`);
      fetchJobs();

      // Open rating modal for this job
      setSelectedJob(job);
      setShowRatingModal(true);
      
      // Fetch workers hired for this job to rate them
      setWorkersLoading(true);
      const workersData = await api.get(`/jobs/${job.id}/workers`);
      const hired = workersData.filter(w => w.applicationStatus === 'CONFIRMED' || w.applicationStatus === 'WORK_STARTED' || w.applicationStatus === 'COMPLETED');
      setHiredWorkers(hired);
      if (hired.length > 0) {
        setSelectedWorkerId(hired[0].id.toString());
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleOpenRatingOnly = async (job) => {
    setSelectedJob(job);
    setShowRatingModal(true);
    setWorkersLoading(true);
    try {
      const workersData = await api.get(`/jobs/${job.id}/workers`);
      const hired = workersData.filter(w => w.applicationStatus === 'CONFIRMED' || w.applicationStatus === 'WORK_STARTED' || w.applicationStatus === 'COMPLETED');
      setHiredWorkers(hired);
      if (hired.length > 0) {
        setSelectedWorkerId(hired[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleRatingChange = (e) => {
    setRatingForm({ ...ratingForm, [e.target.name]: e.target.value });
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      alert('Please select a worker to rate');
      return;
    }
    setSubmittingRating(true);
    setRatingMessage('');
    try {
      await api.post(`/jobs/${selectedJob.id}/rate-worker`, {
        workerId: parseInt(selectedWorkerId),
        rating: parseFloat(ratingForm.rating),
        quality: parseFloat(ratingForm.quality),
        reliability: parseFloat(ratingForm.reliability),
        behaviour: parseFloat(ratingForm.behaviour),
        review: ratingForm.review,
      });
      setRatingMessage('Rating submitted successfully!');
      setRatingForm({
        rating: '5',
        quality: '5',
        reliability: '5',
        behaviour: '5',
        review: '',
      });
      // Remove rated worker from the list
      setHiredWorkers((prev) => prev.filter((w) => w.id !== parseInt(selectedWorkerId)));
      // Select next worker if any
      const remaining = hiredWorkers.filter((w) => w.id !== parseInt(selectedWorkerId));
      if (remaining.length > 0) {
        setSelectedWorkerId(remaining[0].id.toString());
      } else {
        setSelectedWorkerId('');
      }
    } catch (err) {
      setRatingMessage(`Error: ${err.message}`);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>My Posted Jobs</h1>
        <Link to="/contractor/post-job">
          <PrimaryButton size="sm">+ POST NEW JOB</PrimaryButton>
        </Link>
      </div>

      {loading && <LoadingState />}
      
      {!loading && jobs.length === 0 && (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>
          No jobs posted yet. <Link to="/contractor/post-job">Post your first job now.</Link>
        </p>
      )}

      {!loading && jobs.map((job) => (
        <div key={job.id} className={`card ${styles.card}`} style={{ marginBottom: '1rem' }}>
          <div className={styles.header}>
            <div>
              <h3>{job.title}</h3>
              <p className="text-muted">{job.skillRequired} · {job.location}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className={styles.stats}>
            <span>Workers: <strong>{job.workersHired}/{job.workersRequired}</strong></span>
            <span>Daily Wage: <strong>{formatCurrency(job.dailyWage)}</strong></span>
            <span>Duration: <strong>{job.duration} days</strong></span>
            <span>Start Date: <strong>{formatDate(job.startDate)}</strong></span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.75rem', alignItems: 'center' }}>
            <Link 
              to={`/contractor/jobs/${job.id}/workers`} 
              style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
            >
              Suggested Workers →
            </Link>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {job.status !== 'COMPLETED' && (
                <button 
                  onClick={() => handleCompleteJob(job)}
                  style={{ 
                    background: '#166534', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    fontSize: '0.85rem' 
                  }}
                >
                  ✓ Mark Completed
                </button>
              )}
              {job.status === 'COMPLETED' && job.workersHired > 0 && (
                <button 
                  onClick={() => handleOpenRatingOnly(job)}
                  style={{ 
                    background: '#f59e0b', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    fontSize: '0.85rem' 
                  }}
                >
                  ⭐ Rate Workers
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Ratings Modal */}
      <Modal isOpen={showRatingModal} onClose={() => { setShowRatingModal(false); setRatingMessage(''); }} title={`Rate Hired Workers - ${selectedJob?.title}`}>
        {workersLoading && <LoadingState />}
        
        {!workersLoading && hiredWorkers.length === 0 && (
          <div>
            <p className="text-muted" style={{ textAlign: 'center', margin: '2rem 0' }}>
              No remaining workers to rate for this job.
            </p>
            <PrimaryButton fullWidth onClick={() => setShowRatingModal(false)}>
              DONE
            </PrimaryButton>
          </div>
        )}

        {!workersLoading && hiredWorkers.length > 0 && (
          <form onSubmit={handleSubmitRating} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ratingMessage && (
              <div className={`alert ${ratingMessage.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
                {ratingMessage}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Hired Worker to Rate</label>
              <select 
                className="form-input" 
                value={selectedWorkerId} 
                onChange={(e) => { setSelectedWorkerId(e.target.value); setRatingMessage(''); }}
                style={{ width: '100%' }}
              >
                {hiredWorkers.map(w => (
                  <option key={w.id} value={w.id}>{w.user?.name || w.name} ({w.skills?.[0]?.skill || w.skill})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <SelectField 
                label="Overall Rating (1-5)" 
                name="rating" 
                value={ratingForm.rating} 
                onChange={handleRatingChange} 
                options={['1', '2', '3', '4', '5']} 
              />
              <SelectField 
                label="Quality of Work" 
                name="quality" 
                value={ratingForm.quality} 
                onChange={handleRatingChange} 
                options={['1', '2', '3', '4', '5']} 
              />
              <SelectField 
                label="Reliability / Punctuality" 
                name="reliability" 
                value={ratingForm.reliability} 
                onChange={handleRatingChange} 
                options={['1', '2', '3', '4', '5']} 
              />
              <SelectField 
                label="Behaviour" 
                name="behaviour" 
                value={ratingForm.behaviour} 
                onChange={handleRatingChange} 
                options={['1', '2', '3', '4', '5']} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Review / Feedback</label>
              <textarea 
                className="form-textarea" 
                name="review" 
                placeholder="Write feedback about the worker's performance..." 
                value={ratingForm.review} 
                onChange={handleRatingChange}
                required
              />
            </div>

            <PrimaryButton type="submit" disabled={submittingRating}>
              {submittingRating ? 'Submitting...' : 'SUBMIT WORKER RATING'}
            </PrimaryButton>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
