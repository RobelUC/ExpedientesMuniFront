// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TupaPanel } from '../src/infrastructure/adapters/input/components/data/TupaPanel';
import { TupaUseCases } from '../src/application/useCases/TupaUseCases';
import type { TupaRepositoryPort } from '../src/domain/ports/TupaRepositoryPort';
import type { Catalog, Draft, Workflow } from '../src/domain/entities/Tupa';
import type { Expediente } from '../src/domain/entities/Expediente';

const expediente: Expediente = { id: 'id-prueba', fileName: 'ficticio.pdf', fileSize: '1 MB', totalPages: 3,
  status: 'procesado', processingTime: '1 s', sections: [] };
const catalog: Catalog = { catalogo_completo: false, vigencia_normativa_2026_certificada: false, procedimientos: [
  { code: 'TUPA-1', name: 'Prueba', department: 'Gerencia de Desarrollo Urbano', requirements: [{ id: 'pago', description: 'Pago', conditional: false }] },
  { code: 'TUPA-2', name: 'Otra prueba', department: 'Otra gerencia', requirements: [] },
] };
const initial: Workflow = { dossier_id: expediente.id, revision: 1, procedure_code: 'TUPA-1', drafts: [], audit: [], routing: {},
  validation: { estado: 'CONFORME', habilitado_enrutamiento: true, requisitos: [] } };
const draft = (version: number, contenido: string, vigente = true): Draft => ({ version, contenido, vigente,
  autor: 'evaluador-prueba', origen: 'EDICION_HUMANA', tipo: 'PROYECTO', estado: 'BORRADOR', firma: null, sisgedoc: null, notificacion: null });
let repository: TupaRepositoryPort;
let service: TupaUseCases;
beforeEach(() => {
  repository = {
    getCatalog: vi.fn().mockResolvedValue(catalog), getWorkflow: vi.fn().mockResolvedValue(structuredClone(initial)),
    getCapabilities: vi.fn().mockResolvedValue({ integraciones: { firma_electronica: false, sisgedoc: false, notificaciones: false, enrutamiento_predictivo: false } }),
    validate: vi.fn(), saveDraft: vi.fn(), route: vi.fn(), assign: vi.fn(), approveAndSign: vi.fn(),
  };
  service = new TupaUseCases(repository);
});
afterEach(cleanup);
async function open() {
  const user = userEvent.setup();
  render(<TupaPanel expediente={expediente} service={service} />);
  await screen.findByRole('textbox', { name: 'Contenido del borrador' });
  return user;
}
const disabled = (name: string) => (screen.getByRole('button', { name }) as HTMLButtonElement).disabled;

describe('HU03: edición y auditoría reales desde la interfaz', () => {
  it('conserva versiones y usa la revisión devuelta por el servidor en cada guardado', async () => {
    const version1: Workflow = { ...initial, revision: 2, drafts: [draft(1, 'Proyecto inicial')], audit: [
      { actor: 'evaluador-prueba', action: 'VERSION_BORRADOR', at: '2026-11-04T10:00:00Z', detail: { version: 1 } },
    ] };
    const version2: Workflow = { ...version1, revision: 3, drafts: [draft(1, 'Proyecto inicial', false), draft(2, 'Proyecto corregido')], audit: [
      ...version1.audit!, { actor: 'evaluador-prueba', action: 'VERSION_BORRADOR', at: '2026-11-04T10:01:00Z', detail: { version: 2 } },
    ] };
    vi.mocked(repository.saveDraft).mockResolvedValueOnce(version1).mockResolvedValueOnce(version2);
    const user = await open();
    const editor = screen.getByRole('textbox', { name: 'Contenido del borrador' });
    await user.type(editor, 'Proyecto inicial');
    await user.click(screen.getByRole('button', { name: 'Guardar nueva versión del borrador' }));
    await screen.findByText('Nueva versión guardada con auditoría.');
    expect(repository.saveDraft).toHaveBeenNthCalledWith(1, 'id-prueba', 'Proyecto inicial', 1);
    expect(disabled('Guardar nueva versión del borrador')).toBe(true);
    await user.clear(editor); await user.type(editor, 'Proyecto corregido');
    await user.click(screen.getByRole('button', { name: 'Guardar nueva versión del borrador' }));
    await waitFor(() => expect(repository.saveDraft).toHaveBeenNthCalledWith(2, 'id-prueba', 'Proyecto corregido', 2));
    await screen.findByText('Versión 1 · evaluador-prueba · Anterior');
    await screen.findByText('Versión 2 · evaluador-prueba · Vigente');
    expect(screen.getByRole('region', { name: 'Auditoría del expediente' }).textContent).toContain('versión 2');
    expect(disabled('Aprobar y Firmar')).toBe(true);
    expect(repository.approveAndSign).not.toHaveBeenCalled();
  });

  it('mantiene el texto local y muestra el conflicto sin sobrescribir el historial', async () => {
    vi.mocked(repository.saveDraft).mockRejectedValue(new Error('La versión cambió. Consulte el flujo antes de reintentar.'));
    const user = await open();
    await user.type(screen.getByRole('textbox', { name: 'Contenido del borrador' }), 'Mi corrección pendiente');
    await user.click(screen.getByRole('button', { name: 'Guardar nueva versión del borrador' }));
    await screen.findByText('La versión cambió. Consulte el flujo antes de reintentar.');
    expect((screen.getByRole('textbox', { name: 'Contenido del borrador' }) as HTMLTextAreaElement).value).toBe('Mi corrección pendiente');
    expect(screen.queryByText('Nueva versión guardada con auditoría.')).toBeNull();
    expect(screen.queryByText('Historial de versiones')).toBeNull();
  });

  it('protege el borrador sin guardar y permite descartarlo con recarga explícita', async () => {
    const user = await open();
    const editor = screen.getByRole('textbox', { name: 'Contenido del borrador' });
    await user.type(editor, 'Cambio local que todavía no se guardó');
    expect(disabled('Guardar revisión TUPA')).toBe(true);
    expect((screen.getByRole('combobox', { name: 'Procedimiento' }) as HTMLSelectElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Recargar catálogo y revisión guardada (descarta cambios locales)' }));
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Contenido del borrador' }) as HTMLTextAreaElement).value).toBe(''));
    expect(repository.saveDraft).not.toHaveBeenCalled();
  });

  it('muestra la alerta y el borrador de observación guardados por el servidor', async () => {
    vi.mocked(repository.getWorkflow).mockResolvedValue({ ...initial, validation: {
      estado: 'OBSERVADO', requisitos: [], alertas: [{ codigo: 'REQUISITO_FALTANTE', requisito: 'pago', mensaje: 'Falta acreditar pago.', nota: 'Revisado por evaluador.' }],
    }, drafts: [{ ...draft(1, 'Esquela de observación real devuelta por el servidor'), tipo: 'OBSERVACION', origen: 'PLANTILLA_LOCAL' }] });
    await open();
    expect(screen.getByRole('alert').textContent).toContain('Falta acreditar pago.');
    expect((screen.getByRole('textbox', { name: 'Contenido del borrador' }) as HTMLTextAreaElement).value).toContain('Esquela de observación');
    expect(disabled('Enviar a clasificación manual')).toBe(true);
  });
});

describe('HU04: intervención humana sin probabilidades inventadas', () => {
  it('muestra clasificación manual y persiste la gerencia con la revisión correcta', async () => {
    const manual: Workflow = { ...initial, revision: 2, routing: { estado: 'CLASIFICACION_MANUAL', alerta: true,
      sugerencia: 'Gerencia de Desarrollo Urbano', confianza: null, modelo: null } };
    vi.mocked(repository.route).mockResolvedValue(manual);
    vi.mocked(repository.assign).mockResolvedValue({ ...manual, revision: 3, routing: { estado: 'DERIVADO_LOCAL', destino: 'Otra gerencia', alerta: false } });
    const user = await open();
    await user.click(screen.getByRole('button', { name: 'Enviar a clasificación manual' }));
    await screen.findByText('Se requiere decisión del evaluador para asignar la gerencia.');
    expect(repository.route).toHaveBeenCalledWith('id-prueba', 1);
    expect(screen.queryByText(/Confianza del modelo:/)).toBeNull();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Gerencia de destino' }), 'Otra gerencia');
    await user.click(screen.getByRole('button', { name: 'Guardar asignación manual' }));
    await screen.findByText('Asignación manual guardada en el flujo local.');
    expect(repository.assign).toHaveBeenCalledWith('id-prueba', 'Otra gerencia', 2);
    expect(screen.getByText(/Estado de destino: DERIVADO_LOCAL/).textContent).toContain('Otra gerencia');
  });

  it('bloquea acciones sobre una validación TUPA modificada y todavía no guardada', async () => {
    const user = await open();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Procedimiento' }), 'TUPA-2');
    expect(disabled('Enviar a clasificación manual')).toBe(true);
    expect(disabled('Guardar asignación manual')).toBe(true);
    expect(screen.getByText('Guarde la validación TUPA antes de modificar el borrador o el destino.')).toBeTruthy();
    expect(repository.route).not.toHaveBeenCalled();
  });
});
