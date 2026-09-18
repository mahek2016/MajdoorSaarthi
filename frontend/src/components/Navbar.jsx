import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import { useLanguage } from '../context/LanguageContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const handleNavClick = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setLangOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={handleNavClick}>
          <span className={styles.logoIcon}>M</span>
          <div>
            <span className={styles.logoText}>MajdoorSaarthi</span>
            <span className={styles.tagline}>{t('hero_tagline_1')} {t('hero_tagline_2')}</span>
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
          {/* Main Links */}
          <a href="#home" onClick={handleNavClick}>{t('nav_home')}</a>
          <a href="#problem" onClick={handleNavClick}>{t('nav_problem')}</a>
          <a href="#solution" onClick={handleNavClick}>{t('nav_solution')}</a>
          <a href="#how-it-works" onClick={handleNavClick}>{t('nav_how_it_works')}</a>

          {/* Our Services Dropdown */}
          <div 
            className={styles.dropdown}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className={styles.dropdownBtn} type="button">
              {t('nav_our_services')} <span style={{ fontSize: '0.65rem' }}>▼</span>
            </button>
            {(servicesOpen || menuOpen) && (
              <div className={styles.dropdownContent}>
                <a href="#for-workers" onClick={handleNavClick}>{t('nav_for_workers')}</a>
                <a href="#for-contractors" onClick={handleNavClick}>{t('nav_for_contractors')}</a>
                <a href="#for-companies" onClick={handleNavClick}>{t('nav_for_companies')}</a>
              </div>
            )}
          </div>

          {/* Language Selector Dropdown */}
          <div 
            className={styles.dropdown}
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button className={styles.dropdownBtn} type="button">
              🌐 {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'} <span style={{ fontSize: '0.65rem' }}>▼</span>
            </button>
            {(langOpen || menuOpen) && (
              <div className={styles.dropdownContent} style={{ minWidth: '110px' }}>
                <button type="button" onClick={() => { setLanguage('en'); handleNavClick(); }} className={styles.langOpt}>English</button>
                <button type="button" onClick={() => { setLanguage('hi'); handleNavClick(); }} className={styles.langOpt}>हिंदी</button>
                <button type="button" onClick={() => { setLanguage('mr'); handleNavClick(); }} className={styles.langOpt}>मराठी</button>
              </div>
            )}
          </div>

          {/* Authentication Actions */}
          <Link to="/login" className={styles.loginLink} onClick={handleNavClick}>{t('nav_login')}</Link>
          <Link to="/signup" onClick={handleNavClick}>
            <PrimaryButton size="sm">{t('nav_get_started')}</PrimaryButton>
          </Link>
        </div>
      </div>
    </nav>
  );
}
