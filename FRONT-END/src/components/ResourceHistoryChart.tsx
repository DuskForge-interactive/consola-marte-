import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ResourceHistoryPoint } from '@/lib/api';

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

  const data = points.map((point) => ({
    timestamp: new Date(point.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    percentage: point.percentage,
  }));

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
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              stroke="currentColor"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: 'currentColor' }}
              stroke="currentColor"
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="currentColor"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
