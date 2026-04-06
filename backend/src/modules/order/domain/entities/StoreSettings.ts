export type TaxMode = 'INCLUDED' | 'EXCLUDED';

export type ShippingZone = {
  name: string;
  provinces: string[];
  cost: number; // in cents
  freeShippingThreshold?: number; // in cents
};

export type StoreSettingsProps = {
  id: string;
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  storeAddress: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  defaultTaxRate: number; // percentage (e.g., 21 for 21%)
  taxMode: TaxMode;
  defaultShippingCost: number; // in cents
  freeShippingThreshold?: number; // in cents
  shippingZones: ShippingZone[];
  currency: string;
  currencySymbol: string;
  lowStockThreshold: number;
  orderPrefix: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface UpdateStoreSettingsInput {
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress?: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  defaultTaxRate?: number;
  taxMode?: TaxMode;
  defaultShippingCost?: number;
  freeShippingThreshold?: number;
  shippingZones?: ShippingZone[];
  currency?: string;
  currencySymbol?: string;
  lowStockThreshold?: number;
  orderPrefix?: string;
  isActive?: boolean;
}

export class StoreSettings {
  private constructor(private readonly props: StoreSettingsProps) {}

  static createDefault(): StoreSettings {
    const now = new Date();
    return new StoreSettings({
      id: crypto.randomUUID(),
      storeName: 'Mi Tienda',
      storeEmail: 'tienda@ejemplo.com',
      storeAddress: {
        street: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'España',
      },
      defaultTaxRate: 21,
      taxMode: 'EXCLUDED',
      defaultShippingCost: 0,
      shippingZones: [],
      currency: 'EUR',
      currencySymbol: '€',
      lowStockThreshold: 10,
      orderPrefix: 'ORD',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrisma(props: StoreSettingsProps): StoreSettings {
    return new StoreSettings(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get storeName(): string {
    return this.props.storeName;
  }

  get storeEmail(): string {
    return this.props.storeEmail;
  }

  get storePhone(): string | undefined {
    return this.props.storePhone;
  }

  get storeAddress() {
    return this.props.storeAddress;
  }

  get defaultTaxRate(): number {
    return this.props.defaultTaxRate;
  }

  get taxMode(): TaxMode {
    return this.props.taxMode;
  }

  get defaultShippingCost(): number {
    return this.props.defaultShippingCost;
  }

  get freeShippingThreshold(): number | undefined {
    return this.props.freeShippingThreshold;
  }

  get shippingZones(): ShippingZone[] {
    return this.props.shippingZones;
  }

  get currency(): string {
    return this.props.currency;
  }

  get currencySymbol(): string {
    return this.props.currencySymbol;
  }

  get lowStockThreshold(): number {
    return this.props.lowStockThreshold;
  }

  get orderPrefix(): string {
    return this.props.orderPrefix;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  calculateShippingCost(province: string): number {
    // Find matching zone
    const zone = this.props.shippingZones.find(z => 
      z.provinces.some(p => p.toLowerCase() === province.toLowerCase())
    );
    
    const shippingCost = zone?.cost ?? this.props.defaultShippingCost;
    
    // Check free shipping threshold
    if (this.props.freeShippingThreshold && this.props.freeShippingThreshold > 0) {
      // This should be called with order subtotal, but we'll handle that in the use case
      return shippingCost;
    }
    
    return shippingCost;
  }

  update(input: UpdateStoreSettingsInput): void {
    if (input.storeName !== undefined) {
      if (input.storeName.trim().length < 2) {
        throw new Error('Store name must be at least 2 characters');
      }
      this.props.storeName = input.storeName.trim();
    }
    if (input.storeEmail !== undefined) {
      if (!input.storeEmail.includes('@')) {
        throw new Error('Valid email is required');
      }
      this.props.storeEmail = input.storeEmail.trim();
    }
    if (input.storePhone !== undefined) {
      this.props.storePhone = input.storePhone.trim();
    }
    if (input.storeAddress !== undefined) {
      this.props.storeAddress = input.storeAddress;
    }
    if (input.defaultTaxRate !== undefined) {
      if (input.defaultTaxRate < 0 || input.defaultTaxRate > 100) {
        throw new Error('Tax rate must be between 0 and 100');
      }
      this.props.defaultTaxRate = input.defaultTaxRate;
    }
    if (input.taxMode !== undefined) {
      this.props.taxMode = input.taxMode;
    }
    if (input.defaultShippingCost !== undefined) {
      if (input.defaultShippingCost < 0) {
        throw new Error('Shipping cost cannot be negative');
      }
      this.props.defaultShippingCost = input.defaultShippingCost;
    }
    if (input.freeShippingThreshold !== undefined) {
      this.props.freeShippingThreshold = input.freeShippingThreshold;
    }
    if (input.shippingZones !== undefined) {
      this.props.shippingZones = input.shippingZones;
    }
    if (input.currency !== undefined) {
      this.props.currency = input.currency;
    }
    if (input.currencySymbol !== undefined) {
      this.props.currencySymbol = input.currencySymbol;
    }
    if (input.lowStockThreshold !== undefined) {
      if (input.lowStockThreshold < 0) {
        throw new Error('Low stock threshold cannot be negative');
      }
      this.props.lowStockThreshold = input.lowStockThreshold;
    }
    if (input.orderPrefix !== undefined) {
      this.props.orderPrefix = input.orderPrefix.trim();
    }
    if (input.isActive !== undefined) {
      this.props.isActive = input.isActive;
    }
    this.props.updatedAt = new Date();
  }

  toJSON(): StoreSettingsProps {
    return { ...this.props };
  }
}