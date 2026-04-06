import { ConflictError } from '@shared/errors/DomainError';
import type { IAddressRepository } from '@modules/order/domain/repositories/IAddressRepository';
import { Address, type CreateAddressInput } from '@modules/order/domain/entities/Address';
import type { CreateAddressDto } from '../../dto/CreateAddressDto';
import type { Address as AddressEntity } from '@modules/order/domain/entities/Address';

const MAX_ADDRESSES_PER_USER = 2;

export class CreateAddressUseCase {
  constructor(private addressRepo: IAddressRepository) {}

  async execute(dto: CreateAddressDto, userId: string): Promise<AddressEntity> {
    const existingAddresses = await this.addressRepo.findByUserId(userId);
    
    if (existingAddresses.length >= MAX_ADDRESSES_PER_USER) {
      throw new ConflictError(
        `Maximum ${MAX_ADDRESSES_PER_USER} addresses allowed per user. Please delete an existing address first.`
      );
    }

    const addressEntity = Address.create({
      street: dto.street,
      postalCode: dto.postalCode,
      city: dto.city,
      province: dto.province,
      country: dto.country,
      isDefault: dto.isDefault,
    });

    const createdAddress = await this.addressRepo.create(userId, addressEntity.toJSON() as CreateAddressInput);
    
    return createdAddress;
  }
}