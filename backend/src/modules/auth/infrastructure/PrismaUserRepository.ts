import type { PrismaClient } from '@shared/infra/prisma/client';
import type { IUserRepository, CreateUserInput, UpdateUserInput } from '@modules/auth/domain/IUserRepository';
import { User, type Address, type Role } from '@modules/auth/domain/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async create(input: CreateUserInput): Promise<User> {
    const address = input.address ?? {
      street: '',
      postalCode: '',
      city: '',
      province: '',
      country: '',
    };
    
    const record = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role ?? 'CUSTOMER',
        nifCif: input.nifCif,
        fullName: input.fullName,
        phone: input.phone,
        address: address as object,
      },
    });

    return this.mapToEntity(record);
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address && { address: data.address as object }),
        ...(data.nifCif && { nifCif: data.nifCif }),
      },
    });

    return this.mapToEntity(record);
  }

  private mapToEntity(record: {
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    nifCif: string;
    fullName: string;
    phone: string | null;
    address: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const address = record.address as Address;

    return User.create({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      role: record.role as Role,
      nifCif: record.nifCif,
      fullName: record.fullName,
      phone: record.phone ?? undefined,
      address,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
