import { useState, useCallback } from 'react';
import type { ZodSchema, ZodError } from 'zod';

type ValidationErrors<T> = Partial<Record<keyof T, string>>;
type TouchedFields<T> = Partial<Record<keyof T, boolean>>;

interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  validate?: (values: T) => ValidationErrors<T> | Promise<ValidationErrors<T>>;
  schema?: ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormResult<T> {
  values: T;
  errors: ValidationErrors<T>;
  touched: TouchedFields<T>;
  isSubmitting: boolean;
  handleChange: (name: keyof T, value: T[keyof T]) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: T) => void;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors<T>>>;
}

function extractZodErrors<T>(error: ZodError<T>): ValidationErrors<T> {
  const result: ValidationErrors<T> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') as keyof T;
    if (!result[path]) {
      result[path] = issue.message;
    }
  }
  return result;
}

/**
 * useForm - Form state management hook with validation support.
 *
 * Supports both custom `validate` function and Zod `schema`.
 *
 * @param options - Initial values, validation, and submit handler
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  schema,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runValidation = useCallback(
    async (vals: T): Promise<ValidationErrors<T>> => {
      if (schema) {
        const result = schema.safeParse(vals);
        if (!result.success) {
          return extractZodErrors(result.error);
        }
        return {};
      }
      if (validate) {
        return await validate(vals);
      }
      return {};
    },
    [schema, validate]
  );

  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change if field was touched
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      setIsSubmitting(true);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as TouchedFields<T>
      );
      setTouched(allTouched);

      const validationErrors = await runValidation(values);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, runValidation, onSubmit]
  );

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}
