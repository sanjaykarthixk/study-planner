const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp, type) => {
  const subject = type === 'verify'
    ? 'Verify your StudyOS account'
    : 'Reset your StudyOS password';

  const message = type === 'verify'
    ? `Your verification OTP is: <b>${otp}</b>. It expires in 10 minutes.`
    : `Your password reset OTP is: <b>${otp}</b>. It expires in 10 minutes.`;

  await resend.emails.send({
    from: 'StudyOS <onboarding@resend.dev>',
    to: email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#13131a;color:#e8e6e0;border-radius:12px;">
        <h2 style="color:#7c6fff;margin-bottom:16px;">◈ StudyOS</h2>
        <p style="margin-bottom:24px;">${message}</p>
        <div style="background:#1a1a22;border:1px solid #2e2e3a;border-radius:8px;padding:20px;text-align:center;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c6fff;font-family:monospace;">${otp}</span>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#5a5a66;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };
```

Then add to Render environment variables:
```
RESEND_API_KEY = your_resend_api_key