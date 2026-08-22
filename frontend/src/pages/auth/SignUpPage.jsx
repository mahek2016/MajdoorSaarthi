import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit mobile number';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({ name: form.name, phone: form.phone, password: form.password });
      navigate('/otp');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>MajdoorSaarthi</h1>
          <p>Kaam bhi. Kaamgar bhi.</p>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" error={errors.name} required />
          <InputField label="Mobile Number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="9876543210" error={errors.phone} required />
          <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" error={errors.password} required />
          <InputField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" error={errors.confirmPassword} required />

          <PrimaryButton type="submit" fullWidth disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating...' : 'CREATE ACCOUNT'}
          </PrimaryButton>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
