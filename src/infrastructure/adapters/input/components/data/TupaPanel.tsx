import { useEffect, useRef, useState } from 'react';
import type { Expediente } from '@domain/entities/Expediente';
import type { Catalog, RequirementCheck, Workflow } from '@domain/entities/Tupa';
import type { TupaUseCases } from '@application/useCases/TupaUseCases';

interface Props { expediente: Expediente; service: TupaUseCases }
type CheckInput = Omit<RequirementCheck, 'paginas'> & { paginas: string };
const emptyCheck: CheckInput = { estado: 'PENDIENTE', nota: '', paginas: '' };

export function TupaPanel({ expediente, service }: Props) {
  const [catalog, setCatalog] = useState<Catalog>();
  const [flow, setFlow] = useState<Workflow>();
  const [code, setCode] = useState('');
  const [checks, setChecks] = useState<Record<string, CheckInput>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const busy = useRef(false);

  const applyFlow = (next: Workflow) => {
    setFlow(next); setCode(next.procedure_code || '');
    setChecks(Object.fromEntries((next.validation.requisitos || []).map(r => [r.id, {
      estado: r.estado, nota: r.nota, paginas: r.paginas_revisadas.join(', '),
    }])));
  };
  useEffect(() => {
    let active = true;
    Promise.all([service.getCatalog(), service.getWorkflow(expediente.id)])
      .then(([data, next]) => { if (active) { setCatalog(data); applyFlow(next); } })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar TUPA.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [expediente.id, service]);

  const procedure = catalog?.procedimientos.find(p => p.code === code);
  const update = (id: string, patch: Partial<CheckInput>) => {
    setChecks(previous => ({ ...previous, [id]: { ...emptyCheck, ...previous[id], ...patch } }));
    setSaved(false);
  };
  const submit = async () => {
    if (!flow || busy.current) return;
    busy.current = true; setLoading(true); setError(''); setSaved(false);
    try {
      const payload: Record<string, RequirementCheck> = {};
      for (const requirement of procedure?.requirements || []) {
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
    setLoading(true); setError(''); setSaved(false);
    try {
      const [data, next] = await Promise.all([service.getCatalog(), service.getWorkflow(expediente.id)]);
      setCatalog(data); applyFlow(next);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo consultar el flujo.'); }
    finally { setLoading(false); }
  };

  return <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 flex flex-col gap-3">
    <h2 className="font-headline-sm text-primary font-bold">Revisión documental TUPA</h2>
    <p className="text-body-sm text-on-surface-variant">Catálogo piloto. Vigencia normativa no certificada. OCR no verifica firmas, pagos ni validez legal.</p>
    {loading && <p role="status">Cargando revisión...</p>}
    {error && <p role="alert" className="text-on-error-container bg-error-container p-3 rounded">{error}</p>}
    {catalog && <>
      <label className="flex flex-col gap-1">Procedimiento
        <select value={code} disabled={loading} className="border border-outline-variant rounded p-2 bg-surface" onChange={e => { setCode(e.target.value); setChecks({}); setSaved(false); }}>
          <option value="">Seleccione un procedimiento</option>
          {catalog.procedimientos.map(p => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}
        </select>
      </label>
      {procedure?.requirements.map(requirement => {
        const check = checks[requirement.id] || emptyCheck;
        const candidates = flow?.procedure_code === code ? flow.validation.requisitos?.find(r => r.id === requirement.id)?.paginas_candidatas : undefined;
        return <fieldset key={requirement.id} disabled={loading} className="border-t border-surface-container py-2 flex flex-col gap-2">
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
      <button disabled={loading || !code || expediente.status !== 'procesado' || !flow} onClick={submit} className="bg-primary text-on-primary rounded-xl p-3 font-bold disabled:opacity-50">Guardar revisión TUPA</button>
    </>}
    <button disabled={loading} onClick={refresh} className="text-primary underline">Recargar catálogo y revisión guardada (descarta cambios locales)</button>
    {saved && <p role="status">Revisión guardada en el servidor.</p>}
    {flow?.validation.estado && <p>Resultado guardado: {flow.validation.estado} · revisión {flow.revision}</p>}
    {flow?.validation.advertencia && <p className="text-body-sm">{flow.validation.advertencia}</p>}
  </section>;
}
