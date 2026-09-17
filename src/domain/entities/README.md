# Domain — Entities

Contiene las **entidades del dominio**: objetos con identidad única que encapsulan las reglas de negocio más fundamentales.

## Convenciones

- Cada entidad se define en su propio archivo (ej. `User.ts`, `Order.ts`).
- Las entidades no deben depender de capas externas (application, infrastructure).
- Exportar desde `index.ts` para facilitar importaciones con barrel.
