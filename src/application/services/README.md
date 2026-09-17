# Application — Services

Contiene los **servicios de aplicación**: lógica transversal que no pertenece a un caso de uso específico (ej. logging, validación cruzada, transformaciones de datos).

## Convenciones

- Los servicios son stateless siempre que sea posible.
- Pueden ser utilizados por múltiples casos de uso.
- No deben acceder directamente a infraestructura; usan puertos si es necesario.
