/**
 * CheckoutSuccessPage - Order confirmation after successful payment
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../../store/checkoutStore';
import styles from './CheckoutSuccessPage.module.css';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { order, reset } = useCheckoutStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Reset checkout state on mount
    return () => {
      reset();
    };
  }, [reset]);

  // Generate a random order number for display
  const orderNumber = order?.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.successCard}>
          {/* Success Icon */}
          <div className={styles.successIconContainer}>
            <div className={styles.successIconWrapper}>
              <svg
                className={styles.successIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className={styles.successTitle}>
            ¡Pedido Confirmado!
          </h1>
          <p className={styles.successText}>
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </p>
          <p className={styles.successTextSecondary}>
            Número de pedido: <span className={styles.orderNumber}>{orderNumber}</span>
          </p>

          {/* Email Notice */}
          <div className={styles.emailNotice}>
            <div className={styles.emailNoticeContent}>
              <svg className={styles.emailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className={styles.emailNoticeText}>
                <p className={styles.emailNoticeTitle}>
                  Revisa tu correo electrónico
                </p>
                <p className={styles.emailNoticeText}>
                  Te hemos enviado un correo de confirmación con los detalles de tu pedido.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <p className={styles.orderSummaryText}>
              ¿Tienes preguntas sobre tu pedido?
            </p>
            <div className={styles.actionButtons}>
              <Link
                to="/orders"
                className={styles.primaryButton}
              >
                Ver Mis Pedidos
              </Link>
              <Link
                to="/products"
                className={styles.secondaryButton}
              >
                Seguir Comprando
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className={styles.supportInfo}>
            <p>
              ¿Necesitas ayuda?{' '}
              <a href="mailto:soporte@tienda.com" className={styles.supportLink}>
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}