// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Expediente } from '../src/domain/entities/Expediente';
import { ExtractedDataPanel } from '../src/infrastructure/adapters/input/components/data/ExtractedDataPanel';
import { DocumentViewer } from '../src/infrastructure/adapters/input/components/viewer/DocumentViewer';
import { CreateProtectedExportUseCase } from '../src/application/useCases/CreateProtectedExportUseCase';

const expediente: Expediente = {
  id: 'id-ficticio', fileName: 'Persona Ficticia.pdf', fileSize: '1 MB', totalPages: 4, processingTime: '1 s', status: 'procesado',
  sections: [{ id: 'section-0', title: 'FUT', subtitle: 'OCR local', pageRange: [1, 1], icon: 'description', documentIndex: 0,
    fields: [{ label: 'Dni', value: '11111111' }, { label: 'Nombres', value: 'Persona Ficticia' }],
    maskedFields: [{ label: 'Dni', value: '[DNI_1]' }, { label: 'Nombres', value: '[NOMBRE_1]' }],
  }],
  privacy: { tecnica: 'SEUDONIMIZACION_LOCAL_PARCIAL', transmision_externa_habilitada: false, reemplazos_por_tipo: { DNI: 2, NOMBRE: 1 } },
  consistency: { estado: 'REQUIERE_REVISION', requiere_revision_humana: true, campos_comparados: ['dni'], fraude_determinado: false,
    advertencia: 'Una diferencia no constituye prueba de fraude.', alertas: [{ codigo: 'DNI_DIFIERE_ENTRE_ANEXOS', campo: 'dni', mensaje: 'DNI distintos; revisar los anexos.', fuentes: [
      { documento: 0, tipo: 'FUT', paginas: [1], valor_protegido: '[DNI_1]' },
      { documento: 3, tipo: 'RECIBO_PAGO', paginas: [4], valor_protegido: '[DNI_2]' },
    ] }] },
};
afterEach(cleanup);

describe('Ingreso protegido y cruce de anexos', () => {
  it('oculta los originales por defecto y los muestra solo por acción del evaluador', async () => {
    const user = userEvent.setup();
    const originalExport = vi.fn();
    render(<ExtractedDataPanel expediente={expediente} onSave={vi.fn()} onDownload={vi.fn()} onDownloadOriginal={originalExport} />);
    expect(screen.queryByText('11111111')).toBeNull();
    expect(screen.queryByText('Persona Ficticia')).toBeNull();
    expect(screen.getAllByText(/\[DNI_1\]/).length).toBeGreaterThan(0);
    expect(screen.getByText('DNI distintos; revisar los anexos.')).toBeTruthy();
    expect(screen.getByText(/RECIBO_PAGO · páginas 4/)).toBeTruthy();
    expect(screen.getByText('Una diferencia no constituye prueba de fraude.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Mostrar originales (acceso del evaluador)' }));
    expect(screen.getByText('11111111')).toBeTruthy();
    expect(screen.getByText('Persona Ficticia')).toBeTruthy();
    expect(originalExport).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Exportar JSON original (contiene datos personales)' }));
    expect(originalExport).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Ocultar datos originales' }));
    expect(screen.queryByText('11111111')).toBeNull();
  });

  it('exporta solo la proyección protegida y reemplaza el nombre original del archivo', () => {
    const exported = new CreateProtectedExportUseCase().execute(expediente);
    const json = JSON.stringify(exported);
    expect(json).not.toContain('11111111');
    expect(json).not.toContain('Persona Ficticia');
    expect(json).toContain('[DNI_1]');
    expect(exported.privacy.transmision_externa_habilitada).toBe(false);
  });

  it('no revela valores si un backend anterior no ofrece una proyección protegida', () => {
    const old = { ...expediente, privacy: undefined, sections: expediente.sections.map(section => ({ ...section, maskedFields: undefined })) };
    render(<ExtractedDataPanel expediente={old} onSave={vi.fn()} onDownload={vi.fn()} />);
    expect(screen.queryByText('11111111')).toBeNull();
    expect(screen.getAllByText('[OCULTO]').length).toBeGreaterThan(0);
    expect(JSON.stringify(new CreateProtectedExportUseCase().execute(old))).not.toContain('11111111');
  });

  it('solicita el índice real del segmento sin fabricar una descarga y muestra fallos', async () => {
    const user = userEvent.setup();
    const download = vi.fn().mockRejectedValue(new Error('El PDF original no está disponible.'));
    render(<DocumentViewer expediente={expediente} onDownloadSegment={download} />);
    await user.click(screen.getByRole('button', { name: 'Descargar segmento original: FUT' }));
    expect(download).toHaveBeenCalledWith(0);
    await screen.findByText('El PDF original no está disponible.');
    expect(screen.getByText(/Los PDFs originales contienen los datos originales/)).toBeTruthy();
  });
});
