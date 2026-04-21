import type { CategoryProps } from './Category';
import type { ProductImageProps } from './ProductImage';

export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  stockQuantity: number;
  isActive: boolean;
  taxRate: number; // percentage: 0, 4, 10, or 21
  categoryId: string;
  category?: CategoryProps;
  images?: ProductImageProps[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number; // cents
  stockQuantity: number;
  taxRate?: number; // percentage: 0, 4, 10, or 21
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  taxRate?: number;
  categoryId?: string;
  isActive?: boolean;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(input: CreateProductInput): Product {
    if (!input.name || input.name.length < 2) {
      throw new Error('Product name must be at least 2 characters');
    }
    if (!input.price || input.price <= 0) {
      throw new Error('Price must be a positive integer (cents)');
    }
    if (input.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    if (!input.categoryId) {
      throw new Error('Category is required');
    }

    // Validate taxRate: must be 0, 4, 10, or 21
    const validTaxRates = [0, 4, 10, 21];
    const taxRate = input.taxRate ?? 21;
    if (!validTaxRates.includes(taxRate)) {
      throw new Error('Tax rate must be one of: 0, 4, 10, or 21');
    }

    const now = new Date();
    return new Product({
      id: crypto.randomUUID(),
      name: input.name,
      slug: Product.generateSlug(input.name),
      description: input.description || '',
      price: input.price,
      stockQuantity: input.stockQuantity,
      taxRate,
      isActive: input.isActive ?? true,
      categoryId: input.categoryId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrisma(props: ProductProps): Product {
    return new Product(props);
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): number {
    return this.props.price;
  }

  get stockQuantity(): number {
    return this.props.stockQuantity;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get taxRate(): number {
    return this.props.taxRate;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get category(): CategoryProps | undefined {
    return this.props.category;
  }

  get images(): ProductImageProps[] | undefined {
    return this.props.images;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  updateStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    this.props.stockQuantity = quantity;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  update(input: UpdateProductInput): void {
    if (input.name !== undefined) {
      if (input.name.length < 2) {
        throw new Error('Product name must be at least 2 characters');
      }
      this.props.name = input.name;
      this.props.slug = Product.generateSlug(input.name);
    }
    if (input.description !== undefined) {
      this.props.description = input.description;
    }
    if (input.price !== undefined) {
      if (input.price <= 0) {
        throw new Error('Price must be a positive integer (cents)');
      }
      this.props.price = input.price;
    }
    if (input.stockQuantity !== undefined) {
      if (input.stockQuantity < 0) {
        throw new Error('Stock quantity cannot be negative');
      }
      this.props.stockQuantity = input.stockQuantity;
    }
    if (input.taxRate !== undefined) {
      const validTaxRates = [0, 4, 10, 21];
      if (!validTaxRates.includes(input.taxRate)) {
        throw new Error('Tax rate must be one of: 0, 4, 10, or 21');
      }
      this.props.taxRate = input.taxRate;
    }
    if (input.categoryId !== undefined) {
      this.props.categoryId = input.categoryId;
    }
    if (input.isActive !== undefined) {
      this.props.isActive = input.isActive;
    }
    this.props.updatedAt = new Date();
  }

  isInStock(): boolean {
    return this.props.stockQuantity > 0;
  }

  isLowStock(): boolean {
    return this.props.stockQuantity > 0 && this.props.stockQuantity <= 10;
  }

  isOutOfStock(): boolean {
    return this.props.stockQuantity === 0;
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }

  toPublicJSON(): Omit<ProductProps, 'isActive'> {
    const { isActive: _, ...publicData } = this.props;
    return publicData;
  }
}