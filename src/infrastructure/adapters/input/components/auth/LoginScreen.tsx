import React, { useId, useState } from 'react';

export interface LoginScreenProps {
  onLogin: (user: string, pass: string) => Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const usernameId = useId();
  const passwordId = useId();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-on-primary text-[32px]">shield_person</span>
          </div>
        </div>
        <h2 className="mt-2 text-center font-display text-display text-primary tracking-tight">
          GobExpedientes AI
        </h2>
        <p className="mt-2 text-center font-body-lg text-body-lg text-on-surface-variant">
          Municipalidad Provincial de Huancayo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-lowest py-8 px-6 shadow-sm rounded-2xl border border-surface-container">
          <p className="text-body-sm text-on-surface-variant mb-4">Acceso de prototipo mediante credencial de evaluador. El token solo se conserva en memoria; el alias no cambia la identidad auditada por el servidor.</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor={usernameId} className="block font-label-md text-label-md text-on-surface mb-1">
                Nombre para mostrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span aria-hidden="true" className="material-symbols-outlined text-outline text-[20px]">person</span>
                </div>
                <input
                  id={usernameId}
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md transition-colors"
                  placeholder="Nombre del evaluador (alias visual)"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label htmlFor={passwordId} className="block font-label-md text-label-md text-on-surface mb-1">
                Token de evaluador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span aria-hidden="true" className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input
                  id={passwordId}
                  type="password"
                  autoComplete="off"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Ingresando...
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">login</span>
                  Ingresar al Portal
                </>
              )}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
          Agentes Autónomos para Automatización de Expedientes Municipales
        </p>
      </div>
    </div>
  );
}
