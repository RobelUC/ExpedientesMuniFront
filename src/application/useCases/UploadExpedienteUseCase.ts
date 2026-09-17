import type { Expediente } from '@domain/entities/Expediente';
import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';

export class UploadExpedienteUseCase {
  constructor(private readonly expedienteRepo: ExpedienteRepositoryPort) {}

  async execute(file: File): Promise<Expediente> {
    return this.expedienteRepo.uploadExpediente(file);
  }
}
