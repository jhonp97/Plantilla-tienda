/**
 * ProductEdit - Admin page for editing existing products
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import { z } from 'zod';
import type { Category } from '../../../types/product.types';
import styles from './ProductEdit.module.css';

// Validation schema (same as create)
const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  taxRate: z.number().min(0).max(100, 'El impuesto debe estar entre 0 y 100'),
  isActive: z.boolean(),
  categoryId: z.string().optional(),
});

// Image Preview Component
interface ExistingImageProps {
  id: string;
  url: string;
  isPrimary: boolean;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

function ExistingImage({ id, url, isPrimary, onDelete, onSetPrimary }: ExistingImageProps) {
  return (
    <div className={styles.existingImageItem}>
      <img
        src={url}
        alt="Imagen del producto"
        className={styles.existingImage}
      />
      {isPrimary && (
        <span className={styles.existingImagePrimary}>Principal</span>
      )}
      <div className={styles.existingImageOverlay}>
        {!isPrimary && (
          <button
            type="button"
            onClick={() => onSetPrimary(id)}
            className={styles.existingImageButton}
            title="Establecer como principal"
          >
            <svg className={styles.existingImageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(id)}
          className={styles.existingImageButtonDanger}
          title="Eliminar"
        >
          <svg className={styles.existingImageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Image Upload Component
interface ImageUploadProps {
  existingImages: Array<{ id: string; url: string; isPrimary: boolean }>;
  newImages: File[];
  newPreviews: string[];
  onExistingDelete: (id: string) => void;
  onExistingSetPrimary: (id: string) => void;
  onNewImagesChange: (images: File[], previews: string[]) => void;
}

function ImageUpload({
  existingImages,
  newImages,
  newPreviews,
  onExistingDelete,
  onExistingSetPrimary,
  onNewImagesChange,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newImgs = Array.from(files).filter((file) => 
      file.type.startsWith('image/')
    );
    
    const newPrevs = newImgs.map((file) => URL.createObjectURL(file));
    
    onNewImagesChange([...newImages, ...newImgs], [...newPreviews, ...newPrevs]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveNew = (index: number) => {
    const newImgs = newImages.filter((_, i) => i !== index);
    const newPrevs = newPreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(newPreviews[index]);
    
    onNewImagesChange(newImgs, newPrevs);
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className={styles.imageUploadSection}>
      <label className={styles.imageUploadLabel}>
        Imágenes del producto
      </label>
      
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className={styles.existingImages}>
          {existingImages.map((img) => (
            <ExistingImage
              key={img.id}
              id={img.id}
              url={img.url}
              isPrimary={img.isPrimary}
              onDelete={onExistingDelete}
              onSetPrimary={onExistingSetPrimary}
            />
          ))}
        </div>
      )}

      {/* New Images Dropzone */}
      <div
        className={`${styles.imageDropzone} ${isDragging ? styles.imageDropzoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        {totalImages === 0 ? (
          <div className={styles.imageDropzoneContent}>
            <svg className={styles.imageDropzoneIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={styles.imageDropzoneText}>
              Arrastra imágenes aquí o{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.imageDropzoneLink}
              >
                selecciona archivos
              </button>
            </p>
          </div>
        ) : (
          <div className={styles.imagePreviews}>
            {newPreviews.map((preview, index) => (
              <div key={index} className={styles.imagePreviewItem}>
                <img
                  src={preview}
                  alt={`Nueva imagen ${index + 1}`}
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNew(index)}
                  className={styles.imageRemoveButton}
                >
                  <svg className={styles.imageRemoveIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {totalImages < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.imageAddButton}
              >
                <svg className={styles.imageAddIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main ProductEdit Component
export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedProduct, 
    categories, 
    isLoading, 
    error, 
    fetchCategories, 
    fetchProductBySlug, 
    updateProduct,
    clearSelectedProduct,
  } = useProductStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    taxRate: '21',
    isActive: true,
    categoryId: '',
  });
  
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string; isPrimary: boolean }>>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    fetchCategories();
    
    return () => {
      clearSelectedProduct();
    };
  }, []);

  useEffect(() => {
    if (id && !initialLoadDone) {
      fetchProductBySlug(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedProduct && !initialLoadDone) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price.toString(),
        stock: selectedProduct.stock.toString(),
        taxRate: selectedProduct.taxRate.toString(),
        isActive: selectedProduct.isActive,
        categoryId: selectedProduct.category?.id || '',
      });
      
      setExistingImages(
        selectedProduct.images.map((img) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
        }))
      );
      
      setInitialLoadDone(true);
    }
  }, [selectedProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleExistingDelete = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleExistingSetPrimary = (imageId: string) => {
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  };

  const handleNewImagesChange = (images: File[], previews: string[]) => {
    setNewImages(images);
    setNewPreviews(previews);
  };

  const validate = () => {
    try {
      productSchema.parse({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        taxRate: parseFloat(formData.taxRate),
        isActive: formData.isActive,
        categoryId: formData.categoryId || undefined,
      });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        const zodErr = err as unknown as { issues: Array<{ path: Array<string>; message: string }> };
        zodErr.issues.forEach((e) => {
          if (e.path[0]) {
            errors[e.path[0] as string] = e.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!id) return;
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await updateProduct(id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        taxRate: parseFloat(formData.taxRate),
        isActive: formData.isActive,
        categoryId: formData.categoryId || undefined,
      });
      
      // Note: Image management (add/delete/reorder) would happen here
      navigate('/dashboard/products');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !selectedProduct) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backLink}>
        <Link
          to="/dashboard/products"
          className={styles.backLink}
        >
          <svg className={styles.backLinkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a productos
        </Link>
      </div>

      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Editar Producto</h1>

        {submitError && (
          <div className={styles.alert}>
            {submitError}
          </div>
        )}

        {error && (
          <div className={styles.alert}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              Nombre del producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.formInput} ${fieldErrors.name ? styles.formInputError : ''}`}
            />
            {fieldErrors.name && (
              <p className={styles.formError}>{fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`${styles.formTextarea} ${fieldErrors.description ? styles.formInputError : ''}`}
            />
            {fieldErrors.description && (
              <p className={styles.formError}>{fieldErrors.description}</p>
            )}
          </div>

          {/* Price & Stock */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.formLabel}>
                Precio (€) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={`${styles.formInput} ${fieldErrors.price ? styles.formInputError : ''}`}
              />
              {fieldErrors.price && (
                <p className={styles.formError}>{fieldErrors.price}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stock" className={styles.formLabel}>
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`${styles.formInput} ${fieldErrors.stock ? styles.formInputError : ''}`}
              />
              {fieldErrors.stock && (
                <p className={styles.formError}>{fieldErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Tax Rate & Category */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="taxRate" className={styles.formLabel}>
                Tasa de Impuesto (%)
              </label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="categoryId" className={styles.formLabel}>
                Categoría
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="">Sin categoría</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Is Active */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>Producto activo (visible en tienda)</span>
            </label>
          </div>

          {/* Images */}
          <ImageUpload
            existingImages={existingImages}
            newImages={newImages}
            newPreviews={newPreviews}
            onExistingDelete={handleExistingDelete}
            onExistingSetPrimary={handleExistingSetPrimary}
            onNewImagesChange={handleNewImagesChange}
          />

          {/* Submit */}
          <div className={styles.formActions}>
            <Link
              to="/dashboard/products"
              className={styles.cancelButton}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
