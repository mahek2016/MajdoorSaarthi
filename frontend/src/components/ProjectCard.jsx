import { Link } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project, linkTo }) {
  const present = project.present ?? project.workersPresent ?? 0;
  const total = project.workersRequired || project.totalWorkers || 0;

  return (
    <div className={`card ${styles.card}`}>
      <h3 className={styles.name}>{project.name}</h3>
      <p className={styles.location}>📍 {project.location}</p>

      <div className={styles.stats}>
        <div>
          <span className={styles.statValue}>{total}</span>
          <span className={styles.statLabel}>Workers</span>
        </div>
        <div>
          <span className={styles.statValue}>{present}</span>
          <span className={styles.statLabel}>Present</span>
        </div>
        <div>
          <span className={styles.statValue}>{project.progress || 0}%</span>
          <span className={styles.statLabel}>Progress</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${project.progress || 0}%` }} />
      </div>

      {linkTo && (
        <Link to={linkTo}>
          <PrimaryButton fullWidth size="sm">View Project</PrimaryButton>
        </Link>
      )}
    </div>
  );
}
