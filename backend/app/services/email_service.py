import httpx
import logging
from datetime import datetime
from app.config import get_settings

logger = logging.getLogger("email_service")
settings = get_settings()


async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured")
        return False

    try:
        logger.info(f"Sending email to {to_email} via Resend API (key: {settings.RESEND_API_KEY[:8]}...)")
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_body,
                },
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
            logger.info(f"Resend API response: {resp.status_code} - {resp.text[:500]}")
            if resp.status_code != 200:
                logger.error(f"Resend API error {resp.status_code}: {resp.text}")
            return resp.status_code == 200
    except Exception as e:
        logger.error(f"Failed to send email: {type(e).__name__}: {e}")
        return False


async def send_password_reset_email(to_email: str, reset_token: str, frontend_url: str | None = None) -> bool:
    origin = frontend_url or settings.FRONTEND_URL
    reset_link = f"{origin}/reset-password?token={reset_token}"
    subject = "Reset Your Password - AI Script Generator"
    year = datetime.now().year
    html_body = f"""\
<html>
<body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: #312e81; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">AI Script Generator</h1>
              <p style="color: #c7d2fe; margin: 8px 0 0 0; font-size: 13px;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                You requested a password reset for your account. Click the button below to set a new password:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{reset_link}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
                This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; padding: 20px 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; {year} AI Script Generator</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return await send_email(to_email, subject, html_body)
