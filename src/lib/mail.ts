import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Renders a premium, table-based responsive base template for emails.
 * Table-based layouts are the industry standard for maximum compatibility across mail clients (Outlook, Gmail, etc).
 */
const renderBaseTemplate = (content: string, previewText: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>AuthSystem Notification</title>
  <style type="text/css" rel="stylesheet" media="all">
    body { width: 100% !important; height: 100%; margin: 0; -webkit-text-size-adjust: none; background-color: #F4F7FA; color: #51545E; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    a { color: #4F46E5; }
    .email-wrapper { width: 100%; margin: 0; padding: 0; -webkit-counter-reset: 0; background-color: #F4F7FA; }
    .email-content { width: 100%; margin: 0; padding: 0; }
    .email-body { width: 100%; margin: 0; padding: 0; -webkit-text-size-adjust: none; background-color: #FFFFFF; }
    .email-body_inner { width: 570px; margin: 0 auto; padding: 0; background-color: #FFFFFF; border-radius: 12px; }
    .content-cell { padding: 45px; }
    .email-footer { width: 570px; margin: 0 auto; padding: 0; text-align: center; }
    .email-footer_inner { padding: 45px; }
    .button { background-color: #4F46E5; border-top: 10px solid #4F46E5; border-right: 18px solid #4F46E5; border-bottom: 10px solid #4F46E5; border-left: 18px solid #4F46E5; display: inline-block; color: #FFF; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; }
    .attributes { margin: 0 0 21px; }
    .attributes_content { background-color: #F4F7FA; padding: 16px; border-radius: 8px; }
    .h1 { margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left; }
    .p { margin: .4em 0 1.1875em; font-size: 16px; line-height: 1.625; color: #51545E; }
    .preview { display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; }
    @media only screen and (max-width: 600px) {
      .email-body_inner, .email-footer { width: 100% !important; }
    }
  </style>
</head>
<body>
  <span class="preview">${previewText}</span>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td class="content-cell">
                    <div align="center" style="margin-bottom: 30px;">
                      <a href="${process.env.NEXT_URL}" style="font-weight: 800; font-size: 24px; color: #4F46E5; text-decoration: none;">AuthSystem</a>
                    </div>
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td class="content-cell" align="center">
                    <p class="p" style="font-size: 12px; color: #A8AAAD;">© ${new Date().getFullYear()} AuthSystem. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_URL}/verify-email?token=${token}`;
  
  const content = `
    <h1 class="h1">Verify your email</h1>
    <p class="p">Welcome to AuthSystem! We're excited to have you on board. To complete your registration and unlock all features, please verify your email address by clicking the button below.</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <p class="p">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    <p class="p">— The AuthSystem Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Complete your registration',
    html: renderBaseTemplate(content, 'Verify your email to get started with AuthSystem.'),
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_URL}/reset-password?token=${token}`;
  
  const content = `
    <h1 class="h1">Reset your password</h1>
    <p class="p">We received a request to reset your password for your AuthSystem account. If you made this request, please click the button below to set a new password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button" style="background-color: #111827;">Reset Password</a>
    </div>
    <p class="p"><strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
    <p class="p">This link will expire in 1 hour.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Action Required: Reset your password',
    html: renderBaseTemplate(content, 'Reset your AuthSystem account password.'),
  });
};

export const sendSecurityAlertEmail = async (email: string, action: string, details: string) => {
  const content = `
    <h1 class="h1">Security Alert</h1>
    <p class="p">This is an automated notification to inform you that a security-related action was performed on your account.</p>
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 700; color: #991b1b;">Action: ${action}</p>
      <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 14px;">${details}</p>
    </div>
    <p class="p">If you did not perform this action, please secure your account immediately by changing your password or contacting support.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Security Alert: ${action}`,
    html: renderBaseTemplate(content, 'Important security update regarding your account.'),
  });
};
