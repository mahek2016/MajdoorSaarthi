import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingState from '../../components/LoadingState';
import StatsCard from '../../components/StatsCard';
import api from '../../services/api';

export default function ContractorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contractors/analytics')
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingState message="Calculating analytics..." /></DashboardLayout>;
  if (!data) return <DashboardLayout><div className="alert alert-error">Failed to calculate analytics</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '0.5rem' }}>📊 Workforce Analytics</h1>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Database-backed insights on hiring speeds, requested skills, and labor demand.
      </p>

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard icon="📈" label="Total Jobs Posted" value={data.totalPosted} color="primary" />
        <StatsCard icon="👷" label="Workers Hired" value={data.workersHired} color="secondary" />
        <StatsCard icon="💼" label="Jobs Completed" value={data.completedJobs} color="success" />
        <StatsCard icon="⚡" label="Avg Hiring Time" value={`${data.avgHiringTimeHours} hours`} color="warning" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Most Requested Skills */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>🔨 Most Requested Skills</h3>
          {data.requestedSkills.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>No skills requested yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.requestedSkills.map((sk) => {
                const total = data.requestedSkills.reduce((sum, s) => sum + s.count, 0) || 1;
                const percentage = Math.round((sk.count / total) * 100);
                return (
                  <div key={sk.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <strong>{sk.skill}</strong>
                      <span className="text-muted">{sk.count} workers ({percentage}%)</span>
                    </div>
                    <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--color-primary)', width: `${percentage}%`, height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Worker Availability Status */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>👷 Total Worker Pool Availability</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(data.availabilityStats).map(([status, count]) => {
              const total = Object.values(data.availabilityStats).reduce((sum, c) => sum + c, 0) || 1;
              const percentage = Math.round((count / total) * 100);
              const colors = {
                Available: '#166534',
                Busy: '#d97706',
                'Not Available': '#dc2626',
              };
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <strong>{status}</strong>
                    <span className="text-muted">{count} workers ({percentage}%)</span>
                  </div>
                  <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: colors[status] || '#71717a', width: `${percentage}%`, height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* Demand by Location */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📍 Demand by Location</h3>
          {data.demandByLocation.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>No location demand recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.demandByLocation.map((loc) => (
                <div key={loc.location} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                  <span>📍 {loc.location}</span>
                  <strong>{loc.count} job posts</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prototype Demand Forecast */}
        <div className="card" style={{ border: '1px dashed #d97706', background: '#fffbeb' }}>
          <h3 style={{ color: '#b45309', marginBottom: '0.5rem' }}>🔮 Prototype Demand Forecast</h3>
          <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', marginBottom: '1rem', margin: 0 }}>
            <strong>Demo Notice:</strong> This panel projects demand trends based on historical worker requests. In production, this uses a trained time-series Machine Learning model.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
            {data.forecast.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Post more jobs to generate demand trends.</p>
            ) : (
              data.forecast.map((fc, i) => (
                <div key={i} style={{ background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <strong>{fc.skill} in {fc.location}</strong>
                    <span style={{ color: '#166534', fontWeight: 600 }}>↑ +{fc.growth}% Demand</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    Recommended pipeline buffer: recruit at least <strong>{fc.recommendedBuffer}</strong> workers for upcoming month.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
