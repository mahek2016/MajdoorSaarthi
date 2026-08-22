import styles from './LoadingState.module.css';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p>{message}</p>
    </div>
  );
}
