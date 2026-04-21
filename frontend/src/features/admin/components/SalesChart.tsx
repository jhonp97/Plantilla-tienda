/**
 * SalesChart - Sales visualization using Recharts
 */
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './SalesChart.module.css';

interface SalesChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>
        {label && format(parseISO(label), 'd MMM yyyy', { locale: es })}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
          {entry.dataKey === 'revenue' ? 'Ingresos' : 'Pedidos'}:{' '}
          <span className={styles.tooltipBold}>
            {entry.dataKey === 'revenue'
              ? `$${entry.value.toLocaleString('es-AR')}`
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function SalesChart({ data, isLoading }: SalesChartProps) {
  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={`${styles.skeletonTitle}`} />
        <div className={styles.skeletonChart} />
      </div>
    );
  }

  const chartData = data.length > 0
    ? data.map((item) => ({
        date: item.date,
        revenue: item.revenue,
        orders: item.orders,
      }))
    : [
        { date: '2026-04-01', revenue: 12500, orders: 45 },
        { date: '2026-04-02', revenue: 15800, orders: 52 },
        { date: '2026-04-03', revenue: 14200, orders: 48 },
        { date: '2026-04-04', revenue: 18900, orders: 61 },
        { date: '2026-04-05', revenue: 17500, orders: 55 },
        { date: '2026-04-06', revenue: 21200, orders: 68 },
        { date: '2026-04-07', revenue: 19800, orders: 62 },
      ];

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Ventas Recientes</h3>
          <p className={styles.chartSubtitle}>Ingresos y pedidos diarios</p>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotPrimary}`} />
            <span className={styles.legendLabel}>Ingresos</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotSuccess}`} />
            <span className={styles.legendLabel}>Pedidos</span>
          </div>
        </div>
      </div>

      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'd MMM', { locale: es })}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Ingresos"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              name="Pedidos"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}