import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function ContractorOnboarding() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: '', location: '', typeOfWork: '', experience: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const data = await api.put('/contractors/me', {
        businessName: form.businessName,
        location: form.location,
        typeOfWork: form.typeOfWork,
        experience: parseInt(form.experience) || 0,
      });
      setUser({ ...data, profileComplete: true });
      navigate('/contractor/dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <h1>Contractor Profile</h1>
          <p>Tell us about your business</p>
        </div>
        <form onSubmit={handleSubmit}>
          <InputField label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} error={errors.businessName} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Mumbai" error={errors.location} required />
          <InputField label="Type of Work" name="typeOfWork" value={form.typeOfWork} onChange={handleChange} placeholder="Construction, Electrical..." />
          <InputField label="Experience (years)" name="experience" type="number" value={form.experience} onChange={handleChange} />
          <PrimaryButton type="submit" fullWidth disabled={loading}>{loading ? 'Saving...' : 'Complete Profile'}</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
