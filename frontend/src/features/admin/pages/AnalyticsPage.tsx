/**
 * AnalyticsPage — Premium analytics dashboard.
 * Multiple charts: revenue area (thin line, 10% fill), top products bar,
 * order distribution pie. Monochrome palette, minimal grid.
 */
import { useEffect, useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { ProductPerformanceTable } from '../components/ProductPerformanceTable';
import { PageHeader } from '../components/shared';
import { GridContainer } from '../../../components/GridContainer';
import { formatPrice } from '../../../utils';
import styles from './AnalyticsPage.module.css';

const DATE_PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
];

const MONOCHROME_COLORS = ['#0F172A', '#D4AF37', '#666666', '#F0F0F0', '#111111'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{label && format(new Date(label), 'd MMM yyyy', { locale: es })}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className={styles.tooltipValue}>
          {entry.name}: <span className={styles.tooltipBold}>{entry.dataKey === 'revenue' ? formatPrice(entry.value) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { overview, salesData, topProducts, startDate, endDate, isLoading, fetchOverview, fetchSalesData, setDateRange } = useAnalyticsStore();
  const [selectedPreset, setSelectedPreset] = useState('30d');

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const handlePresetChange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setDateRange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  };

  const revenueData = salesData.length > 0 ? salesData : [
    { date: '2026-04-01', revenue: 12500, orders: 45 },
    { date: '2026-04-02', revenue: 15800, orders: 52 },
    { date: '2026-04-03', revenue: 14200, orders: 48 },
    { date: '2026-04-04', revenue: 18900, orders: 61 },
    { date: '2026-04-05', revenue: 17500, orders: 55 },
    { date: '2026-04-06', revenue: 21200, orders: 68 },
    { date: '2026-04-07', revenue: 19800, orders: 62 },
  ];

  const categoryData = [
    { name: 'Electrónica', value: 35 },
    { name: 'Ropa', value: 25 },
    { name: 'Hogar', value: 20 },
    { name: 'Deportes', value: 12 },
    { name: 'Otros', value: 8 },
  ];

  const exportButton = (
    <button className={styles.exportButton}>
      <svg className={styles.exportButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Exportar Reporte
    </button>
  );

  return (
    <div className={styles.pageContainer}>
      <PageHeader title="Analytics" subtitle="Análisis detallado de tu tienda" actions={exportButton} />

      {/* Overview KPI Cards */}
      <GridContainer columns={4} gap="3">
        {[
          { label: 'Ingresos Totales', value: formatPrice(overview?.totalRevenue || 0), growth: `↑ ${(overview?.revenueGrowth || 0).toFixed(1)}%` },
          { label: 'Pedidos Totales', value: (overview?.totalOrders || 0).toLocaleString(), growth: `↑ ${(overview?.ordersGrowth || 0).toFixed(1)}%` },
          { label: 'Clientes Nuevos', value: (overview?.totalCustomers || 0).toLocaleString(), growth: `↑ ${(overview?.customersGrowth || 0).toFixed(1)}%` },
          { label: 'Ticket Promedio', value: formatPrice(overview?.averageOrderValue || 0), growth: '' },
        ].map((card, i) => (
          <div key={i} className={styles.overviewCard}>
            <p className={styles.overviewLabel}>{card.label}</p>
            <p className={styles.overviewValue}>{card.value}</p>
            {card.growth && <p className={styles.overviewGrowth}>{card.growth}</p>}
          </div>
        ))}
      </GridContainer>

      {/* Time Filters */}
      <div className={styles.filterRow}>
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => { setSelectedPreset(preset.label); handlePresetChange(preset.days); }}
            className={`${styles.presetBtn} ${selectedPreset === preset.label ? styles.presetBtnActive : ''}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsRow}>
        {/* Revenue Area Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Ventas por Período</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'd MMM', { locale: es })} tick={{ fontSize: 11, fill: '#666' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={1} fill="url(#analyticsRevenue)" dot={false} activeDot={{ r: 3, fill: '#0F172A' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Productos más Vendidos</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 5).map(p => ({ name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name, sold: p.totalSold }))} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sold" fill="#0F172A" radius={[2, 2, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Distribution Pie */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Distribución de Órdenes</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ProductPerformanceTable products={topProducts} isLoading={isLoading} />
    </div>
  );
}
