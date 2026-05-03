/**
 * ForgotPasswordPage - Password reset request form
 * Sends a reset link to the user's email
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from '@hooks/useForm';
import { useToastStore } from '@store/toastStore';
import { forgotPassword } from '@services/auth.service';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { SEO } from '@components/SEO';
import styles from './ForgotPasswordPage.module.css';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<ForgotPasswordValues>({
    initialValues: { email: '' },
    schema: forgotPasswordSchema,
    onSubmit: async (formValues) => {
      try {
        await forgotPassword(formValues.email);
        setIsSuccess(true);
        toast.success(t('auth.checkEmail'));
      } catch (err) {
        const message = err instanceof Error ? err.message : t('common.error');
        toast.error(message);
      }
    },
  });

  return (
    <>
      <SEO
        title={t('pages.forgotPassword.title')}
        description={t('pages.forgotPassword.description')}
        pathname="/forgot-password"
      />
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* Back to login */}
          <Link to="/login" className={styles.backLink}>
            <svg
              className={styles.backIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('auth.backToLogin')}
          </Link>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer}>
                <svg
                  className={styles.lockIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>{t('auth.forgotPasswordTitle')}</h1>
              <p className={styles.subtitle}>
                {t('auth.forgotPasswordDesc')}
              </p>
            </div>

            {isSuccess ? (
              <div className={styles.successContainer}>
                <div className={styles.successIconContainer}>
                  <svg
                    className={styles.successIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className={styles.successTitle}>{t('auth.checkEmail')}</h2>
                <p className={styles.successText}>
                  {t('auth.checkEmailDesc')}
                </p>
                <Link to="/login" className={styles.successButton}>
                  {t('auth.backToLogin')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.formGroup}>
                  <Input
                    label={t('auth.email')}
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder={t('auth.emailPlaceholder')}
                    error={touched.email ? errors.email : undefined}
                    required
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? t('auth.sendingLink') : t('auth.sendLink')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
