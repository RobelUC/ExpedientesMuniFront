import type { ExpedienteRepositoryPort } from '@domain/ports/ExpedienteRepositoryPort';

export class DownloadDocumentUseCase {
  constructor(private readonly repository: ExpedienteRepositoryPort) {}
  async execute(id: string, index: number): Promise<void> {
    const blob = await this.repository.getDocumentPdf(id, index);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `segmento-${index + 1}.pdf`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
