/**
 * ReportGenerator - Form for generating new reports
 */
import { useState } from 'react';
import { format, subDays } from 'date-fns';
import type { ReportType, ReportFormat } from '../../../types/reports.types';
import { FormInput } from '../shared';
import styles from './ReportGenerator.module.css';

interface ReportGeneratorProps {
  onGenerate: (data: {
    type: ReportType;
    format: ReportFormat;
    startDate: string;
    endDate: string;
  }) => void;
  isLoading?: boolean;
}

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'SALES', label: 'Ventas', description: 'Reporte de ingresos, pedidos y categorías' },
  { value: 'INVENTORY', label: 'Inventario', description: 'Estado actual del stock de productos' },
  { value: 'CUSTOMER', label: 'Clientes', description: 'Análisis de clientes nuevos y recurrentes' },
  { value: 'TAX', label: 'Impuestos', description: 'Resumen de impuestos cobrados' },
  { value: 'SHIPPING', label: 'Envíos', description: 'Costos y tiempos de entrega' },
];

const FORMAT_OPTIONS: { value: ReportFormat; label: string }[] = [
  { value: 'PDF', label: 'PDF' },
  { value: 'CSV', label: 'CSV' },
  { value: 'EXCEL', label: 'Excel (.xlsx)' },
];

export function ReportGenerator({ onGenerate, isLoading }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>('SALES');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      type: reportType,
      format: reportFormat,
      startDate,
      endDate,
    });
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Generar Nuevo Reporte</h3>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Report Type Selection */}
        <div className={styles.typeSection}>
          <label className={styles.typeLabel}>
            Tipo de Reporte
          </label>
          <div className={styles.typeGrid}>
            {REPORT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setReportType(type.value)}
                className={`${styles.typeButton} ${
                  reportType === type.value
                    ? styles.typeButtonActive
                    : styles.typeButtonInactive
                }`}
              >
                <p className={styles.typeName}>{type.label}</p>
                <p className={styles.typeDescription}>{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className={styles.formatSection}>
          <label className={styles.formatLabel}>
            Formato de Exportación
          </label>
          <div className={styles.formatButtons}>
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.value}
                type="button"
                onClick={() => setReportFormat(fmt.value)}
                className={`${styles.formatButton} ${
                  reportFormat === fmt.value
                    ? styles.formatButtonActive
                    : styles.formatButtonInactive
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className={styles.dateRow}>
          <FormInput
            id="startDate"
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <FormInput
            id="endDate"
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Quick Date Presets */}
        <div className={styles.presetsSection}>
          <label className={styles.presetsLabel}>
            Período Rápido
          </label>
          <div className={styles.presetButtons}>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setStartDate(format(today, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              }}
              className={styles.presetButton}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const last7Days = subDays(today, 7);
                setStartDate(format(last7Days, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              }}
              className={styles.presetButton}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const last30Days = subDays(today, 30);
                setStartDate(format(last30Days, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              }}
              className={styles.presetButton}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(format(firstDay, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              }}
              className={styles.presetButton}
            >
              Este Mes
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.generateButton}
        >
          {isLoading ? (
            <>
              <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generando Reporte...
            </>
          ) : (
            <>
              <svg className={styles.generateButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar Reporte
            </>
          )}
        </button>
      </form>
    </div>
  );
}
