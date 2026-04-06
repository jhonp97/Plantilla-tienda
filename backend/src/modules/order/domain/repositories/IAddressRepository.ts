import type { Address, CreateAddressInput } from '../entities/Address';

export interface IAddressRepository {
  // Create
  create(userId: string, input: CreateAddressInput): Promise<Address>;

  // Read
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  findDefaultByUserId(userId: string): Promise<Address | null>;

  // Update
  update(id: string, data: Partial<CreateAddressInput>): Promise<Address>;

  // Delete
  delete(id: string): Promise<void>;
  setAsDefault(userId: string, addressId: string): Promise<void>;

  // Utility
  existsById(id: string): Promise<boolean>;
}