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
import { Separator } from '@/components/ui/separator';

type KycSubmission = {
  id: string;
  user_id: string;
  identification_type: string;
  identification_number: string;
  document_urls: string[];
  selfie_url: string;
  address: string;
  phone_number: string;
  proof_of_address_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
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
    setSubmissions((data as KycSubmission[]) ?? []);
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
      <p className="mt-2 text-muted-foreground">
        Review and approve/reject identity verification requests.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6">
        {submissions.map((sub) => (
          <Card key={sub.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {sub.bank_users.full_name} ({sub.bank_users.email})
              </CardTitle>
              <CardDescription>
                <Badge
                  variant={
                    sub.status === 'pending'
                      ? 'secondary'
                      : sub.status === 'approved'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {sub.status}
                </Badge>{' '}
                • Submitted {new Date(sub.submitted_at).toLocaleString()}
                {sub.reviewed_at &&
                  ` • Reviewed ${new Date(sub.reviewed_at).toLocaleString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Identity Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID Type:</span>{' '}
                  {sub.identification_type.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">ID Number:</span>{' '}
                  {sub.identification_number}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Address:</span> {sub.address}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {sub.phone_number}
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div className="space-y-3">
                <div className="font-medium text-sm">Uploaded documents:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Identity docs ({sub.document_urls.length}):
                    </span>
                    <div className="mt-1 space-y-1">
                      {sub.document_urls.map((url, idx) => (
                        <div key={idx}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs"
                          >
                            Document {idx + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Selfie:</span>{' '}
                    <a
                      href={sub.selfie_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      View selfie
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Proof of address:
                    </span>{' '}
                    <a
                      href={sub.proof_of_address_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      View document
                    </a>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
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
        {submissions.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No KYC submissions yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
