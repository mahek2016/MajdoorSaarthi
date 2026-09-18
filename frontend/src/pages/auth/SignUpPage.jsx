import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function SignUpPage() {
  const { signup, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || '';

  const [selectedType, setSelectedType] = useState(type);
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    logout();
  }, [logout]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = t('form_name') + ' is required';
    if (!form.phone.trim()) newErrors.phone = t('form_phone') + ' is required';
    else if (!/^[6-9][0-9]{9}$/.test(form.phone.trim())) newErrors.phone = 'Enter valid 10-digit mobile number';
    if (!form.password) newErrors.password = t('form_password') + ' is required';
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
      await signup({ name: form.name.trim(), phone: form.phone.trim(), password: form.password });
      navigate(`/otp?type=${selectedType}`);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-onboarding Selection Step
  if (!selectedType) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '500px' }}>
          <div className="auth-logo">
            <h1>MajdoorSaarthi</h1>
            <p>{t('hero_tagline_1')} {t('hero_tagline_2')}</p>
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>{t('auth_choose_role')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {t('auth_select_desc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => setSelectedType('find-work')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid var(--color-border)',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <span style={{ fontSize: '2.5rem' }}>👷</span>
              <div>
                <h3 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.15rem' }}>{t('hero_btn_find_work')}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Register as a skilled worker, verify your KYC profile, and find matching jobs near you.
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedType('hire-workers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px solid var(--color-border)',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <span style={{ fontSize: '2.5rem' }}>🧑💼</span>
              <div>
                <h3 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.15rem' }}>{t('hero_btn_hire_workers')}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Register as a contractor or company, post job requirements, and find matching labor pools.
                </p>
              </div>
            </button>
          </div>

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>MajdoorSaarthi</h1>
          <p>{t('hero_tagline_1')} {t('hero_tagline_2')}</p>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Create {selectedType === 'find-work' ? 'Worker' : 'Employer'} Account
        </h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <InputField label={t('form_name')} name="name" value={form.name} onChange={handleChange} placeholder="Your full name" error={errors.name} required />
          <InputField label={t('form_phone')} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="9876543210" error={errors.phone} required />
          <InputField label={t('form_password')} name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" error={errors.password} required />
          <InputField label={t('form_confirm_pw')} name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" error={errors.confirmPassword} required />

          <PrimaryButton type="submit" fullWidth disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating...' : 'CREATE ACCOUNT'}
          </PrimaryButton>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to={`/login?type=${selectedType}`}>Login</Link>
        </div>
      </div>
    </div>
  );
}
