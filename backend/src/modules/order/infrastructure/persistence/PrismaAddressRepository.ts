import type { PrismaClient } from '@shared/infra/prisma/client';
import type { IAddressRepository } from '@modules/order/domain/repositories/IAddressRepository';
import type { Address, CreateAddressInput } from '@modules/order/domain/entities/Address';
import { Address as AddressEntity } from '@modules/order/domain/entities/Address';

interface PrismaAddressRecord {
  id: string;
  userId: string | null;
  street: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export class PrismaAddressRepository implements IAddressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, input: CreateAddressInput): Promise<Address> {
    // If this is setting as default, clear other defaults first
    if (input.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const record = await this.prisma.address.create({
      data: {
        userId: userId || null,
        street: input.street,
        postalCode: input.postalCode,
        city: input.city,
        province: input.province,
        country: input.country ?? 'España',
        isDefault: input.isDefault ?? false,
      },
    });

    return this.mapToEntity(record);
  }

  async findById(id: string): Promise<Address | null> {
    const record = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const records = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    return records.map(record => this.mapToEntity(record));
  }

  async findDefaultByUserId(userId: string): Promise<Address | null> {
    const record = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async update(id: string, data: Partial<CreateAddressInput>): Promise<Address> {
    const updateData: any = {};
    
    if (data.street !== undefined) updateData.street = data.street;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.isDefault !== undefined) {
      // If setting as default, clear other defaults first
      if (data.isDefault) {
        const address = await this.prisma.address.findUnique({ where: { id } });
        if (address?.userId) {
          await this.prisma.address.updateMany({
            where: { userId: address.userId, id: { not: id } },
            data: { isDefault: false },
          });
        }
      }
      updateData.isDefault = data.isDefault;
    }

    const record = await this.prisma.address.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }

  async setAsDefault(userId: string, addressId: string): Promise<void> {
    // Clear all defaults for this user
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set the specified address as default
    await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.address.count({
      where: { id },
    });
    return count > 0;
  }

  private mapToEntity(record: PrismaAddressRecord): Address {
    return AddressEntity.fromPrisma({
      street: record.street,
      postalCode: record.postalCode,
      city: record.city,
      province: record.province,
      country: record.country,
      isDefault: record.isDefault,
    });
  }
}