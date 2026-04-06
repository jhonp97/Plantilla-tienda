export interface ProductImageProps {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  order: number;
  createdAt: Date;
}

export interface CreateProductImageInput {
  productId: string;
  url: string;
  publicId: string;
  order?: number;
}

export class ProductImage {
  private constructor(private readonly props: ProductImageProps) {}

  static create(input: CreateProductImageInput): ProductImage {
    if (!input.productId) {
      throw new Error('Product ID is required');
    }
    if (!input.url) {
      throw new Error('Image URL is required');
    }
    if (!input.publicId) {
      throw new Error('Cloudinary public ID is required');
    }

    return new ProductImage({
      id: crypto.randomUUID(),
      productId: input.productId,
      url: input.url,
      publicId: input.publicId,
      order: input.order ?? 0,
      createdAt: new Date(),
    });
  }

  static fromPrisma(props: ProductImageProps): ProductImage {
    return new ProductImage(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get url(): string {
    return this.props.url;
  }

  get publicId(): string {
    return this.props.publicId;
  }

  get order(): number {
    return this.props.order;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Domain methods
  isPrimary(): boolean {
    return this.props.order === 0;
  }

  toJSON(): ProductImageProps {
    return { ...this.props };
  }
}