import { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import styles from './LazyImage.module.css';

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Enable curtain reveal animation on scroll */
  curtainReveal?: boolean;
  /** Fallback placeholder content */
  placeholder?: React.ReactNode;
}

/**
 * LazyImage — Image with IntersectionObserver lazy loading,
 * optional GSAP curtain reveal animation, and fallback placeholder.
 */
export function LazyImage({
  src,
  alt,
  className = '',
  curtainReveal = false,
  placeholder,
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const { curtainReveal: curtainRevealAnim } = useGSAPAnimation();

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Set src from data-src
          if (el.dataset.src) {
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
          }
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Curtain reveal GSAP animation
  useEffect(() => {
    if (!curtainReveal || !loaded || !wrapperRef.current) return;

    const timer = setTimeout(() => {
      curtainRevealAnim({
        target: wrapperRef.current!,
        start: 'top 85%',
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [curtainReveal, curtainRevealAnim, loaded]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${className}`}
    >
      {!inView && (
        <div className={styles.placeholder}>
          {placeholder || null}
        </div>
      )}
      <img
        ref={imgRef}
        data-src={inView ? undefined : src}
        src={inView ? src : undefined}
        alt={alt}
        loading="lazy"
        className={`${styles.image} ${loaded ? styles.loaded : ''}`}
        onLoad={handleLoad}
        onError={() => setLoaded(true)} // Hide placeholder on error too
      />
    </div>
  );
}

export default LazyImage;
