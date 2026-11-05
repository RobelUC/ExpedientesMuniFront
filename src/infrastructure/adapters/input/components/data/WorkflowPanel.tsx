import { useEffect, useState } from 'react';
import type { Catalog, Workflow, WorkflowCapabilities } from '@domain/entities/Tupa';

interface Props {
  flow: Workflow;
  catalog: Catalog;
  capabilities?: WorkflowCapabilities;
  disabled: boolean;
  validationDirty: boolean;
  onSaveDraft: (content: string) => Promise<void>;
  onGenerateDraft?: () => Promise<void>;
  onRoute: () => Promise<void>;
  onAssign: (department: string) => Promise<void>;
  onApprove: () => Promise<void>;
  onDraftDirtyChange: (dirty: boolean) => void;
}
const actions: Record<string, string> = {
  VALIDACION_TUPA: 'Validación TUPA', VERSION_BORRADOR: 'Edición del borrador',
  BORRADOR_IA: 'Generación con OpenAI',
  ENRUTAMIENTO: 'Evaluación de destino', ASIGNACION_MANUAL: 'Asignación manual',
};

export function WorkflowPanel({ flow, catalog, capabilities, disabled, validationDirty, onSaveDraft, onGenerateDraft, onRoute, onAssign, onApprove, onDraftDirtyChange }: Props) {
  const latest = flow.drafts?.at(-1);
  const [content, setContent] = useState(latest?.contenido || '');
  const procedure = catalog.procedimientos.find(p => p.code === flow.procedure_code);
  const suggestion = flow.routing?.sugerencia || procedure?.department || '';
  const [department, setDepartment] = useState(suggestion);
  useEffect(() => { setContent(latest?.contenido || ''); }, [latest?.version, latest?.contenido]);
  useEffect(() => { setDepartment(suggestion); }, [suggestion]);
  const conform = flow.validation.estado === 'CONFORME';
  const emitted = latest?.estado === 'EMITIDO_DEMO';
  const locked = disabled || validationDirty || emitted;
  const demo = capabilities?.demo === true || flow.demo === true;
  const syntheticModel = capabilities?.demo && capabilities.simulaciones?.modelo_datos_sinteticos;
  const integrations = capabilities?.integraciones;
  const emissionAvailable = (integrations?.firma_electronica && integrations.sisgedoc && integrations.notificaciones)
    || (capabilities?.demo && flow.demo && capabilities.simulaciones?.firma_sisgedoc_notificacion);
  const draftChanged = content !== (latest?.contenido || '');
  useEffect(() => { onDraftDirtyChange(draftChanged); }, [draftChanged, onDraftDirtyChange]);
  const departments = [...new Set(catalog.procedimientos.map(p => p.department))];

  return <div className="flex flex-col gap-4 border-t border-surface-container-high pt-4">
    {validationDirty && <p role="status" className="text-body-sm">Guarde la validación TUPA antes de modificar el borrador o el destino.</p>}
    <section className="flex flex-col gap-2" aria-label="Borradores y revisión técnica">
      <h3 className="font-headline-sm text-primary font-bold">Borrador y revisión técnica</h3>
      <button onClick={onGenerateDraft} disabled={locked || draftChanged || !flow.validation.estado || !capabilities?.ia_generativa?.configurada || !onGenerateDraft}
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Generar borrador con GPT</button>
      <p className="text-body-sm text-on-surface-variant">{capabilities?.ia_generativa?.configurada
        ? `OpenAI · ${capabilities.ia_generativa.modelo}. Se enviarán requisitos públicos y estados de revisión, sin PDF ni texto OCR. Cada generación usa la API.`
        : 'Para generar con GPT, configure OpenAI en el backend de Render.'}</p>
      {latest?.ia && <p className="text-body-sm">Generado por {latest.ia.proveedor} · modelo {latest.ia.modelo} · referencia {latest.ia.respuesta_id}. Requiere revisión humana.</p>}
      <p className="text-body-sm text-on-surface-variant">El origen de cada versión indica si proviene de una plantilla, de GPT o de una edición humana. Revise el contenido y el sustento documental antes de continuar.</p>
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
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">{demo ? 'Aprobar y Firmar (simulación)' : 'Aprobar y Firmar'}</button>
      {demo && <p className="text-body-sm">La firma, el registro SISGEDOC y la notificación se simulan dentro de esta aplicación; no se contacta a servicios externos.</p>}
      {emitted && <div role="status" className="p-3 border border-outline-variant rounded-lg flex flex-col gap-1">
        <strong>Demostración emitida — SIN VALIDEZ LEGAL</strong>
        <p>Firma: {latest.firma?.tipo} · evaluador {latest.firma?.firmante}</p>
        <p>Registro simulado: {latest.sisgedoc?.registro}</p>
        <p>Notificación: {latest.notificacion?.estado} · {latest.notificacion?.destinatario}</p>
        <p className="text-body-sm">No se envió un correo real ni se registró un acto en SISGEDOC. El borrador emitido queda bloqueado.</p>
      </div>}
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
      {syntheticModel ? <p className="text-body-sm text-on-surface-variant">Modelo didáctico entrenado con textos sintéticos. Su probabilidad no está calibrada ni validada para expedientes reales.</p> : !integrations?.enrutamiento_predictivo && <p className="text-body-sm text-on-surface-variant">Sin modelo entrenado: se ofrece clasificación manual. La gerencia publicada en el TUPA es una sugerencia, no una predicción.</p>}
      <button onClick={onRoute} disabled={locked || !conform || draftChanged}
        className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">{syntheticModel ? 'Evaluar enrutamiento (modelo sintético)' : integrations?.enrutamiento_predictivo ? 'Evaluar enrutamiento' : 'Enviar a clasificación manual'}</button>
      {flow.routing?.estado && <p role={flow.routing.alerta ? 'alert' : 'status'}>Estado de destino: {flow.routing.estado}{flow.routing.destino ? ` · ${flow.routing.destino}` : ''}</p>}
      {flow.routing?.alerta && <p className="text-body-sm">Se requiere decisión del evaluador para asignar la gerencia.</p>}
      {typeof flow.routing?.confianza === 'number' && <p>{flow.routing.simulado ? 'Probabilidad del modelo sintético (sin calibrar)' : 'Confianza del modelo'}: {(flow.routing.confianza * 100).toFixed(1)}% · {flow.routing.modelo}</p>}
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
