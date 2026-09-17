import React from 'react';

export function SecurityBadge() {
  return (
    <div className="p-4 bg-surface-container-low flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface font-semibold">Auditoría SHA-256</p>
          <p className="font-code-sm text-code-sm text-on-surface-variant">Nivel Criptográfico Alto</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>Nodo Seguro
        </span>
        <span className="font-code-sm text-code-sm">TLS 1.3</span>
      </div>
    </div>
  );
}
