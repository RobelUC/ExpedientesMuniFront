# GobExpedientes AI — integración con FastAPI

Se conserva React/TypeScript y la separación dominio → puertos → casos de uso → adaptadores. La composición real usa `ApiExpedienteAdapter`, `ApiAuthAdapter` y `ApiTupaAdapter`; los adaptadores de demostración siguen disponibles en el código y no se incluyen en la composición real. Se conservan estilos y estructura del portal.

## Ejecutar y verificar

Node 24 recomendado (`.nvmrc`); las herramientas de pruebas requieren Node 22.12+, 24 o 26+. Desde este repositorio:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Configurar primero el backend hexagonal con `PROTECT_DOSSIER_ROUTES=true`, `REVIEWER_TOKEN` y `REVIEWER_ID`. El acceso valida la credencial mediante `GET /api/tupa/procedimientos`, una ruta existente protegida en ese modo. `/api/capacidades` anuncia la protección sin revelar secretos. El nombre introducido es un alias visual: la identidad de auditoría procede de REVIEWER_ID. El token se introduce en el formulario, se guarda solo en memoria y se borra al cerrar sesión o recibir 401. No existe una sesión persistente ni se trata de una autenticación multiusuario.

```powershell
npm test
npm run lint
npm run build
```

`tests/integration.test.ts` conecta los adaptadores con un proceso FastAPI real, un PDF sintético y almacenamiento temporal. Se ejecuta si el backend está junto a este repositorio en `../backend` con `.venv`; también se puede establecer `BACKEND_PYTHON` con la ruta de su intérprete. Sin ese entorno se omite esa prueba y siguen ejecutándose las pruebas unitarias y de componentes. No usa Vercel/Render, datos reales ni claves reales. Las pruebas del visor comprueban el enlace al PDF y controles; la visualización, páginas y zoom dependen del visor PDF nativo del navegador. Se ofrece enlace alternativo de apertura.

## Contratos realmente utilizados

- `GET /api/capacidades`: compatibilidad y modo de protección.
- `POST /api/expedientes`: multipart con campo `archivo`. El 201 acredita procesamiento y escritura de la extracción; el servidor conserva el original.
- `GET /api/expedientes/{id}`: consulta y verificación de la extracción persistida. El botón «Verificar guardado en BD» usa esta lectura, no una escritura ficticia. No hay endpoint de actualización de campos. Si la copia ha cambiado o no está procesada se informa un error.
- `GET /api/tupa/procedimientos`: catálogo piloto con requisitos.
- `GET /api/expedientes/{id}/flujo`: revisión persistida y número de versión.
- `POST /api/expedientes/{id}/validacion`: guarda revisiones humanas con `codigo_tupa`, `revision` y `verificaciones`. El servidor decide el resultado; el OCR solo propone evidencia. Ante 409, recargar explícitamente el flujo y revisar antes de reenviar.

`PROCESANDO` se muestra pendiente; `PROCESADO`, procesado; `ILEGIBLE`, `INVALIDO` y `ERROR`, error. Se rechazan estados desconocidos. La confianza OCR no se presenta como verificación humana. La duración es el tiempo observado de la solicitud, no la hora de creación.

El visor y la descarga PDF usan el `File` de la carga con una URL blob, revocada al sustituir el archivo o cerrar sesión. Al consultar un expediente anterior no se inventa una descarga: la API no expone el original. El JSON de extracción sí puede exportarse. El servidor no dispone de un endpoint de previsualización por página.

El cliente tiene tiempo límite de 180 segundos y nunca reenvía automáticamente POST. Un fallo de red o timeout no acredita que el servidor haya cancelado o revertido la carga. Conservar el ID cuando esté disponible y consultar antes de volver a cargar. Sin ID ni clave de idempotencia, no se puede resolver automáticamente una respuesta perdida.

## Vercel

### Cambios del backend para el mantenedor

La cuenta conectada tiene lectura, pero no escritura, en `Andree250/Back-End-TP02`. Se incluye el commit del backend como [parche Git](docs/0001-fix-protect-dossier-API-and-verify-React-integration.patch). El mantenedor puede aplicarlo con `git am` desde una rama basada en `97bb6d0b22ba5550a1dba690b0efc20cdc18f537`, revisar las diferencias y ejecutar pytest. El parche incluye las pruebas de contrato, la protección configurable y su guía DEPLOYMENT.md; no contiene credenciales reales. El commit local de referencia es `d359ee5`.

Publicar el backend y configurar las credenciales antes de fusionar este frontend en producción: el nuevo acceso rechaza servidores que todavía no anuncien la protección de expedientes. La prueba HTTP de frontend se ejecuta con ambos repositorios locales instalados; en un checkout independiente sin backend se omite únicamente esa prueba.

1. Publicar primero los cambios del backend y configurar su arranque como se indica en `../backend/DEPLOYMENT.md`. `src.main:app` es otra aplicación y no ofrece el contrato compatible.
2. En el proyecto de Vercel seleccionar Vite, instalación `npm ci`, build `npm run build`, salida `dist`, Node 24. En el repositorio independiente la raíz es `.`; en esta copia de trabajo es `frontend`.
3. Establecer `VITE_API_URL=https://SU-SERVICIO.onrender.com/api` con el dominio real. Se admite también el origen sin `/api`; el adaptador lo normaliza. En producción debe ser HTTPS y no contener credenciales ni parámetros. Si falta, se muestra un error de configuración al usar la API, sin recurrir a localhost.
4. Aplicar la variable a Production y a los entornos Preview que se vayan a usar, y volver a compilar/desplegar. Las variables VITE se sustituyen durante el build y son públicas: nunca poner tokens o contraseñas en ellas. [Documentación de Vite](https://vite.dev/guide/env-and-mode), [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).
5. Configurar en Render el origen exacto del frontend en `CORS_ORIGINS`. Una URL Preview tiene otro origen y requiere una entrada explícita. No habilitar todas las cuentas de `vercel.app` mediante comodín.

No se han desplegado estos cambios ni se ha verificado el dominio activo. La prueba HTTP local no sustituye comprobar la configuración real del proveedor. El token compartido es un mecanismo de prototipo; ver la propuesta de identidad individual del backend antes de usar expedientes reales.
