// Admin sign-in: Supabase email/password → POST /api/auth/login → redirect.

import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Monogram } from '../../components/brand/Brand';
import { Button, FieldLabel, Input } from '../../components/ui/primitives';

export function AdminLogin() {
  const { admin, signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (admin) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await signIn(email, password).catch(() => {});
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Monogram />
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Back office access</span>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-5 border border-parchment/10 bg-emerald-light p-5 sm:p-8">
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error ? <p className="text-sm text-brass">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}