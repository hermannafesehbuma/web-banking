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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Send,
  DollarSign,
  AlertCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Account = {
  id: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  balance: number;
};

type Transaction = {
  id: string;
  amount: number;
  type: 'credit' | 'debit' | 'refund';
  description: string;
  created_at: string;
  balance_after?: number;
  category?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [userName, setUserName] = useState('');

  // Mock data for analytics (replace with real data from transactions)
  const spendingByCategory = [
    { name: 'Food & Dining', value: 450, color: '#0088FE' },
    { name: 'Transportation', value: 200, color: '#00C49F' },
    { name: 'Shopping', value: 300, color: '#FFBB28' },
    { name: 'Bills & Utilities', value: 550, color: '#FF8042' },
    { name: 'Entertainment', value: 150, color: '#8884d8' },
  ];

  const monthlyTrend = [
    { month: 'Jul', income: 3200, expenses: 1850 },
    { month: 'Aug', income: 3200, expenses: 2100 },
    { month: 'Sep', income: 3500, expenses: 1950 },
    { month: 'Oct', income: 3200, expenses: 1650 },
  ];

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Get user info
    const { data: bankUser } = await supabase
      .from('bank_users')
      .select('kyc_status, full_name')
      .eq('id', user.id)
      .single();

    const status = bankUser?.kyc_status ?? 'pending';
    setKycStatus(status);
    setUserName(bankUser?.full_name || user.email || '');

    if (status === 'approved') {
      // Fetch accounts
      const { data: accs } = await supabase
        .from('accounts')
        .select('id, account_number, account_type, balance')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      setAccounts(accs ?? []);
      if (accs && accs.length > 0) {
        // Fetch transactions for first account
        const { data: txns } = await supabase
          .from('transactions')
          .select('id, amount, type, description, created_at')
          .eq('account_id', accs[0].id)
          .order('created_at', { ascending: false })
          .limit(10);

        setTransactions(txns ?? []);
      }
    }
    setLoading(false);
  };

  if (loading) return null;

  // If KYC not approved, show gating message
  if (kycStatus !== 'approved') {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Complete KYC to access your accounts.
        </p>
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
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0) || 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </a>
        </Button>
      </div>

      {/* 1. Account Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Total Balance</CardTitle>
              <CardDescription>Across all accounts</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-semibold tracking-tight">
                ${totalBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                USD • Updated just now
              </p>
            </CardContent>
          </Card>

          {accounts.map((acc) => (
            <Card key={acc.id}>
              <CardHeader>
                <CardTitle className="text-sm capitalize flex items-center justify-between">
                  {acc.account_type}
                  <Badge variant="outline" className="text-xs font-normal">
                    ****{acc.account_number.slice(-4)}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Available balance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">
                  ${acc.balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Send className="h-5 w-5" />
            <span className="text-sm">Transfer</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Download className="h-5 w-5" />
            <span className="text-sm">Deposit</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <ArrowUpRight className="h-5 w-5" />
            <span className="text-sm">Send Money</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm">Pay Bills</span>
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </div>
              <CardDescription>
                Latest activity on your accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No transactions yet. Start using your account!
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            txn.type === 'credit'
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : 'bg-red-100 dark:bg-red-900/20'
                          }`}
                        >
                          {txn.type === 'credit' ? (
                            <ArrowDownRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {txn.description || 'Transaction'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.created_at).toLocaleDateString()} •{' '}
                            {txn.category || 'General'}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          txn.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {txn.type === 'credit' ? '+' : '-'}$
                        {Math.abs(txn.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Spending Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spending Analytics</CardTitle>
              <CardDescription>
                Your spending breakdown this month
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <p className="text-sm font-medium mb-4">By Category</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category List */}
                <div>
                  <p className="text-sm font-medium mb-4">Top Categories</p>
                  <div className="space-y-3">
                    {spendingByCategory.map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </div>
                        <span className="font-medium">${cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Trend */}
              <Separator className="my-6 h-px" />
              <div>
                <p className="text-sm font-medium mb-4">Income vs Expenses</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#00C49F"
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Transfers & Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Transfer</CardTitle>
              <CardDescription>Send money to another account</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fromAccount">From</Label>
                  <select
                    id="fromAccount"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={accounts[0]?.id}
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type.charAt(0).toUpperCase() +
                          acc.account_type.slice(1)}{' '}
                        ****
                        {acc.account_number.slice(-4)} - $
                        {acc.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recipient">To (Account or Email)</Label>
                  <Input id="recipient" placeholder="Account number or email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input id="note" placeholder="What's this for?" />
                </div>
                <Button type="button" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* 7. Insights & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-md">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Great savings!
                      </p>
                      <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                        You saved $350 more this month vs last month
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Bill reminder
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                        Utility bill due in 3 days - $89.50
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-md">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Spending alert
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                        You spent 20% more on dining this month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Savings Goal</CardTitle>
              <CardDescription>Emergency fund</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">$2,500 / $5,000</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: '50%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  50% complete • $2,500 to go
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Statements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statements</CardTitle>
              <CardDescription>Download account statements</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                October 2025
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                September 2025
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                View all statements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
