import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type ProductShellProps = { children: ReactNode };

export function ProductShell({ children }: ProductShellProps) {
  return (
    <div className="min-h-screen bg-background text-ink flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
