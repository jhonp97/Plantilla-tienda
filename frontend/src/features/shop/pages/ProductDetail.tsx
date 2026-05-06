/**
 * ProductDetail — Premium product detail page with sticky layout,
 * curtain reveal gallery, reviews, related products, and sticky
 * "Add to Cart" bar.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '@store/productStore';
import { useCartStore } from '@store/cartStore';
import { useAuth } from '@hooks/useAuth';
import { useToastStore } from '@store/toastStore';
import { usePagination } from '@hooks/usePagination';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import { reviewService, type Review } from '@services/review.service';
import { StarRating } from '@components/StarRating';
import { Button } from '@components/Button';
import { Textarea } from '@components/Textarea';
import { LazyImage } from '@components/LazyImage';
import { StickyAddToCartBar } from '@components/StickyAddToCartBar';
import type { Product } from '../../../types/product.types';
import { formatPrice } from '@utils/formatPrice';
import { SEO, buildProductJsonLd } from '@components/SEO';
import styles from './ProductDetail.module.css';

// ─── Image Gallery ─────────────────────────────────────────
interface ImageGalleryProps {
  images: Product['images'];
  productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { curtainReveal } = useGSAPAnimation();
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Curtain reveal on each image
  useEffect(() => {
    imgRefs.current.forEach((ref) => {
      if (ref) {
        curtainReveal({ target: ref, start: 'top 85%' });
      }
    });
  }, [curtainReveal, images.length]);

  if (images.length === 0) {
    return (
      <div className={`${styles.mainImage} ${styles.placeholderImage}`}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      {images.map((image, index) => (
        <div
          key={image.id}
          ref={(el) => { imgRefs.current[index] = el; }}
          className={`${styles.galleryImage} ${index === 0 ? styles.galleryImageFirst : ''}`}
        >
          <LazyImage
            src={image.url}
            alt={`${productName} - imagen ${index + 1}`}
            className={styles.galleryImg}
            curtainReveal
          />
        </div>
      ))}
    </div>
  );
}

// ─── Related Products ────────────────────────────────────
interface RelatedProductsProps {
  products: Product[];
}

function RelatedProducts({ products }: RelatedProductsProps) {
  const { t } = useTranslation();
  const { staggerIn } = useGSAPAnimation();
  const relatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (products.length > 0 && relatedRef.current) {
      const cards = relatedRef.current.querySelectorAll('[data-animate="true"]');
      if (cards.length > 0) {
        staggerIn({ targets: cards, stagger: 0.06, baseDelay: 0.3 });
      }
    }
  }, [products, staggerIn]);

  if (products.length === 0) return null;

  return (
    <div className={styles.relatedSection}>
      <h2 className={styles.relatedTitle}>{t('shop.relatedProducts')}</h2>
      <div className={styles.relatedGrid} ref={relatedRef}>
        {products.map((product) => {
          const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
          return (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className={styles.relatedCard}
              data-animate="true"
            >
              <div className={styles.relatedCardImage}>
                {primaryImage ? (
                  <img src={primaryImage.url} alt={product.name} loading="lazy" />
                ) : (
                  <div className={styles.relatedPlaceholder}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.relatedCardContent}>
                <h3 className={styles.relatedCardName}>{product.name}</h3>
                <p className={styles.relatedCardPrice}>{formatPrice(product.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review List ──────────────────────────────────────────
interface ReviewListProps {
  reviews: Review[];
}

function ReviewList({ reviews }: ReviewListProps) {
  const { t } = useTranslation();

  if (reviews.length === 0) return null;

  return (
    <div className={styles.reviewList}>
      {reviews.map((review) => (
        <div key={review.id} className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <div className={styles.reviewAvatar}>
              {review.user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.reviewMeta}>
              <span className={styles.reviewAuthor}>
                {review.user?.name || t('shop.anonymous')}
              </span>
              <span className={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {review.isVerifiedPurchase && (
              <span className={styles.verifiedBadge} title={t('shop.verifiedPurchase')}>
                <svg className={styles.verifiedIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('shop.verified')}
              </span>
            )}
          </div>
          <div className={styles.reviewRating}>
            <StarRating rating={review.rating} readOnly size="sm" />
          </div>
          {review.comment && (
            <p className={styles.reviewComment}>{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ProductDetail ──────────────────────────────────
export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const {
    selectedProduct,
    relatedProducts,
    isLoading,
    error,
    fetchProductBySlug,
    clearSelectedProduct,
  } = useProductStore();
  const { addItem, openDrawer } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const toast = useToastStore();

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // GSAP refs
  const infoRef = useRef<HTMLDivElement>(null);
  const relatedContainerRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const mainAddBtnRef = useRef<HTMLButtonElement>(null);
  const { fadeIn, slideUp, staggerIn } = useGSAPAnimation();

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalReviewPages, setTotalReviewPages] = useState(0);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const {
    currentPage: reviewPage,
    setPage: setReviewPage,
    hasNext: hasNextReviewPage,
    hasPrev: hasPrevReviewPage,
  } = usePagination({ totalItems: reviewCount, pageSize: 10 });

  const fetchReviews = useCallback(async () => {
    if (!slug) return;
    setIsReviewsLoading(true);
    setReviewError(null);
    try {
      const result = await reviewService.getProductReviews(slug, {
        page: reviewPage,
        limit: 10,
      });
      setReviews(result.data);
      setAverageRating(result.averageRating);
      setReviewCount(result.reviewCount);
      setTotalReviewPages(result.totalPages);
    } catch {
      setReviewError(t('shop.reviewLoadError'));
    } finally {
      setIsReviewsLoading(false);
    }
  }, [slug, reviewPage, t]);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    }
    return () => {
      clearSelectedProduct();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // GSAP animations when product loads
  useEffect(() => {
    if (!isLoading && selectedProduct) {
      if (infoRef.current) {
        slideUp(infoRef.current, { delay: 0.15 });
      }
      if (relatedContainerRef.current) {
        const cards = relatedContainerRef.current.querySelectorAll('[data-animate="true"]');
        if (cards.length > 0) {
          staggerIn({ targets: cards, stagger: 0.08, baseDelay: 0.3 });
        }
      }
      if (reviewsRef.current) {
        slideUp(reviewsRef.current, { delay: 0.3 });
      }
    }
  }, [isLoading, selectedProduct, slideUp, staggerIn]);

  useEffect(() => {
    if (slug) {
      fetchReviews();
    }
  }, [slug, fetchReviews]);

  useEffect(() => {
    if (reviews.length > 0 && user) {
      setHasReviewed(reviews.some((r) => r.userId === user.id));
    }
  }, [reviews, user]);

  useEffect(() => {
    if (reviewFormVisible && user && reviews.length > 0) {
      setHasReviewed(reviews.some((r) => r.userId === user.id));
    }
  }, [reviewFormVisible, user, reviews]);

  const handleSubmitReview = async () => {
    if (!slug || newRating === 0) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.createReview(slug, {
        rating: newRating,
        comment: newComment.trim() || undefined,
      });
      toast.success(t('shop.reviewPublished'));
      setNewRating(0);
      setNewComment('');
      setReviewFormVisible(false);
      setHasReviewed(true);
      fetchReviews();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('shop.reviewError');
      toast.error(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = useCallback(async () => {
    if (!selectedProduct || selectedProduct.stock < quantity) return;
    setIsAddingToCart(true);
    try {
      addItem({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
        imageUrl: selectedProduct.images[0]?.url,
      });
      setAddedToCart(true);
      openDrawer();
      setTimeout(() => setAddedToCart(false), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  }, [selectedProduct, quantity, addItem, openDrawer]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(
      1,
      Math.min(quantity + delta, selectedProduct?.stock || 1),
    );
    setQuantity(newQuantity);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonLines}>
              <div className={styles.skeletonLine1} />
              <div className={styles.skeletonLine2} />
              <div className={styles.skeletonLine3} />
              <div className={styles.skeletonLine4} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !selectedProduct) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={styles.errorTitle}>{t('shop.productNotFound')}</h2>
            <p className={styles.errorText}>{error || t('shop.productNotFoundDesc')}</p>
            <Link to="/products" className={styles.backButton}>
              {t('shop.backToCatalog')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = selectedProduct.price * quantity;
  const primaryImage =
    selectedProduct.images.find((img) => img.isPrimary) || selectedProduct.images[0];

  return (
    <>
      <SEO
        title={selectedProduct.name}
        description={selectedProduct.description.slice(0, 160)}
        image={primaryImage?.url}
        type="product"
        pathname={`/products/${selectedProduct.slug}`}
        jsonLd={buildProductJsonLd({
          name: selectedProduct.name,
          description: selectedProduct.description,
          image: primaryImage?.url,
          price: selectedProduct.price,
          sku: selectedProduct.id,
          availability: selectedProduct.stock > 0 ? 'InStock' : 'OutOfStock',
        })}
      />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* ─── Breadcrumb ───────────────────────────── */}
          <nav className={styles.breadcrumb}>
            <ol className={styles.breadcrumbList}>
              <li>
                <Link to="/" className={styles.breadcrumbLink}>{t('shop.home')}</Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/products" className={styles.breadcrumbLink}>{t('shop.productDetail')}</Link>
              </li>
              {selectedProduct.category && (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      to={`/products?category=${selectedProduct.category.slug}`}
                      className={styles.breadcrumbLink}
                    >
                      {selectedProduct.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li>/</li>
              <li className={styles.breadcrumbCurrent}>{selectedProduct.name}</li>
            </ol>
          </nav>

          {/* ─── Product Detail Layout ────────────────── */}
          <div className={styles.productGrid}>
            {/* Left: Gallery (scrolls) */}
            <div className={styles.galleryColumn}>
              <ImageGallery
                images={selectedProduct.images}
                productName={selectedProduct.name}
              />
            </div>

            {/* Right: Info (sticky) */}
            <div className={styles.infoColumn} ref={infoRef}>
              <div className={styles.infoSticky}>
                {/* Category */}
                {selectedProduct.category && (
                  <p className={styles.productCategory}>
                    {selectedProduct.category.name}
                  </p>
                )}

                {/* Title */}
                <h1 className={styles.productTitle}>{selectedProduct.name}</h1>

                {/* Price */}
                <p className={styles.productPrice}>{formatPrice(selectedProduct.price)}</p>
                <p className={styles.productTax}>{t('shop.taxInfo')}</p>

                {/* Description */}
                <p className={styles.productDescription}>
                  {selectedProduct.description}
                </p>

                {/* Stock */}
                <div className={styles.stockRow}>
                  <span
                    className={`${styles.stockBadge} ${
                      selectedProduct.stock > 0
                        ? styles.stockBadgeActive
                        : styles.stockBadgeOut
                    }`}
                  >
                    {selectedProduct.stock > 0
                      ? t('shop.inStock', { stock: selectedProduct.stock })
                      : t('shop.outOfStockLabel')}
                  </span>
                </div>

                {/* Quantity Selector */}
                {selectedProduct.stock > 0 && (
                  <div className={styles.quantitySection}>
                    <label className={styles.quantityLabel}>{t('shop.quantity')}</label>
                    <div className={styles.quantityRow}>
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className={styles.quantityButton}
                        aria-label={t('shop.decreaseQty')}
                        type="button"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className={styles.quantityValue}>{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= selectedProduct.stock}
                        className={styles.quantityButton}
                        aria-label={t('shop.increaseQty')}
                        type="button"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <span className={styles.totalText}>
                        {t('shop.total')}:{' '}
                        <span className={styles.totalAmount}>{formatPrice(totalPrice)}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Main "Add to Cart" Button (observed by StickyBar) */}
                <button
                  ref={mainAddBtnRef}
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock <= 0 || isAddingToCart}
                  className={`${styles.addToCartButton} ${
                    addedToCart
                      ? styles.addToCartSuccess
                      : selectedProduct.stock > 0
                        ? styles.addToCartAvailable
                        : styles.addToCartDisabled
                  }`}
                  id="main-add-to-cart"
                  type="button"
                >
                  {isAddingToCart ? (
                    <span className={styles.addingToCart}>
                      <svg className={styles.spinner} viewBox="0 0 24 24">
                        <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('shop.addingToCart')}
                    </span>
                  ) : addedToCart ? (
                    <span>
                      <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('shop.addedToCart')}
                    </span>
                  ) : (
                    t('shop.addToCart')
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Related Products ─────────────────────── */}
          <div ref={relatedContainerRef}>
            <RelatedProducts products={relatedProducts} />
          </div>

          {/* ─── Reviews Section ──────────────────────── */}
          <section className={styles.reviewsSection} ref={reviewsRef}>
            <div className={styles.reviewsHeader}>
              <div className={styles.reviewsTitleRow}>
                <h2 className={styles.reviewsTitle}>{t('shop.reviews')}</h2>
                {reviewCount > 0 && (
                  <div className={styles.reviewsSummary}>
                    <StarRating rating={averageRating} readOnly size="md" />
                    <span className={styles.reviewsAverage}>
                      {averageRating.toFixed(1)}
                    </span>
                    <span className={styles.reviewsCount}>
                      ({t('shop.reviewCount', { count: reviewCount })})
                    </span>
                  </div>
                )}
              </div>

              {isAuthenticated && !hasReviewed && (
                <button
                  onClick={() => setReviewFormVisible(!reviewFormVisible)}
                  className={styles.writeReviewButton}
                  type="button"
                >
                  <svg className={styles.writeReviewIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {reviewFormVisible ? t('shop.cancelReview') : t('shop.writeReview')}
                </button>
              )}
            </div>

            {/* Review Form */}
            {reviewFormVisible && (
              <div className={styles.reviewForm}>
                <h3 className={styles.reviewFormTitle}>{t('shop.yourOpinion')}</h3>
                <div className={styles.reviewFormRating}>
                  <label className={styles.reviewFormLabel}>{t('shop.rating')}</label>
                  <StarRating rating={newRating} onChange={setNewRating} size="lg" />
                  {newRating === 0 && (
                    <p className={styles.reviewFormHint}>{t('shop.selectRating')}</p>
                  )}
                </div>
                <div className={styles.reviewFormComment}>
                  <Textarea
                    label={t('shop.commentOptional')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('shop.commentPlaceholder')}
                    maxLength={500}
                    rows={4}
                  />
                  <p className={styles.reviewFormCharCount}>{newComment.length}/500</p>
                </div>
                <div className={styles.reviewFormActions}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReviewFormVisible(false);
                      setNewRating(0);
                      setNewComment('');
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitReview}
                    disabled={newRating === 0}
                    isLoading={isSubmittingReview}
                  >
                    {t('shop.publishReview')}
                  </Button>
                </div>
              </div>
            )}

            {/* Error State */}
            {reviewError && (
              <div className={styles.reviewError}>
                <p>{reviewError}</p>
                <button onClick={fetchReviews} className={styles.reviewRetryButton} type="button">
                  {t('shop.backToReviews')}
                </button>
              </div>
            )}

            {/* Loading State */}
            {isReviewsLoading && (
              <div className={styles.reviewsLoading}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={styles.reviewSkeleton}>
                    <div className={styles.reviewSkeletonHeader}>
                      <div className={styles.reviewSkeletonAvatar} />
                      <div className={styles.reviewSkeletonLines}>
                        <div className={styles.reviewSkeletonLine1} />
                        <div className={styles.reviewSkeletonLine2} />
                      </div>
                    </div>
                    <div className={styles.reviewSkeletonStars} />
                    <div className={styles.reviewSkeletonText} />
                  </div>
                ))}
              </div>
            )}

            {/* Review List */}
            {!isReviewsLoading && !reviewError && (
              <>
                {reviews.length === 0 ? (
                  <div className={styles.reviewsEmpty}>
                    <svg className={styles.reviewsEmptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className={styles.reviewsEmptyText}>
                      {isAuthenticated
                        ? t('shop.beFirstReview')
                        : t('shop.loginToReview')}
                    </p>
                  </div>
                ) : (
                  <>
                    <ReviewList reviews={reviews} />
                    {totalReviewPages > 1 && (
                      <div className={styles.reviewsPagination}>
                        <button
                          onClick={() => setReviewPage(reviewPage - 1)}
                          disabled={!hasPrevReviewPage}
                          className={styles.reviewsPageButton}
                          type="button"
                        >
                          <svg className={styles.reviewsPageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          {t('shop.previousReviews')}
                        </button>
                        <span className={styles.reviewsPageInfo}>
                          {t('shop.pageOf', { page: reviewPage, total: totalReviewPages })}
                        </span>
                        <button
                          onClick={() => setReviewPage(reviewPage + 1)}
                          disabled={!hasNextReviewPage}
                          className={styles.reviewsPageButton}
                          type="button"
                        >
                          {t('shop.nextReviews')}
                          <svg className={styles.reviewsPageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* ─── Sticky Add to Cart Bar ──────────────────── */}
      <StickyAddToCartBar
        productName={selectedProduct.name}
        price={selectedProduct.price}
        mainButtonSelector="#main-add-to-cart"
        onAddToCart={handleAddToCart}
        isLoading={isAddingToCart}
        isOutOfStock={selectedProduct.stock <= 0}
        productSlug={selectedProduct.slug}
      />
    </>
  );
}
