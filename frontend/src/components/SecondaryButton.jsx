import styles from './SecondaryButton.module.css';

export default function SecondaryButton({
  children,
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
    >
      {children}
    </button>
  );
}
