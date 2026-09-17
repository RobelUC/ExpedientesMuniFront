import React, { useRef } from 'react';
import type { User } from '@domain/entities/User';

interface HeaderProps {
  user: User;
  onUpload?: (file: File) => void;
}

export function Header({ user, onUpload }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) onUpload?.(file);
    }
  };

  return (
    <header className="fixed top-0 left-[16rem] right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">GobExpedientes AI</span>
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase">Portal de Verificación</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="application/pdf"
          onChange={handleFileChange} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg text-label-md font-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>Cargar nuevo expediente</span>
        </button>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <div className="flex flex-col items-end">
            <span className="font-label-md text-label-md text-on-surface font-semibold">{user.name}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{user.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
