import styles from './MinimalSpinner.module.css';

export interface MinimalSpinnerProps {
  /** Optional className override */
  className?: string;
  /** Accessible label */
  label?: string;
  /** Size in pixels. Default: 24 */
  size?: number;
}

/**
 * MinimalSpinner — SVG monochrome loading spinner.
 * Pure CSS animation (no GSAP needed).
 */
export function MinimalSpinner({
  className = '',
  label = 'Cargando',
  size = 24,
}: MinimalSpinnerProps) {
  return (
    <svg
      className={`${styles.spinner} ${className}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label={label}
    >
      <circle
        className={styles.circle}
        cx="12"
        cy="12"
        r="10"
      />
    </svg>
  );
}

export default MinimalSpinner;
