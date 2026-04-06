export type AddressProps = {
  street: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  isDefault?: boolean;
};

export interface CreateAddressInput {
  street: string;
  postalCode: string;
  city: string;
  province: string;
  country?: string;
  isDefault?: boolean;
}

export class Address {
  private constructor(private readonly props: AddressProps) {}

  static create(input: CreateAddressInput): Address {
    if (!input.street || input.street.trim().length < 3) {
      throw new Error('Street address must be at least 3 characters');
    }
    if (!input.postalCode || input.postalCode.trim().length < 3) {
      throw new Error('Postal code is required');
    }
    if (!input.city || input.city.trim().length < 2) {
      throw new Error('City is required');
    }
    if (!input.province || input.province.trim().length < 2) {
      throw new Error('Province is required');
    }

    return new Address({
      street: input.street.trim(),
      postalCode: input.postalCode.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      country: input.country ?? 'España',
      isDefault: input.isDefault ?? false,
    });
  }

  static fromPrisma(props: AddressProps): Address {
    return new Address(props);
  }

  // Getters
  get street(): string {
    return this.props.street;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get city(): string {
    return this.props.city;
  }

  get province(): string {
    return this.props.province;
  }

  get country(): string {
    return this.props.country;
  }

  get isDefault(): boolean {
    return this.props.isDefault ?? false;
  }

  // Domain methods
  toJSON(): AddressProps {
    return { ...this.props };
  }

  toFormattedAddress(): string {
    return `${this.street}, ${this.postalCode}, ${this.city}, ${this.province}, ${this.country}`;
  }
}