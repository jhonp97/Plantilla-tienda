import type { User, Address, Role } from '@modules/auth/domain/User';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: Role;
  nifCif: string;
  fullName: string;
  phone?: string;
  address: Address;
}

export interface UpdateUserInput {
  fullName?: string;
  phone?: string;
  address?: Address;
  nifCif?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
}
