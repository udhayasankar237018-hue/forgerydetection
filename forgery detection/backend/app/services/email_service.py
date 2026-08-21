import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from app.core.config import settings
from app.core.logger import logger


def send_password_reset_email(
    to_email: str,
    recipient_name: str,
    reset_code: str,
    reset_token: str
) -> Dict[str, Any]:
    """
    Sends a security verification code and password reset link to the analyst's email.
    If SMTP server is configured in .env, sends actual email via SMTP.
    If SMTP is not configured, logs to console and returns simulated status.
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}&email={to_email}"
    
    subject = "ForgeryGuard AI — Password Reset Verification Code"
    
    # HTML formatted email body
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }}
        .card {{ max-width: 540px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 32px 24px; }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .shield-icon {{ font-size: 28px; color: #38bdf8; }}
        .title {{ color: #38bdf8; font-size: 20px; font-weight: 700; margin-top: 8px; }}
        .code-box {{ background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }}
        .code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; text-align: center; }}
        .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="shield-icon">🛡️</div>
          <div class="title">ForgeryGuard AI Forensic Security</div>
          <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;">Cryptographic Password Reset Request</p>
        </div>

        <p>Hello <strong>{recipient_name or 'Analyst'}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          We received a security request to reset the access credentials for your account (<strong>{to_email}</strong>).
        </p>

        <div class="code-box">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
          <div class="code">{reset_code}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Valid for 15 minutes</div>
        </div>

        <div style="text-align: center;">
          <a href="{reset_url}" class="btn" target="_blank">Reset Password Directly &rarr;</a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
          If you did not initiate this request, you can safely disregard this message. Your security clearance remains protected.
        </p>

        <div class="footer">
          &copy; ForgeryGuard AI Forensic Directorate &bull; Automated Clearance Dispatch
        </div>
      </div>
    </body>
    </html>
    """

    plain_text = f"""
    ForgeryGuard AI Security - Password Reset
    
    Hello {recipient_name or 'Analyst'},
    
    Your 6-digit verification code is: {reset_code}
    (Valid for 15 minutes)
    
    Direct reset link: {reset_url}
    
    If you did not request this, please ignore this email.
    """

    # Check if SMTP credentials are configured
    if settings.SMTP_HOST and settings.SMTP_USER:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email

            part1 = MIMEText(plain_text, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                if settings.SMTP_TLS:
                    server.starttls()
            
            if settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
            server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
            server.quit()
            
            logger.info(f"Dispatched real password reset email to {to_email} via SMTP ({settings.SMTP_HOST})")
            return {
                "success": True,
                "delivery_method": "SMTP",
                "message": f"Password reset email dispatched to {to_email}",
                "reset_code": reset_code,
                "reset_url": reset_url
            }
        except Exception as e:
            logger.warning(f"SMTP delivery to {to_email} failed: {e}. Falling back to simulation mode.")

    # Simulation fallback
    logger.info(f"[SIMULATED EMAIL] Password reset code for {to_email}: {reset_code} (Link: {reset_url})")
    return {
        "success": True,
        "delivery_method": "SIMULATED",
        "message": f"Verification code generated and sent to {to_email}",
        "reset_code": reset_code,
        "reset_url": reset_url
    }
