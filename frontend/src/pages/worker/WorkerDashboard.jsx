import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardHeader from '../../components/DashboardHeader';
import JobCard from '../../components/JobCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/workers/jobs')
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  const name = user?.user?.name || user?.name;

  return (
    <DashboardLayout>
      <DashboardHeader
        name={name}
        subtitle={`📍 ${user?.location || 'Set your location'}`}
      />

      <InputField
        label="Search jobs"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title or location..."
      />

      <h3 style={{ margin: '1.5rem 0 1rem' }}>Recommended Jobs</h3>

      {loading && <LoadingState />}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No suitable jobs found" message="Check back later for new opportunities near you." />
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} showMatch linkTo={`/worker/jobs/${job.id}`} />
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/worker/jobs" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>View all jobs →</Link>
      </div>
    </DashboardLayout>
  );
}
