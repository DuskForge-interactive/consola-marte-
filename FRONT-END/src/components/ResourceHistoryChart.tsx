import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ResourceHistoryPoint } from '@/lib/api';
import { useMemo } from 'react';

interface ResourceHistoryChartProps {
  title?: string;
  loading: boolean;
  error?: string;
  points: ResourceHistoryPoint[];
}

export const ResourceHistoryChart = ({
  title,
  loading,
  error,
  points,
}: ResourceHistoryChartProps) => {
  const palette = {
    axis: 'hsla(var(--chart-axis) / 0.85)',
    grid: 'hsla(var(--chart-grid) / 0.45)',
    line: 'hsl(var(--chart-line))',
    fill: 'hsla(var(--chart-fill) / 0.2)',
    tooltipBg: 'hsla(var(--popover) / 0.95)',
    tooltipBorder: 'hsla(var(--glass-border))',
  };

  const data = useMemo(
    () =>
      points.map((point) => ({
        timestamp: new Date(point.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        percentage: point.percentage,
      })),
    [points],
  );

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 h-64 flex items-center justify-center text-sm text-muted-foreground">
        Cargando historial...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6 h-64 flex items-center justify-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="glass rounded-xl p-6 h-64 flex items-center justify-center text-sm text-muted-foreground">
        No hay historial disponible.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const value = payload[0].value as number;
    return (
      <div
        className="rounded-lg p-3 shadow-lg text-sm"
        style={{
          backgroundColor: palette.tooltipBg,
          border: `1px solid ${palette.tooltipBorder}`,
        }}
      >
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground">
          {value.toFixed(2)}%
        </p>
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-6 h-64">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">{title ?? 'Historial'}</h3>
          <p className="text-xs text-muted-foreground">
            Evolución del recurso en el tiempo.
          </p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="resourceChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.line} stopOpacity={0.35} />
                <stop offset="100%" stopColor={palette.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={palette.grid} strokeDasharray="4 8" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12, fill: palette.axis }}
              stroke={palette.grid}
              tickMargin={8}
              axisLine={{ stroke: palette.grid }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: palette.axis }}
              stroke={palette.grid}
              tickFormatter={(value) => `${value}%`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: palette.grid }} />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke={palette.line}
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 1, stroke: palette.line, fill: '#0f1118' }}
              activeDot={{ r: 5 }}
              fill="url(#resourceChartGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
