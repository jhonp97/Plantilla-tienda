/**
 * CategoryManagement — Premium admin CRUD for categories.
 */
import { useEffect, useState } from 'react';
import { useProductStore } from '../../../store/productStore';
import { z } from 'zod';
import type { Category } from '../../../types/product.types';
import styles from './CategoryManagement.module.css';

interface CategoryModalProps {
  isOpen: boolean;
  category?: Category;
  onSave: (data: { name: string; description?: string }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

function CategoryModal({ isOpen, category, onSave, onClose, isLoading }: CategoryModalProps) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: category?.name || '', description: category?.description || '' });
      setErrors({});
    }
  }, [isOpen, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schema = z.object({
      name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      description: z.string().optional(),
    });
    try {
      const data = schema.parse(formData);
      setErrors({});
      onSave(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { name?: string; description?: string } = {};
        (err as unknown as { issues: Array<{ path: Array<string>; message: string }> }).issues.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as 'name' | 'description'] = e.message;
        });
        setErrors(newErrors);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{category ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="modal-name" className={styles.formLabel}>Nombre *</label>
            <input
              type="text" id="modal-name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
              placeholder="Nombre de la categoría"
            />
            {errors.name && <p className={styles.formError}>{errors.name}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="modal-description" className={styles.formLabel}>Descripción</label>
            <textarea
              id="modal-description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3} className={styles.formTextarea} placeholder="Descripción opcional"
            />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}><h3 className={styles.modalTitle}>{title}</h3></div>
        <div className={styles.modalBody}>
          <p className={styles.modalBodyText}>{message}</p>
          <div className={styles.modalFooter}>
            <button onClick={onCancel} disabled={isLoading} className={styles.cancelButton}>Cancelar</button>
            <button onClick={onConfirm} disabled={isLoading} className={styles.deleteButton}>{isLoading ? 'Eliminando...' : 'Eliminar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>
        <div className={styles.categoryInfo}>
          <div className={styles.categoryIconContainer}>
            <svg className={styles.categoryIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p className={styles.categoryName}>{category.name}</p>
            <p className={styles.categorySlug}>{category.slug}</p>
          </div>
        </div>
      </td>
      <td className={styles.tableCell}>
        <p className={styles.categoryDescription}>{category.description || 'Sin descripción'}</p>
      </td>
      <td className={styles.tableCell}>
        <span className={styles.productCountBadge}>{category.productCount || 0} productos</span>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.actionsCell}>
          <button onClick={() => onEdit(category)} className={styles.actionButton} title="Editar">
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => onDelete(category.id)} className={styles.actionButtonDanger} title="Eliminar">
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryManagement() {
  const { categories, isLoading, error, fetchCategories, createCategory, updateCategory, deleteCategory } = useProductStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: string | null }>({ isOpen: false, categoryId: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const handleCreateClick = () => { setEditingCategory(undefined); setIsModalOpen(true); };
  const handleEditClick = (category: Category) => { setEditingCategory(category); setIsModalOpen(true); };
  const handleDeleteClick = (id: string) => { setDeleteModal({ isOpen: true, categoryId: id }); };

  const handleSave = async (data: { name: string; description?: string }) => {
    setIsSaving(true);
    try {
      if (editingCategory) await updateCategory(editingCategory.id, data);
      else await createCategory(data);
      setIsModalOpen(false);
      setEditingCategory(undefined);
    } finally { setIsSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.categoryId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteModal.categoryId);
      setDeleteModal({ isOpen: false, categoryId: null });
    } finally { setIsDeleting(false); }
  };

  const handleDeleteCancel = () => setDeleteModal({ isOpen: false, categoryId: null });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Gestión de Categorías</h1>
          <p className={styles.pageSubtitle}>Administra las categorías del catálogo</p>
        </div>
        <button onClick={handleCreateClick} className={styles.primaryButton}>
          <svg className={styles.primaryButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Categoría</th>
                <th className={styles.tableHeaderCell}>Descripción</th>
                <th className={styles.tableHeaderCell}>Productos</th>
                <th className={styles.tableHeaderCell}>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className={styles.tableRow}>
                    {[...Array(4)].map((_, j) => <td key={j} className={styles.tableCell}><div className={styles.skeletonRow} /></td>)}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    <div className={styles.emptyRow}>
                      <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className={styles.emptyText}>No hay categorías creadas</p>
                      <button onClick={handleCreateClick} className={styles.emptyLink}>Crear primera categoría</button>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <CategoryRow key={category.id} category={category} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal isOpen={isModalOpen} category={editingCategory} onSave={handleSave} onClose={() => { setIsModalOpen(false); setEditingCategory(undefined); }} isLoading={isSaving} />
      <ConfirmModal isOpen={deleteModal.isOpen} title="Eliminar Categoría" message="¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados ya no tendrán categoría." onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isLoading={isDeleting} />
    </div>
  );
}
