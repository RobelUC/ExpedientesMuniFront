import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';

export class ConfirmExpedienteUseCase {
  constructor(private readonly expedienteRepo: ExpedienteRepositoryPort) {}

  async execute(tramiteId: string, data: any): Promise<void> {
    return this.expedienteRepo.confirmData(tramiteId, data);
  }
}
