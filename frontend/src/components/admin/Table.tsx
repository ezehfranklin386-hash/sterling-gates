// Lightweight admin table primitives.

import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto -mx-5 md:mx-0 border border-parchment/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-parchment/10 bg-emerald-darker text-[0.7rem] uppercase tracking-[0.15em] text-gold">
        {children}
      </tr>
    </thead>
  );
}

export function Th({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

export function Td({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top text-parchment/85 ${className}`}>{children}</td>;
}

export function TRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-parchment/5 hover:bg-emerald-light/40">{children}</tr>;
}
