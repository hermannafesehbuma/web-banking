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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function KycPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [docType, setDocType] = useState('passport');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      // Check if email is verified
      if (!user.email_confirmed_at) {
        router.replace('/auth/verify-pending');
        return;
      }
      setUserId(user.id);
      setSessionChecked(true);
    });
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      // upload to Supabase Storage (bucket: 'kyc')
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('kyc')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;
      const { data: publicUrl } = supabase.storage
        .from('kyc')
        .getPublicUrl(filePath);

      const { error: insertErr } = await supabase
        .from('kyc_submissions')
        .insert({
          user_id: userId,
          document_type: docType,
          document_url: publicUrl.publicUrl,
          status: 'pending',
        });
      if (insertErr) throw insertErr;
      setMessage('KYC submitted successfully! Redirecting to status page...');
      setTimeout(() => router.push('/kyc/status'), 2000);
    } catch (err: any) {
      setError(err.message ?? 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <Badge className="mb-4">KYC</Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Verify your identity
      </h1>
      <div className="mt-8 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload documents</CardTitle>
            <CardDescription>
              We review submissions within 1–2 business days
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="docType">Document type</Label>
                <select
                  id="docType"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                  <option value="residence_permit">Residence Permit</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Document file (max 10MB)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Accepted: JPG, PNG, PDF. Ensure the document is clear,
                  well-lit, and all text is legible.
                </p>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {message && (
                <div className="text-sm text-green-700">{message}</div>
              )}
              <Button type="submit" disabled={loading || !file}>
                {loading ? 'Submitting...' : 'Submit KYC'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
