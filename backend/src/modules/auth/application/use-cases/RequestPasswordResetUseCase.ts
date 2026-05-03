import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@shared/infra/prisma/client';
import { EmailService } from '@modules/order/infrastructure/services/EmailService';
import { env } from '@config/env';
import { forgotPasswordSchema } from '@shared/infra/validation/schemas';
import type { z } from 'zod';

const BCRYPT_COST = 10;
const TOKEN_EXPIRY_HOURS = 1;

export class RequestPasswordResetUseCase {
  constructor(private readonly emailService: EmailService) {}

  async execute(input: z.infer<typeof forgotPasswordSchema>): Promise<void> {
    // Validate always succeed silently (anti-enumeration)
    let email: string;
    try {
      const validated = forgotPasswordSchema.parse(input);
      email = validated.email;
    } catch {
      // If validation fails, still return 200 to prevent email enumeration
      return;
    }

    try {
      // Generate cryptographically secure token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(token, BCRYPT_COST);

      // Calculate expiry (1 hour from now)
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Store the hashed token
      await prisma.passwordResetToken.create({
        data: {
          email,
          tokenHash,
          expiresAt,
        },
      });

      // Build reset link
      const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

      // Send email with reset link
      await this.emailService.send({
        to: email,
        subject: 'Restablece tu contraseña',
        html: `
          <h1>Restablece tu contraseña</h1>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p><a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">Restablecer contraseña</a></p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        `,
        text: `Restablece tu contraseña: ${resetLink}. Este enlace expirará en 1 hora.`,
      });
    } catch (error) {
      // Log the error but don't expose it to the client (anti-enumeration)
      console.error('[RequestPasswordReset] Error:', error);
    }
  }
}
