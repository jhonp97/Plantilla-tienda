/**
 * ReportsPage - Report generation and download page
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReportGenerator } from '../components/ReportGenerator';
import { ReportPreview } from '../components/ReportPreview';
import type { ReportType, ReportFormat } from '../../../types/reports.types';

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

  const TYPE_LABELS: Record<ReportType, string> = {
    SALES: 'Ventas',
    INVENTORY: 'Inventario',
    CUSTOMER: 'Clientes',
    TAX: 'Impuestos',
    SHIPPING: 'Envíos',
  };

  const FORMAT_LABELS: Record<ReportFormat, string> = {
    PDF: 'PDF',
    CSV: 'CSV',
    EXCEL: 'Excel',
  };

  const STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    PROCESSING: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
    FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Genera y descarga reportes de tu tienda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <ReportGenerator onGenerate={handleGenerate} isLoading={isGenerating} />

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reportes Recientes</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No hay reportes generados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const status = STATUS_CONFIG[report.status];
                
                return (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {format(parseISO(report.createdAt), "d MMM yyyy", { locale: es })}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{FORMAT_LABELS[report.format]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      {report.status === 'COMPLETED' && (
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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