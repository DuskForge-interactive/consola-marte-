# Consola Marte – API

API en NestJS que envía el estado de los recursos vitales en Marte para que los clientes puedan reaccionar rápido a la escasez. Expone lecturas históricas y permite registrar nuevos reportes provenientes de los sensores de cada colonia.

## Tecnologías
- NestJS 10 (REST + WebSocket Gateway opcional)
- Supabase (PostgreSQL administrado + Auth)
- Prisma u ORM favorito como capa de acceso a datos

## Arquitectura
1. **Supabase** aloja la base `mars_resources` con tablas como `resources`, `alerts` y `stations`.
2. **Módulo `Resources`** ofrece endpoints `GET /resources`, `GET /resources/:id` y `POST /resources` para nuevos reportes.
3. **Módulo `Alerts`** evalúa umbrales (ej. agua < 25%) y publica WebSocket `alerts` para que la consola del frente se actualice al instante.
4. **DTOs y Pipes** validan que cada reporte incluya `type`, `percentage`, `updatedAt` y `stationId`.

## Configuración rápida
1. Instala dependencias: `npm install`.
2. Crea `.env` basado en `.env.example` con:
   ```bash
   SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SERVICE_ROLE=<service_key>
   DATABASE_URL=postgresql://postgres:<pwd>@db.<hash>.supabase.co:5432/postgres
   PORT=3001
   ```
   > El servicio `ResourcesRealtimeService` escucha cambios en `resource_status` usando Supabase Realtime, por lo que **SUPABASE_URL** y **SUPABASE_SERVICE_ROLE** (o `SUPABASE_ANON_KEY` si prefieres) deben estar presentes para que la consola reciba actualizaciones en caliente.
3. Sincroniza el esquema (`npx prisma migrate dev`) o ejecuta los scripts SQL de `supabase/schema`.
4. Levanta la API: `npm run start:dev`.

## Endpoints base
| Método | Ruta              | Uso                                                       |
|--------|-------------------|-----------------------------------------------------------|
| GET    | `/health`         | Pulso del servicio.                                       |
| GET    | `/resources`      | Último estado de cada recurso (agua, oxígeno, energía).   |
| POST   | `/resources`      | Inserta lectura desde un sensor autorizado.               |
| GET    | `/alerts`         | Alertas activas cuando algún recurso cae bajo mínimos.    |

Todos los POST requieren `Authorization: Bearer <supabase_jwt>` emitido por Supabase Auth.

## Scripts útiles
- `npm run lint`: asegura estilo uniforme.
- `npm run test`: pruebas unitarias de los módulos `resources` y `alerts`.
- `npm run seed`: carga datos ficticios para simular una base en Marte.

## Próximos pasos
- Automatizar ingestión cada 5 minutos desde los rovers.
- Añadir colas (BullMQ) para cálculos pesados.
- Exponer métricas Prometheus para monitorear consumo y latencia.
