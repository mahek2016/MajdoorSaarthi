import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';

export default function LoginPage() {
  const { login, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || '';

  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({ phone: '', password: '' });
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
    if (!selectedRole) newErrors.role = t('auth_choose_role');
    if (!form.phone.trim()) newErrors.phone = t('form_phone') + ' is required';
    else if (!/^[6-9][0-9]{9}$/.test(form.phone.trim())) newErrors.phone = 'Enter valid 10-digit mobile number';
    if (!form.password) newErrors.password = t('form_password') + ' is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ phone: form.phone.trim(), password: form.password, role: selectedRole });
      navigate(`/otp?type=${type}`);
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
          <p>{t('hero_tagline_1')} {t('hero_tagline_2')}</p>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{t('auth_welcome_back')}</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role Selector Card Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
              Who are you logging in as?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'WORKER', label: 'Worker', icon: '👷' },
                { id: 'CONTRACTOR', label: 'Contractor', icon: '🧑💼' },
                { id: 'COMPANY', label: 'Company', icon: '🏢' },
              ].map((r) => {
                const isActive = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setSelectedRole(r.id); setErrors({ ...errors, role: '' }); setApiError(''); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem 0.5rem',
                      borderRadius: '8px',
                      border: `2px solid ${isActive ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      background: isActive ? 'var(--color-cream)' : 'white',
                      color: 'var(--color-text)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{r.icon}</span>
                    <span style={{ fontSize: '0.85rem' }}>{r.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.role && <p className="form-error" style={{ marginTop: '0.35rem' }}>{errors.role}</p>}
          </div>

          <InputField
            label={t('form_phone')}
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
            error={errors.phone}
            required
          />
          <InputField
            label={t('form_password')}
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
            {loading ? 'Logging in...' : t('nav_login').toUpperCase()}
          </PrimaryButton>
        </form>

        <div className="auth-divider">OR</div>

        <SecondaryButton fullWidth disabled>
          Continue with Google
        </SecondaryButton>

        <div className="auth-footer">
          Don't have an account? <Link to={`/signup?type=${type}`}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
