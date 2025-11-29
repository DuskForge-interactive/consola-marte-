import { Resource } from '@/store/useResourceStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";


interface ResourceCardProps {
  resource: Resource;
  onRequestResupply: () => void;
}

export const ResourceCard = ({ resource, onRequestResupply }: ResourceCardProps) => {

  const percentage = (resource.current / resource.max) * 100;
  const isCritical = resource.current <= resource.criticalLevel;
  const isWarning = resource.current <= resource.criticalLevel * 1.5;
  
  const trend = resource.history.length >= 2 
    ? resource.history[resource.history.length - 1] - resource.history[resource.history.length - 2]
    : 0;

  const chartData = resource.history.map((value, index) => ({
    value,
    index,
  }));

const navigate = useNavigate();
const handleOpenResource = () => {
  navigate(`/resource/${resource.id}`);
};

  const getStatusColor = () => {
    if (isCritical) return 'text-critical';
    if (isWarning) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-critical';
    if (isWarning) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div
      onClick={handleOpenResource}
      className="cursor-pointer"
    >
      <Card
        className={`glass-strong p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] ${
          isCritical ? 'glow-critical border-critical/50' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{resource.icon}</span>
              <h3 className="text-lg font-bold text-foreground">{resource.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {resource.id.toUpperCase()}
            </p>
          </div>

          {isCritical && (
            <div className="flex items-center gap-1 text-critical animate-pulse">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-bold">CRÍTICO</span>
            </div>
          )}
        </div>

        {/* Current Value */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={`text-4xl font-bold ${getStatusColor()}`}>
              {resource.current.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {resource.max.toLocaleString()} {resource.unit}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress value={percentage} className="h-2 bg-muted/30" />

            <div
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Nivel crítico: {resource.criticalLevel} {resource.unit}
            </span>
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-critical" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span
                className={
                  trend > 0
                    ? 'text-success'
                    : trend < 0
                    ? 'text-critical'
                    : 'text-muted-foreground'
                }
              >
                {trend > 0 ? '+' : ''}
                {trend} {resource.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-16 -mx-2 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  isCritical
                    ? 'hsl(var(--critical))'
                    : isWarning
                    ? 'hsl(var(--warning))'
                    : 'hsl(var(--success))'
                }
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resupply Button (NO navega) */}
        <Button
          onClick={(e) => {
            e.stopPropagation(); // <-- evita abrir la página
            onRequestResupply();
          }}
          variant={isCritical ? 'destructive' : 'secondary'}
          className={`w-full font-semibold ${isCritical ? 'glow-critical' : ''}`}
        >
          {isCritical ? '🚨 RESUPPLY URGENTE' : '📦 Solicitar Resupply'}
        </Button>
      </Card>
    </div>

  );
};
