/**
 * SalesChart — Premium sales visualization using Recharts.
 * Thin lines (strokeWidth:1), 10% area fill opacity,
 * monochrome palette (slate + dorado), minimal grid,
 * premium tooltip, time period filters.
 */
import { formatPrice } from '../../../utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
        <p key={index} className={styles.tooltipValue}>
          {entry.dataKey === 'revenue' ? 'Ingresos' : 'Pedidos'}:{' '}
          <span className={styles.tooltipBold}>
            {entry.dataKey === 'revenue'
              ? formatPrice(entry.value)
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
        <div className={styles.skeletonTitle} />
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
            <div className={styles.legendDotRevenue} />
            <span className={styles.legendLabel}>Ingresos</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDotOrders} />
            <span className={styles.legendLabel}>Pedidos</span>
          </div>
        </div>
      </div>

      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'd MMM', { locale: es })}
              tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Inter' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#0F172A"
              strokeWidth={1}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 3, fill: '#0F172A', stroke: '#fff', strokeWidth: 1 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#D4AF37"
              strokeWidth={1}
              fill="url(#ordersGradient)"
              dot={false}
              activeDot={{ r: 3, fill: '#D4AF37', stroke: '#fff', strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
