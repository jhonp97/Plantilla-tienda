/**
 * StarRating - Reusable star rating component
 *
 * Props:
 * - rating: number 0-5 (supports half stars via decimal)
 * - readOnly?: if true, stars are display-only
 * - onChange?: callback when user clicks a star
 * - size?: 'sm' | 'md' | 'lg' (default 'md')
 */
import { useState, useId } from 'react';
import styles from './StarRating.module.css';

export interface StarRatingProps {
  rating: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  rating,
  readOnly = false,
  onChange,
  size = 'md',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const uid = useId();
  const displayRating = hoverRating ?? rating;

  const handleClick = (star: number) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!readOnly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={`${styles.container} ${styles[size]} ${
        readOnly ? styles.readOnly : styles.interactive
      }`}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={`${rating} de 5 estrellas`}
    >
      {stars.map((star) => {
        const filled = displayRating >= star;
        const halfFilled = !filled && displayRating >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            className={`${styles.star} ${
              filled ? styles.starFilled : halfFilled ? styles.starHalf : styles.starEmpty
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
            role={readOnly ? undefined : 'radio'}
            aria-checked={readOnly ? undefined : rating === star}
            tabIndex={readOnly ? -1 : 0}
          >
            {halfFilled ? (
              <span className={styles.halfStarContainer}>
                <svg
                  className={styles.starSvg}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className={styles.halfStarOverlay}>
                  <svg
                    className={styles.starSvg}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
              </span>
            ) : (
              <svg
                className={styles.starSvg}
                viewBox="0 0 24 24"
                fill={filled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
