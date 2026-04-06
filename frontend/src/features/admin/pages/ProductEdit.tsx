/**
 * ProductEdit - Admin page for editing existing products
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import { z } from 'zod';
import type { Category } from '../../../types/product.types';

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
    <div className="relative group">
      <img
        src={url}
        alt="Imagen del producto"
        className="w-20 h-20 object-cover rounded-md"
      />
      {isPrimary && (
        <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-tl-md">
          Principal
        </span>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
        {!isPrimary && (
          <button
            type="button"
            onClick={() => onSetPrimary(id)}
            className="p-1 bg-white text-gray-700 rounded-full hover:bg-gray-200"
            title="Establecer como principal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Imágenes del producto
      </label>
      
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
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
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        {totalImages === 0 ? (
          <div className="space-y-2">
            <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">
              Arrastra imágenes aquí o{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:underline"
              >
                selecciona archivos
              </button>
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {newPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Nueva imagen ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNew(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {totalImages < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/dashboard/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a productos
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h1>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {submitError}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.price 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
              )}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.stock 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.stock && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Tax Rate & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Is Active */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Producto activo (visible en tienda)</span>
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
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Link
              to="/dashboard/products"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}