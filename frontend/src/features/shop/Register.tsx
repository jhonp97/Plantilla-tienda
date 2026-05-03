import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { PasswordInput } from '@components/PasswordInput';
import styles from './Register.module.css';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  nifCif: string;
}

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nifCif: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): string => {
    if (formData.password !== formData.confirmPassword) {
      return t('auth.passwordsDoNotMatch');
    }
    if (formData.password.length < 8) {
      return t('auth.passwordMinLength');
    }
    if (!formData.email.includes('@')) {
      return t('auth.invalidEmail');
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        nifCif: formData.nifCif,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Logo link to home */}
      <Link to="/products" className={styles.homeLink}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span>{t('header.storeName')}</span>
      </Link>

      <div className={styles.form}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.registerTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            {t('auth.registerSuccess')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <Input
                label={t('auth.fullName')}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.fullNamePlaceholder')}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <Input
                label={t('auth.nifCif')}
                type="text"
                name="nifCif"
                value={formData.nifCif}
                onChange={handleChange}
                placeholder={t('auth.nifCifPlaceholder')}
                helperText={t('auth.nifCifHelper')}
                required
              />
            </div>

            <div className={styles.inputGroupFull}>
              <Input
                label={t('auth.email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                label={t('auth.password')}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                helperText={t('auth.passwordMinLength')}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                label={t('auth.confirmPassword')}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? t('auth.registering') : t('auth.registerButton')}
          </Button>
        </form>

        <p className={styles.loginLink}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
