import type { Expediente } from '@domain/entities/Expediente';
import type { User } from '@domain/entities/User';
import type { OcrStatus } from '@domain/valueObjects/OcrStatus';
import type { NavItemData } from '@domain/valueObjects/NavItemData';

// ─── Datos del expediente de ejemplo ────────────────────────────────

export const mockExpediente: Expediente = {
  id: 'TRAM-2025-08491',
  fileName: 'EXP_2025_00492_LICENCIA_CONSTRUCCION.pdf',
  fileSize: '18.4 MB',
  totalPages: 14,
  status: 'procesado',
  processingTime: '2.4s',
  sections: [
    {
      id: 'fut',
      title: 'FUT (Págs 1-3)',
      subtitle: 'Formulario Único',
      pageRange: [1, 3],
      icon: 'description',
      fields: [
        { label: 'Solicitante', value: 'Carlos Mendoza Ramos' },
        { label: 'DNI', value: '45892147', isCode: true },
        { label: 'Tipo de Trámite', value: 'Licencia Edificación Tipo C' },
        { label: 'Dirección', value: 'Av. Arenales 1420, Lince' },
      ],
    },
    {
      id: 'dni',
      title: 'DNI (Págs 4-5)',
      subtitle: 'Identidad',
      pageRange: [4, 5],
      icon: 'badge',
      fields: [
        { label: 'Número de DNI', value: '45892147', isCode: true },
        {
          label: 'Estado Validación',
          value: 'Vigente (RENIEC)',
          isVerified: true,
          verifiedBy: 'RENIEC',
        },
      ],
    },
    {
      id: 'planos',
      title: 'Planos (Págs 6-14)',
      subtitle: 'Arquitectura',
      pageRange: [6, 14],
      icon: 'architecture',
      fields: [
        { label: 'Tipo de Obra', value: 'Ampliación Unifamiliar' },
        { label: 'Área Total', value: '184.50 m²', isCode: true },
      ],
    },
  ],
};

// ─── Usuario actual ─────────────────────────────────────────────────

export const mockUser: User = {
  name: 'Ing. Marcos Valdivia',
  role: 'Agente Verificador',
};

// ─── Estado del motor OCR ───────────────────────────────────────────

export const mockOcrStatus: OcrStatus = {
  version: 'v4.2',
  precision: 99.4,
  slaPerPage: '1.2s/foja',
  isActive: true,
};

// ─── Ítems de navegación del sidebar ────────────────────────────────

export const navItems: NavItemData[] = [
  { icon: 'upload_file', label: 'Carga de Expediente', path: 'carga-de-expediente' },
  { icon: 'document_scanner', label: 'Procesamiento IA & OCR', path: 'procesamiento-ia-ocr' },
  { icon: 'folder_managed', label: 'Expedientes Estructurados', path: 'expedientes-estructurados' },
  { icon: 'history_edu', label: 'Historial & Alertas', path: 'historial-alertas' },
];

// ─── Opciones del selector de entidad ───────────────────────────────

export const entityOptions = [
  { value: 'central', label: 'Sede Central - Min. Justicia' },
  { value: 'norte', label: 'Delegación Registral Norte' },
  { value: 'archivo', label: 'Archivo General de la Nación' },
  { value: 'aduana', label: 'Tribunal Fiscal & Aduanero' },
];
