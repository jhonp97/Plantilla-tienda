import { InputHTMLAttributes } from 'react';
import styles from './FormInput.module.css';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export function FormInput({ label, error, id, className, ...inputProps }: FormInputProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.formLabel}>
        {label}
      </label>
      <input
        id={id}
        className={`${styles.formInput} ${error ? styles.formInputError : ''} ${className || ''}`}
        {...inputProps}
      />
      {error && <p className={styles.formError}>{error}</p>}
    </div>
  );
}

export default FormInput;
