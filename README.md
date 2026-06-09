# NEXOPAY Frontend

Frontend React (Vite) orientado a una experiencia futurista "street" con neon y grafitis. Esta rama contiene el frontend funcional listo para configurar variables de AWS y desplegar.

Instalación rápida:

```bash
npm install
npm run dev
```

Variables de entorno (ver `.env.example`):

- `VITE_AWS_REGION` — región AWS
- `VITE_AWS_SNS_ARN` — ARN para mensajería (opcional)
- `VITE_API_BASE` — API propia
- `VITE_COINGECKO_BASE` — opcional para datos de mercado

Servicios sugeridos:
- Datos de mercado: CoinGecko (gratuito) — ya usado en `src/services/api.js`.
- Mensajería / notificaciones: AWS SNS / SES para alertas.
 - Fondo animado premium: se integró una escena Three.js personalizada en `src/components/CityBackground.jsx` que simula una ciudad en movimiento con luces y edificios (requiere `three` en dependencias).

Estructura principal creada:

- `src/components` — componentes UI (Navbar, LeftPanel, RightPanel, TradePanel, CurrencyCard)
- `src/providers` — `CurrencyProvider`, `AuthProvider`
- `src/hooks` — hooks utilitarios
- `src/services` — integraciones externas (CoinGecko)
- `.env.example` — plantilla de variables

Listo para producción:
- Rellenar `.env` con los valores reales.
- Ejecutar `npm run build` y desplegar el directorio `dist` en su CDN o hosting preferido.
