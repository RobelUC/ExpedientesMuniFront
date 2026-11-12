// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { LoginScreen } from '../src/infrastructure/adapters/input/components/auth/LoginScreen';
import { DocumentViewer } from '../src/infrastructure/adapters/input/components/viewer/DocumentViewer';
import type { Expediente } from '../src/domain/entities/Expediente';

afterEach(cleanup);

it('asocia las etiquetas del acceso y anuncia errores al enviar con teclado', async () => {
  const user = userEvent.setup();
  const login = vi.fn().mockRejectedValue(new Error('Credencial sintética inválida.'));
  render(<LoginScreen onLogin={login} />);

  const username = screen.getByLabelText('Nombre para mostrar');
  const password = screen.getByLabelText('Token de evaluador');
  const submit = screen.getByRole('button', { name: 'Ingresar al Portal' });
  await user.tab();
  expect(document.activeElement).toBe(username);
  await user.keyboard('Alias de prueba');
  await user.tab();
  expect(document.activeElement).toBe(password);
  await user.keyboard('token-ficticio');
  await user.tab();
  expect(document.activeElement).toBe(submit);
  await user.keyboard('{Enter}');

  expect(login).toHaveBeenCalledWith('Alias de prueba', 'token-ficticio');
  expect((await screen.findByRole('alert')).textContent).toContain('Credencial sintética inválida.');
});

it('identifica el segmento activo y permite activar el zoom por teclado', async () => {
  const user = userEvent.setup();
  const expediente: Expediente = {
    id: 'ficticio', fileName: 'ficticio.pdf', fileSize: '1 MB', totalPages: 2,
    status: 'procesado', processingTime: '',
    sections: [
      { id: 'fut', title: 'FUT', subtitle: 'OCR', icon: 'article', pageRange: [1, 1], fields: [] },
      { id: 'dni', title: 'DNI', subtitle: 'OCR', icon: 'badge', pageRange: [2, 2], fields: [] },
    ],
  };
  render(<DocumentViewer expediente={expediente} />);

  expect(screen.getByRole('button', { name: 'FUT OCR', pressed: true })).toBeTruthy();
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'DNI OCR' }));
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'DNI OCR', pressed: true })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Siguiente' }).hasAttribute('disabled')).toBe(true);
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Acercar' }));
  await user.keyboard('{Enter}');
  expect(screen.getAllByRole('status').map(item => item.textContent)).toContain('110%');
});
