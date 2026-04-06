import bcrypt from 'bcryptjs';

export type Role = 'ADMIN' | 'CUSTOMER';

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  nifCif: string;
  fullName: string;
  phone?: string;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get role(): Role {
    return this.props.role;
  }

  get nifCif(): string {
    return this.props.nifCif;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get address(): Address {
    return this.props.address;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  async matchesPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.props.passwordHash);
  }

  isAdmin(): boolean {
    return this.props.role === 'ADMIN';
  }

  isCustomer(): boolean {
    return this.props.role === 'CUSTOMER';
  }

  toPublicJSON(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash: _, ...publicData } = this.props;
    return publicData;
  }
}
