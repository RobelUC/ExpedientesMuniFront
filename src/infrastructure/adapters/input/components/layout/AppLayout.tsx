import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { User } from '@domain/entities/User';

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  onUpload?: (file: File) => void;
}

export function AppLayout({ children, user, onUpload }: AppLayoutProps) {
  return (
    <>
      <Sidebar />
      <div className="pl-[16rem]">
        <Header user={user} onUpload={onUpload} />
        <main className="relative pt-16 bg-surface w-full px-6 pb-8">
          {children}
        </main>
      </div>
    </>
  );
}
