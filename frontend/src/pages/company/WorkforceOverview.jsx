import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatsCard from '../../components/StatsCard';
import LoadingState from '../../components/LoadingState';
import api from '../../services/api';
import styles from './WorkforceOverview.module.css';

export default function WorkforceOverview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = id ? `/projects/${id}/workforce` : '/projects/workforce-summary';
    api.get(endpoint).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (!data) return <DashboardLayout><div className="alert alert-error">No workforce data</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '0.5rem' }}>Workforce Overview</h1>
      {data.projectName && <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{data.projectName}</p>}

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatsCard icon="👥" label="Total Workers" value={data.totalWorkers || 0} />
        <StatsCard icon="✅" label="Present" value={data.present || 0} color="success" />
        <StatsCard icon="❌" label="Absent" value={data.absent || 0} color="error" />
      </div>

      {data.skillDistribution && (
        <div className={`card ${styles.section}`}>
          <h3>Skill Distribution</h3>
          <div className={styles.bars}>
            {Object.entries(data.skillDistribution).map(([skill, count]) => (
              <div key={skill} className={styles.barRow}>
                <span className={styles.barLabel}>{skill}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(count / (data.totalWorkers || 1)) * 100}%` }}
                  />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.contractorAllocation && (
        <div className={`card ${styles.section}`}>
          <h3>Contractor Allocation</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contractor</th>
                <th>Workers</th>
              </tr>
            </thead>
            <tbody>
              {data.contractorAllocation.map((item) => (
                <tr key={item.contractor}>
                  <td>{item.contractor}</td>
                  <td>{item.workers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
