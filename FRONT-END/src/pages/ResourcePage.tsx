import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResourceStore } from "@/store/useResourceStore";
import { Header } from "@/components/Header";
import { AlertBanner } from "@/components/AlertBanner";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
};

const dummyHistory = [
  { day: "Mon", value: 80 },
  { day: "Tue", value: 75 },
  { day: "Wed", value: 60 },
  { day: "Thu", value: 55 },
  { day: "Fri", value: 50 }
];

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
  const { resources, requestResupply } = useResourceStore();

  const resource = resources[id as keyof typeof resources];

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

  // Compute alerts
  useEffect(() => {
    if (!resource) return;

    if (resource.current <= resource.criticalLevel) {
      setAlerts([
        `${resource.name} ha caído a ${resource.current} ${resource.unit}. Nivel crítico alcanzado.`
      ]);
    } else {
      setAlerts([]);
    }
  }, [resource]);

  const handleRequestResupply = () => {
    requestResupply(resource.id);

    toast({
      title: "📦 Solicitud Enviada",
      description: `Resupply de ${resource.name} solicitado exitosamente.`
    });
  };

  if (!resource) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Recurso no encontrado</h2>
      </div>
    );
  }

  const percentage = Math.round((resource.current / resource.max) * 100);

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
                  {resource.current} {resource.unit} ({percentage}%)
                </p>
              </div>

              {resource.current <= resource.criticalLevel && (
                <div className="text-red-500 font-semibold">
                  🚨 Nivel crítico
                </div>
              )}
            </div>

            {/* Gráfica */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyHistory}>
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
