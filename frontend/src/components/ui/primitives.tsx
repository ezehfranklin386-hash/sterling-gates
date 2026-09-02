// Core form/button primitives. Branded per docs/frontend-spec.md:
// brass-filled CTAs with emerald text; parchment hover; labelled inputs.

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'outline';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const SCALES: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-[0.7rem]',
  md: 'px-7 py-3 text-[0.8rem]',
  lg: 'px-9 py-4 text-[0.85rem]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    `inline-flex items-center justify-center gap-2.5 rounded-full font-sans uppercase tracking-[0.18em] ` +
    `transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ` +
    SCALES[size];
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-brass text-emerald hover:bg-parchment hover:shadow-[0_10px_30px_-10px_rgba(230,203,133,0.5)]',
    ghost: 'text-parchment hover:text-brass',
    outline:
      'border border-gold/60 text-brass hover:bg-gold/10 hover:border-gold',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block border border-gold/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold ${className}`}
    >
      {children}
    </span>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.18em] text-gold">
      {children}
    </label>
  );
}

const inputClasses =
  'w-full bg-emerald-light border border-parchment/20 px-4 py-3 text-parchment min-h-[48px] ' +
  'placeholder:text-parchment/40 focus:border-gold focus:outline-none ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass transition-colors';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClasses} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClasses} min-h-32 ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${inputClasses} appearance-none [&>option]:bg-emerald [&>option]:text-parchment ${className}`}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-brass">{children}</p>;
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
          checked ? 'bg-brass border-brass' : 'bg-emerald-light border-parchment/30'
        }`}
      >
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
            checked ? 'left-6 bg-emerald' : 'left-1 bg-parchment/60'
          }`}
        />
      </button>
      <span className="text-sm text-parchment/80">{label}</span>
    </label>
  );
}