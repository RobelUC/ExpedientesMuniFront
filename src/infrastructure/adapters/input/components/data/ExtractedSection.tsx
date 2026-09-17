import React from 'react';
import type { Section } from '@domain/entities/Section';
import type { ExtractedField } from '@domain/valueObjects/ExtractedField';

export interface ExtractedSectionProps {
  section: Section;
  sectionNumber: number;
}

export function ExtractedSection({ section, sectionNumber }: ExtractedSectionProps) {
  return (
    <div className="p-4 rounded-xl border border-surface-container-highest bg-surface flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
          </div>
          <span className="font-title-md text-title-md text-on-surface font-semibold tracking-tight">
            {section.title}
          </span>
        </div>
        <span className="text-label-sm font-label-sm px-2.5 py-1 bg-surface-container-high rounded-full text-on-surface-variant font-medium">
          {section.subtitle}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
        {section.fields?.map((field: ExtractedField, index: number) => (
          <div key={index} className="flex flex-col bg-surface-container-lowest p-2 rounded-lg border border-surface-container">
            <span className="font-label-sm text-label-sm text-outline font-medium tracking-wide uppercase mb-1">
              {field.label}
            </span>
            <div className="flex items-start gap-1">
              {field.isVerified && (
                <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5" title="Verificado por IA">
                  verified
                </span>
              )}
              <span className={`text-body-md ${field.isCode ? 'font-code-md text-primary font-bold' : 'text-on-surface'} leading-tight`}>
                {field.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
