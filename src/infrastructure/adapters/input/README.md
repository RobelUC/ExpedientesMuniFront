# Infrastructure — Adapters — Input

Contiene los **adaptadores de entrada (driving adapters)**: implementaciones que reciben peticiones del exterior y las traducen a llamadas al dominio.

## Ejemplos

- Controladores HTTP / REST (Express, Fastify)
- Resolvers GraphQL
- Handlers de CLI
- Consumers de colas de mensajes

## Convenciones

- Cada adaptador implementa o invoca un puerto de entrada.
- Puede depender de frameworks de infraestructura (Express, etc.).
- Nunca contiene lógica de negocio.
