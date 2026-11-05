import type { CrossValidation } from '@domain/entities/Expediente';

export function CrossValidationPanel({ report }: { report?: CrossValidation }) {
  if (!report) return <p className="text-body-sm text-on-surface-variant">El servidor no proporcionó todavía un informe de cruce de anexos.</p>;
  const labels: Record<string, string> = {
    REQUIERE_REVISION: 'Se requiere revisión de las diferencias',
    SIN_CONTRADICCIONES_DETECTADAS: 'Sin contradicciones detectadas en los campos comparados',
    DATOS_INSUFICIENTES: 'Datos insuficientes para comparar entre anexos',
  };
  return <section aria-label="Cruce de datos entre anexos" className="border-t border-surface-container pt-3 flex flex-col gap-2">
    <h3 className="font-headline-sm text-primary font-bold">Cruce de datos entre anexos</h3>
    <p role={report.requiere_revision_humana ? 'alert' : 'status'}>{labels[report.estado] || report.estado}</p>
    {!!report.campos_comparados.length && <p className="text-body-sm">Campos comparados: {report.campos_comparados.map(field => field.toUpperCase()).join(', ')}</p>}
    {report.alertas.map((alert, index) => <div key={`${alert.codigo}-${index}`} className="bg-error-container text-on-error-container rounded-lg p-3">
      <p>{alert.mensaje}</p>
      <ul className="text-body-sm mt-1">{alert.fuentes.map(source => <li key={source.documento}>
        {source.tipo} · páginas {source.paginas.join(', ')} {source.valor_protegido || ''}
      </li>)}</ul>
    </div>)}
    <p className="text-body-sm text-on-surface-variant">{report.advertencia}</p>
  </section>;
}
