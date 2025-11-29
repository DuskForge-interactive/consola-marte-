import { useResourceStore } from '@/store/useResourceStore';
import { Activity, TrendingUp, Package } from 'lucide-react';

export const StatsOverview = () => {
  const { resources, resupplyRequests } = useResourceStore();
  
  const criticalCount = Object.values(resources).filter(
    r => r.current <= r.criticalLevel
  ).length;
  
  const totalCapacity = Object.values(resources).reduce(
    (sum, r) => sum + (r.current / r.max) * 100,
    0
  ) / Object.keys(resources).length;

  const pendingRequests = resupplyRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Capacidad Promedio</p>
            <p className="text-2xl font-bold text-foreground">
              {totalCapacity.toFixed(1)}%
            </p>
          </div>
          <Activity className="h-8 w-8 text-accent" />
        </div>
      </div>

      <div className="glass p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Recursos Críticos</p>
            <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-critical' : 'text-success'}`}>
              {criticalCount}
            </p>
          </div>
          <TrendingUp className={`h-8 w-8 ${criticalCount > 0 ? 'text-critical' : 'text-success'}`} />
        </div>
      </div>

      <div className="glass p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Resupply Pendientes</p>
            <p className="text-2xl font-bold text-warning">
              {pendingRequests}
            </p>
          </div>
          <Package className="h-8 w-8 text-warning" />
        </div>
      </div>
    </div>
  );
};
