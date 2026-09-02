// Lightweight admin table primitives.

import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-parchment/10">
      <table className="w-full border-collapse text-left text-sm">
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
  return (
    <th
      className={`px-3.5 py-2.5 text-[0.7rem] uppercase tracking-[0.15em] font-medium sm:px-4 sm:py-3 touch-target ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-3.5 py-2.5 text-sm text-parchment/85 sm:px-4 sm:py-3 touch-target ${className}`}
    >
      {children}
    </td>
  );
}

export function TRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-parchment/5 hover:bg-emerald-light/40">{children}</tr>;
}