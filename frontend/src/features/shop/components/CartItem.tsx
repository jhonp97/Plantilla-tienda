/**
 * CartItem - Individual cart item component with quantity controls
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore, type CartItem as CartItemType } from '../../../store/cartStore';
import styles from './CartItem.module.css';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { addItem, removeItem } = useCartStore();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    // Update the cart with new quantity
    useCartStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === item.id ? { ...i, quantity: newQuantity } : i
      ),
    }));
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeItem(item.productId);
    }, 300);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div
      className={`${styles.cartItem} ${
        isRemoving ? styles.cartItemRemoving : styles.cartItemVisible
      }`}
    >
      <div className={styles.cartItemContent}>
        {/* Product Image */}
        <Link
          to={`/products/${item.productId}`}
          className={styles.productImageLink}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.productImagePlaceholder}>
              <svg className={styles.iconXl} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className={styles.productDetails}>
          <div className={styles.productHeader}>
            <div className={styles.productInfo}>
              <Link
                to={`/products/${item.productId}`}
                className={styles.productName}
              >
                {item.name}
              </Link>
              <p className={styles.productPrice}>
                ${item.price.toFixed(2)} cada uno
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className={styles.removeButton}
              aria-label="Eliminar del carrito"
            >
              <svg
                className={styles.iconSm}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className={styles.productFooter}>
            {/* Quantity Stepper */}
            <div className={styles.quantityControls}>
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className={styles.quantityButton}
                aria-label="Disminuir cantidad"
              >
                <svg className={styles.iconXs} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className={styles.quantityValue}>
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className={styles.quantityButton}
                aria-label="Aumentar cantidad"
              >
                <svg className={styles.iconXs} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Item Total */}
            <div className={styles.itemTotal}>
              <p className={styles.itemTotalValue}>
                ${itemTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}