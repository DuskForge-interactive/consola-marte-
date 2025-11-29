import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResourceStore } from "@/store/useResourceStore";
import { Header } from "@/components/Header";
import { AlertBanner } from "@/components/AlertBanner";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis } from "recharts";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchResourceByCode, type ResourceCard } from "@/lib/api";

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
};

const generarMensajeDummy = () => {
  const mensajes = [
    "Ajuste automático detectado.",
    "Lectura de sensores recalibrada.",
    "Movimiento registrado en el módulo.",
    "Nueva telemetría recibida desde órbita.",
    "Nivel ajustado por ciclo de consumo.",
    "Sincronización completada.",
    "Modificación registrada en el sistema.",
    "Análisis interno actualizado."
  ];

  return mensajes[Math.floor(Math.random() * mensajes.length)];
};

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

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Dummy logs by websocket simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const log: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        message: generarMensajeDummy()
      };
      setLogs(prev => [log, ...prev]);
    }, Math.random() * 2000 + 2000);

    return () => clearInterval(interval);
  }, []);

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

    toast({
      title: "📦 Solicitud Enviada",
      description: `Resupply de ${resource.name} solicitado exitosamente.`
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
  const chartData = useMemo(() => {
    const values: number[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const nextValue = Math.max(
        0,
        resource.currentPercentage - i * resource.consumptionRatePerMinute
      );
      values.push(Number(nextValue.toFixed(2)));
    }
    return values.map((value, index) => ({
      label: `T-${values.length - index}`,
      value,
    }));
  }, [resource]);

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
                <p className="text-2xl font-bold">
                  {percentage.toFixed(2)}% restante
                </p>
              </div>

              {resource.isCritical && (
                <div className="text-red-500 font-semibold">
                  🚨 Nivel crítico
                </div>
              )}
            </div>

            {/* Gráfica */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="currentColor"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                {logs.map(log => (
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
