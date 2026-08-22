import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <header className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <span className={styles.mobileTitle}>MajdoorSaarthi</span>
        </header>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
