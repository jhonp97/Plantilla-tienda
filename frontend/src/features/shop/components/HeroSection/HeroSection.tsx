/**
 * HeroSection — Full-viewport hero with background image/video,
 * overlay, translatable heading + subtitle, and CTA button.
 */

import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  /** Background image URL (also used as video fallback) */
  backgroundImage?: string;
  /** Optional muted looping video URL (takes precedence over image) */
  backgroundVideo?: string;
}

/**
 * HeroSection — Premium full-viewport hero.
 * Renders background image/video with gradient overlay, heading,
 * subtitle, and a CTA button linking to /products.
 *
 * All text uses t() from react-i18next.
 */
export function HeroSection({
  backgroundImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
  backgroundVideo,
}: HeroSectionProps) {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pageIn } = useGSAPAnimation();

  // GSAP page-in animation on mount
  useEffect(() => {
    if (heroRef.current) {
      pageIn(heroRef.current);
    }
  }, [pageIn]);

  // Video error fallback: the <video> element's onError will hide it
  // and the static image behind will show through.

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-label={t('home.hero.ariaLabel')}
    >
      {/* Background Video (if provided) */}
      {backgroundVideo && (
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          poster={backgroundImage}
          onError={(e) => {
            // Hide video element on error → fallback image shows through
            (e.currentTarget as HTMLVideoElement).style.display = 'none';
          }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Static background image (visible as fallback or primary bg) */}
      <img
        className={styles.image}
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        style={{ display: backgroundVideo ? 'none' : 'block' }}
      />

      {/* Gradient overlay */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* Content */}
      <div ref={contentRef} className={styles.content}>
        <h1 className={styles.heading}>
          {t('home.hero.title')}
        </h1>
        <p className={styles.subtitle}>
          {t('home.hero.subtitle')}
        </p>
        <Link to="/products" className={styles.cta}>
          {t('home.hero.cta')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        <span>{t('home.hero.scroll')}</span>
      </div>
    </section>
  );
}

export default HeroSection;
