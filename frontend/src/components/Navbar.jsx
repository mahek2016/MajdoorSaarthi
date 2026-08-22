import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import styles from './Navbar.module.css';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#for-workers', label: 'For Workers' },
  { to: '/#for-contractors', label: 'For Contractors' },
  { to: '/#for-companies', label: 'For Companies' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={handleNavClick}>
          <span className={styles.logoIcon}>M</span>
          <div>
            <span className={styles.logoText}>MajdoorSaarthi</span>
            <span className={styles.tagline}>Kaam bhi. Kaamgar bhi.</span>
          </div>
        </Link>

        <button
          className={`${styles.menuToggle} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {PUBLIC_LINKS.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className={location.pathname === link.to ? styles.active : ''}
              onClick={handleNavClick}
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" className={styles.loginLink} onClick={handleNavClick}>Login</Link>
          <Link to="/signup" onClick={handleNavClick}>
            <PrimaryButton size="sm">Get Started</PrimaryButton>
          </Link>
        </div>
      </div>
    </nav>
  );
}
