import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.badge}>Blue-Collar Workforce Platform</span>
            <h1>Kaam bhi. Kaamgar bhi.</h1>
            <p className={styles.subtitle}>
              Connecting skilled workers with the right opportunities across India.
            </p>
            <div className={styles.cta}>
              <Link to="/signup"><PrimaryButton size="lg">Find Work</PrimaryButton></Link>
              <Link to="/signup"><SecondaryButton size="lg">Hire Workers</SecondaryButton></Link>
            </div>
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

      <section id="how-it-works" className="section">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle text-center">Simple steps to connect work with workers</p>
          <div className="grid-3">
            <div className={`card ${styles.stepCard}`}>
              <span className={styles.stepNum}>1</span>
              <h3>Sign Up</h3>
              <p>Create your account with mobile number and verify via OTP.</p>
            </div>
            <div className={`card ${styles.stepCard}`}>
              <span className={styles.stepNum}>2</span>
              <h3>Choose Role</h3>
              <p>Select Worker, Contractor, or Company based on your needs.</p>
            </div>
            <div className={`card ${styles.stepCard}`}>
              <span className={styles.stepNum}>3</span>
              <h3>Get Started</h3>
              <p>Find jobs, hire workers, or manage your workforce.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="for-workers" className={`section ${styles.altBg}`}>
        <div className="container">
          <div className={styles.roleSection}>
            <div>
              <h2 className="section-title">For Workers</h2>
              <p className={styles.roleDesc}>
                Find nearby jobs that match your skills, experience, and wage expectations.
                Apply with confidence using our transparent rule-based matching system.
              </p>
              <ul className={styles.featureList}>
                <li>✓ Browse jobs near your location</li>
                <li>✓ See match scores before applying</li>
                <li>✓ Track application status</li>
                <li>✓ Build your professional profile</li>
              </ul>
              <Link to="/signup"><PrimaryButton>Find Work Near You</PrimaryButton></Link>
            </div>
            <div className={styles.roleVisual}>👷</div>
          </div>
        </div>
      </section>

      <section id="for-contractors" className="section">
        <div className="container">
          <div className={`${styles.roleSection} ${styles.reverse}`}>
            <div>
              <h2 className="section-title">For Contractors</h2>
              <p className={styles.roleDesc}>
                Post jobs and find suitable workers quickly. Our matching algorithm
                ranks workers by skill, experience, location, and availability.
              </p>
              <ul className={styles.featureList}>
                <li>✓ Post jobs in minutes</li>
                <li>✓ Get AI-suggested worker matches</li>
                <li>✓ Hire directly from profiles</li>
                <li>✓ Manage active jobs</li>
              </ul>
              <Link to="/signup"><PrimaryButton>Hire Workers</PrimaryButton></Link>
            </div>
            <div className={styles.roleVisual}>🏗️</div>
          </div>
        </div>
      </section>

      <section id="for-companies" className={`section ${styles.altBg}`}>
        <div className="container">
          <div className={styles.roleSection}>
            <div>
              <h2 className="section-title">For Companies</h2>
              <p className={styles.roleDesc}>
                Manage projects and get a clear overview of your workforce —
                attendance, skill distribution, and contractor allocation.
              </p>
              <ul className={styles.featureList}>
                <li>✓ Create and track projects</li>
                <li>✓ Workforce overview dashboard</li>
                <li>✓ Attendance monitoring</li>
                <li>✓ Skill distribution insights</li>
              </ul>
              <Link to="/signup"><PrimaryButton>Manage Workforce</PrimaryButton></Link>
            </div>
            <div className={styles.roleVisual}>🏢</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">Why MajdoorSaarthi</h2>
          <p className="section-subtitle text-center">Built for India's blue-collar workforce</p>
          <div className="grid-4">
            {[
              { icon: '✅', title: 'Verified Profiles', desc: 'Worker profiles with skills, experience, and ratings' },
              { icon: '🎯', title: 'Skill-Based Matching', desc: 'Rule-based matching by skill, location, and wage' },
              { icon: '📍', title: 'Location-Based Jobs', desc: 'Find opportunities near you' },
              { icon: '💰', title: 'Transparent Wages', desc: 'Clear daily wage information upfront' },
              { icon: '👥', title: 'Workforce Management', desc: 'Track projects, attendance, and allocation' },
            ].map((f) => (
              <div key={f.title} className={`card ${styles.featureCard}`}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.futureScope}`}>
        <div className="container text-center">
          <h2 className="section-title">Future Scope</h2>
          <p className={styles.futureDesc}>
            Individual/Customer hiring — soon, homeowners will be able to find plumbers,
            electricians, and painters for home services directly through MajdoorSaarthi.
          </p>
          <span className={styles.comingSoon}>Coming Soon</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
