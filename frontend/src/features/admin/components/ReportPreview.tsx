/**
 * ReportPreview - Preview report before downloading
 */
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ReportType, ReportFormat } from '../../../types/reports.types';

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeInfo.icon} />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{typeInfo.label}</h3>
              <p className="text-sm text-gray-500">Previsualización del reporte</p>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Date Range */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Desde</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(parseISO(startDate), 'd MMM yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Hasta</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(parseISO(endDate), 'd MMM yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Format Info */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Formato de exportación</p>
            <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {reportFormat}
            </span>
          </div>

          {/* Fields to Include */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Datos incluidos en el reporte</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {typeInfo.fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">{field}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Preview Data */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">Vista Previa</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Ingresos Totales</span>
                <span className="text-sm font-medium text-gray-900">$125,450.00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Pedidos</span>
                <span className="text-sm font-medium text-gray-900">342</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Ticket Promedio</span>
                <span className="text-sm font-medium text-gray-900">$366.81</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Fecha de generación</span>
                <span className="text-sm font-medium text-gray-900">
                  {format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isGenerating}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}