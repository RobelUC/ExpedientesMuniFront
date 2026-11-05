import React from 'react';
import type { Expediente } from '@domain/entities/Expediente';

export interface FileInfoBarProps {
  expediente: Expediente;
  pdfUrl?: string;
}

export function FileInfoBar({ expediente, pdfUrl }: FileInfoBarProps) {
  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
        </div>
        <div>
          <div className="font-label-lg text-label-lg text-on-surface font-bold">{expediente.fileName}</div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mt-0.5">
            <span>{expediente.fileSize}</span>
            <span>•</span>
            <span>{expediente.totalPages} Fojas delimitadas</span>
            <span>•</span>
            <span className="text-on-tertiary-container font-semibold inline-flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">description</span> {expediente.backendStatus || expediente.status} · sin validación administrativa
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <a href={pdfUrl} download={expediente.fileName} aria-disabled={!pdfUrl} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Descargar PDF</span>
        </a>
      </div>
    </div>
  );
}
