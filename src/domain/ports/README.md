# Domain — Ports

Contiene los **puertos** (interfaces) que definen los contratos entre el dominio y el mundo exterior. Este es el corazón de la **Arquitectura Hexagonal**.

## Convenciones

- **Puertos de entrada (driving ports):** interfaces que exponen los casos de uso al exterior (ej. `CreateUserPort.ts`).
- **Puertos de salida (driven ports):** interfaces que el dominio necesita del exterior (ej. `UserRepository.ts`, `EmailNotifier.ts`).
- Los puertos solo definen interfaces/tipos, nunca implementaciones.
