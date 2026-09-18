import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_OTP } from '../../utils/constants';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function OTPPage() {
  const { verifyOTP, pendingPhone } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOTP(otp);
      if (data.user?.role) {
        navigate(data.user.profileComplete ? `/${data.user.role.toLowerCase()}/dashboard` : `/role-selection?type=${type}`);
      } else {
        navigate(`/role-selection?type=${type}`);
      }
    } catch (err) {
      setError(err.message);
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

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('auth_verify_otp')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter the OTP sent to {pendingPhone || 'your mobile'}
        </p>

        <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>
          {t('auth_dev_otp_notice')}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <InputField
            label="OTP"
            name="otp"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            placeholder="123456"
            maxLength={6}
          />
          <PrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? t('auth_verifying') : t('auth_verify_btn')}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
