import type { IUserRepository, CreateUserInput } from '@modules/auth/domain/IUserRepository';
import type { Address } from '@modules/auth/domain/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  nifCif: z.string().min(5, 'NIF/CIF is required'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(3, 'Street is required'),
    postalCode: z.string().min(4, 'Valid postal code is required'),
    city: z.string().min(2, 'City is required'),
    province: z.string().min(2, 'Province is required'),
    country: z.string().min(2, 'Country is required'),
  }).optional(),
});

export interface RegisterResult {
  id: string;
  email: string;
  role: string;
  fullName: string;
  nifCif: string;
  phone?: string;
  address: Address;
}

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: z.infer<typeof registerSchema>): Promise<RegisterResult> {
    const validated = registerSchema.parse(input);

    const existing = await this.userRepository.findByEmail(validated.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Handle optional address - use empty address if not provided
    const address: Address = validated.address ?? {
      street: '',
      postalCode: '',
      city: '',
      province: '',
      country: '',
    };

    const createUserInput: CreateUserInput = {
      email: validated.email,
      passwordHash,
      role: 'CUSTOMER',
      nifCif: validated.nifCif,
      fullName: validated.fullName,
      phone: validated.phone,
      address,
    };

    const user = await this.userRepository.create(createUserInput);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nifCif: user.nifCif,
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
    };
  }
}
