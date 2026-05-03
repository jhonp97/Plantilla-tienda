/**
 * CouponManagement - Admin coupon CRUD page
 * Lists coupons, allows create/edit/toggle active/inactive
 */
import { useEffect, useState, useCallback } from 'react';
import { z } from 'zod';
import { couponService, type Coupon, type CreateCouponInput, type UpdateCouponInput } from '@services/coupon.service';
import { useToastStore } from '@store/toastStore';
import { usePagination } from '@hooks/usePagination';
import { useForm } from '@hooks/useForm';
import { Input } from '@components/Input';
import { Select } from '@components/Select';
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import styles from './CouponManagement.module.css';

// Coupon form schema
const couponSchema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').max(20, 'Máximo 20 caracteres').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(1, 'El valor debe ser mayor a 0'),
  minOrderAmount: z.number().min(0).nullable().optional(),
  usageLimit: z.number().min(1, 'Debe ser al menos 1').nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Porcentaje (%)' },
  { value: 'FIXED', label: 'Monto Fijo (€)' },
];

// === Coupon Row Component ===
interface CouponRowProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onToggleActive: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

function CouponRow({ coupon, onEdit, onToggleActive, onDelete }: CouponRowProps) {
  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
  const usageLimitReached = coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit;
  const isAvailable = coupon.isActive && !isExpired && !usageLimitReached;

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>
        <span className={styles.couponCode}>{coupon.code}</span>
      </td>
      <td className={styles.tableCell}>
        {coupon.discountType === 'PERCENTAGE'
          ? `${coupon.discountValue}%`
          : `${coupon.discountValue} €`}
      </td>
      <td className={styles.tableCell}>
        {coupon.minOrderAmount
          ? `${coupon.minOrderAmount / 100} €`
          : '—'}
      </td>
      <td className={styles.tableCell}>
        <span className={styles.usageText}>
          {coupon.usageCount}
          {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ''}
        </span>
      </td>
      <td className={styles.tableCell}>
        {coupon.expiresAt ? (
          <span className={isExpired ? styles.expiredText : styles.validText}>
            {new Date(coupon.expiresAt).toLocaleDateString()}
          </span>
        ) : (
          <span className={styles.noExpiry}>Sin expiración</span>
        )}
      </td>
      <td className={styles.tableCell}>
        <div className={styles.statusContainer}>
          <span className={`${styles.statusDot} ${isAvailable ? styles.statusActive : styles.statusInactive}`} />
          <span className={isAvailable ? styles.statusActiveText : styles.statusInactiveText}>
            {isAvailable ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.actionsCell}>
          <button
            onClick={() => onEdit(coupon)}
            className={styles.actionButton}
            title="Editar"
          >
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onToggleActive(coupon)}
            className={`${styles.actionButton} ${coupon.isActive ? styles.actionWarning : styles.actionSuccess}`}
            title={coupon.isActive ? 'Desactivar' : 'Activar'}
          >
            {coupon.isActive ? (
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onDelete(coupon.id)}
            className={styles.actionButtonDanger}
            title="Eliminar"
          >
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// === Main Component ===
export default function CouponManagement() {
  const toast = useToastStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination({ totalItems, pageSize: 10 });

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await couponService.getAll({ page: currentPage, limit: 10 });
      setCoupons(result.data);
      setTotalItems(result.total);
    } catch (err) {
      toast.error('Error al cargar cupones');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Filter coupons by search term
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === Modal handlers ===
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSave = async (values: CouponFormValues) => {
    setIsSaving(true);
    try {
      const data: CreateCouponInput = {
        code: values.code,
        discountType: values.discountType,
        discountValue: values.discountValue,
        minOrderAmount: values.minOrderAmount ?? null,
        usageLimit: values.usageLimit ?? null,
        expiresAt: values.expiresAt || null,
      };

      if (editingCoupon) {
        const updateData: UpdateCouponInput = { ...data };
        await couponService.update(editingCoupon.id, updateData);
        toast.success('Cupón actualizado correctamente');
      } else {
        await couponService.create(data);
        toast.success('Cupón creado correctamente');
      }

      handleCloseModal();
      fetchCoupons();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar cupón';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await couponService.update(coupon.id, { isActive: !coupon.isActive });
      toast.success(
        coupon.isActive
          ? `Cupón ${coupon.code} desactivado`
          : `Cupón ${coupon.code} activado`
      );
      fetchCoupons();
    } catch (err) {
      toast.error('Error al cambiar estado del cupón');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      await couponService.delete(id);
      toast.success('Cupón eliminado');
      fetchCoupons();
    } catch (err) {
      toast.error('Error al eliminar cupón');
    }
  };

  // Format initial values for form
  const initialFormValues: CouponFormValues = editingCoupon
    ? {
        code: editingCoupon.code,
        discountType: editingCoupon.discountType,
        discountValue: editingCoupon.discountValue,
        minOrderAmount: editingCoupon.minOrderAmount ?? null,
        usageLimit: editingCoupon.usageLimit ?? null,
        expiresAt: editingCoupon.expiresAt
          ? editingCoupon.expiresAt.split('T')[0]
          : null,
      }
    : {
        code: '',
        discountType: 'PERCENTAGE' as const,
        discountValue: 0,
        minOrderAmount: null,
        usageLimit: null,
        expiresAt: null,
      };

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gestión de Cupones</h1>
          <p className={styles.pageSubtitle}>
            Administra los cupones de descuento de la tienda
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className={styles.createButton}
        >
          <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cupón
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchInputContainer}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Código</th>
                <th className={styles.tableHeaderCell}>Descuento</th>
                <th className={styles.tableHeaderCell}>Mínimo</th>
                <th className={styles.tableHeaderCell}>Usos</th>
                <th className={styles.tableHeaderCell}>Expira</th>
                <th className={styles.tableHeaderCell}>Estado</th>
                <th className={styles.tableHeaderCell}>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={styles.tableRow}>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                    <td className={styles.tableCell}><div className={styles.skeleton} /></td>
                  </tr>
                ))
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    {searchTerm
                      ? 'No se encontraron cupones con ese código'
                      : 'No hay cupones creados. ¡Crea el primero!'}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={handleOpenEdit}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={prevPage}
            disabled={!hasPrev}
            className={styles.paginationButton}
          >
            <svg className={styles.paginationIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          <div className={styles.paginationInfo}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`${styles.paginationPage} ${
                  page === currentPage ? styles.paginationPageActive : ''
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={nextPage}
            disabled={!hasNext}
            className={styles.paginationButton}
          >
            Siguiente
            <svg className={styles.paginationIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
      >
        <CouponForm
          initialValues={initialFormValues}
          onSubmit={handleSave}
          onCancel={handleCloseModal}
          isSaving={isSaving}
          isEditing={!!editingCoupon}
        />
      </Modal>
    </div>
  );
}

// === Coupon Form Component (inside modal) ===
interface CouponFormProps {
  initialValues: CouponFormValues;
  onSubmit: (values: CouponFormValues) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

function CouponForm({ initialValues, onSubmit, onCancel, isSaving, isEditing }: CouponFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<CouponFormValues>({
    initialValues,
    schema: couponSchema,
    onSubmit,
  });

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <Input
            label="Código"
            value={values.code}
            onChange={(e) => handleChange('code', e.target.value)}
            onBlur={() => handleBlur('code')}
            placeholder="Ej: DESCUENTO10"
            error={touched.code ? errors.code : undefined}
            required
            disabled={isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <Select
            label="Tipo de Descuento"
            value={values.discountType}
            onChange={(e) => handleChange('discountType', e.target.value as 'PERCENTAGE' | 'FIXED')}
            onBlur={() => handleBlur('discountType')}
            options={DISCOUNT_TYPE_OPTIONS}
            error={touched.discountType ? errors.discountType : undefined}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label={values.discountType === 'PERCENTAGE' ? 'Valor (%)' : 'Valor (€)'}
            type="number"
            value={values.discountValue === 0 ? '' : String(values.discountValue)}
            onChange={(e) => handleChange('discountValue', Number(e.target.value))}
            onBlur={() => handleBlur('discountValue')}
            placeholder={values.discountType === 'PERCENTAGE' ? 'Ej: 10' : 'Ej: 5'}
            error={touched.discountValue ? errors.discountValue : undefined}
            required
            min={1}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Pedido Mínimo (€)"
            type="number"
            value={values.minOrderAmount ?? ''}
            onChange={(e) => handleChange('minOrderAmount', e.target.value ? Number(e.target.value) : null)}
            onBlur={() => handleBlur('minOrderAmount')}
            placeholder="Opcional"
            error={touched.minOrderAmount ? errors.minOrderAmount : undefined}
            min={0}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Límite de Usos"
            type="number"
            value={values.usageLimit ?? ''}
            onChange={(e) => handleChange('usageLimit', e.target.value ? Number(e.target.value) : null)}
            onBlur={() => handleBlur('usageLimit')}
            placeholder="Opcional"
            error={touched.usageLimit ? errors.usageLimit : undefined}
            min={1}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Fecha de Expiración"
            type="date"
            value={values.expiresAt ?? ''}
            onChange={(e) => handleChange('expiresAt', e.target.value || null)}
            onBlur={() => handleBlur('expiresAt')}
            error={touched.expiresAt ? errors.expiresAt : undefined}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" isLoading={isSaving}>
          {isEditing ? 'Guardar Cambios' : 'Crear Cupón'}
        </Button>
      </div>
    </form>
  );
}
