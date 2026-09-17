# Infrastructure — Adapters — Output

Contiene los **adaptadores de salida (driven adapters)**: implementaciones concretas de los puertos de salida definidos en el dominio.

## Ejemplos

- Repositorios con acceso a base de datos (TypeORM, Prisma, Mongoose)
- Clientes HTTP para servicios externos
- Adaptadores de envío de email / SMS
- Adaptadores de almacenamiento de archivos (S3, GCS)

## Convenciones

- Cada adaptador implementa un puerto de salida definido en `domain/ports`.
- Contiene todo el detalle de infraestructura (queries SQL, llamadas HTTP, etc.).
- Fácilmente reemplazable gracias a la inversión de dependencias.
