import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResourceStore } from "@/store/useResourceStore";
import { Header } from "@/components/Header";
import { AlertBanner } from "@/components/AlertBanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchResourceByCode, type ResourceCard } from "@/lib/api";
import { ResourceHistoryChart } from "@/components/ResourceHistoryChart";
import { useResourceHistory } from "@/hooks/use-resource-history";

const ResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const resourcesRecord = useResourceStore((state) => state.resources);
  const requestResupply = useResourceStore((state) => state.requestResupply);
  const code = (id || "").toUpperCase();
  const resourceFromStore = resourcesRecord[code];
  const [fetchedResource, setFetchedResource] = useState<ResourceCard | null>(null);
  const [loading, setLoading] = useState(!resourceFromStore);
  const resource = resourceFromStore ?? fetchedResource;

  const [alerts, setAlerts] = useState<string[]>([]);
  const {
    points: historyPoints,
    loading: historyLoading,
    error: historyError,
  } = useResourceHistory(resource?.id);

  useEffect(() => {
    if (resourceFromStore || !code) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchResourceByCode(code);
        setFetchedResource(data);
      } catch (error) {
        console.error("Failed to load resource", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [code, resourceFromStore]);

  useEffect(() => {
    if (!resource) {
      setAlerts([]);
      return;
    }

    if (resource.isCritical) {
      setAlerts([
        `${resource.name} ha caído a ${resource.currentPercentage.toFixed(
          2
        )}% (umbral ${resource.criticalPercentage}%).`,
      ]);
    } else {
      setAlerts([]);
    }
  }, [resource]);

  const handleRequestResupply = () => {
    if (!resource) {
      return;
    }
    requestResupply(resource.id);
    const resupplyAmount = resource.safetyStockAmount;
    const capacityLimit =
      typeof resource.maxCapacity === 'number'
        ? resource.maxCapacity
        : Number.POSITIVE_INFINITY;
    const projectedTotal = Math.min(
      capacityLimit,
      (resource.currentQuantity ?? 0) + resupplyAmount
    );
    const formatAmount = (value: number) =>
      value.toLocaleString(undefined, { maximumFractionDigits: 2 });

    toast({
      title: "📦 Reabastecimiento aplicado",
      description: `+${formatAmount(resupplyAmount)} ${resource.unit}. Inventario proyectado: ${formatAmount(projectedTotal)} ${resource.unit}.`
    });
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Cargando recurso...</h2>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Recurso no encontrado</h2>
      </div>
    );
  }

  const percentage = resource.currentPercentage;
  const percentageColor = 'text-foreground';
  const autonomyHours = resource.autonomyHours;
  const autonomyDays =
    autonomyHours === null ? null : Number((autonomyHours / 24).toFixed(1));
  const timeline = useMemo(
    () =>
      [...historyPoints].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [historyPoints]
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-6">

        {/* Botón de volver */}
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        {/* Título del recurso */}
        <section>
          <h1 className="text-3xl font-bold mt-4">
            {resource.name}
          </h1>
          <p className="text-muted-foreground">
            Estado detallado del recurso y eventos registrados.
          </p>
        </section>

        {/* Datos principales del recurso */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">

          {/* Panel principal: 3/4 */}
          <div className="lg:col-span-3 glass rounded-xl p-6 space-y-6">

            {/* Indicadores */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Nivel actual:</p>
                <p className={`text-2xl font-bold ${percentageColor}`}>
                  {percentage.toFixed(2)}% restante
                </p>
                <p className="text-sm text-muted-foreground">
                  {(resource.currentQuantity ?? 0).toLocaleString()} {resource.unit} disponibles
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Capacidad máxima:{' '}
                  {resource.maxCapacity !== null
                    ? resource.maxCapacity.toLocaleString()
                    : 'N/D'} {resource.unit}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Ventana segura ({resource.safeWindowHours}h):{' '}
                  {resource.safetyStockAmount.toLocaleString()} {resource.unit}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Autonomía:{' '}
                  {autonomyHours === null
                    ? 'Estable'
                    : `${autonomyHours.toFixed(1)} h (${
                        autonomyDays !== null ? `${autonomyDays} d` : '~'
                      })`}
                </p>
              </div>

              {resource.isCritical && (
                <div className="text-red-500 font-semibold">
                  🚨 Nivel crítico
                </div>
              )}
            </div>

            <ResourceHistoryChart
              title="Historial de mediciones"
              loading={historyLoading}
              error={historyError}
              points={historyPoints}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="glass p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Consumo neto</p>
                <p className="text-lg font-semibold">
                  {resource.totalConsumptionPerHour.toFixed(2)} {resource.unit}/h
                </p>
              </div>
              <div className="glass p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Consumo por persona</p>
                <p className="text-lg font-semibold">
                  {resource.perCapitaConsumptionPerHour.toFixed(2)} {resource.unit}/h
                </p>
              </div>
              <div className="glass p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Población cubierta</p>
                <p className="text-lg font-semibold">
                  {resource.population.toLocaleString()} colonos
                </p>
              </div>
            </div>

            {/* Botón de resupply */}
            <Button
              className="w-full"
              onClick={handleRequestResupply}
            >
              Solicitar reabastecimiento
            </Button>

            {/* Historial específico */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">
                📜 Historial de Eventos del Recurso
              </h2>

              <div className="h-[250px] overflow-y-auto space-y-2">
                {historyLoading && (
                  <p className="text-sm text-muted-foreground">
                    Cargando historial...
                  </p>
                )}

                {historyError && !historyLoading && (
                  <p className="text-sm text-destructive">{historyError}</p>
                )}

                {!historyLoading && timeline.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin eventos registrados aún.
                  </p>
                )}

                {timeline.map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className="p-2 rounded-md bg-secondary text-sm font-mono shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs opacity-70">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <br />
                      {entry.isCritical ? "⚠️ Crítico" : "✅ Estable"}
                    </div>
                    <div className="font-semibold">
                      {entry.percentage.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alertas críticas */}
          <div className="glass rounded-xl p-6 h-full">
            <h2 className="text-xl font-semibold mb-3">
              🚨 Alertas del Recurso
            </h2>

            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin alertas activas.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <AlertBanner
                    key={index}
                    message={alert}
                    resourceName={resource.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourcePage;
