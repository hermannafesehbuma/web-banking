import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // After email verification, get user and check KYC status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: bankUser } = await supabase
        .from('bank_users')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      const kycStatus = bankUser?.kyc_status ?? 'pending';

      // Redirect based on KYC status
      if (kycStatus === 'pending') {
        return NextResponse.redirect(new URL('/kyc', request.url));
      } else if (kycStatus === 'approved') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/kyc/status', request.url));
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
