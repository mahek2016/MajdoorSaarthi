import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { useLanguage } from '../context/LanguageContext';
import SaarthiWidget from '../components/SaarthiWidget';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('find-work');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setHowItWorksOpen(false);
      }
    };
    if (howItWorksOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [howItWorksOpen]);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.badge}>{t('hero_badge')}</span>
            <h1>
              {t('hero_tagline_1')} <span>{t('hero_tagline_2')}</span>
            </h1>
            <p className={styles.subtitle}>
              {t('hero_subtitle')}
            </p>

            {/* Tabbed Onboarding Directions */}
            <div className={styles.tabButtons}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'find-work' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('find-work')}
              >
                Worker Login / SignUp
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'hire-workers' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('hire-workers')}
              >
                Employer Login / SignUp
              </button>
            </div>

            {activeTab === 'find-work' ? (
              <div className={styles.journeyPanel}>
                <h3 className={styles.journeyHeading}>{t('worker_journey_heading')}</h3>
                <p className={styles.journeyText}>
                  {t('worker_journey_sub')}
                </p>
                <div className={styles.journeyCards}>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('worker_card_1')}
                  </div>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('worker_card_2')}
                  </div>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('worker_card_3')}
                  </div>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('worker_card_4')}
                  </div>
                </div>
                <Link to="/signup?type=find-work">
                  <PrimaryButton size="lg">{t('hero_btn_find_work')}</PrimaryButton>
                </Link>
              </div>
            ) : (
              <div className={styles.journeyPanel}>
                <h3 className={styles.journeyHeading} style={{ color: 'var(--color-primary)' }}>{t('contractor_journey_heading')}</h3>
                <p className={styles.journeyText}>
                  {t('contractor_journey_sub')}
                </p>
                <div className={styles.journeyCards}>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('contractor_card_1')}
                  </div>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('contractor_card_2')}
                  </div>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('contractor_card_3')}
                  </div>
                  <div className={styles.journeyCard}>
                    <span>✓</span> {t('contractor_card_4')}
                  </div>
                </div>
                <Link to="/signup?type=hire-workers">
                  <PrimaryButton size="lg" style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>{t('hero_btn_hire_workers')}</PrimaryButton>
                </Link>
              </div>
            )}
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>👷</span>
              <span>Find Skilled Work</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>🎯</span>
              <span>Smart Job Matching</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>📍</span>
              <span>Nearby Opportunities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="section">
        <div className="container">
          <h2 className="section-title text-center">{t('prob_title')}</h2>
          <p className="section-subtitle text-center">{t('prob_subtitle')}</p>
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            <div className={styles.probCard}>
              <span className={styles.probIcon}>🚉</span>
              <h4>{t('prob_1_title')}</h4>
              <p>{t('prob_1_desc')}</p>
            </div>
            <div className={styles.probCard}>
              <span className={styles.probIcon}>💸</span>
              <h4>{t('prob_2_title')}</h4>
              <p>{t('prob_2_desc')}</p>
            </div>
            <div className={styles.probCard}>
              <span className={styles.probIcon}>📇</span>
              <h4>{t('prob_3_title')}</h4>
              <p>{t('prob_3_desc')}</p>
            </div>
            <div className={styles.probCard}>
              <span className={styles.probIcon}>📊</span>
              <h4>{t('prob_4_title')}</h4>
              <p>{t('prob_4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className={`section ${styles.altBg}`}>
        <div className="container">
          <h2 className="section-title text-center">{t('sol_title')}</h2>
          <p className="section-subtitle text-center">{t('sol_subtitle')}</p>
          <div className="grid-4" style={{ marginTop: '2rem' }}>
            <div className={styles.solCard}>
              <span className={styles.solIcon}>🎯</span>
              <h4>{t('sol_1_title')}</h4>
              <p>{t('sol_1_desc')}</p>
            </div>
            <div className={styles.solCard}>
              <span className={styles.solIcon}>🆔</span>
              <h4>{t('sol_2_title')}</h4>
              <p>{t('sol_2_desc')}</p>
            </div>
            <div className={styles.solCard}>
              <span className={styles.solIcon}>📅</span>
              <h4>{t('sol_3_title')}</h4>
              <p>{t('sol_3_desc')}</p>
            </div>
            <div className={styles.solCard}>
              <span className={styles.solIcon}>⭐️</span>
              <h4>{t('sol_4_title')}</h4>
              <p>{t('sol_4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Collapsed View with Modal CTA) */}
      <section id="how-it-works" className="section">
        <div className="container text-center">
          <h2 className="section-title">{t('how_title')}</h2>
          <p className="section-subtitle">{t('how_sub')}</p>
          <div style={{ marginTop: '2rem' }}>
            <PrimaryButton onClick={() => setHowItWorksOpen(true)} size="lg">
              {t('how_works_cta')}
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* Accessible Workflow Modal */}
      {howItWorksOpen && (
        <div 
          className={styles.modalOverlay} 
          onClick={() => setHowItWorksOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="How It Works Workflows"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              className={styles.modalClose} 
              onClick={() => setHowItWorksOpen(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="section-title text-center" style={{ margin: '1rem 0' }}>{t('how_title')}</h2>
            <p className={styles.modalSub}>{t('how_sub')}</p>
            
            <div className={styles.modalGrid}>
              {/* For Workers Workflow */}
              <div className={styles.modalCol}>
                <h3>👷 {t('how_workers_header')}</h3>
                <ol>
                  <li>Create your profile with mobile and trades</li>
                  <li>Find suitable nearby jobs ranked by matching scores</li>
                  <li>Apply or receive direct shortlist invitations</li>
                  <li>Accept the work check-in request</li>
                  <li>Track attendance and earnings digitally</li>
                </ol>
              </div>

              {/* For Contractors Workflow */}
              <div className={styles.modalCol}>
                <h3>🏗️ {t('how_contractors_header')}</h3>
                <ol>
                  <li>Post a job specifying required skills and locations</li>
                  <li>Find suitable workers ranked by match scores</li>
                  <li>Shortlist or invite matching workers</li>
                  <li>Worker accepts invitation</li>
                  <li>Confirm hiring allocation</li>
                </ol>
              </div>

              {/* For Companies Workflow */}
              <div className={styles.modalCol}>
                <h3>🏢 For Companies Flow</h3>
                <ol>
                  <li>Create a project for your site locations</li>
                  <li>Allocate contractor workforce</li>
                  <li>Monitor worker attendances (Present/Absent counts)</li>
                  <li>Track attendance distribution logs</li>
                  <li>View workforce analytics (skills and contractor summaries)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Our Services Section */}
      <section id="our-services" className={`section ${styles.altBg}`}>
        <div className="container">
          <h2 className="section-title text-center">{t('srv_title')}</h2>
          <p className="section-subtitle text-center">{t('srv_subtitle')}</p>

          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {/* For Workers Card */}
            <div id="for-workers" className={styles.serviceCard}>
              <span className={styles.serviceIcon}>👷</span>
              <h3>{t('srv_w_title')}</h3>
              <p>{t('srv_w_desc')}</p>
              <Link to="/signup?type=find-work">
                <PrimaryButton>{t('hero_btn_find_work')}</PrimaryButton>
              </Link>
            </div>

            {/* For Contractors Card */}
            <div id="for-contractors" className={styles.serviceCard}>
              <span className={styles.serviceIcon}>🧑🔧</span>
              <h3>{t('srv_c_title')}</h3>
              <p>{t('srv_c_desc')}</p>
              <Link to="/signup?type=hire-workers">
                <PrimaryButton>{t('hero_btn_hire_workers')}</PrimaryButton>
              </Link>
            </div>

            {/* For Companies Card */}
            <div id="for-companies" className={styles.serviceCard}>
              <span className={styles.serviceIcon}>🏢</span>
              <h3>{t('srv_co_title')}</h3>
              <p>{t('srv_co_desc')}</p>
              <Link to="/signup?type=hire-workers">
                <SecondaryButton>{t('nav_get_started')}</SecondaryButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Saarthi Section */}
      <section className="section">
        <div className="container text-center" style={{ maxWidth: '600px' }}>
          <h2 className="section-title">Meet Saarthi</h2>
          <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
            Need help using MajdoorSaarthi? Saarthi can guide you step-by-step.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
            <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent('saarthi-open', { detail: { voice: false } }))}>
              💬 Chat with Saarthi
            </PrimaryButton>
            <SecondaryButton onClick={() => window.dispatchEvent(new CustomEvent('saarthi-open', { detail: { voice: true } }))}>
              🎙️ Talk to Saarthi
            </SecondaryButton>
          </div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className={`section ${styles.altBg}`}>
        <div className="container">
          <h2 className="section-title text-center">{t('trust_title')}</h2>
          <p className="section-subtitle text-center">{t('trust_subtitle')}</p>

          <div className="grid-2" style={{ marginTop: '2.5rem', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', background: 'white' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>🆔 {t('trust_1_title')}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('trust_1_desc')}</p>
            </div>
            <div className="card" style={{ padding: '2rem', background: 'white' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>📝 {t('trust_2_title')}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('trust_2_desc')}</p>
            </div>
            <div className="card" style={{ padding: '2rem', background: 'white' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>⚙️ {t('trust_3_title')}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('trust_3_desc')}</p>
            </div>
            <div className="card" style={{ padding: '2rem', background: 'white' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>⭐️ {t('trust_4_title')}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('trust_4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
