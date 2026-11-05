# Auditoría de integración y resultado

La ampliación posterior del PMV HU01–HU04 está documentada en [el informe por escenarios](https://github.com/PGTEV/Back-End-TP/blob/codex/pmv-hu01-hu04/docs/PMV_HU01_HU04.md): 67 pruebas backend y 34 frontend aprobadas. Los resultados siguientes conservan el registro de la integración inicial.

Repositorios correctos: `RobelUC/ExpedientesMuniFront` (base `c281dab43526a398107b65621b916876448f212d`) y `PGTEV/Back-End-TP` (base `881466515db6a30ff713e8902bb51828a8066480`). El repositorio de Andree250 indicado inicialmente por error no es la base de estos cambios del backend.

## Hallazgos y correcciones

1. El cliente original permitía fallback a localhost en producción. Se normaliza VITE_API_URL y se exige HTTPS y configuración explícita. El frontend ya desplegado sí contiene la URL correcta de Render.
2. `confirmData` simulaba guardado. La carga del backend ya persiste original y extracción; el botón ahora verifica esa copia mediante GET y rechaza discrepancias. No hay endpoint de actualización de campos.
3. Todos los estados se mostraban procesados. Se distinguen pendiente, procesado y error; los estados no reconocidos se rechazan.
4. El acceso usaba admin/admin. La composición real valida un token de evaluador con el servidor. El backend añade protección configurable a carga, consulta y catálogo; el token permanece en memoria. Sigue siendo un control de prototipo compartido, sin usuarios individuales ni autorización por expediente; se documenta una propuesta OIDC/BFF.
5. El visor mostraba un formulario ficticio. Ahora usa el PDF cargado y permite descargarlo; tras consultar por ID no se fabrica un original porque la API no expone descarga.
6. OCR ya era real y sigue aislado en su adaptador. Se conservan PyMuPDF, RapidOCR y el diagnóstico `/health/ia`; no se activan proveedores externos ni se atribuye revisión humana a una confianza OCR alta.
7. La revisión TUPA no estaba conectada en React. Se integran catálogo, flujo y validación mediante puerto/caso de uso/adaptador, con fundamento, páginas y control de versión. La vigencia normativa del catálogo piloto no está certificada.
8. Se mejoran errores HTTP/red/proxy, timeout, estados de carga, bloqueo de reenvíos simultáneos y mensajes de persistencia. Los POST no se reintentan automáticamente. Se retiran precisión, SLA y TLS ficticios de la interfaz, conservando estilos.
9. El preflight CORS del despliegue actual ya autoriza `https://expedientes-muni-front.vercel.app`. Se prueba el caso permitido y el rechazo de otro origen. CORS no sustituye autenticación.
10. Se conserva la conexión Supabase/PostgreSQL y `/health/db`. La BD duradera no conserva por sí sola los originales del almacenamiento local: verificar disco o implementar almacenamiento de objetos antes de afirmar persistencia completa en Render.

## Validación local

- 28 pruebas del frontend aprobadas, incluida comunicación HTTP real de los adaptadores TypeScript con la fábrica FastAPI del repositorio PGTEV, PDF sintético, SQLite y token efímero.
- TypeScript y compilación Vite aprobados; Node 24 y Python 3.12.
- 55 pruebas del backend correcto aprobadas, con versiones de requirements.lock.txt. Incluyen OCR real, persistencia, concurrencia TUPA, autenticación, CORS, los diagnósticos existentes y normalización de URLs PostgreSQL.
- No se probó una conexión real a Supabase ni el renderizado visual del visor nativo en navegador. Las pruebas del visor comprueban sus enlaces y parámetros.
- Se conservan dos advertencias de deprecación de Starlette/AnyIO, sin fallos.

## Publicación

Antes de fusionar el frontend en producción: publicar el backend, activar PROTECT_DOSSIER_ROUTES=true y configurar REVIEWER_TOKEN/REVIEWER_ID solo en Render. Conservar DATABASE_URL de Supabase y verificar el almacenamiento de originales. Vercel debe compilar con `VITE_API_URL=https://back-end-tp.onrender.com/api`. La rama del frontend requiere esa protección y no permite acceso contra la versión anterior sin configurar.

Las comprobaciones del despliegue anterior fueron GET/OPTIONS sin datos personales ni escrituras. No se cambiaron variables de Vercel/Render. Publicar ramas en GitHub no equivale a fusionarlas en main ni acredita que producción haya sido actualizada.
