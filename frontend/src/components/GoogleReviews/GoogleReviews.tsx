/**
 * GoogleReviews - Displays cached Google Maps reviews for a place
 * Calls GET /api/reviews?placeId=XXX
 * Graceful degradation if no reviews or API is unavailable
 */
import { useEffect, useState } from 'react';
import { useAuthStore } from '@store/authStore';
import { apiGet } from '@services/api';
import { StarRating } from '@components/StarRating';
import styles from './GoogleReviews.module.css';

interface GoogleReview {
  id: string;
  placeId: string;
  authorName: string;
  rating: number;
  text: string | null;
  reviewDate: string;
  cachedAt: string;
}

interface GoogleReviewsResponse {
  success: boolean;
  data: GoogleReview[];
  cachedAt?: string;
}

interface GoogleReviewsProps {
  placeId: string;
}

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'recién actualizado';
  if (diffHours < 24) return `hace ${diffHours} horas`;
  if (diffDays < 7) return `hace ${diffDays} días`;
  return `hace ${Math.floor(diffDays / 7)} semanas`;
}

function formatReviewDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function GoogleReviews({ placeId }: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) {
      setIsLoading(false);
      setError('No se ha especificado un lugar');
      return;
    }

    let cancelled = false;

    async function fetchReviews() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiGet<GoogleReviewsResponse>(
          `/api/reviews?placeId=${encodeURIComponent(placeId)}`,
          {},
          deps
        );

        if (cancelled) return;

        if (result.success && result.data.length > 0) {
          setReviews(result.data);
          setCachedAt(result.cachedAt ?? null);
        } else {
          setReviews([]);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No hay reseñas disponibles');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [placeId]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.googleIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.818h5.273c-.196 1.284-1.128 2.385-2.475 3.046l3.905 3.039c2.338-2.155 3.697-5.336 3.697-9.116 0-.843-.074-1.657-.211-2.424H12.545v1.637z" />
                <path d="M5.618 8.313l-1.934 1.502C5.026 11.759 6.81 13.5 9 14.5l1.864-1.864C9.451 11.936 8.5 10.657 8.5 9.167c0-.668.157-1.3.44-1.862L5.618 8.313z" fillOpacity="0.6" />
              </svg>
            </div>
            <h3 className={styles.title}>Reseñas de Google</h3>
          </div>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Cargando reseñas...</span>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.googleIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.818h5.273c-.196 1.284-1.128 2.385-2.475 3.046l3.905 3.039c2.338-2.155 3.697-5.336 3.697-9.116 0-.843-.074-1.657-.211-2.424H12.545v1.637z" />
                <path d="M5.618 8.313l-1.934 1.502C5.026 11.759 6.81 13.5 9 14.5l1.864-1.864C9.451 11.936 8.5 10.657 8.5 9.167c0-.668.157-1.3.44-1.862L5.618 8.313z" fillOpacity="0.6" />
              </svg>
            </div>
            <h3 className={styles.title}>Reseñas de Google</h3>
          </div>
        </div>
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className={styles.emptyText}>{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.googleIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.818h5.273c-.196 1.284-1.128 2.385-2.475 3.046l3.905 3.039c2.338-2.155 3.697-5.336 3.697-9.116 0-.843-.074-1.657-.211-2.424H12.545v1.637z" />
                <path d="M5.618 8.313l-1.934 1.502C5.026 11.759 6.81 13.5 9 14.5l1.864-1.864C9.451 11.936 8.5 10.657 8.5 9.167c0-.668.157-1.3.44-1.862L5.618 8.313z" fillOpacity="0.6" />
              </svg>
            </div>
            <h3 className={styles.title}>Reseñas de Google</h3>
          </div>
        </div>
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className={styles.emptyText}>No hay reseñas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.googleIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.818h5.273c-.196 1.284-1.128 2.385-2.475 3.046l3.905 3.039c2.338-2.155 3.697-5.336 3.697-9.116 0-.843-.074-1.657-.211-2.424H12.545v1.637z" />
              <path d="M5.618 8.313l-1.934 1.502C5.026 11.759 6.81 13.5 9 14.5l1.864-1.864C9.451 11.936 8.5 10.657 8.5 9.167c0-.668.157-1.3.44-1.862L5.618 8.313z" fillOpacity="0.6" />
            </svg>
          </div>
          <h3 className={styles.title}>Reseñas de Google</h3>
        </div>
        {cachedAt && (
          <span className={styles.cacheBadge}>
            Actualizado {formatTimeAgo(cachedAt)}
          </span>
        )}
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewCardHeader}>
              <div className={styles.reviewAvatar}>
                {review.authorName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.reviewMeta}>
                <span className={styles.reviewAuthor}>
                  {review.authorName}
                </span>
                <span className={styles.reviewDate}>
                  {formatReviewDate(review.reviewDate)}
                </span>
              </div>
              <div className={styles.reviewRating}>
                <StarRating rating={review.rating} readOnly size="sm" />
              </div>
            </div>
            {review.text && (
              <p className={styles.reviewText}>
                {review.text.length > 300
                  ? `${review.text.slice(0, 300)}...`
                  : review.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
