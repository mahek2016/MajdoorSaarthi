import styles from './MatchScore.module.css';

export default function MatchScore({ score, breakdown, size = 'md' }) {
  const getColor = (s) => {
    if (s >= 80) return 'high';
    if (s >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={`${styles.score} ${styles[getColor(score)]}`}>
        <span className={styles.percent}>{Math.round(score)}%</span>
        <span className={styles.label}>Match</span>
      </div>
      {breakdown && (
        <div className={styles.breakdown}>
          <div className={styles.row}>
            <span>Skill Match</span>
            <span>{breakdown.skillScore}/40</span>
          </div>
          <div className={styles.row}>
            <span>Experience</span>
            <span>{breakdown.experienceScore}/20</span>
          </div>
          <div className={styles.row}>
            <span>Location</span>
            <span>{breakdown.locationScore}/15</span>
          </div>
          <div className={styles.row}>
            <span>Availability</span>
            <span>{breakdown.availabilityScore}/15</span>
          </div>
          <div className={styles.row}>
            <span>Wage Compatibility</span>
            <span>{breakdown.wageScore}/10</span>
          </div>
        </div>
      )}
    </div>
  );
}
