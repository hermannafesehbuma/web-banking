import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

const FROM_EMAIL =
  process.env.NEXT_PUBLIC_FROM_EMAIL || 'Fortiz Bank <noreply@resend.dev>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log('📧 Starting email send process...');
  console.log('📧 FROM_EMAIL:', FROM_EMAIL);
  console.log('📧 TO:', to);
  console.log('📧 SUBJECT:', subject);
  console.log(
    '📧 RESEND_API_KEY exists:',
    !!process.env.NEXT_PUBLIC_RESEND_API_KEY
  );

  try {
    console.log('📧 Calling resend.emails.send...');
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    console.log('✅ Email sent successfully:', data);
    console.log('✅ Email ID:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email send exception:', error);
    console.error('❌ Exception details:', JSON.stringify(error, null, 2));
    return { success: false, error };
  }
}

// Email Templates

export const emailTemplates = {
  // 1. Welcome Email (Account Created)
  welcomeEmail: (userName: string, userEmail: string) => ({
    subject: 'Welcome to Fortiz Bank! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Fortiz Bank!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Thank you for choosing Fortiz Bank! Your account has been successfully created.</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p>Next steps:</p>
            <ol>
              <li>Complete your KYC verification to unlock all features</li>
              <li>Set up your checking and savings accounts</li>
              <li>Start managing your finances with ease</li>
            </ol>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fortiz Bank. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 2. KYC Submitted
  kycSubmitted: (userName: string) => ({
    subject: 'KYC Verification Submitted Successfully',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .info-box { background: #f9fafb; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ KYC Submitted</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>We've received your KYC verification documents and they are currently under review.</p>
            <div class="info-box">
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our team will review your documents within 24-48 hours</li>
                <li>You'll receive an email once your verification is complete</li>
                <li>After approval, you'll have full access to all banking features</li>
              </ul>
            </div>
            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 3. KYC Approved
  kycApproved: (userName: string) => ({
    subject: '🎉 Your KYC Verification is Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .success-box { background: #f9fafb; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 KYC Approved!</h1>
          </div>
          <div class="content">
            <h2>Congratulations, ${userName}!</h2>
            <p>Great news! Your KYC verification has been <strong>approved</strong>.</p>
            <div class="success-box">
              <p><strong>You now have access to:</strong></p>
              <ul>
                <li>✓ Full checking and savings accounts</li>
                <li>✓ Money transfers</li>
                <li>✓ Bill payments</li>
                <li>✓ Card requests</li>
                <li>✓ All premium features</li>
              </ul>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Access Your Dashboard</a>
            <p>Start exploring all the features Fortiz Bank has to offer!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 4. KYC Rejected
  kycRejected: (userName: string, reason?: string) => ({
    subject: 'KYC Verification - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning-box { background: #f9fafb; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Verification Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Unfortunately, we were unable to approve your KYC verification at this time.</p>
            ${
              reason
                ? `<div class="warning-box"><p><strong>Reason:</strong> ${reason}</p></div>`
                : ''
            }
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Review your submitted documents</li>
              <li>Ensure all information is clear and accurate</li>
              <li>Resubmit your KYC application</li>
            </ul>
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/kyc" class="button">Resubmit KYC</a>
            <p>If you need assistance, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 5. Card Request Created
  cardRequested: (
    userName: string,
    cardType: string,
    deliveryAddress: string
  ) => ({
    subject: `Your ${cardType} Card Request is Being Processed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .info-box { background: #f9fafb; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Card Request Received</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Your ${cardType} card request has been successfully submitted!</p>
            <div class="info-box">
              <h3 style="margin-top: 0; color: #000;">Card Request Details</h3>
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>Card Type:</strong></span>
                  <span>${cardType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>Delivery Address:</strong></span>
                  <span>${deliveryAddress}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span><strong>Expected Delivery:</strong></span>
                  <span>5-7 business days</span>
                </div>
              </div>
            </div>

            <div style="background: #f9fafb; border-left: 4px solid #374151; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0; color: #374151;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0 0 0; color: #374151;">
                <li>Our team will contact you within 24 hours to verify your request</li>
                <li>Your card will be processed and manufactured</li>
                <li>You'll receive a shipping notification once your card is dispatched</li>
                <li>Your card will be delivered to the address provided</li>
              </ul>
            </div>

            <p>You can track your card request in your dashboard under "My Cards".</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/cards" style="display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View My Cards</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you have any questions about your card request, please contact our support team.
            </p>
            
            <p>Thank you for banking with Fortiz!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 6. Money Transfer Confirmation
  transferConfirmation: (
    userName: string,
    amount: number,
    recipient: string,
    reference: string
  ) => ({
    subject: `Transfer Confirmation - $${amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .transaction-details { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Transfer Successful</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Your money transfer was successful!</p>
            <div class="transaction-details">
              <h3>Transaction Details</h3>
              <div class="detail-row">
                <span>Amount:</span>
                <strong>$${amount.toFixed(2)}</strong>
              </div>
              <div class="detail-row">
                <span>Recipient:</span>
                <strong>${recipient}</strong>
              </div>
              <div class="detail-row">
                <span>Reference:</span>
                <strong>${reference}</strong>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <strong>${new Date().toLocaleString()}</strong>
              </div>
            </div>
            <p>Thank you for using Fortiz Bank!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 7. Bill Payment Confirmation
  billPaymentConfirmation: (
    userName: string,
    amount: number,
    payeeName: string,
    reference: string
  ) => ({
    subject: `Bill Payment Confirmation - $${amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .transaction-details { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Bill Payment Successful</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Your bill payment was processed successfully!</p>
            <div class="transaction-details">
              <h3>Payment Details</h3>
              <div class="detail-row">
                <span>Amount:</span>
                <strong>$${amount.toFixed(2)}</strong>
              </div>
              <div class="detail-row">
                <span>Payee:</span>
                <strong>${payeeName}</strong>
              </div>
              <div class="detail-row">
                <span>Reference:</span>
                <strong>${reference}</strong>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <strong>${new Date().toLocaleString()}</strong>
              </div>
            </div>
            <p>Keep this email for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 8. Refund Created (User)
  refundCreated: (
    userName: string,
    amount: number,
    reason: string,
    refundId: string
  ) => ({
    subject: `💰 Refund Created - $${amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .info-box { background: #f9fafb; border-left: 4px solid #000; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Refund Created</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your refund has been processed</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Great news! A refund has been created for your account and is being processed.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #000;">Refund Details</h3>
              <div class="detail-row">
                <span><strong>Amount:</strong></span>
                <span style="font-size: 18px; font-weight: bold; color: #000;">$${amount.toFixed(
                  2
                )}</span>
              </div>
              <div class="detail-row">
                <span><strong>Reason:</strong></span>
                <span style="text-transform: capitalize;">${reason.replace(
                  '_',
                  ' '
                )}</span>
              </div>
              <div class="detail-row">
                <span><strong>Reference ID:</strong></span>
                <span style="font-family: monospace;">${refundId}</span>
              </div>
              <div class="detail-row">
                <span><strong>Date Created:</strong></span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
            </div>

                <div style="background: #f9fafb; border-left: 4px solid #374151; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0; color: #374151;"><strong>What happens next?</strong></p>
                  <ul style="margin: 10px 0 0 0; color: #374151;">
                    <li>Our team will contact you within 24 hours to discuss next steps</li>
                    <li>The refund will be credited to your checking account</li>
                    <li>You'll receive another email once the refund is completed</li>
                    <li>Processing typically takes 1-3 business days</li>
                  </ul>
                </div>

            <p>You can track this refund in your dashboard under "My Refunds".</p>
            
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/dashboard/refunds" class="button">View Refunds</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you have any questions about this refund, please contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fortiz Bank. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 9. Refund Status Updated
  refundStatusUpdate: (
    userName: string,
    amount: number,
    status: string,
    refundId: string
  ) => ({
    subject: `Refund ${status} - $${amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .status-box { background: #f9fafb; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Refund Status Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Your refund status has been updated.</p>
            <div class="status-box">
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Reference ID:</strong> ${refundId}</p>
            </div>
            ${
              status === 'completed'
                ? '<p>The refund has been processed and the funds have been credited to your account.</p>'
                : status === 'rejected'
                ? '<p>Unfortunately, your refund request was not approved. Please contact support if you have questions.</p>'
                : '<p>Your refund is being processed.</p>'
            }
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 10. Refund Created (Admin Notification)
  refundCreatedAdmin: (
    userName: string,
    userEmail: string,
    amount: number,
    reason: string,
    refundId: string
  ) => ({
    subject: `🔔 New Refund Request from ${userName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .detail-box { background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Refund Request</h1>
          </div>
          <div class="content">
            <h2>Admin Alert</h2>
            <p>A new refund request requires your attention.</p>
            <div class="detail-box">
              <p><strong>User:</strong> ${userName} (${userEmail})</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Reference:</strong> ${refundId}</p>
            </div>
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/admin/refunds" class="button">Review Refund</a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 11. Refund Approved (User Notification)
  refundApproved: (userName: string, amount: number, refundId: string) => ({
    subject: `✅ Refund Approved - $${amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .info-box { background: #f9fafb; border-left: 4px solid #000; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Refund Approved</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your refund has been approved</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Great news! Your refund has been approved and is ready to be transferred to your checking account.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #000;">Refund Details</h3>
              <div class="detail-row">
                <span><strong>Amount:</strong></span>
                <span style="font-size: 18px; font-weight: bold; color: #000;">$${amount.toFixed(
                  2
                )}</span>
              </div>
              <div class="detail-row">
                <span><strong>Reference ID:</strong></span>
                <span style="font-family: monospace;">${refundId}</span>
              </div>
              <div class="detail-row">
                <span><strong>Status:</strong></span>
                <span style="color: #059669; font-weight: bold;">✅ Approved</span>
              </div>
              <div class="detail-row">
                <span><strong>Date Approved:</strong></span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div style="background: #f9fafb; border-left: 4px solid #374151; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0; color: #374151;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0 0 0; color: #374151;">
                <li>Your refund will be transferred to your checking account</li>
                <li>You'll receive another email once the transfer is completed</li>
                <li>The transfer typically takes 1-3 business days</li>
                <li>You can track the status in your dashboard</li>
              </ul>
            </div>

            <p>You can view your refunds and account balance in your dashboard.</p>
            
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/dashboard/refunds" class="button">View My Refunds</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you have any questions about this refund, please contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fortiz Bank. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 12. KYC Submitted (Admin Notification)
  kycSubmittedAdmin: (
    userName: string,
    userEmail: string,
    submissionId: string,
    idType: string,
    address: string,
    phoneNumber: string
  ) => ({
    subject: `🔔 New KYC Submission from ${userName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .detail-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .urgent-box { background: #f9fafb; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New KYC Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required - Review Required</p>
          </div>
          <div class="content">
            <h2>Admin Alert</h2>
            <p>A new KYC submission has been submitted and requires your review.</p>
            
            <div class="urgent-box">
              <p style="margin: 0; color: #374151;"><strong>⚠️ Action Required:</strong> Please review this KYC submission within 24-48 hours.</p>
            </div>

            <div class="detail-box">
              <h3 style="margin-top: 0; color: #000;">Submission Details</h3>
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>User Name:</strong></span>
                  <span>${userName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>Email:</strong></span>
                  <span>${userEmail}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>ID Type:</strong></span>
                  <span style="text-transform: uppercase;">${idType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>Phone:</strong></span>
                  <span>${phoneNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span><strong>Address:</strong></span>
                  <span>${address}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span><strong>Submission ID:</strong></span>
                  <span style="font-family: monospace;">${submissionId}</span>
                </div>
              </div>
            </div>

            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0; color: #0c4a6e;"><strong>Next Steps:</strong></p>
              <ul style="margin: 10px 0 0 0; color: #0c4a6e;">
                <li>Review the submitted documents and information</li>
                <li>Verify the identity documents are clear and valid</li>
                <li>Check that the address matches the proof of address</li>
                <li>Approve or reject the submission</li>
              </ul>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/kyc" class="button">Review KYC Submission</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              This is an automated notification. Please review the submission promptly to ensure good user experience.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
