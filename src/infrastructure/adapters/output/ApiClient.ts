export function resolveApiUrl(value: string | undefined, production: boolean): string {
  if (!value?.trim() && production) throw new Error('Configure VITE_API_URL en Vercel y vuelva a compilar.');
  const url = new URL(value?.trim() || 'http://127.0.0.1:8000/api');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_API_URL debe ser una URL HTTP sin credenciales, consulta ni fragmento.');
  }
  if (production && url.protocol !== 'https:') throw new Error('VITE_API_URL debe usar HTTPS en producción.');
  const pathname = url.pathname.replace(/\/+$/, '');
  url.pathname = pathname.endsWith('/api') ? pathname : `${pathname}/api`;
  return url.toString().replace(/\/+$/, '');
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly detail?: unknown) { super(message); }
}

function errorMessage(body: unknown, status: number): string {
  const detail = body && typeof body === 'object' && 'detail' in body ? body.detail : undefined;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object' && 'mensaje' in detail && typeof detail.mensaje === 'string') return detail.mensaje;
  if (Array.isArray(detail)) return detail.map(item => typeof item?.msg === 'string' ? item.msg : 'Entrada inválida').join('; ');
  if (status === 401) return 'La credencial no es válida o ha expirado. Vuelva a ingresar.';
  if (status === 413) return 'El PDF supera el tamaño permitido por el servidor.';
  if (status === 502 || status === 504) return 'El servidor no respondió a tiempo. Consulte el expediente antes de reenviarlo.';
  return `La solicitud falló (HTTP ${status}).`;
}

export class ApiClient {
  private token = '';
  constructor(private readonly configuredUrl = import.meta.env.VITE_API_URL,
              private readonly production = import.meta.env.PROD) {}
  setToken(token: string) { this.token = token; }

  async request<T>(path: string, options: RequestInit = {}, timeoutMs = 180000): Promise<T> {
    const base = resolveApiUrl(this.configuredUrl, this.production);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(options.headers);
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);
    try {
      const response = await fetch(`${base}${path}`, { ...options, headers, signal: controller.signal, cache: 'no-store' });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) this.token = '';
        throw new ApiError(errorMessage(body, response.status), response.status, body);
      }
      if (body === null) throw new Error('El servidor devolvió una respuesta que no es JSON. Revise VITE_API_URL.');
      return body as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted) throw new Error('Tiempo de espera agotado. El servidor puede haber guardado el expediente; no se reintentó automáticamente.');
      if (error instanceof TypeError) throw new Error('No se pudo conectar con la API. Revise conexión, VITE_API_URL y CORS del servidor.');
      throw error;
    } finally { clearTimeout(timer); }
  }
}
export const apiClient = new ApiClient();
