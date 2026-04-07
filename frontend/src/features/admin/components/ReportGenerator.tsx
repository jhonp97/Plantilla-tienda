/**
 * ReportGenerator - Form for generating new reports
 */
import { useState } from 'react';
import { format, subDays } from 'date-fns';
import type { ReportType, ReportFormat } from '../../../types/reports.types';

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

  const selectedType = REPORT_TYPES.find(t => t.value === reportType);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Nuevo Reporte</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Reporte
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setReportType(type.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  reportType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formato de Exportación
          </label>
          <div className="flex gap-3">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.value}
                type="button"
                onClick={() => setReportFormat(fmt.value)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  reportFormat === fmt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Date Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período Rápido
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setStartDate(format(today, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Este Mes
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generando Reporte...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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