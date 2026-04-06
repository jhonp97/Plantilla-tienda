import { NotFoundError } from '@shared/errors/DomainError';
import type { IAddressRepository } from '@modules/order/domain/repositories/IAddressRepository';
import type { CreateAddressInput } from '@modules/order/domain/entities/Address';
import type { UpdateAddressDto } from '../../dto/UpdateAddressDto';
import type { Address as AddressEntity } from '@modules/order/domain/entities/Address';

export class UpdateAddressUseCase {
  constructor(private addressRepo: IAddressRepository) {}

  async execute(addressId: string, dto: UpdateAddressDto, _userId: string): Promise<AddressEntity> {
    const address = await this.addressRepo.findById(addressId);
    
    if (!address) {
      throw new NotFoundError(`Address with ID ${addressId} not found`, 'Address');
    }

    const updateData: Partial<CreateAddressInput> = {};
    
    if (dto.street !== undefined) {
      updateData.street = dto.street;
    }
    if (dto.postalCode !== undefined) {
      updateData.postalCode = dto.postalCode;
    }
    if (dto.city !== undefined) {
      updateData.city = dto.city;
    }
    if (dto.province !== undefined) {
      updateData.province = dto.province;
    }
    if (dto.country !== undefined) {
      updateData.country = dto.country;
    }
    if (dto.isDefault !== undefined) {
      updateData.isDefault = dto.isDefault;
    }

    const updatedAddress = await this.addressRepo.update(addressId, updateData);
    
    return updatedAddress;
  }
}