import { useEffect, useState } from 'react';
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

const Index = () => {
  const { resources, requestResupply, consumeResource } = useResourceStore();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);


  // Simulate resource consumption
  useEffect(() => {
    const interval = setInterval(() => {
      const resourceIds = Object.keys(resources) as Array<keyof typeof resources>;
      const randomResource = resourceIds[Math.floor(Math.random() * resourceIds.length)];
      const consumptionAmount = Math.floor(Math.random() * 10) + 5;
      consumeResource(randomResource, consumptionAmount);
    }, 10000);

    

    return () => clearInterval(interval);
  }, [resources, consumeResource]);


      const generarMensajeDummy = () => {
  const mensajes = [
    "Oxígeno ajustado debido a variación de consumo.",
    "Reserva de agua actualizada tras ciclo de purificación.",
    "Revisión automática de filtros completada.",
    "Módulo de energía registró un ligero descenso.",
    "Nuevo paquete enviado desde plataforma orbital.",
    "Sincronizando datos del inventario con estación base.",
    "Análisis de nutrientes recalculado.",
    "Movimiento detectado en el almacén 3."
  ];
  
  return mensajes[Math.floor(Math.random() * mensajes.length)];
};
    //simulate historial logs
    useEffect(() => {
  // Simulación de WebSocket dummy
      const interval = setInterval(() => {
        const fakeLog: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          message: generarMensajeDummy()
        };

        setLogs(prev => [fakeLog, ...prev]); // se agrega arriba igual que un WS real
      }, Math.random() * 2000 + 2000); // cada 2–4 sec

      return () => clearInterval(interval);
    }, []);





  // Check for critical resources
  useEffect(() => {
    const criticalResources = Object.values(resources).filter(
      (r) => r.current <= r.criticalLevel
    );

    const newAlerts = criticalResources.map(
      (r) => `${r.name} ha caído a ${r.current} ${r.unit} - Nivel peligroso detectado`
    );

    setAlerts(newAlerts);

    // Show toast for new critical alerts
    criticalResources.forEach((r) => {
      if (r.current <= r.criticalLevel && r.current > r.criticalLevel - 50) {
        toast({
          variant: 'destructive',
          title: '🚨 Alerta Crítica',
          description: `${r.name} está en nivel peligroso: ${r.current} ${r.unit}`,
        });
      }
    });
  }, [resources, toast]);

  const handleResupply = (resourceId: keyof typeof resources) => {
    requestResupply(resourceId);
    toast({
      title: '📦 Solicitud Enviada',
      description: `Resupply de ${resources[resourceId].name} solicitado exitosamente`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <AlertBanner
                key={index}
                message={alert}
                resourceName={Object.values(resources)[index]?.name || ''}
              />
            ))}
          </div>
        )}

        {/* Stats Overview */}
        <StatsOverview />

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(resources).map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onRequestResupply={() => handleResupply(resource.id)}
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
            {alerts.map((alert, index) => (
              <AlertBanner
                key={index}
                message={alert}
                resourceName={Object.values(resources)[index]?.name || ''}
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
