/**
 * AddressForm - Reusable address form component
 */
import type { CreateAddressInput } from '../../../types/address.types';
import styles from './AddressForm.module.css';

interface AddressFormProps {
  formData: CreateAddressInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateAddressInput>>;
  errors: Record<string, string>;
}

export function AddressForm({ formData, setFormData, errors }: AddressFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.formContainer}>
      {/* Name Fields */}
      <div className={styles.nameFields}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>
            Nombre *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
            placeholder="Juan"
          />
          {errors.firstName && (
            <p className={styles.errorText}>{errors.firstName}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Apellidos *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
            placeholder="Pérez García"
          />
          {errors.lastName && (
            <p className={styles.errorText}>{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Company (Optional) */}
      <div className={styles.formGroup}>
        <label htmlFor="company" className={styles.label}>
          Empresa (opcional)
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="Empresa S.A. de C.V."
        />
      </div>

      {/* Address Fields */}
      <div className={styles.formGroup}>
        <label htmlFor="address1" className={styles.label}>
          Dirección *
        </label>
        <input
          type="text"
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          className={`${styles.input} ${errors.address1 ? styles.inputError : ''}`}
          placeholder="Calle Principal 123"
        />
        {errors.address1 && (
          <p className={styles.errorText}>{errors.address1}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="address2" className={styles.label}>
          Colonia/Referencia (opcional)
        </label>
        <input
          type="text"
          id="address2"
          name="address2"
          value={formData.address2 || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="Colonia del Valle"
        />
      </div>

      {/* City, State, Postal Code */}
      <div className={styles.locationFields}>
        <div className={styles.formGroup}>
          <label htmlFor="postalCode" className={styles.label}>
            Código Postal *
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`}
            placeholder="03100"
          />
          {errors.postalCode && (
            <p className={styles.errorText}>{errors.postalCode}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="city" className={styles.label}>
            Ciudad *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
            placeholder="Ciudad de México"
          />
          {errors.city && (
            <p className={styles.errorText}>{errors.city}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="state" className={styles.label}>
            Estado *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
            placeholder="CDMX"
          />
          {errors.state && (
            <p className={styles.errorText}>{errors.state}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div className={styles.formGroup}>
        <label htmlFor="country" className={styles.label}>
          País *
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={`${styles.input} ${errors.country ? styles.inputError : ''}`}
        >
          <option value="MX">México</option>
          <option value="US">Estados Unidos</option>
          <option value="CA">Canadá</option>
          <option value="CO">Colombia</option>
          <option value="AR">Argentina</option>
          <option value="CL">Chile</option>
          <option value="ES">España</option>
        </select>
        {errors.country && (
          <p className={styles.errorText}>{errors.country}</p>
        )}
      </div>

      {/* Phone */}
      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.label}>
          Teléfono (opcional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="55 1234 5678"
        />
        <p className={styles.hint}>
          Incluir código de país si es fuera de México
        </p>
      </div>
    </div>
  );
}