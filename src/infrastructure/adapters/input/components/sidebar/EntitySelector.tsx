import React from 'react';

interface EntitySelectorProps {
  options: { value: string; label: string }[];
}

export function EntitySelector({ options }: EntitySelectorProps) {
  return (
    <div className="h-16 px-4 flex items-center gap-2 bg-surface-container-low">
      <span className="material-symbols-outlined text-secondary text-[24px]">account_balance</span>
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Entidad Reguladora</p>
        <select className="font-label-md text-label-md text-on-surface bg-transparent focus:outline-none cursor-pointer pr-1">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
