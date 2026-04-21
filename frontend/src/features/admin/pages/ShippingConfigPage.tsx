/**
 * ShippingConfigPage - Configure shipping options and rates
 */
import { useState } from 'react';
import type { ShippingOption } from '../../../types/shipping.types';
import { PageHeader } from '../components/shared';
import { ConfirmModal } from '../components/shared';
import { FormInput } from '../components/shared';
import styles from './ShippingConfigPage.module.css';

interface ShippingFormData {
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
  isActive: boolean;
}

// Mock existing shipping options
const MOCK_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: '1',
    name: 'Envío Estándar',
    description: 'Entrega en 5-7 días hábiles',
    price: 500,
    estimatedDays: 7,
    carrier: 'Correo Argentino',
    isActive: true,
  },
  {
    id: '2',
    name: 'Envío Express',
    description: 'Entrega en 24-48 horas',
    price: 1200,
    estimatedDays: 2,
    carrier: 'FedEx',
    isActive: true,
  },
  {
    id: '3',
    name: 'Retiro en Tienda',
    description: 'Retira tu pedido en nuestra tienda',
    price: 0,
    estimatedDays: 0,
    carrier: 'Retiro en persona',
    isActive: true,
  },
];

export default function ShippingConfigPage() {
  const [options, setOptions] = useState<ShippingOption[]>(MOCK_SHIPPING_OPTIONS);
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ShippingOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShippingFormData>({
    name: '',
    description: '',
    price: 0,
    estimatedDays: 0,
    carrier: '',
    isActive: true,
  });

  const handleOpenModal = (option?: ShippingOption) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        name: option.name,
        description: option.description,
        price: option.price,
        estimatedDays: option.estimatedDays,
        carrier: option.carrier || '',
        isActive: option.isActive,
      });
    } else {
      setEditingOption(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        estimatedDays: 0,
        carrier: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingOption) {
      // Update existing option
      setOptions(options.map(o => 
        o.id === editingOption.id
          ? { ...o, ...formData, carrier: formData.carrier || undefined }
          : o
      ));
    } else {
      // Create new option
      const newOption: ShippingOption = {
        id: Date.now().toString(),
        ...formData,
        carrier: formData.carrier || undefined,
      };
      setOptions([...options, newOption]);
    }

    setIsSaving(false);
    setShowModal(false);
  };

  const handleToggleActive = async (optionId: string) => {
    setOptions(options.map(o =>
      o.id === optionId ? { ...o, isActive: !o.isActive } : o
    ));
  };

  const handleDelete = (optionId: string) => {
    setDeletingId(optionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      setOptions(options.filter(o => o.id !== deletingId));
    }
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };

  const addButton = (
    <button
      onClick={() => handleOpenModal()}
      className={styles.addButton}
    >
      <svg className={styles.addButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Nueva Opción
    </button>
  );

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <PageHeader
        title="Configuración de Envío"
        subtitle="Administra las opciones de envío disponibles"
        actions={addButton}
      />

      {/* Shipping Options List */}
      <div className={styles.optionsGrid}>
        {options.map((option) => (
          <div
            key={option.id}
            className={`${styles.optionCard} ${
              option.isActive ? styles.optionCardActive : styles.optionCardInactive
            }`}
          >
            <div className={styles.optionCardHeader}>
              <div>
                <h3 className={styles.optionCardTitle}>{option.name}</h3>
                <p className={styles.optionCardDescription}>{option.description}</p>
              </div>
              <button
                onClick={() => handleOpenModal(option)}
                className={styles.editButton}
              >
                <svg className={styles.editButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <div className={styles.optionDetails}>
              <div className={styles.optionDetailRow}>
                <span className={styles.optionDetailLabel}>Precio</span>
                <span className={styles.optionDetailValue}>
                  {option.price === 0 ? 'Gratis' : `$${option.price.toLocaleString('es-AR')}`}
                </span>
              </div>
              <div className={styles.optionDetailRow}>
                <span className={styles.optionDetailLabel}>Tiempo de entrega</span>
                <span className={styles.optionDetailValue}>
                  {option.estimatedDays === 0 ? 'Inmediato' : `${option.estimatedDays} días`}
                </span>
              </div>
              {option.carrier && (
                <div className={styles.optionDetailRow}>
                  <span className={styles.optionDetailLabel}>Transportista</span>
                  <span className={styles.optionDetailValue}>{option.carrier}</span>
                </div>
              )}
            </div>

            <div className={styles.optionActions}>
              <button
                onClick={() => handleToggleActive(option.id)}
                className={`${styles.toggleButton} ${
                  option.isActive
                    ? styles.toggleButtonActive
                    : styles.toggleButtonInactive
                }`}
              >
                {option.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => handleDelete(option.id)}
                className={styles.deleteButton}
              >
                <svg className={styles.deleteButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => handleOpenModal()}
          className={styles.addNewCard}
        >
          <svg className={styles.addNewIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className={styles.addNewText}>Agregar opción de envío</span>
        </button>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingOption ? 'Editar Opción de Envío' : 'Nueva Opción de Envío'}
              </h3>
            </div>

            <div className={styles.modalBody}>
              <FormInput
                id="name"
                label="Nombre"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Envío Express"
              />

              <FormInput
                id="description"
                label="Descripción"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Entrega en 24-48 horas"
              />

              <div className={styles.formRow}>
                <FormInput
                  id="price"
                  label="Precio ($)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  min={0}
                />
                <FormInput
                  id="estimatedDays"
                  label="Días de entrega"
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <FormInput
                id="carrier"
                label="Transportista"
                type="text"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                placeholder="Ej: Correo Argentino"
              />

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className={styles.checkbox}
                />
                <label htmlFor="isActive" className={styles.checkboxLabel}>
                  Opción activa
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name}
                className={styles.saveButton}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Opción de Envío"
        message="¿Estás seguro de eliminar esta opción de envío?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </div>
  );
}
