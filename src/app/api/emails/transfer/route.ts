import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, amount, recipient, reference } =
      await request.json();

    if (!email || !userName || !amount || !recipient || !reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = emailTemplates.transferConfirmation(
      userName,
      amount,
      recipient,
      reference
    );
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transfer email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


