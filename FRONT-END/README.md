# Consola Marte – Frontend

Interfaz en React + Tailwind que consume la API de recursos marcianos y presenta una consola en tiempo real con barras de capacidad, alertas y bitácora de eventos para el equipo de operaciones.

## Stack
- React 18 creado con Vite.
- Tailwind CSS + Headless UI para componentes accesibles.
- Zustand (o Redux Toolkit) para manejar el estado global de recursos.
- Axios/SWR para llamadas a la API del backend Nest.

## UX imaginada
1. **Panel principal** muestra tarjetas de `Agua`, `Oxígeno`, `Energía`, `Alimentos` con barras llenado según `%`.
2. **Vista consola** lista eventos entrantes (`station-03 envió alerta de oxígeno`).
3. **Modo oscuro permanente** pensado para operar dentro de cúpulas y evitar reflejos.
4. **Alert Drawer** se abre automáticamente cuando Supabase emite un evento `alert`.

## Configuración
1. `npm install`
2. Crea `.env` con la URL del backend:
   ```bash
   VITE_API_URL=https://api.consola-marte.local
   VITE_WS_URL=wss://api.consola-marte.local/alerts
   ```
3. Ejecuta `npm run dev` para modo desarrollo o `npm run build` + `npm run preview` para revisar el build.

## Estructura sugerida
```
src/
 ├─ components/ResourceGauge.tsx
 ├─ modules/resources/api.ts
 ├─ modules/resources/store.ts
 ├─ pages/Dashboard.tsx
 └─ styles/tailwind.css
```

## Buenas prácticas
- Centraliza colores y gradientes de Tailwind en `tailwind.config.js` para mantener la estética “habitat marciano”.
- Usa `aria-live="polite"` en los contenedores de alertas para operadores con lectores de pantalla.
- Mockea la API con `msw` cuando no tengas el backend disponible.

## Próximos pasos
- Añadir modo kiosko para pantallas grandes en el centro de mando.
- Integrar gráficos históricos con Recharts.
- Automatizar despliegue en Vercel apuntando al backend Nest en Render/Fly.
