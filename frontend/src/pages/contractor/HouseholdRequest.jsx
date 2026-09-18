import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import WorkerCard from '../../components/WorkerCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import PrimaryButton from '../../components/PrimaryButton';
import { SKILLS } from '../../utils/constants';
import api from '../../services/api';

export default function HouseholdRequest() {
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [searched, setSearched] = useState(false);
  const [form, setForm] = useState({
    service: 'Painter',
    location: '',
    date: '',
    budget: '',
    description: '',
  });

  // Action status
  const [requestLoading, setRequestLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.location || !form.budget || !form.date) {
      alert('Please fill out all search criteria');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('skill', form.service);
      queryParams.append('location', form.location);
      queryParams.append('maxWage', form.budget);
      queryParams.append('verifiedOnly', 'true');
      queryParams.append('availability', 'Available'); // Prioritize available workers

      const data = await api.get(`/contractors/workers?${queryParams.toString()}`);
      setWorkers(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWorker = async (worker) => {
    setRequestLoading(true);
    try {
      await api.post('/jobs/household-request', {
        service: form.service,
        location: form.location,
        preferredDate: form.date,
        budget: form.budget,
        description: form.description || `Household service request for ${form.service}`,
        workerId: worker.id,
      });

      setMessage(
        `Service Request Sent Successfully! ${worker.user?.name || worker.name} has been notified and shortlisted for your ${form.service} requirement on ${new Date(form.date).toLocaleDateString('en-IN')}.`
      );
      setShowModal(true);
      
      // Remove requested worker from list to show action complete
      setWorkers((prev) => prev.filter((w) => w.id !== worker.id));
    } catch (err) {
      setMessage(`Failed to request service: ${err.message}`);
      setShowModal(true);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '0.5rem' }}>🏠 Household / Individual Hiring</h1>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Quickly request services for your home and hire verified nearby workers directly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Request Form */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Enter Home Need</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <SelectField
              label="Service Required"
              name="service"
              value={form.service}
              onChange={handleChange}
              options={['Painter', 'Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Technician']}
            />
            
            <InputField
              label="My Location"
              name="location"
              placeholder="e.g. Vasai, Mumbai"
              value={form.location}
              onChange={handleChange}
              required
            />

            <InputField
              label="Preferred Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <InputField
              label="Wage Budget (₹/day)"
              name="budget"
              type="number"
              placeholder="e.g. 800"
              value={form.budget}
              onChange={handleChange}
              required
            />

            <div className="form-group">
              <label className="form-label">Task Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe what needs to be done..."
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <PrimaryButton type="submit" fullWidth disabled={loading}>
              {loading ? 'Searching...' : 'FIND VERIFIED WORKERS'}
            </PrimaryButton>
          </form>
        </div>

        {/* Results List */}
        <div>
          {!searched ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">Enter your home requirements and location to discover verified workers nearby.</p>
            </div>
          ) : loading ? (
            <LoadingState message="Searching verified database..." />
          ) : workers.length === 0 ? (
            <EmptyState
              title="No verified workers found"
              message={`We couldn't find any verified ${form.service}s in ${form.location} matching your budget.`}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>Verified Workers Near You</h3>
              <div className="grid-2">
                {workers.map((worker) => (
                  <div key={worker.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '0.75rem' }}>
                    <WorkerCard worker={worker} linkTo={`/contractor/workers/${worker.id}`} />
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <PrimaryButton
                        size="sm"
                        fullWidth
                        disabled={requestLoading}
                        onClick={() => handleRequestWorker(worker)}
                      >
                        {requestLoading ? 'Requesting...' : `REQUEST ${form.service.toUpperCase()}`}
                      </PrimaryButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Household Request Status">
        <p>{message}</p>
        <PrimaryButton style={{ marginTop: '1rem' }} fullWidth onClick={() => setShowModal(false)}>
          PROCEED
        </PrimaryButton>
      </Modal>
    </DashboardLayout>
  );
}
