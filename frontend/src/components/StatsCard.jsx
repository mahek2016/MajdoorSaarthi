import styles from './StatsCard.module.css';

export default function StatsCard({ icon, label, value, color = 'primary' }) {
  return (
    <div className={`card ${styles.card}`}>
      <div className={`${styles.icon} ${styles[color]}`}>{icon}</div>
      <div className={styles.content}>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
}
