import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/constants';
import StatusBadge from './StatusBadge';
import MatchScore from './MatchScore';
import PrimaryButton from './PrimaryButton';
import styles from './JobCard.module.css';

export default function JobCard({ job, showMatch = false, linkTo }) {
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{job.title}</h3>
          <p className={styles.company}>{job.contractor?.businessName || job.company || 'Contractor'}</p>
        </div>
        {job.status && <StatusBadge status={job.status} />}
      </div>

      <div className={styles.details}>
        <span>📍 {job.location}</span>
        {job.distance != null && <span>{job.distance} km</span>}
        <span>{formatCurrency(job.dailyWage)}/day</span>
        <span>{job.duration} Days</span>
      </div>

      {showMatch && job.matchScore != null && (
        <div className={styles.match}>
          <MatchScore score={job.matchScore} size="sm" />
        </div>
      )}

      {linkTo && (
        <Link to={linkTo}>
          <PrimaryButton fullWidth size="sm">View Job</PrimaryButton>
        </Link>
      )}
    </div>
  );
}
