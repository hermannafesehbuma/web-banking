'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/SupbaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signErr) throw signErr;

      const user = data.user;
      const session = data.session;

      if (!user || !session)
        throw new Error('Login failed. Please check credentials.');

      // Store session in cookie for middleware to read
      document.cookie = `fortiz-session=${JSON.stringify({
        userId: user.id,
        accessToken: session.access_token,
      })};path=/;max-age=3600;SameSite=Lax`;

      console.log('Login successful:', { user: user.id, session: !!session });

      // Check if email is verified
      if (!user.email_confirmed_at) {
        router.push('/auth/verify-pending');
        return;
      }

      // Get redirect param if exists
      const redirectTo = searchParams.get('redirect') || undefined;

      // Fetch KYC status from bank_users
      const { data: bankUser, error: bankError } = await supabase
        .from('bank_users')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      if (bankError) throw bankError;

      const kycStatus = (bankUser?.kyc_status || 'pending').toLowerCase();

      // Redirect priority
      if (redirectTo && kycStatus === 'approved') {
        router.push(redirectTo);
      } else if (kycStatus === 'pending') {
        router.push('/kyc');
      } else if (kycStatus === 'approved') {
        router.push('/dashboard');
      } else {
        // rejected or other status
        router.push('/kyc/status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <Badge className="mb-4">Welcome back</Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Log in
      </h1>
      <div className="mt-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Access your account</CardTitle>
            <CardDescription>Use your email and password</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className="text-sm text-muted-foreground">
                New to Fortiz?{' '}
                <a className="text-primary hover:underline" href="/auth/signup">
                  Create an account
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
