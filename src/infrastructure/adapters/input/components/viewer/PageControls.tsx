import React from 'react';

export interface PageControlsProps {
  currentPage: number;
  totalPages: number;
  sectionLabel: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export function PageControls({
  currentPage,
  totalPages,
  sectionLabel,
  zoom,
  onZoomIn,
  onZoomOut,
  onPrev,
  onNext,
  children
}: PageControlsProps) {
  return (
    <div className="relative bg-slate-100 rounded-lg p-4 flex flex-col items-center min-h-[500px] border border-surface-container-high">
      {/* Top info + zoom bar */}
      <div className="w-full flex items-center justify-between text-on-surface-variant pb-2 text-body-sm">
        <span>
          Visualizando: <strong>Página {currentPage} de {totalPages}</strong> ({sectionLabel})
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded bg-white hover:bg-surface-container shadow-xs text-on-surface"
            title="Alejar"
            onClick={onZoomOut}
          >
            <span className="material-symbols-outlined text-[18px]">zoom_out</span>
          </button>
          <span className="px-2 font-code-sm text-code-sm font-semibold">{zoom}%</span>
          <button
            className="p-1 rounded bg-white hover:bg-surface-container shadow-xs text-on-surface"
            title="Acercar"
            onClick={onZoomIn}
          >
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </button>
        </div>
      </div>

      {/* Document Content */}
      {children}

      {/* Bottom pagination */}
      <div className="w-full flex items-center justify-center gap-4 pt-2">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white shadow-xs hover:bg-surface-container text-on-surface font-label-md text-label-md border border-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span> Anterior
        </button>
        <span className="font-label-md text-label-md text-on-surface font-semibold">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white shadow-xs hover:bg-surface-container text-on-surface font-label-md text-label-md border border-surface-container"
        >
          Siguiente <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
