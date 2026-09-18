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
            <span>Skills {breakdown.skillScore > 0 ? '✓' : '✗'}</span>
            <span>{breakdown.skillScore}/40</span>
          </div>
          <div className={styles.row}>
            <span>Experience {breakdown.experienceScore >= 15 ? '✓' : '✗'}</span>
            <span>{breakdown.experienceScore}/20</span>
          </div>
          <div className={styles.row}>
            <span>Location {breakdown.locationScore >= 12 ? '✓' : '✗'}</span>
            <span>{breakdown.locationScore}/15</span>
          </div>
          <div className={styles.row}>
            <span>Availability {breakdown.availabilityScore >= 15 ? '✓' : '✗'}</span>
            <span>{breakdown.availabilityScore}/15</span>
          </div>
          <div className={styles.row}>
            <span>Wage {breakdown.wageScore >= 7 ? '✓' : '✗'}</span>
            <span>{breakdown.wageScore}/10</span>
          </div>
        </div>
      )}
    </div>
  );
}
