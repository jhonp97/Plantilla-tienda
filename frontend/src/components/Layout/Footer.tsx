import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

/**
 * Footer - Site footer with links and copyright
 * @component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>MiTienda</h3>
            <p className={styles.columnText}>
              Tu tienda online de confianza con los mejores productos.
            </p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Comprar</h3>
            <Link to="/products" className={styles.link}>Productos</Link>
            <Link to="/cart" className={styles.link}>Carrito</Link>
            <Link to="/orders" className={styles.link}>Mis Pedidos</Link>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Ayuda</h3>
            <Link to="/faq" className={styles.link}>Preguntas Frecuentes</Link>
            <Link to="/shipping" className={styles.link}>Envíos</Link>
            <Link to="/returns" className={styles.link}>Devoluciones</Link>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Legal</h3>
            <Link to="/terms" className={styles.link}>Términos y Condiciones</Link>
            <Link to="/privacy" className={styles.link}>Política de Privacidad</Link>
            <Link to="/cookies" className={styles.link}>Política de Cookies</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} MiTienda. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}