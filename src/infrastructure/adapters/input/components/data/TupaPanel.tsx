import { useEffect, useRef, useState } from 'react';
import type { Expediente } from '@domain/entities/Expediente';
import type { Catalog, RequirementCheck, Workflow, WorkflowCapabilities } from '@domain/entities/Tupa';
import type { TupaUseCases } from '@application/useCases/TupaUseCases';
import { WorkflowPanel } from './WorkflowPanel';

interface Props { expediente: Expediente; service: TupaUseCases }
type CheckInput = Omit<RequirementCheck, 'paginas'> & { paginas: string };
const emptyCheck: CheckInput = { estado: 'PENDIENTE', nota: '', paginas: '' };

export function TupaPanel({ expediente, service }: Props) {
  const [catalog, setCatalog] = useState<Catalog>();
  const [flow, setFlow] = useState<Workflow>();
  const [capabilities, setCapabilities] = useState<WorkflowCapabilities>();
  const [code, setCode] = useState('');
  const [checks, setChecks] = useState<Record<string, CheckInput>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const busy = useRef(false);

  const applyFlow = (next: Workflow) => {
    setFlow(next); setCode(next.procedure_code || '');
    setDirty(false);
    setDraftDirty(false);
    setChecks(Object.fromEntries((next.validation.requisitos || []).map(r => [r.id, {
      estado: r.estado, nota: r.nota, paginas: r.paginas_revisadas.join(', '),
    }])));
  };
  useEffect(() => {
    let active = true;
    Promise.all([service.getCatalog(), service.getWorkflow(expediente.id), service.getCapabilities()])
      .then(([data, next, availability]) => { if (active) { setCatalog(data); applyFlow(next); setCapabilities(availability); } })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar TUPA.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [expediente.id, service]);

  const procedure = catalog?.procedimientos.find(p => p.code === code);
  const update = (id: string, patch: Partial<CheckInput>) => {
    setChecks(previous => ({ ...previous, [id]: { ...emptyCheck, ...previous[id], ...patch } }));
    setSaved(false);
    setDirty(true); setActionMessage('');
  };
  const submit = async (automatic = false) => {
    if (!flow || busy.current || draftDirty) return;
    busy.current = true; setLoading(true); setError(''); setSaved(false); setActionMessage('');
    try {
      const payload: Record<string, RequirementCheck> = {};
      for (const requirement of automatic ? [] : procedure?.requirements || []) {
        const check = checks[requirement.id];
        if (!check || (check.estado === 'PENDIENTE' && !check.nota.trim() && !check.paginas.trim())) continue;
        payload[requirement.id] = { ...check, paginas: check.paginas.trim() ? check.paginas.split(',').map(v => Number(v.trim())) : [] };
      }
      applyFlow(await service.validate(expediente.id, code, flow.revision, payload));
      setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar la revisión.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const refresh = async () => {
    setLoading(true); setError(''); setSaved(false); setActionMessage('');
    try {
      const [data, next, availability] = await Promise.all([service.getCatalog(), service.getWorkflow(expediente.id), service.getCapabilities()]);
      setCatalog(data); applyFlow(next); setCapabilities(availability);
      setRefreshToken(previous => previous + 1);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo consultar el flujo.'); }
    finally { setLoading(false); }
  };
  const run = async (operation: (revision: number) => Promise<Workflow>, success: string) => {
    if (!flow || busy.current || dirty) return;
    busy.current = true; setLoading(true); setError(''); setSaved(false); setActionMessage('');
    try { applyFlow(await operation(flow.revision)); setActionMessage(success); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.'); }
    finally { busy.current = false; setLoading(false); }
  };

  return <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 flex flex-col gap-3">
    <h2 className="font-headline-sm text-primary font-bold">Revisión documental TUPA</h2>
    {(capabilities?.demo || flow?.demo) && <div role="status" className="bg-tertiary-fixed/30 text-on-tertiary-container p-3 rounded-lg font-bold">DEMO UNIVERSITARIA: expedientes ficticios, auditoría de evidencias de práctica y servicios simulados. Sin validez legal.</div>}
    <p className="text-body-sm text-on-surface-variant">Catálogo piloto. Vigencia normativa no certificada. OCR no verifica firmas, pagos ni validez legal.</p>
    {loading && <p role="status">Cargando revisión...</p>}
    {error && <p role="alert" className="text-on-error-container bg-error-container p-3 rounded">{error}</p>}
    {catalog && <>
      {draftDirty && <p role="status" className="text-body-sm">Guarde el borrador o recargue la revisión antes de modificar la validación TUPA.</p>}
      <label className="flex flex-col gap-1">Procedimiento
        <select value={code} disabled={loading || draftDirty} className="border border-outline-variant rounded p-2 bg-surface" onChange={e => { setCode(e.target.value); setChecks({}); setSaved(false); setDirty(true); setActionMessage(''); }}>
          <option value="">Seleccione un procedimiento</option>
          {catalog.procedimientos.map(p => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}
        </select>
      </label>
      {!!procedure?.pdf_pages?.length && <p className="text-body-sm">Fuente: TUPA Huancayo 2025, páginas del PDF {procedure.pdf_pages.join(', ')}.</p>}
      {procedure?.requirements.map(requirement => {
        const check = checks[requirement.id] || emptyCheck;
        const candidates = flow?.procedure_code === code ? flow.validation.requisitos?.find(r => r.id === requirement.id)?.paginas_candidatas : undefined;
        return <fieldset key={requirement.id} disabled={loading || draftDirty} className="border-t border-surface-container py-2 flex flex-col gap-2">
          <legend className="font-bold text-body-sm">{requirement.description}</legend>
          {!!candidates?.length && <p className="text-body-sm">Páginas candidatas OCR: {candidates.join(', ')}; requieren revisión humana.</p>}
          <label>Estado <select className="border rounded p-1 bg-surface" value={check.estado} onChange={e => update(requirement.id, { estado: e.target.value as RequirementCheck['estado'] })}>
            <option value="PENDIENTE">Pendiente</option><option value="CUMPLE">Cumple</option><option value="FALTA">Falta</option>
            {requirement.conditional && <option value="NO_APLICA">No aplica</option>}
          </select></label>
          <label className="flex flex-col">Fundamento de la revisión
            <textarea maxLength={2000} value={check.nota} className="border border-outline-variant rounded p-2 bg-surface" onChange={e => update(requirement.id, { nota: e.target.value })} />
          </label>
          <label className="flex flex-col">Páginas revisadas (separadas por comas)
            <input value={check.paginas} className="border border-outline-variant rounded p-2 bg-surface" onChange={e => update(requirement.id, { paginas: e.target.value })} />
          </label>
        </fieldset>;
      })}
      {capabilities?.demo && <button disabled={loading || draftDirty || !code || expediente.status !== 'procesado' || !flow || flow.drafts?.at(-1)?.estado === 'EMITIDO_DEMO'} onClick={() => submit(true)} className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Auditar automáticamente (demostración)</button>}
      <button disabled={loading || draftDirty || !code || expediente.status !== 'procesado' || !flow || flow.drafts?.at(-1)?.estado === 'EMITIDO_DEMO'} onClick={() => submit(false)} className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Guardar revisión TUPA</button>
    </>}
    <button disabled={loading} onClick={refresh} className="text-primary underline">Recargar catálogo y revisión guardada (descarta cambios locales)</button>
    {saved && <p role="status">Revisión guardada en el servidor.</p>}
    {actionMessage && <p role="status">{actionMessage}</p>}
    {flow?.validation.estado && <p>Resultado guardado: {flow.validation.estado} · revisión {flow.revision}</p>}
    {!!flow?.validation.alertas?.length && <div role="alert" className="p-3 rounded bg-error-container text-on-error-container">
      <p className="font-bold">{capabilities?.demo ? 'Observaciones de la auditoría ficticia' : 'Requisitos faltantes o inconsistencias que requieren revisión'}</p>
      <ul>{flow.validation.alertas.map(alert => <li key={alert.requisito}>{alert.mensaje} {alert.nota}</li>)}</ul>
    </div>}
    {flow?.validation.advertencia && <p className="text-body-sm">{flow.validation.advertencia}</p>}
    {flow && catalog && <WorkflowPanel key={refreshToken} flow={flow} catalog={catalog} capabilities={capabilities} disabled={loading} validationDirty={dirty}
      onDraftDirtyChange={setDraftDirty}
      onSaveDraft={content => run(revision => service.saveDraft(expediente.id, content, revision), 'Nueva versión guardada con auditoría.')}
      onRoute={() => run(revision => service.route(expediente.id, revision), 'Destino local actualizado.')}
      onAssign={department => run(revision => service.assign(expediente.id, department, revision), 'Asignación manual guardada en el flujo local.')}
      onApprove={() => run(revision => service.approveAndSign(expediente.id, revision), capabilities?.demo ? 'Demostración emitida: firma, registro y notificación simulados.' : 'Respuesta de emisión recibida del servidor. Consulte el resultado guardado.')}
    />}
  </section>;
}
