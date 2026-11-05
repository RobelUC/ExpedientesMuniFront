import React from 'react';

export interface ActionButtonsProps {
  onSave: () => void;
  onDownloadJson: () => void;
}

export function ActionButtons({ onSave, onDownloadJson }: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-3 mt-2 border-t border-surface-container">
      <button
        onClick={onSave}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary py-3 px-6 rounded-xl font-label-lg font-bold shadow-md hover:shadow-lg transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
        <span>Verificar guardado en BD</span>
      </button>
      <button
        onClick={onDownloadJson}
        className="flex-none inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-container text-primary border-2 border-primary/20 hover:border-primary/40 py-3 px-6 rounded-xl font-label-lg font-bold transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">download</span>
        <span>Exportar JSON protegido</span>
      </button>
    </div>
  );
}
