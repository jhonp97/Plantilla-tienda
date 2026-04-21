/**
 * ProductCreate - Admin page for creating new products
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import { z } from 'zod';
import type { Category } from '../../../types/product.types';
import styles from './ProductCreate.module.css';

// Validation schema
const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  taxRate: z.number().min(0).max(100, 'El impuesto debe estar entre 0 y 100'),
  isActive: z.boolean(),
  categoryId: z.string().optional(),
});

// Image Upload Component
interface ImageUploadProps {
  images: File[];
  previews: string[];
  onImagesChange: (images: File[], previews: string[]) => void;
}

function ImageUpload({ images, previews, onImagesChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).filter((file) => 
      file.type.startsWith('image/')
    );
    
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    
    onImagesChange([...images, ...newImages], [...previews, ...newPreviews]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    
    onImagesChange(newImages, newPreviews);
  };

  return (
    <div className={styles.imageUploadSection}>
      <label className={styles.imageUploadLabel}>
        Imágenes del producto
      </label>
      
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
        
        {previews.length === 0 ? (
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
            <p className={styles.imageDropzoneHint}>PNG, JPG hasta 5MB</p>
          </div>
        ) : (
          <div className={styles.imagePreviews}>
            {previews.map((preview, index) => (
              <div key={index} className={styles.imagePreviewItem}>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className={styles.imageRemoveButton}
                >
                  <svg className={styles.imageRemoveIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {previews.length < 5 && (
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

// Main ProductCreate Component
export default function ProductCreate() {
  const navigate = useNavigate();
  const { categories, isLoading, error, fetchCategories, createProduct } = useProductStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    taxRate: '21',
    isActive: true,
    categoryId: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear error when field is modified
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImagesChange = (newImages: File[], newPreviews: string[]) => {
    setImages(newImages);
    setPreviews(newPreviews);
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
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        taxRate: parseFloat(formData.taxRate),
        isActive: formData.isActive,
        categoryId: formData.categoryId || undefined,
      });
      
      // Note: Image upload would happen here after product creation
      // For now, we just redirect to the product list
      navigate('/dashboard/products');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className={styles.formTitle}>Nuevo Producto</h1>

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
              placeholder="Nombre del producto"
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
              placeholder="Descripción detallada del producto"
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
                placeholder="0.00"
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
                placeholder="0"
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
                placeholder="21"
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
            images={images}
            previews={previews}
            onImagesChange={handleImagesChange}
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
              {isSubmitting ? 'Creando...' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
