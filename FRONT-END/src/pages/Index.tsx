import { useEffect, useMemo, useState } from 'react';
import { useResourceStore } from '@/store/useResourceStore';
import { ResourceCard } from '@/components/ResourceCard';
import { AlertBanner } from '@/components/AlertBanner';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { useToast } from '@/hooks/use-toast';

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
};

type AlertEntry = {
  id: string;
  message: string;
  resourceName: string;
};

const Index = () => {
  const resourcesRecord = useResourceStore((state) => state.resources);
  const requestResupply = useResourceStore((state) => state.requestResupply);
  const criticalQueue = useResourceStore((state) => state.criticalQueue);
  const clearCriticalAlerts = useResourceStore(
    (state) => state.clearCriticalAlerts,
  );
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const resourceList = useMemo(
    () => Object.values(resourcesRecord),
    [resourcesRecord],
  );

  const generarMensajeDummy = () => {
    const mensajes = [
      'Oxígeno ajustado debido a variación de consumo.',
      'Reserva de agua actualizada tras ciclo de purificación.',
      'Revisión automática de filtros completada.',
      'Módulo de energía registró un ligero descenso.',
      'Nuevo paquete enviado desde plataforma orbital.',
      'Sincronizando datos del inventario con estación base.',
      'Análisis de nutrientes recalculado.',
      'Movimiento detectado en el almacén 3.',
    ];

    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const fakeLog: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        message: generarMensajeDummy(),
      };

      setLogs((prev) => [fakeLog, ...prev]);
    }, Math.random() * 2000 + 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newAlerts = resourceList
      .filter((resource) => resource.isCritical)
      .map<AlertEntry>((resource) => ({
        id: resource.id,
        resourceName: resource.name,
        message: `${resource.name} está en ${resource.currentPercentage.toFixed(
          2,
        )}% (umbral ${resource.criticalPercentage}%).`,
      }));

    setAlerts(newAlerts);
  }, [resourceList]);

  useEffect(() => {
    if (criticalQueue.length === 0) return;

    criticalQueue.forEach((resource) => {
      toast({
        variant: 'destructive',
        title: '🚨 Alerta crítica',
        description: `${resource.name} cayó a ${resource.currentPercentage.toFixed(
          1,
        )}%`,
      });
    });

    clearCriticalAlerts();
  }, [criticalQueue, toast, clearCriticalAlerts]);

  const handleResupply = (resourceId: string, resourceName: string) => {
    requestResupply(resourceId);
    toast({
      title: '📦 Solicitud enviada',
      description: `Resupply de ${resourceName} solicitado exitosamente`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertBanner
                key={alert.id}
                message={alert.message}
                resourceName={alert.resourceName}
              />
            ))}
          </div>
        )}

        {/* Stats Overview */}
        <StatsOverview />

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resourceList.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onRequestResupply={() =>
                handleResupply(resource.id, resource.name)
              }
            />
          ))}
        </div>
     
          {/* Historial logs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-10">

        {/* 3/4 Historial */}
      <div className="lg:col-span-3 glass rounded-xl p-4 h-[500px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-3">📜 Historial de Inventario</h2>

        <div className="space-y-2">
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          )}

          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-md bg-secondary text-sm font-mono shadow-sm"
            >
              <span className="text-xs opacity-70">{log.timestamp}</span>
              <br />
              {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* 1/4 Alertas críticas */}
      <div className="lg:col-span-1 glass rounded-xl p-4 h-[500px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-3">🚨 Alertas Críticas</h2>

        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay alertas críticas.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertBanner
                key={alert.id}
                message={alert.message}
                resourceName={alert.resourceName}
              />
            ))}
          </div>
        )}
      </div>
    </div>



        {/* Footer Info */}
        <div className="glass p-4 rounded-lg text-center text-sm text-muted-foreground">
          <p className="font-mono">
            🛰️ Sistema sincronizado con Tierra • Latencia: ~3-22 min • Próxima ventana de comunicación: 04:23 UTC
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
