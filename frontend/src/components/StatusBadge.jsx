import { STATUS_LABELS } from '../utils/constants';
import styles from './StatusBadge.module.css';

const BADGE_MAP = {
  OPEN: 'open',
  IN_PROGRESS: 'progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  APPLIED: 'applied',
  UNDER_REVIEW: 'review',
  SELECTED: 'selected',
  WORK_STARTED: 'progress',
  REJECTED: 'rejected',
  ACTIVE: 'open',
  ON_HOLD: 'review',
};

export default function StatusBadge({ status }) {
  const variant = BADGE_MAP[status] || 'closed';
  const label = STATUS_LABELS[status] || status;

  return <span className={`badge badge-${variant} ${styles.badge}`}>{label}</span>;
}
