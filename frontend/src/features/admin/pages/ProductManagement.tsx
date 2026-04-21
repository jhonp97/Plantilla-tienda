/**
 * ProductManagement - Admin product list with CRUD actions
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import type { Product } from '../../../types/product.types';
import { ConfirmModal } from '../components/shared';
import styles from './ProductManagement.module.css';

// Product Row Component
interface ProductRowProps {
  product: Product;
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
}

function ProductRow({ product, onEdit, onDeactivate }: ProductRowProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>
        <div className={styles.productImage}>
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.name}
              className={styles.productImageImg}
            />
          ) : (
            <div className={styles.productImagePlaceholder}>
              <svg className={styles.productImagePlaceholderIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.productInfo}>
          <p className={styles.productName}>{product.name}</p>
          {product.category && (
            <p className={styles.productCategory}>{product.category.name}</p>
          )}
        </div>
      </td>
      <td className={styles.tableCell}>
        <span className={styles.price}>${product.price.toFixed(2)}</span>
      </td>
      <td className={styles.tableCell}>
        <span className={`${styles.statusBadge} ${
          product.isActive
            ? styles.statusActive
            : styles.statusInactive
        }`}>
          {product.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className={styles.tableCell}>
        <span className={product.stock === 0 ? styles.stockLow : styles.stockNormal}>
          {product.stock}
        </span>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.actionsCell}>
          <button
            onClick={() => onEdit(product.id)}
            className={styles.actionButton}
            title="Editar"
          >
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDeactivate(product.id)}
            className={styles.actionButtonDanger}
            title={product.isActive ? 'Desactivar' : 'Activar'}
          >
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// Main ProductManagement Component
export default function ProductManagement() {
  const navigate = useNavigate();
  const {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
    deactivateProduct,
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    productId: string | null;
  }>({ isOpen: false, productId: null });
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory ||
      product.category?.id === filterCategory;
    const matchesActive = !filterActive ||
      (filterActive === 'active' && product.isActive) ||
      (filterActive === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesActive;
  });

  const handleEdit = (id: string) => {
    navigate(`/dashboard/products/${id}/edit`);
  };

  const handleDeactivateClick = (id: string) => {
    setDeactivateModal({ isOpen: true, productId: id });
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateModal.productId) return;

    setDeletingIds((prev) => new Set(prev).add(deactivateModal.productId!));

    try {
      await deactivateProduct(deactivateModal.productId);
      setDeactivateModal({ isOpen: false, productId: null });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(deactivateModal.productId!);
        return next;
      });
    }
  };

  const handleDeactivateCancel = () => {
    setDeactivateModal({ isOpen: false, productId: null });
  };

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorAlert}>
          <p>Error: {error}</p>
          <button
            onClick={() => fetchProducts()}
            className={styles.errorRetryLink}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gestión de Productos</h1>
          <p className={styles.pageSubtitle}>Administra el catálogo de productos</p>
        </div>
        <Link
          to="/dashboard/products/new"
          className={styles.primaryButton}
        >
          <svg className={styles.primaryButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersRow}>
          <div className={styles.filterInputContainer}>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>
                  Imagen
                </th>
                <th className={styles.tableHeaderCell}>
                  Producto
                </th>
                <th className={styles.tableHeaderCell}>
                  Precio
                </th>
                <th className={styles.tableHeaderCell}>
                  Estado
                </th>
                <th className={styles.tableHeaderCell}>
                  Stock
                </th>
                <th className={styles.tableHeaderCell}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={`${styles.skeletonRow} ${styles.skeletonCell}`} />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.skeletonRow} ${styles.skeletonCell}`} />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.skeletonRow} ${styles.skeletonCell}`} />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.skeletonRow} ${styles.skeletonCell}`} />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.skeletonRow} ${styles.skeletonCell}`} />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.skeletonRow} ${styles.skeletonCell}`} />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDeactivate={handleDeactivateClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={deactivateModal.isOpen}
        title="Desactivar Producto"
        message="¿Estás seguro de que deseas desactivar este producto? Los clientes ya no podrán verlo en la tienda."
        onConfirm={handleDeactivateConfirm}
        onCancel={handleDeactivateCancel}
        isLoading={deletingIds.size > 0}
      />
    </div>
  );
}