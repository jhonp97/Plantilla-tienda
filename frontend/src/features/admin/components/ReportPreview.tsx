/**
 * ReportPreview - Preview report before downloading
 */
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ReportType, ReportFormat } from '../../../types/reports.types';
import { BaseModal } from '../shared';
import styles from './ReportPreview.module.css';

interface ReportPreviewProps {
  type: ReportType;
  reportFormat: ReportFormat;
  startDate: string;
  endDate: string;
  onConfirm: () => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

const TYPE_INFO: Record<ReportType, { label: string; icon: string; fields: string[] }> = {
  SALES: {
    label: 'Reporte de Ventas',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    fields: ['Ingresos totales', 'Pedidos', 'Ticket promedio', 'Productos más vendidos'],
  },
  INVENTORY: {
    label: 'Reporte de Inventario',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    fields: ['Total productos', 'Stock actual', 'Items con stock bajo', 'Items sin stock'],
  },
  CUSTOMER: {
    label: 'Reporte de Clientes',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    fields: ['Clientes totales', 'Nuevos clientes', 'Clientes recurrentes', 'Valor de vida del cliente'],
  },
  TAX: {
    label: 'Reporte de Impuestos',
    icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
    fields: ['Total impuestos cobrados', 'Impuesto por pedido', 'Porcentaje promedio'],
  },
  SHIPPING: {
    label: 'Reporte de Envíos',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    fields: ['Costo total de envío', 'Tiempo promedio de entrega', 'Pedidos enviados'],
  },
};

export function ReportPreview({
  type,
  reportFormat,
  startDate,
  endDate,
  onConfirm,
  onCancel,
  isGenerating,
}: ReportPreviewProps) {
  const typeInfo = TYPE_INFO[type];

  const modalContent = (
    <>
      {/* Modal Body */}
      <div className={styles.modalBody}>
        {/* Date Range */}
        <div className={styles.dateRangeCard}>
          <div className={styles.dateRangeGrid}>
            <div className={styles.dateRangeItem}>
              <p className={styles.dateRangeLabel}>Desde</p>
              <p className={styles.dateRangeValue}>
                {format(parseISO(startDate), 'd MMM yyyy', { locale: es })}
              </p>
            </div>
            <div className={styles.dateRangeItem}>
              <p className={styles.dateRangeLabel}>Hasta</p>
              <p className={styles.dateRangeValue}>
                {format(parseISO(endDate), 'd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Format Info */}
        <div className={styles.formatSection}>
          <p className={styles.formatLabel}>Formato de exportación</p>
          <span className={styles.formatBadge}>
            {reportFormat}
          </span>
        </div>

        {/* Fields to Include */}
        <div className={styles.fieldsSection}>
          <p className={styles.fieldsLabel}>Datos incluidos en el reporte</p>
          <div className={styles.fieldsGrid}>
            {typeInfo.fields.map((field, index) => (
              <div key={index} className={styles.fieldItem}>
                <svg className={styles.fieldCheckIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className={styles.fieldName}>{field}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Preview Data */}
        <div className={styles.previewCard}>
          <div className={styles.previewCardHeader}>
            <p className={styles.previewCardTitle}>Vista Previa</p>
          </div>
          <div className={styles.previewCardBody}>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Ingresos Totales</span>
              <span className={styles.previewValue}>$125,450.00</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Pedidos</span>
              <span className={styles.previewValue}>342</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Ticket Promedio</span>
              <span className={styles.previewValue}>$366.81</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Fecha de generación</span>
              <span className={styles.previewValue}>
                {format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className={styles.modalFooter}>
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isGenerating}
          className={styles.confirmButton}
        >
          {isGenerating ? (
            <>
              <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg className={styles.confirmButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onCancel} maxWidth="42rem">
      {/* Header */}
      <div className={styles.modalHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIconBox}>
            <svg className={styles.headerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeInfo.icon} />
            </svg>
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.headerTitle}>{typeInfo.label}</h3>
            <p className={styles.headerSubtitle}>Previsualización del reporte</p>
          </div>
        </div>
      </div>
      {modalContent}
    </BaseModal>
  );
}
