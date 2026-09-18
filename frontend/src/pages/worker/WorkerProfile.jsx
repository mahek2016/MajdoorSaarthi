import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import StatusBadge from '../../components/StatusBadge';
import { SKILLS, formatCurrency, formatDate } from '../../utils/constants';
import api from '../../services/api';
import styles from './WorkerProfile.module.css';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // KYC form state
  const [kycForm, setKycForm] = useState({ documentType: 'Aadhaar Card', documentNumber: '' });
  const [kycLoading, setKycLoading] = useState(false);
  const [kycMessage, setKycMessage] = useState(null);

  const fetchProfileData = () => {
    Promise.all([
      api.get('/workers/me'),
      api.get('/workers/applications').catch(() => [])
    ]).then(([workerData, appsData]) => {
      setProfile(workerData);
      setApplications(appsData);
      setForm({
        experience: workerData.experience,
        location: workerData.location,
        expectedWage: workerData.expectedWage,
        availability: workerData.availability,
        skill: workerData.skills?.[0]?.skill || '',
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.put('/workers/me', {
        ...form,
        experience: parseInt(form.experience),
        expectedWage: parseInt(form.expectedWage),
        skills: [form.skill],
      });
      setProfile(data);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setKycLoading(true);
    setKycMessage(null);
    try {
      const data = await api.put('/workers/me/kyc', kycForm);
      setProfile(data.worker);
      setKycMessage({ type: 'success', text: data.message });
    } catch (err) {
      setKycMessage({ type: 'error', text: err.message });
    } finally {
      setKycLoading(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  const name = profile?.user?.name;
  const skill = profile?.skills?.[0]?.skill;
  const completedJobs = applications.filter((app) => app.status === 'COMPLETED');

  return (
    <DashboardLayout>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <PrimaryButton size="sm" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
        </PrimaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        {/* Profile Card */}
        <div className={`card ${styles.profile}`} style={{ maxWidth: '100%' }}>
          <div className={styles.avatar}>
            {profile?.user?.profilePhoto ? (
              <img src={profile.user.profilePhoto} alt={name} />
            ) : (
              <span>{name?.charAt(0)}</span>
            )}
          </div>

          {editing ? (
            <div className={styles.form}>
              <SelectField label="Skill" name="skill" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} options={SKILLS} />
              <InputField label="Experience (years)" name="experience" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              <InputField label="Location" name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <InputField label="Expected Wage" name="expectedWage" type="number" value={form.expectedWage} onChange={(e) => setForm({ ...form, expectedWage: e.target.value })} />
              <SelectField label="Availability" name="availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} options={['Available', 'Busy', 'Not Available']} />
            </div>
          ) : (
            <>
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {name}
                <StatusBadge status={profile.verificationStatus} />
              </h2>
              <p className={styles.skill}>{skill || 'Unspecified Trade'}</p>
              <div className={styles.stats}>
                <div><span>Experience</span><strong>{profile.experience} years</strong></div>
                <div><span>Location</span><strong>{profile.location}</strong></div>
                <div><span>Expected Wage</span><strong>{formatCurrency(profile.expectedWage)}/day</strong></div>
                <div><span>Availability</span><strong>{profile.availability}</strong></div>
                <div><span>Rating</span><strong>⭐ {profile.rating?.toFixed(1) || 'N/A'}</strong></div>
                <div><span>Jobs Completed</span><strong>{profile.jobsCompleted}</strong></div>
                <div><span>Attendance</span><strong>{profile.attendance}%</strong></div>
              </div>
              {profile.previousWork && (
                <div className={styles.previous}>
                  <h4>Previous Work</h4>
                  <p>{profile.previousWork}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* KYC Verification Card */}
        {!editing && (
          <div className="card">
            <h3>KYC Identity Verification</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Verify your identity to build trust with contractors and receive priority matching.
            </p>

            {profile.verificationStatus === 'VERIFIED' ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '6px', color: '#166534' }}>
                <p><strong>✓ KYC Verification Complete</strong></p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Document: {profile.kycDocumentType} ({profile.kycDocumentNumber ? `**** **** ${profile.kycDocumentNumber.slice(-4)}` : ''})
                </p>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {kycMessage && (
                  <div className={`alert ${kycMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {kycMessage.text}
                  </div>
                )}
                
                {profile.verificationStatus === 'REJECTED' && (
                  <div className="alert alert-error" style={{ fontSize: '0.85rem', margin: 0 }}>
                    Your previous verification attempt was rejected. Please review and re-submit.
                  </div>
                )}

                <SelectField 
                  label="Document Type" 
                  name="documentType" 
                  value={kycForm.documentType} 
                  onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })} 
                  options={['Aadhaar Card', 'PAN Card', 'Voter ID']} 
                />
                
                <InputField 
                  label="Document Number" 
                  name="documentNumber" 
                  placeholder="e.g. 12-digit Aadhaar number" 
                  value={kycForm.documentNumber} 
                  onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })} 
                  required 
                />

                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>
                  <strong>Demo Instructions:</strong> Enter any 12-digit number for Aadhaar (e.g. 123456789012) to verify successfully, or enter a number starting with 9999 (e.g. 999988887777) to simulate verification rejection.
                </p>

                <PrimaryButton type="submit" disabled={kycLoading}>
                  {kycLoading ? 'Verifying...' : 'VERIFY DOCUMENT (SIMULATED)'}
                </PrimaryButton>
              </form>
            )}
          </div>
        )}

        {/* Work History / Completed Jobs Card */}
        {!editing && (
          <div className="card">
            <h3>Verified Work History ({completedJobs.length})</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Jobs completed through MajdoorSaarthi.
            </p>

            {completedJobs.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                No completed jobs registered yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {completedJobs.map((app) => (
                  <div key={app.id} style={{ border: '1px solid var(--color-border)', padding: '0.75rem', borderRadius: '6px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong>{app.job?.title}</strong>
                      <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px' }}>
                        Verified Job
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '2px 0 6px' }}>
                      Contractor: {app.job?.contractor?.businessName || 'Verified Builder'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px dashed #eee', paddingTop: '4px' }}>
                      <span>Wage: {formatCurrency(app.job?.dailyWage)}/day</span>
                      <span>Completed: {formatDate(app.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
