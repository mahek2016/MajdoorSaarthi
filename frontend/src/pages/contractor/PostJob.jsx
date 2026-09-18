import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import PrimaryButton from '../../components/PrimaryButton';
import { SKILLS } from '../../utils/constants';
import api from '../../services/api';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', skillRequired: '', workersRequired: '', location: '',
    dailyWage: '', duration: '', startDate: '', description: '',
    experienceRequired: '0', requiredAvailability: 'Available',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const job = await api.post('/jobs', {
        ...form,
        workersRequired: parseInt(form.workersRequired),
        dailyWage: parseInt(form.dailyWage),
        duration: parseInt(form.duration),
        experienceRequired: parseInt(form.experienceRequired || 0),
      });
      navigate(`/contractor/jobs/${job.id}/workers`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>Post New Job</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <InputField label="Job Title" name="title" value={form.title} onChange={handleChange} placeholder="Electrician needed" required />
          <SelectField label="Skill Required" name="skillRequired" value={form.skillRequired} onChange={handleChange} options={SKILLS} required />
          <InputField label="Workers Required" name="workersRequired" type="number" value={form.workersRequired} onChange={handleChange} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Vasai, Mumbai" required />
          <InputField label="Min Experience Required (years)" name="experienceRequired" type="number" value={form.experienceRequired} onChange={handleChange} required />
          <SelectField label="Required Availability" name="requiredAvailability" value={form.requiredAvailability} onChange={handleChange} options={['Available', 'Busy', 'Not Available']} />
          <InputField label="Daily Wage (₹)" name="dailyWage" type="number" value={form.dailyWage} onChange={handleChange} required />
          <InputField label="Duration (days)" name="duration" type="number" value={form.duration} onChange={handleChange} required />
          <InputField label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea" placeholder="Job details..." required />
          </div>
          <PrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? 'Posting...' : 'FIND SUITABLE WORKERS'}
          </PrimaryButton>
        </form>
      </div>
    </DashboardLayout>
  );
}
