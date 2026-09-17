import React, { useState } from 'react';
import type { Expediente } from '@domain/entities/Expediente';
import { ExtractedSection } from './ExtractedSection';
import { ActionButtons } from './ActionButtons';

export interface ExtractedDataPanelProps {
  expediente: Expediente;
  onSave?: () => void;
  onDownload?: () => void;
}

export function ExtractedDataPanel({ expediente, onSave, onDownload }: ExtractedDataPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(expediente.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
        <div className="font-headline-sm text-headline-sm text-primary font-bold">Datos Extraídos y Clasificados</div>
        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-semibold">
          IA 99.4%
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
      <div className="flex flex-col gap-2">
        {expediente.sections.map((section, i) => (
          <ExtractedSection key={section.id} section={section} sectionNumber={i + 1} />
        ))}
      </div>
      
      {/* Actions */}
      <ActionButtons onSave={onSave!} onDownloadJson={onDownload!} />
    </div>
  );
}
