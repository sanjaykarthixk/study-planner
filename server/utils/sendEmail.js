const axios = require('axios');

const sendOTPEmail = async (email, otp, type) => {
  const subject = type === 'verify'
    ? 'Verify your StudyOS account'
    : 'Reset your StudyOS password';

  const message = type === 'verify'
    ? `Your verification OTP is: <b>${otp}</b>. It expires in 10 minutes.`
    : `Your password reset OTP is: <b>${otp}</b>. It expires in 10 minutes.`;

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: 'StudyOS', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#13131a;color:#e8e6e0;border-radius:12px;">
          <h2 style="color:#7c6fff;margin-bottom:16px;">StudyOS</h2>
          <p style="margin-bottom:24px;">${message}</p>
          <div style="background:#1a1a22;border:1px solid #2e2e3a;border-radius:8px;padding:20px;text-align:center;">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c6fff;font-family:monospace;">${otp}</span>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#5a5a66;">If you did not request this, ignore this email.</p>
        </div>
      `,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
};

module.exports = { sendOTPEmail };