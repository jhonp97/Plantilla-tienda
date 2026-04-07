/**
 * AdminDashboardPage - Main dashboard with KPIs and charts
 */
import { useEffect } from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { DashboardStats } from '../components/DashboardStats';
import { SalesChart } from '../components/SalesChart';
import { LowStockAlert } from '../components/LowStockAlert';

export default function AdminDashboardPage() {
  const {
    overview,
    salesData,
    topProducts,
    lowStockProducts,
    todaySales,
    weekSales,
    pendingOrders,
    lowStockCount,
    isLoading,
    fetchOverview,
    fetchLowStockProducts,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchOverview();
    fetchLowStockProducts();
  }, [fetchOverview, fetchLowStockProducts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de tu tienda en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <DashboardStats
        todaySales={todaySales}
        weekSales={weekSales}
        pendingOrders={pendingOrders}
        lowStockCount={lowStockCount}
        isLoading={isLoading}
      />

      {/* Charts and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesData} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlert products={lowStockProducts} isLoading={isLoading} />
        </div>
      </div>

      {/* Top Products Today */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
            <p className="text-sm text-gray-500">Top 10 productos por unidades vendidas</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendidos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.slice(0, 10).map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.totalSold}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${product.revenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay datos de productos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}