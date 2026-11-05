import React, { useState } from 'react';
import type { Expediente } from '@domain/entities/Expediente';
import { ExtractedSection } from './ExtractedSection';
import { ActionButtons } from './ActionButtons';
import { CrossValidationPanel } from './CrossValidationPanel';

export interface ExtractedDataPanelProps {
  expediente: Expediente;
  onSave?: () => void;
  onDownload?: () => void;
  onDownloadOriginal?: () => void;
}

export function ExtractedDataPanel({ expediente, onSave, onDownload, onDownloadOriginal }: ExtractedDataPanelProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [showOriginal, setShowOriginal] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expediente.id);
      setCopied(true); setCopyError('');
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError('No se pudo copiar. Seleccione y copie el ID manualmente.'); }
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
        <div className="font-headline-sm text-headline-sm text-primary font-bold">Datos Extraídos y Clasificados</div>
        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-semibold">
          Extracción OCR · revisión pendiente
        </span>
      </div>
      
      {/* Trámite ID */}
      <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">ID Trámite Generado</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold font-code-md">{expediente.id}</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-label-md font-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      
      {/* Sections */}
      <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2">
        <p className="font-bold">{showOriginal ? 'Datos originales del expediente' : 'Datos protegidos por defecto'}</p>
        <p className="text-body-sm">Seudonimización parcial de datos detectados. No se envían textos ni PDFs a Gemini o GPT.</p>
        <button aria-pressed={showOriginal} onClick={() => setShowOriginal(previous => !previous)} className="text-primary underline text-left">
          {showOriginal ? 'Ocultar datos originales' : 'Mostrar originales (acceso del evaluador)'}
        </button>
        {expediente.privacy?.reemplazos_por_tipo && <p className="text-body-sm">Identificadores protegidos: {Object.entries(expediente.privacy.reemplazos_por_tipo).map(([kind, count]) => `${kind}: ${count}`).join(' · ') || 'No se detectaron etiquetas sensibles.'}</p>}
        {!expediente.privacy && <p className="text-body-sm">La versión protegida no está disponible; los valores se mantienen ocultos hasta que solicite ver los originales.</p>}
        {showOriginal && onDownloadOriginal && <button onClick={onDownloadOriginal} className="text-primary underline text-left">Exportar JSON original (contiene datos personales)</button>}
      </div>
      {copyError && <p role="alert" className="text-on-error-container">{copyError}</p>}
      <div className="flex flex-col gap-2">
        {expediente.sections.map((section, i) => (
          <ExtractedSection key={section.id} section={{ ...section, fields: showOriginal ? section.fields : section.maskedFields || section.fields.map(field => ({ ...field, value: '[OCULTO]' })) }} sectionNumber={i + 1} />
        ))}
      </div>
      <CrossValidationPanel report={expediente.consistency} />
      
      {/* Actions */}
      <ActionButtons onSave={onSave!} onDownloadJson={onDownload!} />
    </div>
  );
}
