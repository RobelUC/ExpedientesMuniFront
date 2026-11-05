# GobExpedientes AI — integración con FastAPI

**Ingreso y cruce de anexos:** campos protegidos por defecto, vista original explícita, exportación protegida, alertas de DNI/RUC contradictorios y descarga de segmentos PDF reales. [Alcance, privacidad y pruebas](https://github.com/PGTEV/Back-End-TP/blob/codex/pmv-hu01-hu04/docs/PMV_INGRESO_PRIVACIDAD_AUDITORIA.md). Esta ampliación no necesita API key.

**Modo universitario:** con ACADEMIC_DEMO=true en el backend, el portal ofrece ocho PDFs ficticios para descargar, auditoría automática de práctica, modelo sintético y emisión simulada. Las acciones y los comprobantes identifican las simulaciones, sin banners globales repetidos. [Guion y fuente TUPA verificada](https://github.com/PGTEV/Back-End-TP/blob/codex/pmv-hu01-hu04/docs/DEMO_UNIVERSITARIA.md). No requiere claves externas ni constituye una integración municipal real.

Se conserva React/TypeScript y la separación dominio → puertos → casos de uso → adaptadores. La composición real usa `ApiExpedienteAdapter`, `ApiAuthAdapter` y `ApiTupaAdapter`; los adaptadores de demostración siguen disponibles en el código y no se incluyen en la composición real. Se conservan estilos y estructura del portal.

## Ampliación HU01–HU04

La revisión ahora incorpora alertas de faltantes, editor de borradores, historial de versiones, auditoría y destino local con clasificación/asignación manual. Las escrituras usan los endpoints existentes y su revisión optimista; no se sobrescriben cambios concurrentes. El texto sin guardar se conserva ante errores y bloquea una validación simultánea; la recarga explícita descarta los cambios locales.

El botón «Aprobar y Firmar» sigue deshabilitado sin firma, SISGEDOC y notificaciones. La sugerencia del TUPA no se presenta como predicción. No se generan probabilidades ni firmas simuladas. Evaluación por cada escenario, pruebas y dependencias pendientes: [informe PMV del backend](https://github.com/PGTEV/Back-End-TP/blob/codex/pmv-hu01-hu04/docs/PMV_HU01_HU04.md).

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

`tests/integration.test.ts` conecta los adaptadores con un proceso FastAPI real, un PDF sintético y almacenamiento temporal. Se ejecuta si el backend correcto está junto a este repositorio en `../backend-render` con `.venv`; también se puede establecer `BACKEND_ROOT` con su carpeta y `BACKEND_PYTHON` con la ruta de su intérprete. Sin ese entorno se omite esa prueba y siguen ejecutándose las pruebas unitarias y de componentes. No usa Vercel/Render, datos reales ni claves reales. Las pruebas del visor comprueban el enlace al PDF y controles; la visualización, páginas y zoom dependen del visor PDF nativo del navegador. Se ofrece enlace alternativo de apertura.

## Contratos realmente utilizados

- `GET /api/capacidades`: compatibilidad y modo de protección.
- `POST /api/expedientes`: multipart con campo `archivo`. El 201 acredita procesamiento y escritura de la extracción; el servidor conserva el original.
- `GET /api/expedientes/{id}`: consulta y verificación de la extracción persistida. El botón «Verificar guardado en BD» usa esta lectura, no una escritura ficticia. No hay endpoint de actualización de campos. Si la copia ha cambiado o no está procesada se informa un error.
- `GET /api/tupa/procedimientos`: catálogo piloto con requisitos.
- `GET /api/expedientes/{id}/flujo`: revisión persistida y número de versión.
- `POST /api/expedientes/{id}/validacion`: guarda revisiones humanas con `codigo_tupa`, `revision` y `verificaciones`. El servidor decide el resultado; el OCR solo propone evidencia. Ante 409, recargar explícitamente el flujo y revisar antes de reenviar.

`PROCESANDO` se muestra pendiente; `PROCESADO`, procesado; `ILEGIBLE`, `INVALIDO` y `ERROR`, error. Se rechazan estados desconocidos. La confianza OCR no se presenta como verificación humana. La duración es el tiempo observado de la solicitud, no la hora de creación.

El visor completo y su descarga usan el `File` de la carga con una URL blob, revocada al sustituir el archivo o cerrar sesión. Al consultar por ID, se pueden descargar los segmentos originales mediante la ruta implementada `GET /api/expedientes/{id}/documentos/{index}/pdf`, con Bearer y siempre que el original siga en el almacenamiento. La vista previa completa no se recupera automáticamente. El JSON protegido se exporta por defecto; la exportación original requiere mostrar los datos originales y pulsar su acción identificada.

El cliente tiene tiempo límite de 180 segundos y nunca reenvía automáticamente POST. Un fallo de red o timeout no acredita que el servidor haya cancelado o revertido la carga. Conservar el ID cuando esté disponible y consultar antes de volver a cargar. Sin ID ni clave de idempotencia, no se puede resolver automáticamente una respuesta perdida.

## Vercel

### Backend compatible

El repositorio correcto es [PGTEV/Back-End-TP](https://github.com/PGTEV/Back-End-TP). Consultar su guía [DEPLOYMENT.md](https://github.com/PGTEV/Back-End-TP/blob/codex/integracion-segura-react/DEPLOYMENT.md). La referencia inicial a Andree250/Back-End-TP02 correspondía a otro repositorio; se retiró su parche de esta integración. El backend correcto conserva Supabase y los diagnósticos existentes `/health/db` y `/health/ia`.

Publicar el backend y configurar las credenciales antes de fusionar este frontend en producción: el nuevo acceso rechaza servidores que todavía no anuncien la protección de expedientes. La prueba HTTP de frontend se ejecuta con ambos repositorios locales instalados; en un checkout independiente sin backend se omite únicamente esa prueba.

1. Publicar primero los cambios de PGTEV/Back-End-TP y configurar su arranque mediante `src.infrastructure.main:create_app --factory`, como indica su guía DEPLOYMENT.md.
2. En el proyecto de Vercel seleccionar Vite, instalación `npm ci`, build `npm run build`, salida `dist`, Node 24. En el repositorio independiente la raíz es `.`; en esta copia de trabajo es `frontend`.
3. Establecer `VITE_API_URL=https://back-end-tp.onrender.com/api`. Se admite también el origen sin `/api`; el adaptador lo normaliza. En producción debe ser HTTPS y no contener credenciales ni parámetros. Si falta, se muestra un error de configuración al usar la API, sin recurrir a localhost.
4. Aplicar la variable a Production y a los entornos Preview que se vayan a usar, y volver a compilar/desplegar. Las variables VITE se sustituyen durante el build y son públicas: nunca poner tokens o contraseñas en ellas. [Documentación de Vite](https://vite.dev/guide/env-and-mode), [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).
5. Configurar en Render el origen exacto del frontend en `CORS_ORIGINS`. Una URL Preview tiene otro origen y requiere una entrada explícita. No habilitar todas las cuentas de `vercel.app` mediante comodín.

No se han desplegado estos cambios ni se ha verificado el dominio activo. La prueba HTTP local no sustituye comprobar la configuración real del proveedor. El token compartido es un mecanismo de prototipo; ver la propuesta de identidad individual del backend antes de usar expedientes reales.
# Borradores con GPT

La revisión incluye **Analizar requisitos con Gemini**, disponible tras guardar la revisión TUPA si el backend anuncia ia_generativa.auditoria_tupa=true. Muestra hallazgos, páginas candidatas y procedencia sin enviar PDFs/OCR ni datos personales. La correspondencia automática local aparece en el detalle Cruce automático de categorías con requisitos TUPA. No sustituye la verificación de contenido, firmas o pagos.

También se admite Gemini: el botón y el modelo mostrado cambian según `/api/capacidades`. Configurar AI_PROVIDER=gemini, GEMINI_ENABLED=true, GEMINI_API_KEY y GEMINI_MODEL exclusivamente en Render; ver `docs/GEMINI.md` del backend. Se conserva el endpoint autenticado de generación y el soporte OpenAI. El botón explica bloqueos por cambios sin guardar o por emisión previa del expediente.

La revisión técnica incluye **Generar borrador con GPT**, habilitado cuando el backend anuncia `ia_generativa.configurada=true`. Genera una versión con procedencia OpenAI y permite revisarla/editarla con el historial existente. No sobrescribe cambios locales sin guardar. Configurar OPENAI_ENABLED, OPENAI_API_KEY y OPENAI_MODEL exclusivamente en Render según `docs/OPENAI.md` del backend; nunca usar una variable VITE para secretos. Desplegar primero el backend que implementa `POST /api/expedientes/{id}/borradores/ia`.
