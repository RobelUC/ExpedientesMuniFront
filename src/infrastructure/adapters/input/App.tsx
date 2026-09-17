import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FileInfoBar } from './components/viewer/FileInfoBar';
import { DocumentViewer } from './components/viewer/DocumentViewer';
import { ExtractedDataPanel } from './components/data/ExtractedDataPanel';
import { LoginScreen } from './components/auth/LoginScreen';

import type { Expediente } from '@domain/entities/Expediente';
import type { User } from '@domain/entities/User';
import { ApiExpedienteAdapter } from '../output/ApiExpedienteAdapter';
import { MockAuthAdapter } from '../output/MockAuthAdapter';
import { GetExpedienteUseCase } from '@application/useCases/GetExpedienteUseCase';
import { UploadExpedienteUseCase } from '@application/useCases/UploadExpedienteUseCase';
import { ConfirmExpedienteUseCase } from '@application/useCases/ConfirmExpedienteUseCase';
import { DownloadJsonUseCase } from '@application/useCases/DownloadJsonUseCase';
import { LoginUseCase } from '@application/useCases/LoginUseCase';

// Inicializar dependencias (DI Container simple)
const apiAdapter = new ApiExpedienteAdapter();
const authAdapter = new MockAuthAdapter();

const getExpedienteUseCase = new GetExpedienteUseCase(apiAdapter);
const uploadExpedienteUseCase = new UploadExpedienteUseCase(apiAdapter);
const confirmExpedienteUseCase = new ConfirmExpedienteUseCase(apiAdapter);
const downloadJsonUseCase = new DownloadJsonUseCase();
const loginUseCase = new LoginUseCase(authAdapter);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, pass: string) => {
    const loggedInUser = await loginUseCase.execute(username, pass);
    setUser(loggedInUser);
  };

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await uploadExpedienteUseCase.execute(file);
      setExpediente(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!expediente) return;
    try {
      setLoading(true);
      await confirmExpedienteUseCase.execute(expediente.id, expediente);
      alert('Datos guardados exitosamente en la Municipalidad');
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!expediente) return;
    downloadJsonUseCase.execute(expediente.id, expediente);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AppLayout user={user} onUpload={handleUpload}>
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
                Procesado con éxito en {expediente.processingTime || 'N/A'}
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div className="p-4 bg-surface-container text-on-surface rounded-lg">Cargando datos...</div>
        )}

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg font-bold">{error}</div>
        )}

        {!expediente && !loading && !error && (
          <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl mt-4">
            No hay ningún expediente cargado. Usa el botón "Cargar nuevo expediente" para comenzar.
          </div>
        )}

        {expediente && !loading && (
          <>
            {/* ── File info ── */}
            <FileInfoBar expediente={expediente} />

            {/* ── Main grid: Viewer + Extracted Data ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <DocumentViewer expediente={expediente} />
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4">
                <ExtractedDataPanel 
                  expediente={expediente} 
                  onSave={handleSave} 
                  onDownload={handleDownload} 
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
