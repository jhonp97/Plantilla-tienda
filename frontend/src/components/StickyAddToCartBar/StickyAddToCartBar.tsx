/**
 * StickyAddToCartBar — Fixed bottom bar that appears when the main
 * "Add to Cart" button scrolls out of viewport.
 *
 * Uses IntersectionObserver to detect the main button's visibility.
 */

import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '@utils/formatPrice';
import styles from './StickyAddToCartBar.module.css';

export interface StickyAddToCartBarProps {
  /** Product name to display (truncated) */
  productName: string;
  /** Product price in cents */
  price: number;
  /** Main "Add to Cart" button selector for IntersectionObserver */
  mainButtonSelector: string;
  /** Called when "Add to Cart" is clicked */
  onAddToCart: () => void;
  /** Whether the add action is loading */
  isLoading?: boolean;
  /** Whether the product is out of stock */
  isOutOfStock?: boolean;
  /** Product slug for aria-label */
  productSlug: string;
}

export function StickyAddToCartBar({
  productName,
  price,
  mainButtonSelector,
  onAddToCart,
  isLoading = false,
  isOutOfStock = false,
  productSlug,
}: StickyAddToCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainButton = document.querySelector(mainButtonSelector);
    if (!mainButton) {
      // If no main button, always show the bar
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when main button is NOT intersecting (scrolled out)
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 80px 0px', // Trigger slightly before it fully leaves
      },
    );

    observer.observe(mainButton);

    return () => observer.disconnect();
  }, [mainButtonSelector]);

  return (
    <div
      ref={barRef}
      className={`${styles.bar} ${isVisible ? styles.barVisible : ''}`}
      role="region"
      aria-label={`Comprar ${productName}`}
      aria-live="polite"
    >
      <div className={styles.container}>
        <div className={styles.info}>
          <p className={styles.name}>{productName}</p>
          <p className={styles.price}>{formatPrice(price)}</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.addBtn}
            onClick={onAddToCart}
            disabled={isLoading || isOutOfStock}
            aria-label={`Añadir ${productName} al carrito`}
            type="button"
          >
            {isLoading ? 'Agregando...' : isOutOfStock ? 'Agotado' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StickyAddToCartBar;
