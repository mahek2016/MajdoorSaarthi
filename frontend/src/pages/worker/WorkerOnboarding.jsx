import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SKILLS } from '../../utils/constants';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import PrimaryButton from '../../components/PrimaryButton';

export default function WorkerOnboarding() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    experience: '', location: '', expectedWage: '', availability: 'Available', skill: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.skill) newErrors.skill = 'Select a skill';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.experience) newErrors.experience = 'Experience is required';
    if (!form.expectedWage) newErrors.expectedWage = 'Expected wage is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const data = await api.put('/workers/me', {
        experience: parseInt(form.experience),
        location: form.location,
        expectedWage: parseInt(form.expectedWage),
        availability: form.availability,
        skills: [form.skill],
      });
      setUser({ ...data, profileComplete: true });
      navigate('/worker/dashboard');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <h1>Worker Profile</h1>
          <p>Tell us about your skills and experience</p>
        </div>
        {apiError && <div className="alert alert-error">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <SelectField label="Skill / Trade" name="skill" value={form.skill} onChange={handleChange} options={SKILLS} error={errors.skill} required />
          <InputField label="Experience (years)" name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="5" error={errors.experience} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Vasai, Mumbai" error={errors.location} required />
          <InputField label="Expected Daily Wage (₹)" name="expectedWage" type="number" value={form.expectedWage} onChange={handleChange} placeholder="900" error={errors.expectedWage} required />
          <SelectField label="Availability" name="availability" value={form.availability} onChange={handleChange} options={['Available', 'Busy', 'Not Available']} />
          <PrimaryButton type="submit" fullWidth disabled={loading}>{loading ? 'Saving...' : 'Complete Profile'}</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
