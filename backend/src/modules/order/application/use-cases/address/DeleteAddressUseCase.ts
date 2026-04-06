import { NotFoundError } from '@shared/errors/DomainError';
import type { IAddressRepository } from '@modules/order/domain/repositories/IAddressRepository';

export class DeleteAddressUseCase {
  constructor(private addressRepo: IAddressRepository) {}

  async execute(addressId: string, _userId: string): Promise<void> {
    const address = await this.addressRepo.findById(addressId);
    
    if (!address) {
      throw new NotFoundError(`Address with ID ${addressId} not found`, 'Address');
    }

    await this.addressRepo.delete(addressId);
  }
}