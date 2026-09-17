import React from 'react';
import type { OcrStatus } from '@domain/valueObjects/OcrStatus';

interface OcrStatusCardProps {
  status: OcrStatus;
}

export function OcrStatusCard({ status }: OcrStatusCardProps) {
  return (
    <div className="p-4">
      <div className="bg-surface-container-low p-2 rounded-lg flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Motor OCR v4.2</span>
          <span className="inline-flex items-center gap-1 font-code-sm text-code-sm text-on-tertiary-container bg-tertiary-container/15 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>Activo
          </span>
        </div>
        <p className="font-code-md text-code-md text-on-surface font-semibold">99.4% precisión</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">SLA Ingesta: 1.2s/foja</p>
      </div>
    </div>
  );
}
