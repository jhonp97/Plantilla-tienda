import { useId } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  maxLength,
  required,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  const textareaClassNames = [
    styles.textarea,
    error ? styles.error : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={textareaClassNames}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        required={required}
        {...rest}
      />
      {error && (
        <p id={`${textareaId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className={styles.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
}
