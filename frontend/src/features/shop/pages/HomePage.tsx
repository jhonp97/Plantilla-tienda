/**
 * HomePage — Landing page with HeroSection, featured categories,
 * featured products, and Google Reviews carousel.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '@store/productStore';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import { SEO } from '@components/SEO';
import { formatPrice } from '@utils/formatPrice';
import { HeroSection } from '@features/shop/components/HeroSection';
import type { Review } from '@services/review.service';
import styles from './HomePage.module.css';

/** Fetch reviews from the Google Reviews API */
async function fetchGoogleReviews(): Promise<Review[]> {
  try {
    const res = await fetch('/api/google-reviews');
    if (!res.ok) return [];
    const data = await res.json();
    // Filter for >= 4 stars only
    const reviews: Review[] = Array.isArray(data) ? data : data.reviews ?? [];
    return reviews.filter((r: Review) => r.rating >= 4);
  } catch {
    return [];
  }
}

/** Fetch categories */
async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Star SVG icon component */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ─── Category Card ────────────────────────────────────────
interface CategoryCardProps {
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

function CategoryCard({ name, slug, image, productCount }: CategoryCardProps) {
  const imgSrc =
    image ||
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=60';

  return (
    <Link
      to={`/products?category=${slug}`}
      className={styles.categoryCard}
      data-animate="true"
    >
      <img
        className={styles.categoryCardImage}
        src={imgSrc}
        alt={name}
        loading="lazy"
      />
      <div className={styles.categoryCardOverlay} aria-hidden="true" />
      <div className={styles.categoryCardContent}>
        <h3 className={styles.categoryCardName}>{name}</h3>
        {productCount !== undefined && (
          <p className={styles.categoryCardCount}>
            {productCount} {productCount === 1 ? 'producto' : 'productos'}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Featured Product Card ────────────────────────────────
interface FeaturedProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string; isPrimary: boolean }[];
  };
}

function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={styles.featuredCard}
      data-animate="true"
    >
      <div className={styles.featuredCardImage}>
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} loading="lazy" />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className={styles.featuredCardBody}>
        <h3 className={styles.featuredCardName}>{product.name}</h3>
        <p className={styles.featuredCardPrice}>
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

// ─── Main HomePage ────────────────────────────────────────
export default function HomePage() {
  const { t } = useTranslation();
  const { products, fetchProducts } = useProductStore();
  const { staggerIn } = useGSAPAnimation();

  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string; productCount?: number }[]
  >([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeDot, setActiveDot] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchProducts({ limit: 8, isActive: true });
    fetchCategories().then(setCategories);
    fetchGoogleReviews().then(setReviews);
  }, [fetchProducts]);

  // Stagger animation on category cards
  useEffect(() => {
    if (categories.length > 0 && categoriesRef.current) {
      const cards = categoriesRef.current.querySelectorAll(
        '[data-animate="true"]',
      );
      if (cards.length > 0) {
        staggerIn({ targets: cards, stagger: 0.08 });
      }
    }
  }, [categories, staggerIn]);

  // Stagger animation on featured products
  useEffect(() => {
    if (products.length > 0 && featuredRef.current) {
      const cards = featuredRef.current.querySelectorAll(
        '[data-animate="true"]',
      );
      if (cards.length > 0) {
        staggerIn({ targets: cards, stagger: 0.06, baseDelay: 0.2 });
      }
    }
  }, [products, staggerIn]);

  // Auto-scroll carousel every 5 seconds
  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!carouselRef.current) return;
      const maxScroll =
        carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      const newScroll = carouselRef.current.scrollLeft + carouselRef.current.clientWidth;
      if (newScroll >= maxScroll) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveDot(0);
      } else {
        carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth, behavior: 'smooth' });
        setActiveDot((d) => d + 1);
      }
    }, 5000);
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      startAutoplay();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reviews.length, startAutoplay]);

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.clientWidth;
    const active = Math.round(scrollLeft / cardWidth);
    setActiveDot(active);
  }, []);

  const scrollToDot = (index: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.children[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    setActiveDot(index);
  };

  // JSON-LD for WebSite
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('header.storeName'),
    url: typeof window !== 'undefined' ? window.location.origin : '',
  };

  return (
    <>
      <SEO
        title={t('home.seo.title')}
        description={t('home.seo.description')}
        pathname="/"
        jsonLd={websiteJsonLd}
      />

      <div className={styles.page}>
        {/* ─── Hero ──────────────────────────────────── */}
        <HeroSection />

        {/* ─── Categories ──────────────────────────────── */}
        {categories.length > 0 && (
          <section className={`${styles.section} ${styles.sectionDark}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {t('home.categories.title')}
                </h2>
                <p className={styles.sectionSubtitle}>
                  {t('home.categories.subtitle')}
                </p>
              </div>
              <div
                className={styles.categoriesGrid}
                ref={categoriesRef}
              >
                {categories.slice(0, 4).map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    slug={cat.slug}
                    productCount={cat.productCount}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Featured Products ────────────────────── */}
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {t('home.featured.title')}
              </h2>
              <p className={styles.sectionSubtitle}>
                {t('home.featured.subtitle')}
              </p>
            </div>

            {products.length === 0 ? (
              <div className={styles.featuredGrid}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : (
              <div className={styles.featuredGrid} ref={featuredRef}>
                {products.slice(0, 8).map((product) => (
                  <FeaturedProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Google Reviews Carousel ──────────────── */}
        {reviews.length > 0 && (
          <section className={`${styles.section} ${styles.sectionDark}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {t('home.reviews.title')}
                </h2>
                <p className={styles.sectionSubtitle}>
                  {t('home.reviews.subtitle')}
                </p>
              </div>

              <div
                className={styles.reviewsCarousel}
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                onMouseEnter={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                }}
                onMouseLeave={startAutoplay}
                onFocus={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                }}
                onBlur={startAutoplay}
                role="region"
                aria-label={t('home.reviews.ariaLabel')}
                tabIndex={0}
              >
                {reviews.map((review, idx) => (
                  <div key={review.id || idx} className={styles.reviewCard}>
                    <div className={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={styles.reviewStar}
                        />
                      ))}
                    </div>
                    <p className={styles.reviewText}>
                      {review.comment || ''}
                    </p>
                    <p className={styles.reviewAuthor}>
                      — {review.user?.name || t('home.reviews.anonymous')}
                    </p>
                  </div>
                ))}
              </div>

              {reviews.length > 1 && (
                <div className={styles.dots} role="tablist" aria-label={t('home.reviews.dotsLabel')}>
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      className={`${styles.dot} ${idx === activeDot ? styles.dotActive : ''}`}
                      onClick={() => scrollToDot(idx)}
                      role="tab"
                      aria-selected={idx === activeDot}
                      aria-label={`${t('home.reviews.reviewLabel')} ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
