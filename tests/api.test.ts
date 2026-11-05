import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiError, resolveApiUrl } from '../src/infrastructure/adapters/output/ApiClient';
import { ApiExpedienteAdapter, mapDossier } from '../src/infrastructure/adapters/output/ApiExpedienteAdapter';
import { ApiAuthAdapter } from '../src/infrastructure/adapters/output/ApiAuthAdapter';
import { ApiTupaAdapter } from '../src/infrastructure/adapters/output/ApiTupaAdapter';
import { TupaUseCases } from '../src/application/useCases/TupaUseCases';
import type { DossierResponse } from '../src/infrastructure/adapters/output/ApiContracts';

const dossier: DossierResponse = {
  id: 'dossier-id', sha256: 'test-sha', nombre_archivo: 'test.pdf', creado_en: '2026-11-04T10:00:00Z',
  estado: 'PROCESADO', error: null, documentos: [{ tipo: 'FUT', paginas: [1, 2], texto: '',
    campos: { dni: '12345678' }, confianza_ocr: 0.95, metodo_extraccion: 'TEXTO_PDF', requiere_revision: false }],
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fetchMock = vi.fn<typeof fetch>();
let client: ApiClient;
beforeEach(() => { vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); client = new ApiClient('https://api.example/api/', true); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('URL y contrato de estados', () => {
  it.each(['https://api.example', 'https://api.example/', 'https://api.example/api/'])('normaliza %s', url => {
    expect(resolveApiUrl(url, true)).toBe('https://api.example/api');
  });
  it.each([undefined, 'http://localhost:8000', 'https://user:password@api.example', 'https://api.example?x=1'])('rechaza producción inválida %s', url => {
    expect(() => resolveApiUrl(url, true)).toThrow();
  });
  it('solo permite fallback local en desarrollo', () => expect(resolveApiUrl(undefined, false)).toBe('http://127.0.0.1:8000/api'));
  it.each([['PROCESANDO', 'pendiente'], ['PROCESADO', 'procesado'], ['ILEGIBLE', 'error'], ['INVALIDO', 'error'], ['ERROR', 'error']])('mapea %s', (estado, expected) => {
    expect(mapDossier({ ...dossier, estado }).status).toBe(expected);
  });
  it('rechaza estados desconocidos y no acredita revisión humana por confianza', () => {
    expect(() => mapDossier({ ...dossier, estado: 'NUEVO' })).toThrow('no reconocido');
    expect(mapDossier(dossier).sections[0]?.fields[0]?.isVerified).toBe(false);
    expect(mapDossier(dossier)).toEqual(mapDossier(dossier));
  });
});

describe('HTTP', () => {
  it('descarga el segmento por la ruta implementada con Bearer y sin token en la URL', async () => {
    client.setToken('credencial-ficticia');
    fetchMock.mockResolvedValue(new Response('%PDF-ficticio', { headers: { 'Content-Type': 'application/pdf' } }));
    const adapter = new ApiExpedienteAdapter(client);
    const blob = await adapter.getDocumentPdf('id', 2);
    expect(await blob.text()).toBe('%PDF-ficticio');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example/api/expedientes/id/documentos/2/pdf');
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe('Bearer credencial-ficticia');
  });
  it('no trata HTML como PDF y elimina la credencial si la descarga devuelve 401', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>error</html>', { headers: { 'Content-Type': 'text/html' } }));
    await expect(client.requestBlob('/segmento')).rejects.toThrow('PDF válido');
    client.setToken('credencial-ficticia');
    fetchMock.mockResolvedValueOnce(reply({}, 401)).mockResolvedValueOnce(reply({}));
    await expect(client.requestBlob('/segmento')).rejects.toBeInstanceOf(ApiError);
    await client.request('/capacidades');
    expect(new Headers(fetchMock.mock.calls[2]?.[1]?.headers).has('Authorization')).toBe(false);
  });
  it.each([{ detail: 'Texto del servidor' }, { detail: { mensaje: 'Texto del servidor' } }, { detail: [{ msg: 'Texto del servidor' }] }])('muestra los formatos de error de FastAPI', async body => {
    fetchMock.mockResolvedValue(reply(body, 422));
    await expect(client.request('/expedientes')).rejects.toThrow('Texto del servidor');
  });
  it('rechaza HTML del proxy y explica fallos de red', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Error</html>'));
    await expect(client.request('/expedientes')).rejects.toThrow('no es JSON');
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(client.request('/expedientes')).rejects.toThrow('CORS');
  });
  it('agota la espera sin repetir POST', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const pending = expect(client.request('/expedientes', { method: 'POST' }, 50)).rejects.toThrow('no se reintentó');
    await vi.advanceTimersByTimeAsync(51); await pending;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('limpia el token tras 401', async () => {
    client.setToken('token-de-prueba');
    fetchMock.mockResolvedValueOnce(reply({}, 401)).mockResolvedValueOnce(reply({}));
    await expect(client.request('/tupa/procedimientos')).rejects.toBeInstanceOf(ApiError);
    await client.request('/capacidades');
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).has('Authorization')).toBe(false);
  });
});

describe('persistencia y autenticación', () => {
  it('propaga el modo académico del servidor para mostrarlo antes de cargar un PDF', async () => {
    fetchMock.mockResolvedValueOnce(reply({ demo: true, seguridad: { expedientes_protegidos: true } })).mockResolvedValueOnce(reply({ procedimientos: [] }));
    const user = await new ApiAuthAdapter(client).login('Alias', 'token-ficticio');
    expect(user.demo).toBe(true);
    expect(user.role).toContain('demostración universitaria');
  });
  it('envía multipart archivo, recibe 201 y verifica con GET sin simular escritura', async () => {
    const adapter = new ApiExpedienteAdapter(client);
    fetchMock.mockResolvedValueOnce(reply(dossier, 201)).mockResolvedValueOnce(reply(dossier));
    const result = await adapter.uploadExpediente(new File(['%PDF-test'], 'test.pdf', { type: 'application/pdf' }));
    await adapter.saveExpediente(result);
    const post = fetchMock.mock.calls[0]?.[1];
    expect(post?.method).toBe('POST');
    expect((post?.body as FormData).get('archivo')).toBeInstanceOf(File);
    expect(new Headers(post?.headers).has('Content-Type')).toBe(false);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://api.example/api/expedientes/dossier-id');
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBeUndefined();
  });
  it('rechaza guardado si no existe, falla la red o se alteran campos', async () => {
    const adapter = new ApiExpedienteAdapter(client);
    fetchMock.mockResolvedValueOnce(reply({}, 404));
    await expect(adapter.saveExpediente(mapDossier(dossier))).rejects.toThrow('no se encontró');
    fetchMock.mockResolvedValueOnce(reply(dossier));
    const edited = mapDossier(dossier); edited.sections[0]!.fields[0]!.value = 'cambio';
    await expect(adapter.saveExpediente(edited)).rejects.toThrow('no coincide');
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(adapter.saveExpediente(mapDossier(dossier))).rejects.toThrow('conectar');
  });
  it('requiere backend protegido y credencial validada; logout elimina Bearer', async () => {
    const auth = new ApiAuthAdapter(client);
    fetchMock.mockResolvedValueOnce(reply({ seguridad: { expedientes_protegidos: false } }));
    await expect(auth.login('Alias', 'token')).rejects.toThrow('PROTECT_DOSSIER_ROUTES');
    fetchMock.mockResolvedValueOnce(reply({ seguridad: { expedientes_protegidos: true } })).mockResolvedValueOnce(reply({ procedimientos: [] }));
    expect((await auth.login('Alias', 'token')).name).toBe('Alias');
    expect(new Headers(fetchMock.mock.calls[2]?.[1]?.headers).get('Authorization')).toBe('Bearer token');
    await auth.logout(); fetchMock.mockResolvedValueOnce(reply({})); await client.request('/capacidades');
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).has('Authorization')).toBe(false);
  });
});

describe('TUPA', () => {
  it('usa las rutas reales, revisión y JSON compatibles', async () => {
    const service = new TupaUseCases(new ApiTupaAdapter(client));
    const checks = { identidad: { estado: 'CUMPLE' as const, nota: 'Revisado', paginas: [1] } };
    fetchMock.mockResolvedValue(reply({ revision: 1 }));
    await service.validate('id', 'TUPA', 0, checks);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example/api/expedientes/id/validacion');
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ codigo_tupa: 'TUPA', revision: 0, verificaciones: checks });
    expect(() => service.validate('id', 'TUPA', 0, { identidad: { ...checks.identidad, nota: '' } })).toThrow('nota');
  });
});
