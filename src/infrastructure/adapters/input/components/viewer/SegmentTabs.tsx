import React from 'react';
import type { Section } from '@domain/entities/Section';

export interface SegmentTabsProps {
  sections: Section[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentTabs({ sections, activeIndex, onSelect }: SegmentTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((section, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={section.id}
            onClick={() => onSelect(index)}
            className={`flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl transition-all border ${
              isActive
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border-outline-variant hover:border-outline'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[20px] opacity-90">{section.icon}</span>
              <span className="font-label-lg font-bold tracking-wide">{section.title}</span>
            </div>
            <span className={isActive ? 'text-label-sm font-label-sm opacity-80' : 'text-label-sm font-label-sm text-on-surface-variant'}>
              {section.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
