import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import { SKILLS, formatCurrency } from '../../utils/constants';
import api from '../../services/api';
import styles from './WorkerProfile.module.css';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/workers/me').then((data) => {
      setProfile(data);
      setForm({
        experience: data.experience,
        location: data.location,
        expectedWage: data.expectedWage,
        availability: data.availability,
        skill: data.skills?.[0]?.skill || '',
      });
    }).finally(() => setLoading(false));
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

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  const name = profile?.user?.name;
  const skill = profile?.skills?.[0]?.skill;

  return (
    <DashboardLayout>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <PrimaryButton size="sm" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
        </PrimaryButton>
      </div>

      <div className={`card ${styles.profile}`}>
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
            <h2>{name}</h2>
            <p className={styles.skill}>{skill}</p>
            <div className={styles.stats}>
              <div><span>Experience</span><strong>{profile.experience} years</strong></div>
              <div><span>Location</span><strong>{profile.location}</strong></div>
              <div><span>Expected Wage</span><strong>{formatCurrency(profile.expectedWage)}/day</strong></div>
              <div><span>Availability</span><strong>{profile.availability}</strong></div>
              <div><span>Rating</span><strong>⭐ {profile.rating?.toFixed(1)}</strong></div>
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
    </DashboardLayout>
  );
}
