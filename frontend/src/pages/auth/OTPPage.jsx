import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_OTP } from '../../utils/constants';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function OTPPage() {
  const { verifyOTP, pendingPhone } = useAuth();
  const navigate = useNavigate();
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
        navigate(data.user.profileComplete ? `/${data.user.role.toLowerCase()}/dashboard` : '/role-selection');
      } else {
        navigate('/role-selection');
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
          <p>Kaam bhi. Kaamgar bhi.</p>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Verify OTP</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter the OTP sent to {pendingPhone || 'your mobile'}
        </p>

        <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>
          Dev OTP: <strong>{MOCK_OTP}</strong>
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
            {loading ? 'Verifying...' : 'VERIFY OTP'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
