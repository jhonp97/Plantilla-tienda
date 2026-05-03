/**
 * ResetPasswordPage - Password reset form
 * Reads token from query param, validates and allows setting new password
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from '@hooks/useForm';
import { useToastStore } from '@store/toastStore';
import { resetPassword } from '@services/auth.service';
import { PasswordInput } from '@components/PasswordInput';
import { Button } from '@components/Button';
import { SEO } from '@components/SEO';
import styles from './ResetPasswordPage.module.css';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const token = searchParams.get('token');

  const [isTokenMissing, setIsTokenMissing] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsTokenMissing(true);
    }
  }, [token]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<ResetPasswordValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    schema: resetPasswordSchema,
    onSubmit: async (formValues) => {
      if (!token) return;

      try {
        await resetPassword(token, formValues.newPassword);
        toast.success('Contraseña actualizada correctamente');
        navigate('/login', { replace: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al restablecer la contraseña';
        toast.error(message);
      }
    },
  });

  if (isTokenMissing) {
    return (
      <>
        <SEO
          title="Enlace Inválido"
          description="El enlace para restablecer la contraseña no es válido"
          pathname="/reset-password"
        />
        <div className={styles.pageContainer}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.errorContainer}>
                <div className={styles.errorIconContainer}>
                  <svg
                    className={styles.errorIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h1 className={styles.errorTitle}>Enlace Inválido</h1>
                <p className={styles.errorText}>
                  El enlace para restablecer la contraseña no es válido o ha
                  expirado. Solicita uno nuevo.
                </p>
                <Link to="/forgot-password" className={styles.errorButton}>
                  Solicitar nuevo enlace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Restablecer Contraseña"
        description="Crea una nueva contraseña para tu cuenta"
        pathname="/reset-password"
      />
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer}>
                <svg
                  className={styles.keyIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>Nueva Contraseña</h1>
              <p className={styles.subtitle}>
                Ingresa tu nueva contraseña para restablecer el acceso a tu
                cuenta
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.formGroup}>
                <PasswordInput
                  label="Nueva Contraseña"
                  value={values.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  onBlur={() => handleBlur('newPassword')}
                  placeholder="Mínimo 8 caracteres"
                  error={touched.newPassword ? errors.newPassword : undefined}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.formGroup}>
                <PasswordInput
                  label="Confirmar Contraseña"
                  value={values.confirmPassword}
                  onChange={(e) =>
                    handleChange('confirmPassword', e.target.value)
                  }
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Repite la contraseña"
                  error={
                    touched.confirmPassword
                      ? errors.confirmPassword
                      : undefined
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Guardando...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
