// Brass-styled confirmation dialog for destructive admin actions.

import type { ReactNode } from 'react';
import { Button } from './primitives';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-emerald/80 p-4">
      <div className="w-full max-w-sm border border-gold/40 bg-emerald-light p-7 shadow-2xl">
        <h3 className="display text-2xl text-brass">{title}</h3>
        {body && <div className="mt-2 text-sm text-parchment/80">{body}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}