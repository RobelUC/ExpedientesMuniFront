import React, { useState } from 'react';
import { EntitySelector } from '../sidebar/EntitySelector';
import { OcrStatusCard } from '../sidebar/OcrStatusCard';
import { NavItem } from '../sidebar/NavItem';
import { SecurityBadge } from '../sidebar/SecurityBadge';
import { mockOcrStatus, navItems, entityOptions } from '@application/services/MockExpedienteData';

export function Sidebar() {
  const [activeNavPath, setActiveNavPath] = useState('carga-de-expediente');

  return (
    <aside className="fixed left-0 top-0 h-full w-[16rem] bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div>
        <EntitySelector options={entityOptions} />
        <OcrStatusCard status={mockOcrStatus} />
        <div className="px-4 py-1 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Operaciones Documentales</div>
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={activeNavPath === item.path}
              onClick={() => setActiveNavPath(item.path)}
            />
          ))}
        </nav>
      </div>
      <SecurityBadge />
    </aside>
  );
}
