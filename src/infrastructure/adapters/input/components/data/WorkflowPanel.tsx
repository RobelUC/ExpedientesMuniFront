import { useEffect, useState } from 'react';
import type { Catalog, Workflow, WorkflowCapabilities } from '@domain/entities/Tupa';

interface Props {
  flow: Workflow;
  catalog: Catalog;
  capabilities?: WorkflowCapabilities;
  disabled: boolean;
  validationDirty: boolean;
  onSaveDraft: (content: string) => Promise<void>;
  onRoute: () => Promise<void>;
  onAssign: (department: string) => Promise<void>;
  onApprove: () => Promise<void>;
  onDraftDirtyChange: (dirty: boolean) => void;
}
const actions: Record<string, string> = {
  VALIDACION_TUPA: 'Validación TUPA', VERSION_BORRADOR: 'Edición del borrador',
  ENRUTAMIENTO: 'Evaluación de destino', ASIGNACION_MANUAL: 'Asignación manual',
};

export function WorkflowPanel({ flow, catalog, capabilities, disabled, validationDirty, onSaveDraft, onRoute, onAssign, onApprove, onDraftDirtyChange }: Props) {
  const latest = flow.drafts?.at(-1);
  const [content, setContent] = useState(latest?.contenido || '');
  const procedure = catalog.procedimientos.find(p => p.code === flow.procedure_code);
  const suggestion = flow.routing?.sugerencia || procedure?.department || '';
  const [department, setDepartment] = useState(suggestion);
  useEffect(() => { setContent(latest?.contenido || ''); }, [latest?.version, latest?.contenido]);
  useEffect(() => { setDepartment(suggestion); }, [suggestion]);
  const conform = flow.validation.estado === 'CONFORME';
  const locked = disabled || validationDirty;
  const integrations = capabilities?.integraciones;
  const emissionAvailable = integrations?.firma_electronica && integrations.sisgedoc && integrations.notificaciones;
  const draftChanged = content !== (latest?.contenido || '');
  useEffect(() => { onDraftDirtyChange(draftChanged); }, [draftChanged, onDraftDirtyChange]);
  const departments = [...new Set(catalog.procedimientos.map(p => p.department))];

  return <div className="flex flex-col gap-4 border-t border-surface-container-high pt-4">
    {validationDirty && <p role="status" className="text-body-sm">Guarde la validación TUPA antes de modificar el borrador o el destino.</p>}
    <section className="flex flex-col gap-2" aria-label="Borradores y revisión técnica">
      <h3 className="font-headline-sm text-primary font-bold">Borrador y revisión técnica</h3>
      <p className="text-body-sm text-on-surface-variant">Las observaciones se generan por plantilla local. El borrador requiere revisión técnica; todavía no existe generación de resoluciones mediante IA.</p>
      {latest && <p className="text-body-sm">Versión {latest.version} · {latest.tipo} · {latest.vigente ? 'Vigente' : 'Requiere nueva revisión'} · {latest.origen}</p>}
      <label className="flex flex-col gap-1">Contenido del borrador
        <textarea aria-label="Contenido del borrador" rows={10} maxLength={100000} value={content}
          disabled={locked || !flow.validation.estado} onChange={e => setContent(e.target.value)}
          className="border border-outline-variant rounded-lg p-3 bg-surface font-body-sm" />
      </label>
      <button onClick={() => onSaveDraft(content)} disabled={locked || !flow.validation.estado || !content.trim() || !draftChanged}
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Guardar nueva versión del borrador</button>
      <p className="text-body-sm">Cada guardado conserva las versiones anteriores y registra autor, fecha y acción.</p>
      <button onClick={onApprove} disabled={locked || !emissionAvailable || !conform || !latest?.vigente || latest.tipo !== 'PROYECTO' || draftChanged}
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Aprobar y Firmar</button>
      {!emissionAvailable && <p className="text-body-sm text-on-surface-variant">Firma electrónica, SISGEDOC y notificaciones no están conectados. No se puede emitir un acto administrativo.</p>}
      {!!flow.drafts?.length && <div>
        <h4 className="font-bold">Historial de versiones</h4>
        {flow.drafts.map(draft => <details key={draft.version} className="py-2 border-b border-surface-container">
          <summary>Versión {draft.version} · {draft.autor} · {draft.vigente ? 'Vigente' : 'Anterior'}</summary>
          <pre className="whitespace-pre-wrap break-words text-body-sm py-2">{draft.contenido}</pre>
        </details>)}
      </div>}
    </section>

    <section className="flex flex-col gap-2 border-t border-surface-container pt-3" aria-label="Destino local del expediente">
      <h3 className="font-headline-sm text-primary font-bold">Destino local del expediente</h3>
      {!integrations?.enrutamiento_predictivo && <p className="text-body-sm text-on-surface-variant">Sin modelo entrenado: se ofrece clasificación manual. La gerencia publicada en el TUPA es una sugerencia, no una predicción.</p>}
      <button onClick={onRoute} disabled={locked || !conform || draftChanged}
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">{integrations?.enrutamiento_predictivo ? 'Evaluar enrutamiento' : 'Enviar a clasificación manual'}</button>
      {flow.routing?.estado && <p role={flow.routing.alerta ? 'alert' : 'status'}>Estado de destino: {flow.routing.estado}{flow.routing.destino ? ` · ${flow.routing.destino}` : ''}</p>}
      {flow.routing?.alerta && <p className="text-body-sm">Se requiere decisión del evaluador para asignar la gerencia.</p>}
      {typeof flow.routing?.confianza === 'number' && <p>Confianza del modelo: {(flow.routing.confianza * 100).toFixed(1)}% · {flow.routing.modelo}</p>}
      {suggestion && <p className="text-body-sm">Sugerencia: {suggestion}</p>}
      <label className="flex flex-col gap-1">Gerencia de destino
        <select aria-label="Gerencia de destino" disabled={locked || !conform} value={department} onChange={e => setDepartment(e.target.value)} className="border border-outline-variant rounded p-2 bg-surface">
          <option value="">Seleccione una gerencia</option>
          {departments.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <button onClick={() => onAssign(department)} disabled={locked || !conform || !department || draftChanged}
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Guardar asignación manual</button>
      <p className="text-body-sm text-on-surface-variant">La asignación queda en el flujo local. No se transmite a SISGEDOC.</p>
    </section>

    {!!flow.audit?.length && <section className="border-t border-surface-container pt-3" aria-label="Auditoría del expediente">
      <h3 className="font-headline-sm text-primary font-bold">Auditoría</h3>
      <ol className="flex flex-col gap-2 mt-2 text-body-sm">
        {[...flow.audit].reverse().map((entry, index) => <li key={`${entry.at}-${index}`}>
          {new Date(entry.at).toLocaleString('es-PE')} · {entry.actor} · {actions[entry.action] || entry.action}
          {entry.detail.version !== undefined ? ` · versión ${entry.detail.version}` : ''}
        </li>)}
      </ol>
    </section>}
  </div>;
}
