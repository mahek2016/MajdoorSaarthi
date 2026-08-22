import { Link } from 'react-router-dom';
import MatchScore from './MatchScore';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import styles from './WorkerCard.module.css';

export default function WorkerCard({ worker, showHire = false, onHire, linkTo }) {
  const name = worker.user?.name || worker.name;
  const skill = worker.skills?.[0]?.skill || worker.skill || worker.primarySkill;

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {worker.user?.profilePhoto || worker.profilePhoto ? (
            <img src={worker.user?.profilePhoto || worker.profilePhoto} alt={name} />
          ) : (
            <span>{name?.charAt(0)}</span>
          )}
        </div>
        <div className={styles.info}>
          <h3>{name}</h3>
          <p className={styles.skill}>{skill}</p>
          <p className={styles.rating}>⭐ {worker.rating?.toFixed(1) || '4.0'}</p>
        </div>
        {worker.matchScore != null && (
          <MatchScore score={worker.matchScore} size="sm" />
        )}
      </div>

      <div className={styles.details}>
        <span>{worker.experience} years experience</span>
        <span>📍 {worker.distance != null ? `${worker.distance} km` : worker.location}</span>
        <span>{worker.availability}</span>
      </div>

      <div className={styles.actions}>
        {linkTo && (
          <Link to={linkTo} className={styles.linkBtn}>
            <SecondaryButton size="sm" fullWidth>View Profile</SecondaryButton>
          </Link>
        )}
        {showHire && onHire && (
          <PrimaryButton size="sm" fullWidth onClick={() => onHire(worker)}>Hire</PrimaryButton>
        )}
      </div>
    </div>
  );
}
