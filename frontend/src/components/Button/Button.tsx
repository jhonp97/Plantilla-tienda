import { useTranslation } from 'react-i18next';
import { MinimalSpinner } from '@components/MinimalSpinner';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <MinimalSpinner label={t('common.loading')} />
          <span className={styles.loadingText}>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
