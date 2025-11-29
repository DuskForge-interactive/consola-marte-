import { useMemo } from 'react';
import { Activity, TrendingUp, Package } from 'lucide-react';
import { useResourceStore } from '@/store/useResourceStore';

export const StatsOverview = () => {
  const resourcesRecord = useResourceStore((state) => state.resources);
  const resupplyRequests = useResourceStore((state) => state.resupplyRequests);

  const resourceList = useMemo(
    () => Object.values(resourcesRecord),
    [resourcesRecord],
  );

  const averageCapacity =
    resourceList.length === 0
      ? 0
      : resourceList.reduce(
          (sum, resource) => sum + resource.currentPercentage,
          0,
        ) / resourceList.length;

  const criticalCount = resourceList.filter((r) => r.isCritical).length;
  const pendingRequests = resupplyRequests.filter(
    (request) => request.status === 'pending',
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Capacidad promedio
            </p>
            <p className="text-2xl font-bold text-foreground">
              {averageCapacity.toFixed(1)}%
            </p>
          </div>
          <Activity className="h-8 w-8 text-accent" />
        </div>
      </div>

      <div className="glass p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Recursos críticos
            </p>
            <p
              className={`text-2xl font-bold ${
                criticalCount > 0 ? 'text-critical' : 'text-success'
              }`}
            >
              {criticalCount}
            </p>
          </div>
          <TrendingUp
            className={`h-8 w-8 ${
              criticalCount > 0 ? 'text-critical' : 'text-success'
            }`}
          />
        </div>
      </div>

      <div className="glass p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Resupply pendientes
            </p>
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
