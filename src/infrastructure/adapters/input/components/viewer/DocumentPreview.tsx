export interface DocumentPreviewProps {
  pdfUrl?: string;
  page: number;
  zoom: number;
}

export function DocumentPreview({ pdfUrl, page, zoom }: DocumentPreviewProps) {
  if (!pdfUrl) return <p className="my-auto text-on-surface-variant">El original solo está disponible durante la sesión de carga.</p>;
  return (
    <div className="w-full flex flex-col gap-2">
      <iframe key={`${pdfUrl}-${page}-${zoom}`} title={`PDF original · página ${page}`}
        src={`${pdfUrl}#page=${page}&zoom=${zoom}`} className="w-full h-[600px] bg-white rounded border border-surface-container" />
      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline text-body-sm">Abrir PDF original en otra pestaña si su navegador no muestra la vista previa</a>
    </div>
  );
}
