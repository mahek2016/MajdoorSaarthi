import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import PrimaryButton from '../../components/PrimaryButton';
import { INDUSTRIES, COMPANY_SIZES } from '../../utils/constants';

export default function CompanyOnboarding() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', industry: '', location: '', contactPerson: '', companySize: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.industry) newErrors.industry = 'Select industry';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!form.companySize) newErrors.companySize = 'Select company size';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const data = await api.put('/companies/me', form);
      setUser({ ...data, profileComplete: true });
      navigate('/company/dashboard');
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
          <h1>Company Profile</h1>
          <p>Tell us about your organization</p>
        </div>
        <form onSubmit={handleSubmit}>
          <InputField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} required />
          <SelectField label="Industry" name="industry" value={form.industry} onChange={handleChange} options={INDUSTRIES} error={errors.industry} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Mumbai" error={errors.location} required />
          <InputField label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} error={errors.contactPerson} required />
          <SelectField label="Company Size" name="companySize" value={form.companySize} onChange={handleChange} options={COMPANY_SIZES} error={errors.companySize} required />
          <PrimaryButton type="submit" fullWidth disabled={loading}>{loading ? 'Saving...' : 'Complete Profile'}</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
