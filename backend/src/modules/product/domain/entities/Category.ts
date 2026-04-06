import type { ProductProps } from './Product';

export interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  products?: ProductProps[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export class Category {
  private constructor(private readonly props: CategoryProps) {}

  static create(input: CreateCategoryInput): Category {
    if (!input.name || input.name.length < 2) {
      throw new Error('Category name must be at least 2 characters');
    }

    const now = new Date();
    return new Category({
      id: crypto.randomUUID(),
      name: input.name,
      slug: Category.generateSlug(input.name),
      description: input.description || '',
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrisma(props: CategoryProps): Category {
    return new Category(props);
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

  get description(): string | undefined {
    return this.props.description;
  }

  get products(): ProductProps[] | undefined {
    return this.props.products;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  update(input: UpdateCategoryInput): void {
    if (input.name !== undefined) {
      if (input.name.length < 2) {
        throw new Error('Category name must be at least 2 characters');
      }
      this.props.name = input.name;
      this.props.slug = Category.generateSlug(input.name);
    }
    if (input.description !== undefined) {
      this.props.description = input.description;
    }
    this.props.updatedAt = new Date();
  }

  hasProducts(): boolean {
    return (this.props.products?.length ?? 0) > 0;
  }

  toJSON(): CategoryProps {
    return { ...this.props };
  }
}