import React, { useRef, useState } from 'react';
import type { Expediente } from '@domain/entities/Expediente';
import { SegmentTabs } from './SegmentTabs';
import { PageControls } from './PageControls';
import { DocumentPreview } from './DocumentPreview';

export interface DocumentViewerProps {
  expediente: Expediente;
  pdfUrl?: string;
  onDownloadSegment?: (index: number) => Promise<void>;
}

export function DocumentViewer({ expediente, pdfUrl, onDownloadSegment }: DocumentViewerProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const activeSection = expediente.sections[activeSectionIndex];
  
  // Default to the start page of the active section, if available
  const initialPage = activeSection?.pageRange?.[0] || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const downloadBusy = useRef(false);
  const download = async () => {
    if (!onDownloadSegment || activeSection?.documentIndex === undefined || downloadBusy.current) return;
    downloadBusy.current = true; setDownloading(true); setDownloadError('');
    try { await onDownloadSegment(activeSection.documentIndex); }
    catch (err) { setDownloadError(err instanceof Error ? err.message : 'No se pudo descargar el segmento.'); }
    finally { downloadBusy.current = false; setDownloading(false); }
  };

  const handleSelectSection = (index: number) => {
    setActiveSectionIndex(index);
    const newSection = expediente.sections[index];
    if (newSection?.pageRange?.[0]) {
      setCurrentPage(newSection.pageRange[0]);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, expediente.totalPages));

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-label-lg text-label-lg text-on-surface font-bold">Segmentación del Expediente</span>
        <span className="text-body-sm text-on-surface-variant font-medium">
          {expediente.sections.length} secciones detectadas
        </span>
      </div>
      <SegmentTabs 
        sections={expediente.sections} 
        activeIndex={activeSectionIndex} 
        onSelect={handleSelectSection} 
      />
      {onDownloadSegment && <>
        <button disabled={downloading || activeSection?.documentIndex === undefined} onClick={download} className="bg-primary text-on-primary rounded-lg p-2 disabled:opacity-50">
          {downloading ? 'Descargando segmento...' : `Descargar segmento original: ${activeSection?.title || ''}`}
        </button>
        <p className="text-body-sm text-on-surface-variant">Separación conservadora por página. Los PDFs originales contienen los datos originales; no están anonimizados.</p>
        {downloadError && <p role="alert" className="bg-error-container text-on-error-container p-2 rounded">{downloadError}</p>}
      </>}
      <PageControls 
        currentPage={currentPage} 
        totalPages={expediente.totalPages} 
        sectionLabel={activeSection?.title || ''} 
        zoom={zoom} 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onPrev={handlePrev} 
        onNext={handleNext}
      >
        <DocumentPreview pdfUrl={pdfUrl} page={currentPage} zoom={zoom} />
      </PageControls>
    </div>
  );
}
