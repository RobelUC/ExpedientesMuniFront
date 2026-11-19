# Paso 7 - Frontend OWASP

Base `2ae69fc`. Cambios compatibles con el backend existente y con los controles
nuevos: cuentas individuales opcionales anunciadas por `/api/capacidades`,
consulta `/api/sesion`, mensaje para 429 sin reintentos automáticos, eliminación
del autenticador simulado sin consumidores, higiene de archivos y cabeceras
Vercel con CSP en modo solo informe.

Las mismas familias de fuentes e iconos se sirven desde `public/fonts/`, con
licencias, origen y hashes verificables mediante `python scripts/verify_assets.py`.
No se acredita revisión visual en tres navegadores. Se conserva el visor nativo
sin sandbox hasta comprobar su compatibilidad. El ZIP de ocho casos ficticios
procede de `scripts/academic_examples.py` del backend y se regenera con
`python -m scripts.build_demo_zip --output ../frontend/public/ejemplos-demo.zip`.
El generador de cuatro casos OCR es otro script y no debe sustituir ese paquete.

Crear `.env.local` a partir de `.env.example`; `.env` permanece local y deja de
estar versionado. En Vercel configurar `VITE_API_URL` con la URL HTTPS del backend;
ningún token va en variables VITE. Si cambia el origen, actualizar también
`connect-src` en `vercel.json` y los CORS del servidor.

Ver `docs/IMPLEMENTACION_OWASP.md` del backend para banderas, pruebas, amenazas,
rotación, cifrado, rollback y trabajo pendiente. El backend debe publicarse
primero. Los workflows y Dependabot están preparados, pero no se ejecutaron en
GitHub ni se cambiaron permisos de rama. No se modificaron Vercel/Render.

Este trabajo corresponde al paso 7. La auditoría de implementación (06) y la
validación integral (07) son pasos posteriores; no se asigna score ni se declara
cumplimiento de criterios de producción.

Verificación local: 53 pruebas aprobadas incluida integración HTTP con backend,
TypeScript y build Vite correctos, npm audit sin avisos e integridad de fuentes
verificada. Reportes de dependencias en `docs/evidencias_owasp/`.
