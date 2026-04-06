import type { IUserRepository } from '@modules/auth/domain/IUserRepository';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '@config/env';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export interface LoginResult {
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
  token: string;
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: z.infer<typeof loginSchema>): Promise<LoginResult> {
    const validated = loginSchema.parse(input);

    const user = await this.userRepository.findByEmail(validated.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.matchesPassword(validated.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      token,
    };
  }
}
