import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardHeader from '../../components/DashboardHeader';
import JobCard from '../../components/JobCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/constants';
import api from '../../services/api';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Attendance states
  const [confirmedJob, setConfirmedJob] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.get('/workers/jobs'),
      api.get('/workers/applications').catch(() => []),
      api.get('/workers/attendance/today').catch(() => null)
    ]).then(([jobsData, applications, attendanceData]) => {
      setJobs(jobsData);
      
      // Find active/confirmed job
      const activeApp = applications.find(
        (app) => app.status === 'CONFIRMED' || app.status === 'WORK_STARTED'
      );
      if (activeApp) {
        setConfirmedJob(activeApp.job);
      } else {
        setConfirmedJob(null);
      }
      
      setTodayAttendance(attendanceData);
    })
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    if (!confirmedJob) return;
    setAttendanceLoading(true);
    try {
      const data = await api.post('/workers/attendance/check-in', { jobId: confirmedJob.id });
      setTodayAttendance(data.attendance);
      alert('Check-in successful! Have a safe shift.');
    } catch (err) {
      alert(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    setAttendanceLoading(true);
    try {
      const data = await api.post('/workers/attendance/check-out', { attendanceId: todayAttendance.id });
      setTodayAttendance(data.attendance);
      alert('Check-out successful! Shift complete.');
    } catch (err) {
      alert(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const filtered = jobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  const name = user?.user?.name || user?.name;

  return (
    <DashboardLayout>
      <DashboardHeader
        name={name}
        subtitle={`📍 ${user?.location || 'Set your location'}`}
      />

      {/* Today's Shift / Attendance Card */}
      {confirmedJob && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--color-navy)', color: 'white' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            📅 {t('w_dash_active_shift')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{confirmedJob.title}</h4>
              <p style={{ opacity: 0.8, fontSize: '0.85rem', margin: '4px 0 8px' }}>
                {confirmedJob.location} · {formatCurrency(confirmedJob.dailyWage)}/day
              </p>
              
              {todayAttendance ? (
                <div style={{ fontSize: '0.9rem' }}>
                  <p>✓ {t('w_dash_checked_in_at')} <strong>{new Date(todayAttendance.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong></p>
                  {todayAttendance.checkOut ? (
                    <p>✓ {t('w_dash_checked_out_at')} <strong>{new Date(todayAttendance.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong> ({t('w_dash_shift_completed')})</p>
                  ) : (
                    <p>{t('status_label')}: {t('w_dash_working')}</p>
                  )}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#ffedd5' }}>
                  {t('w_dash_check_in_prompt')}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!todayAttendance && (
                <button 
                  onClick={handleCheckIn} 
                  disabled={attendanceLoading}
                  style={{ background: '#166534', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {attendanceLoading ? 'Checking in...' : t('w_dash_check_in')}
                </button>
              )}
              {todayAttendance && !todayAttendance.checkOut && (
                <button 
                  onClick={handleCheckOut} 
                  disabled={attendanceLoading}
                  style={{ background: '#ea580c', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {attendanceLoading ? 'Checking out...' : t('w_dash_check_out')}
                </button>
              )}
              {todayAttendance?.checkOut && (
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('w_dash_shift_completed')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <InputField
        label={t('w_dash_search_jobs')}
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title or location..."
      />

      <h3 style={{ margin: '1.5rem 0 1rem' }}>{t('w_dash_recommended')}</h3>

      {loading && <LoadingState />}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No suitable jobs found" message="Check back later for new opportunities near you." />
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} showMatch linkTo={`/worker/jobs/${job.id}`} />
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/worker/jobs" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('w_dash_view_all_jobs')}</Link>
      </div>
    </DashboardLayout>
  );
}
