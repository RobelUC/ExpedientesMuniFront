import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { ApiClient } from '../src/infrastructure/adapters/output/ApiClient';
import { ApiAuthAdapter } from '../src/infrastructure/adapters/output/ApiAuthAdapter';
import { ApiExpedienteAdapter } from '../src/infrastructure/adapters/output/ApiExpedienteAdapter';
import { ApiTupaAdapter } from '../src/infrastructure/adapters/output/ApiTupaAdapter';

const backend = path.resolve('../backend');
const python = process.env.BACKEND_PYTHON || path.join(backend, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const available = existsSync(python) && existsSync(path.join(backend, 'tests/support_frontend_server.py'));
let child: ChildProcess | undefined;
afterAll(() => { child?.kill(); });

describe.skipIf(!available)('React adapters → FastAPI real en localhost', () => {
  it('autentica, carga un PDF, verifica la persistencia y guarda la revisión TUPA por HTTP real', async () => {
    const token = randomBytes(32).toString('hex');
    child = spawn(python, ['tests/support_frontend_server.py'], { cwd: backend, env: { ...process.env, CONTRACT_TOKEN: token }, windowsHide: true });
    let stderr = '';
    child.stderr?.on('data', chunk => { stderr += String(chunk); });
    const info = await new Promise<{ port: number; pdf: string }>((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`No arrancó la API local: ${stderr}`)), 15000);
      child!.stdout?.on('data', chunk => {
        output += String(chunk);
        const line = output.split('\n').map(value => value.trim()).find(value => value.startsWith('{'));
        if (line?.endsWith('}')) { clearTimeout(timer); resolve(JSON.parse(line)); }
      });
      child!.once('error', error => { clearTimeout(timer); reject(error); });
      child!.once('exit', code => { clearTimeout(timer); reject(new Error(`Servidor finalizó (${code}): ${stderr}`)); });
    });
    const base = `http://127.0.0.1:${info.port}`;
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try { ready = (await fetch(`${base}/health`)).ok; } catch { /* El puerto aún no escucha. */ }
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    expect(ready, stderr).toBe(true);
    const client = new ApiClient(base, false);
    const auth = new ApiAuthAdapter(client);
    await expect(auth.login('Alias de prueba', 'invalido')).rejects.toThrow('inválida');
    await auth.login('Alias de prueba', token);
    const repository = new ApiExpedienteAdapter(client);
    const file = new File([Buffer.from(info.pdf, 'base64')], 'ficticio.pdf', { type: 'application/pdf' });
    const dossier = await repository.uploadExpediente(file);
    expect(dossier.status).toBe('procesado');
    expect(dossier.sections[0]?.title).toBe('FUT');
    await repository.saveExpediente(dossier);
    expect((await repository.getExpedienteById(dossier.id))?.sha256).toBe(dossier.sha256);
    const tupa = new ApiTupaAdapter(client);
    const catalog = await tupa.getCatalog();
    const flow = await tupa.getWorkflow(dossier.id);
    const saved = await tupa.validate(dossier.id, catalog.procedimientos[0]!.code, flow.revision, {});
    expect(saved.revision).toBe(1);
    expect(saved.validation.estado).toBe('PENDIENTE_REVISION');
    await expect(tupa.validate(dossier.id, catalog.procedimientos[0]!.code, 0, {})).rejects.toThrow('versión');
    const preflight = await fetch(`${base}/api/expedientes`, { method: 'OPTIONS', headers: {
      Origin: 'https://municipal-test.vercel.app', 'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    } });
    expect(preflight.status).toBe(200);
    expect(preflight.headers.get('access-control-allow-origin')).toBe('https://municipal-test.vercel.app');
    await auth.logout();
    await expect(repository.getExpedienteById(dossier.id)).rejects.toThrow('inválida');
  }, 30000);
});
