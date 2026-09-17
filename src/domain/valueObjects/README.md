# Domain — Value Objects

Contiene los **Value Objects** del dominio: objetos inmutables sin identidad propia que se comparan por valor.

## Convenciones

- Cada Value Object se define en su propio archivo (ej. `Email.ts`, `Money.ts`).
- Son inmutables: nunca modificar su estado después de la creación.
- Implementar `equals()` para comparación por valor.
