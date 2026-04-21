/**
 * AnalyticsPage - Analytics dashboard with date range picker and charts
 */
import { useEffect, useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { ProductPerformanceTable } from '../components/ProductPerformanceTable';
import { PageHeader } from '../components/shared';
import styles from './AnalyticsPage.module.css';

const DATE_PRESETS = [
  { label: 'Hoy', days: 0 },
  { label: 'Ayer', days: 1 },
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Último mes', days: 30, type: 'month' },
  { label: 'Últimos 3 meses', days: 90 },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const {
    overview,
    salesData,
    topProducts,
    startDate,
    endDate,
    isLoading,
    fetchOverview,
    fetchSalesData,
    setDateRange,
  } = useAnalyticsStore();

  const [selectedPreset, setSelectedPreset] = useState<string>('Últimos 7 días');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handlePresetChange = (preset: typeof DATE_PRESETS[0]) => {
    setSelectedPreset(preset.label);
    
    if (preset.type === 'month') {
      const end = new Date();
      const start = subMonths(end, 1);
      setDateRange(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
    } else {
      const end = new Date();
      const start = subDays(end, preset.days);
      setDateRange(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
    }
  };

  // Mock data for charts (in real app would come from API)
  const revenueData = salesData.length > 0 ? salesData : [
    { date: '2026-04-01', revenue: 12500, orders: 45 },
    { date: '2026-04-02', revenue: 15800, orders: 52 },
    { date: '2026-04-03', revenue: 14200, orders: 48 },
    { date: '2026-04-04', revenue: 18900, orders: 61 },
    { date: '2026-04-05', revenue: 17500, orders: 55 },
    { date: '2026-04-06', revenue: 21200, orders: 68 },
    { date: '2026-04-07', revenue: 19800, orders: 62 },
  ];

  // Mock category data
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
      {/* Header */}
      <PageHeader
        title="Analytics"
        subtitle="Análisis detallado de tu tienda"
        actions={exportButton}
      />

      {/* Date Range Picker */}
      <div className={styles.dateRangeCard}>
        <div className={styles.presetButtons}>
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetChange(preset)}
              className={`${styles.presetButton} ${
                selectedPreset === preset.label
                  ? styles.presetButtonActive
                  : styles.presetButtonInactive
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className={styles.dateInputsRow}>
          <div className={styles.dateInputGroup}>
            <label className={styles.dateLabel}>Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setDateRange(e.target.value, endDate)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label className={styles.dateLabel}>Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setDateRange(startDate, e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={`${styles.dateInputGroup} ${styles.dateInputGroupSmall}`}>
            <label className={styles.dateLabel}>Agrupar por</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className={styles.dateInput}
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <div className={styles.overviewCardHeader}>
            <div className={`${styles.overviewIconBox} ${styles.overviewIconBoxBlue}`}>
              <svg className={`${styles.overviewIcon} ${styles.overviewIconBlue}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={styles.overviewLabel}>Ingresos Totales</span>
          </div>
          <p className={styles.overviewValue}>
            ${(overview?.totalRevenue || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className={styles.overviewGrowth}>
            ↑ {(overview?.revenueGrowth || 0).toFixed(1)}% vs período anterior
          </p>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.overviewCardHeader}>
            <div className={`${styles.overviewIconBox} ${styles.overviewIconBoxGreen}`}>
              <svg className={`${styles.overviewIcon} ${styles.overviewIconGreen}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className={styles.overviewLabel}>Pedidos Totales</span>
          </div>
          <p className={styles.overviewValue}>{overview?.totalOrders || 0}</p>
          <p className={styles.overviewGrowth}>
            ↑ {(overview?.ordersGrowth || 0).toFixed(1)}% vs período anterior
          </p>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.overviewCardHeader}>
            <div className={`${styles.overviewIconBox} ${styles.overviewIconBoxPurple}`}>
              <svg className={`${styles.overviewIcon} ${styles.overviewIconPurple}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className={styles.overviewLabel}>Clientes Nuevos</span>
          </div>
          <p className={styles.overviewValue}>{overview?.totalCustomers || 0}</p>
          <p className={styles.overviewGrowth}>
            ↑ {(overview?.customersGrowth || 0).toFixed(1)}% vs período anterior
          </p>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.overviewCardHeader}>
            <div className={`${styles.overviewIconBox} ${styles.overviewIconBoxOrange}`}>
              <svg className={`${styles.overviewIcon} ${styles.overviewIconOrange}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className={styles.overviewLabel}>Ticket Promedio</span>
          </div>
          <p className={styles.overviewValue}>
            ${(overview?.averageOrderValue || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Ingresos por Período</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'd MMM', { locale: es })}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, 'Ingresos']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className={styles.categoryChartCard}>
          <h3 className={styles.chartTitle}>Ventas por Categoría</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <ProductPerformanceTable products={topProducts} isLoading={isLoading} />
    </div>
  );
}
