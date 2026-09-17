import React from 'react';
import type { Section } from '@domain/entities/Section';

export interface DocumentPreviewProps {
  section?: Section;
}

export function DocumentPreview({ section }: DocumentPreviewProps) {
  return (
    <div className="w-full max-w-[500px] bg-white rounded shadow p-4 my-auto border border-surface-container">
      <div className="border-b pb-2 mb-3 text-center">
        <div className="font-label-md text-label-md uppercase tracking-wider text-slate-700 font-bold">
          MUNICIPALIDAD METROPOLITANA
        </div>
        <div className="font-label-sm text-label-sm text-slate-500">
          FORMULARIO ÚNICO DE TRÁMITE (FUT) - LEY N° 29090
        </div>
      </div>
      <div className="space-y-3">
        <div className="p-2 rounded bg-secondary-fixed/20 border border-secondary/20">
          <div className="text-[10px] text-secondary font-bold uppercase">1. Solicitante / Administrado</div>
          <div className="text-body-md font-semibold text-slate-800">Carlos Mendoza Ramos</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Documento Identidad</div>
            <div className="font-code-md text-code-md font-bold text-slate-800">DNI 45892147</div>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Teléfono de Contacto</div>
            <div className="font-code-md text-code-md font-bold text-slate-800">987-654-321</div>
          </div>
        </div>
        <div className="p-2 rounded bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium">Domicilio Legal</div>
          <div className="text-body-sm text-slate-800">Av. Arenales 1420, Lince — Lima</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Tipo de Trámite</div>
            <div className="text-body-sm font-semibold text-slate-800">Licencia Tipo C (Ampliación)</div>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Área Techada Declarada</div>
            <div className="font-code-md text-code-md font-semibold text-slate-800">184.50 m²</div>
          </div>
        </div>
      </div>
    </div>
  );
}
