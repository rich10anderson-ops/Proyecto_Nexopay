# NEXOPAY

Frontend React + Vite para NEXOPAY, con dashboard autenticado, login con Google, simulador de mercados, subida de documentos por S3 presigned URL y envio de email por AWS SES.

## Desarrollo Local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

En Windows, si PowerShell bloquea `npm.ps1`, usa:

```powershell
npm.cmd run dev
```

## Deploy en Vercel

El proyecto ya incluye `vercel.json`.

Configuracion esperada en Vercel:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Las rutas serverless quedan en:

- `POST /api/get-presigned-url`
- `POST /api/send-email`

## Variables de Entorno

Variables publicas del frontend:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_APP_API_BASE=
VITE_API_BASE=
VITE_COINGECKO_BASE=https://api.coingecko.com/api/v3
```

Variables privadas en Vercel, sin prefijo `VITE_`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-private-upload-bucket
SES_EMAIL=verified-sender@example.com
ALLOWED_ORIGIN=https://your-vercel-domain.vercel.app
S3_PRESIGNED_EXPIRES_IN=300
```

Notas:

- `VITE_APP_API_BASE` puede quedar vacio en Vercel para usar las funciones del mismo dominio.
- `SES_EMAIL` debe ser un remitente verificado en AWS SES.
- El bucket S3 debe permitir `PutObject` para el usuario IAM configurado.
- Para login real con Google, agrega el dominio de Vercel en los origenes autorizados del OAuth Client.

## Verificacion

```bash
npm run build
```

El build debe generar `dist/` sin errores.
