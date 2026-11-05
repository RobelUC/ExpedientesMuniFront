import type { Expediente } from '@domain/entities/Expediente';

export class CreateProtectedExportUseCase {
  execute(expediente: Expediente) {
    return {
      id: expediente.id, fileName: `expediente-${expediente.id}.pdf`, totalPages: expediente.totalPages,
      status: expediente.status, consistency: expediente.consistency,
      privacy: { tecnica: expediente.privacy?.tecnica || 'DATOS_OCULTOS',
        advertencia: expediente.privacy?.advertencia, transmision_externa_habilitada: false },
      sections: expediente.sections.map(section => ({
        id: section.id, title: section.title, pageRange: section.pageRange,
        fields: section.maskedFields || section.fields.map(field => ({ ...field, value: '[OCULTO]' })),
      })),
    };
  }
}
