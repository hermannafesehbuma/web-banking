'use client';

import { useEffect, useState } from 'react';
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

type KycSubmission = {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  bank_users: {
    full_name: string;
    email: string;
  };
};

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('kyc_submissions')
      .select('*, bank_users(full_name, email)')
      .order('submitted_at', { ascending: false });
    setSubmissions((data as any) ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('kyc_submissions')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      loadSubmissions();
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <Badge className="mb-4">Admin</Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        KYC Submissions
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-6">
        {submissions.map((sub) => (
          <Card key={sub.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {sub.bank_users.full_name} ({sub.bank_users.email})
              </CardTitle>
              <CardDescription>
                {sub.document_type} • {sub.status} •{' '}
                {new Date(sub.submitted_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4">
                <a
                  href={sub.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  View document
                </a>
              </div>
              {sub.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => updateStatus(sub.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(sub.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
