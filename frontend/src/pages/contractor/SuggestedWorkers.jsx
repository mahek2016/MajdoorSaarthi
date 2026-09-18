import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import WorkerCard from '../../components/WorkerCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';

export default function SuggestedWorkers() {
  const { id } = useParams();
  const [workers, setWorkers] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchPageData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/jobs/${id}/workers`),
      api.get(`/jobs/my-jobs`).then((jobs) => jobs.find((j) => j.id === parseInt(id))),
    ]).then(([workersData, jobData]) => {
      setWorkers(workersData);
      setJob(jobData);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPageData();
  }, [id]);

  const handleShortlist = async (worker) => {
    try {
      await api.post(`/jobs/${id}/hire`, { workerId: worker.id });
      setMessage(`${worker.user?.name || worker.name} shortlisted/invited successfully!`);
      setShowModal(true);
      fetchPageData();
    } catch (err) {
      setMessage(err.message);
      setShowModal(true);
    }
  };

  const handleConfirm = async (worker) => {
    try {
      await api.post(`/jobs/${id}/confirm-hire`, { workerId: worker.id });
      setMessage(`Hiring for ${worker.user?.name || worker.name} confirmed!`);
      setShowModal(true);
      fetchPageData();
    } catch (err) {
      setMessage(err.message);
      setShowModal(true);
    }
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '0.5rem' }}>Suitable Workers</h1>
      {job && (
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          For: <strong>{job.title}</strong> · Required: {job.skillRequired} · Hired: {job.workersHired}/{job.workersRequired}
        </p>
      )}

      {loading && <LoadingState />}
      
      {!loading && workers.length === 0 && (
        <EmptyState title="No suitable workers found" message="Try adjusting job requirements or check back later." />
      )}
      
      {!loading && workers.length > 0 && (
        <div className="grid-2">
          {workers.map((worker) => {
            const status = worker.applicationStatus;
            return (
              <div 
                key={worker.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  justifyContent: 'space-between',
                  border: status === 'CONFIRMED' ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)'
                }}
              >
                <WorkerCard
                  worker={worker}
                  linkTo={`/contractor/workers/${worker.id}?jobId=${id}`}
                />
                
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Status: <span style={{ 
                      color: status === 'CONFIRMED' ? 'var(--color-secondary)' : 
                             status === 'ACCEPTED' ? '#166534' : 
                             status === 'SHORTLISTED' ? '#d97706' : 
                             status === 'REJECTED' ? '#dc2626' : 'var(--color-text-muted)' 
                    }}>{status ? status : 'Not Contacted'}</span>
                  </span>
                  
                  {!status && (
                    <PrimaryButton size="sm" onClick={() => handleShortlist(worker)}>
                      SHORTLIST / INVITE
                    </PrimaryButton>
                  )}
                  {status === 'SHORTLISTED' && (
                    <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 500, fontStyle: 'italic' }}>
                      Waiting for worker
                    </span>
                  )}
                  {status === 'ACCEPTED' && (
                    <PrimaryButton size="sm" style={{ background: '#166534' }} onClick={() => handleConfirm(worker)}>
                      CONFIRM HIRE
                    </PrimaryButton>
                  )}
                  {status === 'CONFIRMED' && (
                    <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                      ✓ Hired & Confirmed
                    </span>
                  )}
                  {status === 'REJECTED' && (
                    <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 500 }}>
                      ✗ Declined
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Hiring Update">
        <p>{message}</p>
      </Modal>
    </DashboardLayout>
  );
}
