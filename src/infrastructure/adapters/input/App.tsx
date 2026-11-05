import React, { useEffect, useRef, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FileInfoBar } from './components/viewer/FileInfoBar';
import { DocumentViewer } from './components/viewer/DocumentViewer';
import { ExtractedDataPanel } from './components/data/ExtractedDataPanel';
import { LoginScreen } from './components/auth/LoginScreen';

import type { Expediente } from '@domain/entities/Expediente';
import type { User } from '@domain/entities/User';
import { ApiExpedienteAdapter } from '../output/ApiExpedienteAdapter';
import { ApiAuthAdapter } from '../output/ApiAuthAdapter';
import { TupaPanel } from './components/data/TupaPanel';
import { TupaUseCases } from '@application/useCases/TupaUseCases';
import { ApiTupaAdapter } from '../output/ApiTupaAdapter';
import { GetExpedienteUseCase } from '@application/useCases/GetExpedienteUseCase';
import { UploadExpedienteUseCase } from '@application/useCases/UploadExpedienteUseCase';
import { ConfirmExpedienteUseCase } from '@application/useCases/ConfirmExpedienteUseCase';
import { DownloadJsonUseCase } from '@application/useCases/DownloadJsonUseCase';
import { CreateProtectedExportUseCase } from '@application/useCases/CreateProtectedExportUseCase';
import { DownloadDocumentUseCase } from '@application/useCases/DownloadDocumentUseCase';
import { LoginUseCase } from '@application/useCases/LoginUseCase';

// Inicializar dependencias (DI Container simple)
const apiAdapter = new ApiExpedienteAdapter();
const authAdapter = new ApiAuthAdapter();
const tupaUseCases = new TupaUseCases(new ApiTupaAdapter());

const getExpedienteUseCase = new GetExpedienteUseCase(apiAdapter);
const uploadExpedienteUseCase = new UploadExpedienteUseCase(apiAdapter);
const confirmExpedienteUseCase = new ConfirmExpedienteUseCase(apiAdapter);
const downloadJsonUseCase = new DownloadJsonUseCase();
const protectedExport = new CreateProtectedExportUseCase();
const downloadDocument = new DownloadDocumentUseCase(apiAdapter);
const loginUseCase = new LoginUseCase(authAdapter);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [queryId, setQueryId] = useState('');
  const busy = useRef(false);
  useEffect(() => {
    if (!pdfFile) { setPdfUrl(undefined); return; }
    const url = URL.createObjectURL(pdfFile);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfFile]);

  const handleLogin = async (username: string, pass: string) => {
    const loggedInUser = await loginUseCase.execute(username, pass);
    setUser(loggedInUser);
  };

  const handleUpload = async (file: File) => {
    if (busy.current) return;
    busy.current = true;
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const result = await uploadExpedienteUseCase.execute(file);
      setExpediente(result);
      setPdfFile(file);
      setMessage('PDF y extracción guardados por el servidor. Puede verificar la copia persistida.');
    } catch (err: any) {
      setError(err.message || 'Error al cargar expediente');
    } finally {
      setLoading(false);
      busy.current = false;
    }
  };

  const handleSave = async () => {
    if (!expediente || busy.current) return;
    busy.current = true;
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      await confirmExpedienteUseCase.execute(expediente.id, expediente);
      setMessage('Persistencia verificada: el servidor devolvió el expediente y la extracción guardados durante la carga.');
    } catch (err: any) {
      setError(err.message || 'Error al verificar el guardado');
    } finally {
      setLoading(false);
      busy.current = false;
    }
  };

  const handleDownload = () => {
    if (!expediente) return;
    downloadJsonUseCase.execute(expediente.id, protectedExport.execute(expediente));
  };

  const handleQuery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current || !queryId.trim()) return;
    busy.current = true; setLoading(true); setError(null); setMessage(null);
    try {
      const result = await getExpedienteUseCase.execute(queryId.trim());
      if (!result) throw new Error('Expediente no encontrado.');
      setExpediente(result); setPdfFile(null);
      setMessage('Expediente recuperado de la base de datos. Puede descargar los segmentos originales disponibles en el almacenamiento.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error al consultar'); }
    finally { busy.current = false; setLoading(false); }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AppLayout user={user} onUpload={handleUpload}>
      <button className="text-primary underline mt-2" onClick={async () => {
        await authAdapter.logout(); setUser(null); setExpediente(null); setPdfFile(null); setError(null); setMessage(null);
      }} disabled={loading}>Cerrar sesión</button>
      {user.demo && <div role="status" className="p-4 mt-3 rounded-lg bg-tertiary-fixed/30 text-on-tertiary-container">
        <strong>DEMO UNIVERSITARIA — datos ficticios y servicios simulados, sin validez legal.</strong>
        <a href="/ejemplos-demo.zip" download className="block underline mt-2">Descargar paquete de expedientes ficticios (ZIP)</a>
      </div>}
      <div className="flex flex-col w-full gap-4 pt-4">
        {/* ── Page heading ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-surface-container-high">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
              Revisión de Expediente Digital
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Clasificación de fojas y extracción asistida por IA para validación registral.
            </p>
          </div>
          {expediente && (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-on-tertiary-container bg-tertiary-fixed/30 px-3 py-1 rounded-full font-semibold">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
                {expediente.status === 'procesado' ? `Procesado en ${expediente.processingTime || 'tiempo no informado'}` : expediente.backendStatus}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleQuery} className="flex gap-2">
          <input aria-label="ID de expediente guardado" placeholder="Consultar expediente guardado por ID" value={queryId} onChange={e => setQueryId(e.target.value)} className="border border-outline-variant rounded-lg p-2 bg-surface flex-1" />
          <button disabled={loading || !queryId.trim()} className="bg-primary text-on-primary rounded-lg px-4 disabled:opacity-50">Consultar</button>
        </form>
        {expediente?.error && <p role="alert" className="bg-error-container text-on-error-container rounded-lg p-4">{expediente.error}</p>}
        {loading && (
          <div role="status" className="p-4 bg-surface-container text-on-surface rounded-lg">Procesando solicitud. El OCR puede tardar; no vuelva a enviar el archivo.</div>
        )}

        {error && (
          <div role="alert" className="p-4 bg-error-container text-on-error-container rounded-lg font-bold">{error}</div>
        )}
        {message && <div role="status" className="p-4 bg-surface-container text-on-surface rounded-lg">{message}</div>}

        {!expediente && !loading && !error && (
          <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl mt-4">
            No hay ningún expediente cargado. Usa el botón "Cargar nuevo expediente" para comenzar.
          </div>
        )}

        {expediente && !loading && (
          <>
            {/* ── File info ── */}
            <FileInfoBar expediente={expediente} pdfUrl={pdfUrl} />

            {/* ── Main grid: Viewer + Extracted Data ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <DocumentViewer key={expediente.id} expediente={expediente} pdfUrl={pdfUrl}
                  onDownloadSegment={index => downloadDocument.execute(expediente.id, index)} />
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4">
                <ExtractedDataPanel 
                  key={expediente.id}
                  expediente={expediente} 
                  onSave={handleSave} 
                  onDownload={handleDownload} 
                  onDownloadOriginal={() => downloadJsonUseCase.execute(expediente.id, expediente)}
                />
                <TupaPanel key={expediente.id} expediente={expediente} service={tupaUseCases} />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
