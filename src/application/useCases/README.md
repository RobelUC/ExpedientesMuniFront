# Application — Use Cases

Contiene los **casos de uso** de la aplicación: orquestadores que coordinan entidades, value objects y puertos para cumplir un objetivo de negocio.

## Convenciones

- Un caso de uso por archivo (ej. `CreateUser.ts`, `PlaceOrder.ts`).
- Cada caso de uso recibe sus dependencias (puertos) por inyección en el constructor.
- No debe contener lógica de infraestructura (HTTP, DB, etc.).
