import { useEffect, useState } from 'react';
import { useResourceStore } from '@/store/useResourceStore';
import { ResourceCard } from '@/components/ResourceCard';
import { AlertBanner } from '@/components/AlertBanner';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { resources, requestResupply, consumeResource } = useResourceStore();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<string[]>([]);

  // Simulate resource consumption
  useEffect(() => {
    const interval = setInterval(() => {
      const resourceIds = Object.keys(resources) as Array<keyof typeof resources>;
      const randomResource = resourceIds[Math.floor(Math.random() * resourceIds.length)];
      const consumptionAmount = Math.floor(Math.random() * 10) + 5;
      consumeResource(randomResource, consumptionAmount);
    }, 5000);

    return () => clearInterval(interval);
  }, [resources, consumeResource]);

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
