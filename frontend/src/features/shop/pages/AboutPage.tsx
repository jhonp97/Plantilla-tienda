/**
 * AboutPage - Company information page with mission, team, and values
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '@components/SEO';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import styles from './AboutPage.module.css';

const TEAM_MEMBERS = [
  {
    name: 'María García',
    role: 'CEO & Fundadora',
    image: undefined,
    initials: 'MG',
  },
  {
    name: 'Carlos López',
    role: 'CTO',
    image: undefined,
    initials: 'CL',
  },
  {
    name: 'Ana Martínez',
    role: 'Directora de Marketing',
    image: undefined,
    initials: 'AM',
  },
  {
    name: 'David Sánchez',
    role: 'Head de Ventas',
    image: undefined,
    initials: 'DS',
  },
];

const VALUES = [
  {
    key: 'quality',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    key: 'innovation',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    key: 'sustainability',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    key: 'transparency',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const { scrollTrigger, fadeIn } = useGSAPAnimation();
  const heroRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroRef.current) fadeIn(heroRef.current);
    if (missionRef.current) scrollTrigger({ target: missionRef.current, trigger: missionRef.current, animationVars: {} });
    if (valuesRef.current) scrollTrigger({ target: valuesRef.current, trigger: valuesRef.current, animationVars: {} });
    if (teamRef.current) scrollTrigger({ target: teamRef.current, trigger: teamRef.current, animationVars: {} });
  }, [fadeIn, scrollTrigger]);

  return (
    <>
      <SEO
        title={t('pages.about.title')}
        description={t('pages.about.description')}
        pathname="/about"
      />

      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('pages.about.title')}</h1>
          <p className={styles.heroDescription}>
            {t('pages.about.heroDescription')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection} ref={missionRef}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <h2 className={styles.missionTitle}>{t('pages.about.missionTitle')}</h2>
              <p className={styles.missionText}>
                {t('pages.about.missionText')}
              </p>
            </div>
            <div className={styles.missionCard}>
              <h2 className={styles.missionTitle}>{t('pages.about.visionTitle')}</h2>
              <p className={styles.missionText}>
                {t('pages.about.visionText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection} ref={valuesRef}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('pages.about.valuesTitle')}</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map((value) => (
              <div key={value.key} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3 className={styles.valueTitle}>{t(`pages.about.value${value.key.charAt(0).toUpperCase() + value.key.slice(1)}`)}</h3>
                <p className={styles.valueDescription}>{t(`pages.about.value${value.key.charAt(0).toUpperCase() + value.key.slice(1)}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection} ref={teamRef}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('pages.about.teamTitle')}</h2>
          <div className={styles.teamGrid}>
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} />
                  ) : (
                    <span className={styles.teamInitials}>{member.initials}</span>
                  )}
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
