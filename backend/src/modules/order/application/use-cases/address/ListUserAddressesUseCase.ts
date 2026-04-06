import type { IAddressRepository } from '@modules/order/domain/repositories/IAddressRepository';
import type { Address as AddressEntity } from '@modules/order/domain/entities/Address';

export class ListUserAddressesUseCase {
  constructor(private addressRepo: IAddressRepository) {}

  async execute(userId: string): Promise<AddressEntity[]> {
    const addresses = await this.addressRepo.findByUserId(userId);
    
    return addresses;
  }
}