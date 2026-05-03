import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { PasswordInput } from '@components/PasswordInput';
import styles from './Login.module.css';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
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
          <h1 className={styles.title}>{t('auth.welcomeBack')}</h1>
          <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <PasswordInput
              label={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
            />
            <Link to="/forgot-password" className={styles.forgotPassword}>
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>{t('auth.or')}</span>
        </div>

        <p className={styles.registerLink}>
          {t('auth.noAccount')}{' '}
          <Link to="/register">{t('auth.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}
