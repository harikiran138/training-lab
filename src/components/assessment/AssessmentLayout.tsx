import React from 'react';

interface AssessmentLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AssessmentLayout({ sidebar, children }: AssessmentLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Area */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-full z-10">
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
