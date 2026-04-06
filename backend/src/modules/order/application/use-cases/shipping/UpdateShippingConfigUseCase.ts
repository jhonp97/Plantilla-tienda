import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { StoreSettings } from '@modules/order/domain/entities/StoreSettings';
import type { UpdateShippingConfigDto } from '../../dto/UpdateShippingConfigDto';

export class UpdateShippingConfigUseCase {
  constructor(
    private settingsRepo: IStoreSettingsRepository
  ) {}

  async execute(dto: UpdateShippingConfigDto): Promise<StoreSettings> {
    // Update shipping-related settings based on shipping type
    const updateInput: any = {};

    // Set default shipping cost based on type
    if (dto.shippingPrice !== undefined) {
      updateInput.defaultShippingCost = dto.shippingPrice;
    }

    // Set free shipping threshold if THRESHOLD type
    if (dto.freeShippingThreshold !== undefined) {
      updateInput.freeShippingThreshold = dto.freeShippingThreshold;
    }

    // Set shipping zones if provided
    if (dto.shippingZones !== undefined) {
      updateInput.shippingZones = dto.shippingZones;
    }

    const updatedSettings = await this.settingsRepo.update(updateInput);
    return updatedSettings;
  }

  // Get current shipping configuration
  async getCurrentConfig(): Promise<StoreSettings> {
    return await this.settingsRepo.get();
  }
}