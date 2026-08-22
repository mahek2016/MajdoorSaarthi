import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <h3>MajdoorSaarthi</h3>
          <p>Kaam bhi. Kaamgar bhi.</p>
          <p className={styles.desc}>
            Connecting skilled blue-collar workers with contractors and companies across India.
          </p>
        </div>

        <div className={styles.links}>
          <h4>Platform</h4>
          <Link to="/#for-workers">For Workers</Link>
          <Link to="/#for-contractors">For Contractors</Link>
          <Link to="/#for-companies">For Companies</Link>
        </div>

        <div className={styles.links}>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>

        <div className={styles.links}>
          <h4>Future Scope</h4>
          <span className={styles.muted}>Individual/Customer hiring</span>
          <span className={styles.muted}>Home services marketplace</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} MajdoorSaarthi. Final Year Academic Project — MVP.</p>
        </div>
      </div>
    </footer>
  );
}
