export interface DossierResponse {
  id: string;
  nombre_archivo: string;
  sha256: string;
  estado: string;
  creado_en: string;
  error: string | null;
  documentos: {
    tipo: string;
    paginas: number[];
    texto: string;
    campos: Record<string, string>;
    confianza_ocr: number;
    metodo_extraccion: string;
    requiere_revision: boolean;
  }[];
}

