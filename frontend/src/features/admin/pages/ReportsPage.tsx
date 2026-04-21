/**
 * ReportsPage - Report generation and download page
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReportGenerator } from '../components/ReportGenerator';
import { ReportPreview } from '../components/ReportPreview';
import { PageHeader } from '../components/shared';
import type { ReportType, ReportFormat } from '../../../types/reports.types';
import styles from './ReportsPage.module.css';

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  fileUrl?: string;
}

// Mock existing reports
const MOCK_REPORTS: GeneratedReport[] = [
  {
    id: '1',
    name: 'Reporte de Ventas - Marzo 2026',
    type: 'SALES',
    format: 'PDF',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'COMPLETED',
    createdAt: '2026-04-01T10:30:00Z',
    completedAt: '2026-04-01T10:32:00Z',
  },
  {
    id: '2',
    name: 'Reporte de Inventario - Abril 2026',
    type: 'INVENTORY',
    format: 'CSV',
    startDate: '2026-04-01',
    endDate: '2026-04-07',
    status: 'COMPLETED',
    createdAt: '2026-04-07T14:15:00Z',
    completedAt: '2026-04-07T14:16:00Z',
  },
  {
    id: '3',
    name: 'Reporte de Clientes - Q1 2026',
    type: 'CUSTOMER',
    format: 'EXCEL',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'COMPLETED',
    createdAt: '2026-04-05T09:00:00Z',
    completedAt: '2026-04-05T09:01:00Z',
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<GeneratedReport[]>(MOCK_REPORTS);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    type: ReportType;
    format: ReportFormat;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (data: {
    type: ReportType;
    format: ReportFormat;
    startDate: string;
    endDate: string;
  }) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleConfirmGenerate = async () => {
    if (!previewData) return;

    setIsGenerating(true);

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const typeLabels: Record<ReportType, string> = {
      SALES: 'Ventas',
      INVENTORY: 'Inventario',
      CUSTOMER: 'Clientes',
      TAX: 'Impuestos',
      SHIPPING: 'Envíos',
    };

    const newReport: GeneratedReport = {
      id: Date.now().toString(),
      name: `Reporte de ${typeLabels[previewData.type]} - ${format(parseISO(previewData.startDate), 'MMM yyyy')}`,
      type: previewData.type,
      format: previewData.format,
      startDate: previewData.startDate,
      endDate: previewData.endDate,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      fileUrl: '#',
    };

    setReports([newReport, ...reports]);
    setShowPreview(false);
    setPreviewData(null);
    setIsGenerating(false);
  };

  const FORMAT_LABELS: Record<ReportFormat, string> = {
    PDF: 'PDF',
    CSV: 'CSV',
    EXCEL: 'Excel',
  };

  const STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', className: styles.statusPending },
    PROCESSING: { label: 'Procesando', className: styles.statusProcessing },
    COMPLETED: { label: 'Completado', className: styles.statusCompleted },
    FAILED: { label: 'Fallido', className: styles.statusFailed },
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <PageHeader
        title="Reportes"
        subtitle="Genera y descarga reportes de tu tienda"
      />

      <div className={styles.contentGrid}>
        {/* Report Generator */}
        <ReportGenerator onGenerate={handleGenerate} isLoading={isGenerating} />

        {/* Recent Reports */}
        <div className={styles.recentReportsCard}>
          <h3 className={styles.recentReportsTitle}>Reportes Recientes</h3>
          
          {reports.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className={styles.emptyText}>No hay reportes generados</p>
            </div>
          ) : (
            <div className={styles.reportsList}>
              {reports.map((report) => {
                const status = STATUS_CONFIG[report.status];
                
                return (
                  <div
                    key={report.id}
                    className={styles.reportItem}
                  >
                    <div className={styles.reportItemLeft}>
                      <div className={styles.reportItemIcon}>
                        <svg className={styles.reportItemIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className={styles.reportItemInfo}>
                        <p className={styles.reportItemName}>{report.name}</p>
                        <div className={styles.reportItemMeta}>
                          <span className={styles.reportItemDate}>
                            {format(parseISO(report.createdAt), "d MMM yyyy", { locale: es })}
                          </span>
                          <span className={styles.reportItemDot}>•</span>
                          <span className={styles.reportItemFormat}>{FORMAT_LABELS[report.format]}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.reportItemRight}>
                      <span className={`${styles.statusBadge} ${status.className}`}>
                        {status.label}
                      </span>
                      {report.status === 'COMPLETED' && (
                        <button className={styles.downloadButton}>
                          <svg className={styles.downloadButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && previewData && (
        <ReportPreview
          type={previewData.type}
          reportFormat={previewData.format}
          startDate={previewData.startDate}
          endDate={previewData.endDate}
          onConfirm={handleConfirmGenerate}
          onCancel={() => {
            setShowPreview(false);
            setPreviewData(null);
          }}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
