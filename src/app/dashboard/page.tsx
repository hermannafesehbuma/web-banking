'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/SupbaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Account = {
  id: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  balance: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [kycStatus, setKycStatus] = useState<string>('pending');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      // fetch bank user to check KYC status
      const { data: bankUser } = await supabase
        .from('bank_users')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      const status = bankUser?.kyc_status ?? 'pending';
      setKycStatus(status);

      if (status === 'approved') {
        const { data: accs } = await supabase
          .from('accounts')
          .select('id, account_number, account_type, balance')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        setAccounts(accs ?? []);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        {kycStatus === 'approved'
          ? 'View balances and recent activity.'
          : 'Complete KYC to access your accounts.'}
      </p>

      {kycStatus === 'pending' && (
        <div className="mt-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="secondary">KYC Pending</Badge> Verification in
                progress
              </CardTitle>
              <CardDescription>
                Complete identity verification to unlock your accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Your identity verification is pending. Submit your documents to
                activate your checking and savings accounts.
              </p>
              <div className="flex gap-3">
                <Button asChild size="sm">
                  <a href="/kyc">Submit documents</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/kyc/status">Check status</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {kycStatus === 'approved' && accounts.length === 0 && (
        <div className="mt-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Accounts being created
              </CardTitle>
              <CardDescription>
                Your accounts will be ready shortly
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Your identity has been verified! We're setting up your checking
              and savings accounts now. Refresh this page in a moment.
            </CardContent>
          </Card>
        </div>
      )}

      {kycStatus === 'approved' && accounts.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {a.account_type} account
                </CardTitle>
                <CardDescription>
                  •••• {a.account_number.slice(-4)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">
                  ${a.balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
