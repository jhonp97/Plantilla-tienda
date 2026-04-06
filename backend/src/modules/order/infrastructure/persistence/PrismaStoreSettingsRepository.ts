import type { PrismaClient } from '@shared/infra/prisma/client';
import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { StoreSettings, UpdateStoreSettingsInput } from '@modules/order/domain/entities/StoreSettings';
import { StoreSettings as StoreSettingsEntity } from '@modules/order/domain/entities/StoreSettings';

interface PrismaStoreSettingsRecord {
  id: string;
  shippingType: string;
  shippingPrice: number | null;
  freeShippingThreshold: number | null;
  updatedAt: Date;
  updatedBy: string | null;
}

export class PrismaStoreSettingsRepository implements IStoreSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(): Promise<StoreSettings> {
    let record = await this.prisma.storeSettings.findFirst();

    if (!record) {
      // Create default settings if none exist
      record = await this.prisma.storeSettings.create({
        data: {
          shippingType: 'FREE',
          shippingPrice: 0,
          freeShippingThreshold: 0,
        },
      });
    }

    return this.mapToEntity(record);
  }

  async update(input: UpdateStoreSettingsInput): Promise<StoreSettings> {
    let record = await this.prisma.storeSettings.findFirst();

    if (!record) {
      // Create default settings if none exist
      record = await this.prisma.storeSettings.create({
        data: {
          shippingType: (input as any).shippingType ?? 'FREE',
          shippingPrice: input.defaultShippingCost ?? 0,
          freeShippingThreshold: input.freeShippingThreshold ?? 0,
        },
      });
    } else {
      const updateData: any = {};
      
      if ((input as any).shippingType !== undefined) {
        updateData.shippingType = (input as any).shippingType;
      }
      if (input.defaultShippingCost !== undefined) {
        updateData.shippingPrice = input.defaultShippingCost;
      }
      if (input.freeShippingThreshold !== undefined) {
        updateData.freeShippingThreshold = input.freeShippingThreshold;
      }

      record = await this.prisma.storeSettings.update({
        where: { id: record.id },
        data: updateData,
      });
    }

    return this.mapToEntity(record);
  }

  async resetToDefaults(): Promise<StoreSettings> {
    let record = await this.prisma.storeSettings.findFirst();

    if (!record) {
      record = await this.prisma.storeSettings.create({
        data: {
          shippingType: 'FREE',
          shippingPrice: 0,
          freeShippingThreshold: 0,
        },
      });
    } else {
      record = await this.prisma.storeSettings.update({
        where: { id: record.id },
        data: {
          shippingType: 'FREE',
          shippingPrice: 0,
          freeShippingThreshold: 0,
        },
      });
    }

    return this.mapToEntity(record);
  }

  private mapToEntity(record: PrismaStoreSettingsRecord): StoreSettings {
    return StoreSettingsEntity.fromPrisma({
      id: record.id,
      storeName: 'Mi Tienda',
      storeEmail: 'tienda@ejemplo.com',
      storeAddress: {
        street: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'España',
      },
      defaultTaxRate: 21,
      taxMode: 'EXCLUDED',
      defaultShippingCost: record.shippingPrice ?? 0,
      freeShippingThreshold: record.freeShippingThreshold ?? undefined,
      shippingZones: [],
      currency: 'EUR',
      currencySymbol: '€',
      lowStockThreshold: 10,
      orderPrefix: 'ORD',
      isActive: true,
      createdAt: new Date(),
      updatedAt: record.updatedAt,
    });
  }
}