import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import JobCard from '../../components/JobCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import InputField from '../../components/InputField';
import api from '../../services/api';

export default function WorkerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/workers/jobs').then(setJobs).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>Available Jobs</h1>
      <InputField label="Search" name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." />
      {loading && <LoadingState />}
      {!loading && filtered.length === 0 && <EmptyState title="No suitable jobs found" />}
      {!loading && filtered.length > 0 && (
        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} showMatch linkTo={`/worker/jobs/${job.id}`} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
