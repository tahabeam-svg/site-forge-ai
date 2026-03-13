import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM || "ArabyWeb <noreply@arabyweb.net>";

async function sendMail(to: string, subject: string, html: string) {
  const transport = createTransport();
  if (!transport) {
    console.log(`[EMAIL] No SMTP config — would send to ${to}: ${subject}`);
    return;
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, html });
    console.log(`[EMAIL] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error("[EMAIL] Failed to send:", err);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, isAr = true) {
  const subject = isAr ? "إعادة تعيين كلمة المرور — ArabyWeb" : "Password Reset — ArabyWeb";
  const html = isAr
    ? `
      <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width:600px; margin:auto; padding:32px; background:#f9fafb; border-radius:12px;">
        <h2 style="color:#10b981;">ArabyWeb.net</h2>
        <p>مرحباً،</p>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">إعادة تعيين كلمة المرور</a>
        <p style="color:#6b7280;font-size:13px;">الرابط صالح لمدة 30 دقيقة فقط. إذا لم تطلب هذا، تجاهل الرسالة.</p>
      </div>`
    : `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:32px; background:#f9fafb; border-radius:12px;">
        <h2 style="color:#10b981;">ArabyWeb.net</h2>
        <p>Hello,</p>
        <p>We received a request to reset your account password.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Reset Password</a>
        <p style="color:#6b7280;font-size:13px;">This link is valid for 30 minutes only. If you didn't request this, please ignore this email.</p>
      </div>`;
  await sendMail(to, subject, html);
}

export async function sendPaymentSuccessEmail(to: string, credits: number, amountSar: number, isAr = true) {
  const subject = isAr ? "تم شراء رصيد الذكاء بنجاح — ArabyWeb" : "AI Credits Purchase Successful — ArabyWeb";
  const html = isAr
    ? `
      <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width:600px; margin:auto; padding:32px; background:#f9fafb; border-radius:12px;">
        <h2 style="color:#10b981;">ArabyWeb.net</h2>
        <p>شكراً لك!</p>
        <p>تمت عملية الشراء بنجاح. تم إضافة <strong>${credits} جلسة ذكاء</strong> لرصيدك.</p>
        <p style="color:#6b7280;">المبلغ المدفوع: ${amountSar.toFixed(2)} ريال سعودي (شامل ضريبة القيمة المضافة)</p>
        <a href="https://arabyweb.net/billing" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">عرض رصيدي</a>
      </div>`
    : `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:32px; background:#f9fafb; border-radius:12px;">
        <h2 style="color:#10b981;">ArabyWeb.net</h2>
        <p>Thank you!</p>
        <p>Your purchase was successful. <strong>${credits} AI sessions</strong> have been added to your balance.</p>
        <p style="color:#6b7280;">Amount paid: SAR ${amountSar.toFixed(2)} (VAT included)</p>
        <a href="https://arabyweb.net/billing" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">View My Balance</a>
      </div>`;
  await sendMail(to, subject, html);
}

export async function sendLowCreditsEmail(to: string, isAr = true) {
  const subject = isAr ? "تنبيه: رصيد الذكاء وصل للصفر — ArabyWeb" : "Alert: AI Credits Depleted — ArabyWeb";
  const html = isAr
    ? `
      <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width:600px; margin:auto; padding:32px; background:#f9fafb; border-radius:12px;">
        <h2 style="color:#10b981;">ArabyWeb.net</h2>
        <p>مرحباً،</p>
        <p>نود إعلامك بأن رصيد الذكاء الخاص بك قد نفد. لا تتوقف عن بناء مواقعك!</p>
        <a href="https://arabyweb.net/billing" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">إعادة شحن الرصيد</a>
      </div>`
    : `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:32px; background:#f9fafb; border-radius:12px;">
        <h2 style="color:#10b981;">ArabyWeb.net</h2>
        <p>Hello,</p>
        <p>Your AI credits balance has reached zero. Don't stop building!</p>
        <a href="https://arabyweb.net/billing" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Top Up Credits</a>
      </div>`;
  await sendMail(to, subject, html);
}
