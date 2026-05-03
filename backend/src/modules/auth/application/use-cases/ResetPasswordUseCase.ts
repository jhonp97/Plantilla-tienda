import bcrypt from 'bcryptjs';
import { prisma } from '@shared/infra/prisma/client';
import { resetPasswordSchema } from '@shared/infra/validation/schemas';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { z } from 'zod';

const BCRYPT_COST = 10;

export class ResetPasswordUseCase {
  async execute(input: z.infer<typeof resetPasswordSchema>): Promise<void> {
    const validated = resetPasswordSchema.parse(input);
    const { token, newPassword } = validated;

    // Find all unexpired, unused tokens (we'll check against bcrypt hash)
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Find the matching token by comparing bcrypt hashes
    let matchedToken: typeof tokens[number] | null = null;
    for (const t of tokens) {
      const isValid = await bcrypt.compare(token, t.tokenHash);
      if (isValid) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: matchedToken.email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_COST);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { used: true },
      }),
    ]);
  }
}
