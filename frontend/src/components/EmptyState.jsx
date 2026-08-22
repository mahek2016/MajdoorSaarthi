import styles from './EmptyState.module.css';

export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>{icon}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
