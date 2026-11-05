import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DocumentPreview } from '../src/infrastructure/adapters/input/components/viewer/DocumentPreview';
import { FileInfoBar } from '../src/infrastructure/adapters/input/components/viewer/FileInfoBar';
import type { Expediente } from '../src/domain/entities/Expediente';

describe('PDF original', () => {
  it('muestra el archivo cargado y transmite página y zoom al visor nativo', () => {
    const markup = renderToStaticMarkup(<DocumentPreview pdfUrl="blob:https://municipal.example/real-file" page={3} zoom={150} />);
    expect(markup).toContain('blob:https://municipal.example/real-file#page=3&amp;zoom=150');
    expect(markup).toContain('Abrir PDF original');
    expect(markup).not.toContain('Carlos Mendoza');
  });
  it('muestra una limitación explícita sin fabricar un original al consultar expedientes', () => {
    const markup = renderToStaticMarkup(<DocumentPreview page={1} zoom={100} />);
    expect(markup).not.toContain('<iframe');
    expect(markup).toContain('solo está disponible durante la sesión');
  });
  it('descarga el blob real sin afirmar validación administrativa', () => {
    const expediente: Expediente = { id: 'id', fileName: 'real.pdf', fileSize: '1 MB', totalPages: 3,
      status: 'procesado', backendStatus: 'PROCESADO', processingTime: '1 s', sections: [] };
    const markup = renderToStaticMarkup(<FileInfoBar expediente={expediente} pdfUrl="blob:real" />);
    expect(markup).toContain('href="blob:real"');
    expect(markup).toContain('download="real.pdf"');
    expect(markup).toContain('sin validación administrativa');
  });
});
