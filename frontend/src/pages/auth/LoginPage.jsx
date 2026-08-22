import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
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
    if (!form.phone.trim()) newErrors.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit mobile number';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
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

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back 👋</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Mobile Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
            error={errors.phone}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            required
          />

          <p style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
            <Link to="#" style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>Forgot Password?</Link>
          </p>

          <PrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </PrimaryButton>
        </form>

        <div className="auth-divider">OR</div>

        <SecondaryButton fullWidth disabled>
          Continue with Google
        </SecondaryButton>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
