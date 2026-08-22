import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import PrimaryButton from '../../components/PrimaryButton';
import { SKILLS } from '../../utils/constants';
import api from '../../services/api';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', location: '', workersRequired: '', requiredSkills: [],
    budget: '', duration: '', startDate: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (skillInput && !form.requiredSkills.includes(skillInput)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, skillInput] });
      setSkillInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/projects', {
        ...form,
        workersRequired: parseInt(form.workersRequired),
        budget: parseInt(form.budget),
        duration: parseInt(form.duration),
        requiredSkills: form.requiredSkills.length ? form.requiredSkills : [skillInput].filter(Boolean),
      });
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>Create Project</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <InputField label="Project Name" name="name" value={form.name} onChange={handleChange} placeholder="Mumbai Tower" required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} required />
          <InputField label="Workers Required" name="workersRequired" type="number" value={form.workersRequired} onChange={handleChange} required />
          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="form-select" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}>
                <option value="">Select skill...</option>
                {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <PrimaryButton type="button" size="sm" onClick={addSkill}>Add</PrimaryButton>
            </div>
            {form.requiredSkills.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {form.requiredSkills.map((s) => (
                  <span key={s} className="badge badge-open">{s}</span>
                ))}
              </div>
            )}
          </div>
          <InputField label="Budget (₹)" name="budget" type="number" value={form.budget} onChange={handleChange} required />
          <InputField label="Duration (days)" name="duration" type="number" value={form.duration} onChange={handleChange} required />
          <InputField label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
          <PrimaryButton type="submit" fullWidth disabled={loading}>{loading ? 'Creating...' : 'CREATE PROJECT'}</PrimaryButton>
        </form>
      </div>
    </DashboardLayout>
  );
}
