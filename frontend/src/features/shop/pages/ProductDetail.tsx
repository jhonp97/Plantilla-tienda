/**
 * ProductDetail - Product detail page with gallery, info, and add to cart
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import { useCartStore } from '../../../store/cartStore';
import type { Product } from '../../../types/product.types';
import styles from './ProductDetail.module.css';

// Image Gallery Component
interface ImageGalleryProps {
  images: Product['images'];
  productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className={`${styles.mainImage} ${styles.placeholderImage}`}>
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <>
      <div className={styles.galleryContainer}>
        {/* Main Image */}
        <div 
          className={styles.mainImage}
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={selectedImage.url}
            alt={`${productName} - imagen ${selectedIndex + 1}`}
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`${styles.thumbnail} ${index === selectedIndex ? styles.thumbnailActive : ''}`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className={styles.lightbox}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage.url}
            alt={productName}
            className={styles.lightboxImage}
          />
          {images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNavRight}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev + 1) % images.length);
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// Related Products Component
interface RelatedProductsProps {
  products: Product[];
}

function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className={styles.relatedSection}>
      <h2 className={styles.relatedTitle}>Productos Relacionados</h2>
      <div className={styles.relatedGrid}>
        {products.map((product) => {
          const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
          
          return (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className={styles.relatedCard}
            >
              <div className={styles.relatedCardImage}>
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={product.name}
                  />
                ) : (
                  <div className={styles.relatedPlaceholder}>
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.relatedCardContent}>
                <h3 className={styles.relatedCardName}>
                  {product.name}
                </h3>
                <p className={styles.relatedCardPrice}>
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Main ProductDetail Component
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { selectedProduct, relatedProducts, isLoading, error, fetchProductBySlug, clearSelectedProduct } = useProductStore();
  const { addItem } = useCartStore();
  
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    }
    
    return () => {
      clearSelectedProduct();
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedProduct || selectedProduct.stock < quantity) return;

    setIsAddingToCart(true);
    
    try {
      addItem({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        imageUrl: selectedProduct.images[0]?.url,
      });
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, selectedProduct?.stock || 1));
    setQuantity(newQuantity);
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.container}>
          <div className={`${styles.skeleton} ${styles.skeletonGrid}`}>
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

  if (error || !selectedProduct) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className={styles.errorTitle}>Producto no encontrado</h2>
          <p className={styles.errorText}>{error || 'El producto que buscas no existe'}</p>
          <Link to="/products" className={styles.backButton}>
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = selectedProduct.price * quantity;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <ol className={styles.breadcrumbList}>
            <li>
              <Link to="/" className={styles.breadcrumbLink}>Inicio</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/products" className={styles.breadcrumbLink}>Productos</Link>
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

        {/* Product Detail */}
        <div className={styles.productGrid}>
          {/* Image Gallery */}
          <div>
            <ImageGallery images={selectedProduct.images} productName={selectedProduct.name} />
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div>
              {selectedProduct.category && (
                <p className={styles.productCategory}>
                  {selectedProduct.category.name}
                </p>
              )}
              <h1 className={styles.productTitle}>
                {selectedProduct.name}
              </h1>
            </div>

            <div>
              <p className={styles.productPrice}>
                ${selectedProduct.price.toFixed(2)}
              </p>
              <p className={styles.productTax}>
                Impuestos incluidos
              </p>
            </div>

            <div>
              <p className={styles.productDescription}>
                {selectedProduct.description}
              </p>
            </div>

            {/* Stock */}
            <div className={styles.stockRow}>
              <span className={`${styles.stockBadge} ${selectedProduct.stock > 0 ? styles.stockBadgeActive : styles.stockBadgeOut}`}>
                {selectedProduct.stock > 0 
                  ? `${selectedProduct.stock} unidades disponibles` 
                  : 'Agotado'
                }
              </span>
            </div>

            {/* Quantity Selector */}
            {selectedProduct.stock > 0 && (
              <div className={styles.quantitySection}>
                <label className={styles.quantityLabel}>
                  Cantidad
                </label>
                <div className={styles.quantityRow}>
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className={styles.quantityButton}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= selectedProduct.stock}
                    className={styles.quantityButton}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <span className={styles.totalText}>
                    Total: <span className={styles.totalAmount}>${totalPrice.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={selectedProduct.stock <= 0 || isAddingToCart}
              className={`${styles.addToCartButton} ${
                addedToCart
                  ? styles.addToCartSuccess
                  : selectedProduct.stock > 0
                    ? styles.addToCartAvailable
                    : styles.addToCartDisabled
              }`}
            >
              {isAddingToCart ? (
                <span className={styles.addingToCart}>
                  <svg className={styles.spinner} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Agregando...
                </span>
              ) : addedToCart ? (
                <span>
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Agregado al carrito
                </span>
              ) : (
                'Agregar al carrito'
              )}
            </button>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}