import React from 'react';
import type { NavItemData } from '@domain/valueObjects/NavItemData';

interface NavItemProps {
  item: NavItemData;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({ item, isActive, onClick }: NavItemProps) {
  const activeClasses = 'bg-primary-container text-on-primary font-semibold rounded-lg';
  const inactiveClasses = 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface';

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
      <span className="font-label-lg text-label-lg">{item.label}</span>
    </a>
  );
}
