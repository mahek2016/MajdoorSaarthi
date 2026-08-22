import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import WorkerCard from '../../components/WorkerCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import api from '../../services/api';

export default function SuggestedWorkers() {
  const { id } = useParams();
  const [workers, setWorkers] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/jobs/${id}/workers`),
      api.get(`/jobs/my-jobs`).then((jobs) => jobs.find((j) => j.id === parseInt(id))),
    ]).then(([workersData, jobData]) => {
      setWorkers(workersData);
      setJob(jobData);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleHire = async (worker) => {
    try {
      await api.post(`/jobs/${id}/hire`, { workerId: worker.id });
      setMessage(`${worker.user?.name || worker.name} hired successfully!`);
      setShowModal(true);
      setWorkers((prev) => prev.filter((w) => w.id !== worker.id));
    } catch (err) {
      setMessage(err.message);
      setShowModal(true);
    }
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '0.5rem' }}>Suitable Workers</h1>
      {job && <p className="text-muted" style={{ marginBottom: '1.5rem' }}>For: {job.title} · {job.skillRequired}</p>}

      {loading && <LoadingState />}
      {!loading && workers.length === 0 && (
        <EmptyState title="No suitable workers found" message="Try adjusting job requirements or check back later." />
      )}
      {!loading && workers.length > 0 && (
        <div className="grid-2">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              showHire
              onHire={handleHire}
              linkTo={`/contractor/workers/${worker.id}?jobId=${id}`}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Hire Status">
        <p>{message}</p>
      </Modal>
    </DashboardLayout>
  );
}
