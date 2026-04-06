import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { CalculateShippingDto, ShippingCalculationResponse } from '../../dto/CalculateShippingDto';

export class CalculateShippingUseCase {
  constructor(
    private settingsRepo: IStoreSettingsRepository
  ) {}

  async execute(dto: CalculateShippingDto): Promise<ShippingCalculationResponse> {
    const settings = await this.settingsRepo.get();
    const settingsData = settings.toJSON();

    // Determine shipping zone
    let shippingZoneName: string | undefined;
    let shippingCost = settingsData.defaultShippingCost;

    // Check if there's a matching zone for the province
    if (settingsData.shippingZones.length > 0) {
      const matchingZone = settingsData.shippingZones.find(zone =>
        zone.provinces.some(p => p.toLowerCase() === dto.province.toLowerCase())
      );

      if (matchingZone) {
        shippingZoneName = matchingZone.name;
        shippingCost = matchingZone.cost;
      }
    }

    // Check free shipping threshold
    const freeShippingThreshold = settingsData.freeShippingThreshold;
    let freeShippingEligible = false;
    let amountToFreeShipping: number | undefined;

    if (freeShippingThreshold && freeShippingThreshold > 0) {
      freeShippingEligible = dto.subtotal >= freeShippingThreshold;
      
      if (!freeShippingEligible) {
        amountToFreeShipping = freeShippingThreshold - dto.subtotal;
      }
    }

    return {
      province: dto.province,
      subtotal: dto.subtotal,
      shippingCost,
      freeShippingEligible,
      freeShippingThreshold,
      amountToFreeShipping,
      shippingZone: shippingZoneName,
    };
  }
}