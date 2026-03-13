import nodemailer from "nodemailer";
import { storage } from "./storage";

// ─── Sender addresses per category ───────────────────────────────────────────

const SENDERS = {
  noreply:  "ArabyWeb <noreply@arabyweb.net>",    // welcome, verification, reset, security
  bills:    "ArabyWeb Bills <bills@arabyweb.net>",  // payments, subscriptions, credits
  support:  "ArabyWeb Support <support@arabyweb.net>", // support replies
  info:     "ArabyWeb <info@arabyweb.net>",         // announcements, general
  privacy:  "ArabyWeb Privacy <privacy@arabyweb.net>", // privacy/system alerts
} as const;

type SenderKey = keyof typeof SENDERS;

// ─── Transport (env vars first, then DB settings) ────────────────────────────

async function getSmtpConfig() {
  // Prefer env vars (more secure for production)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }
  // Fall back to DB settings (configured from admin panel)
  try {
    const [host, port, user, pass] = await Promise.all([
      storage.getSetting("smtp_host"),
      storage.getSetting("smtp_port"),
      storage.getSetting("smtp_user"),
      storage.getSetting("smtp_pass"),
    ]);
    if (host && user && pass) {
      return {
        host,
        port: parseInt(port || "587", 10),
        user,
        pass,
      };
    }
  } catch {}
  return null;
}

async function sendMail(to: string, subject: string, html: string, sender: SenderKey = "noreply"): Promise<boolean> {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    console.log(`[EMAIL] No SMTP config — skipped: "${subject}" → ${to}`);
    return false;
  }
  try {
    const transport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
      tls: { rejectUnauthorized: false },
    });
    // Use SMTP user as the actual from address (required by most hosting providers)
    // but keep a friendly display name based on sender type
    const displayNames: Record<SenderKey, string> = {
      noreply: "ArabyWeb",
      bills:   "ArabyWeb Bills",
      support: "ArabyWeb Support",
      info:    "ArabyWeb",
      privacy: "ArabyWeb Privacy",
    };
    const fromAddress = `${displayNames[sender]} <${cfg.user}>`;
    await transport.sendMail({ from: fromAddress, to, subject, html });
    console.log(`[EMAIL] ✓ [${fromAddress}] "${subject}" → ${to}`);
    return true;
  } catch (err: any) {
    console.error(`[EMAIL] ✗ Failed "${subject}" → ${to}:`, err.message);
    return false;
  }
}

// ─── Base Template ────────────────────────────────────────────────────────────

function wrap(content: string, isAr: boolean): string {
  const dir = isAr ? "rtl" : "ltr";
  const font = isAr
    ? "'Cairo', 'Tajawal', Arial, sans-serif"
    : "Arial, -apple-system, sans-serif";
  return `<!DOCTYPE html>
<html lang="${isAr ? "ar" : "en"}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ArabyWeb</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:${font};">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#059669,#0d9488);padding:28px 32px;text-align:${isAr ? "right" : "left"};">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🌐 ArabyWeb.net</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;direction:${dir};text-align:${isAr ? "right" : "left"};">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; 2026 ArabyWeb.net · <a href="https://arabyweb.net/privacy" style="color:#10b981;text-decoration:none;">${isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a></p>
            <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">${isAr ? "لإلغاء الاشتراك في الإشعارات، توجه لإعدادات حسابك." : "To unsubscribe from notifications, visit your account settings."}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;margin:20px 0;padding:13px 28px;background:#10b981;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${label}</a>`;
}

function h1(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;">${text}</h2>`;
}

function p(text: string, muted = false): string {
  const color = muted ? "#64748b" : "#334155";
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${color};">${text}</p>`;
}

function infoBox(content: string, color = "#10b981"): string {
  return `<div style="background:${color}15;border-${true ? "right" : "left"}:4px solid ${color};border-radius:8px;padding:16px 20px;margin:16px 0;">${content}</div>`;
}

function statRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;font-size:14px;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:10px 16px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`;
}

function statsTable(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:16px 0;">
    ${rows.map(([l, v]) => statRow(l, v)).join("")}
  </table>`;
}

// ─── Plan name helper ─────────────────────────────────────────────────────────
function planName(plan: string, isAr: boolean): string {
  const names: Record<string, [string, string]> = {
    free: ["المجاني", "Free"],
    pro: ["الاحترافي", "Pro"],
    business: ["الأعمال", "Business"],
  };
  return (isAr ? names[plan]?.[0] : names[plan]?.[1]) ?? plan;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. Welcome / Registration ────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, isAr = true) {
  const firstName = name?.split(" ")[0] || (isAr ? "عزيزي المستخدم" : "there");
  const subject = isAr ? `مرحباً بك في ArabyWeb.net 🎉` : `Welcome to ArabyWeb.net 🎉`;
  const html = wrap(
    isAr
      ? `${h1(`أهلاً وسهلاً، ${firstName}! 🎉`)}
         ${p("يسعدنا انضمامك لعائلة ArabyWeb. أنت الآن قادر على بناء مواقع إلكترونية احترافية بالذكاء الاصطناعي في ثوانٍ معدودة.")}
         ${infoBox(`<strong>ماذا يمكنك فعله الآن؟</strong><br>
           ✅ إنشاء موقعك الأول مجاناً<br>
           ✅ استخدام 10 جلسات ذكاء اصطناعي مجانية<br>
           ✅ اختيار من عشرات القوالب الجاهزة`)}
         ${btn("https://arabyweb.net/dashboard", "ابدأ الآن →")}
         ${p("إذا احتجت أي مساعدة، فريق الدعم لديك دائماً.", true)}`
      : `${h1(`Welcome aboard, ${firstName}! 🎉`)}
         ${p("We're thrilled to have you join ArabyWeb. You can now build professional websites with AI in seconds.")}
         ${infoBox(`<strong>What you can do now:</strong><br>
           ✅ Create your first website for free<br>
           ✅ Use 10 free AI sessions<br>
           ✅ Choose from dozens of ready templates`)}
         ${btn("https://arabyweb.net/dashboard", "Get Started →")}
         ${p("If you need any help, our support team is always here for you.", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 2. Email Verification ────────────────────────────────────────────────────

export async function sendEmailVerificationEmail(to: string, name: string, verifyUrl: string, isAr = true) {
  const firstName = name?.split(" ")[0] || "";
  const subject = isAr ? "تأكيد بريدك الإلكتروني — ArabyWeb" : "Verify your email — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("تأكيد البريد الإلكتروني 📧")}
         ${p(`مرحباً ${firstName}،`)}
         ${p("شكراً لتسجيلك في ArabyWeb. اضغط الزر أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك.")}
         ${btn(verifyUrl, "تأكيد البريد الإلكتروني")}
         ${p("الرابط صالح لمدة 24 ساعة. إذا لم تسجل في ArabyWeb، تجاهل هذه الرسالة.", true)}`
      : `${h1("Verify your email address 📧")}
         ${p(`Hi ${firstName},`)}
         ${p("Thank you for registering with ArabyWeb. Click the button below to verify your email and activate your account.")}
         ${btn(verifyUrl, "Verify Email Address")}
         ${p("This link is valid for 24 hours. If you didn't sign up for ArabyWeb, please ignore this email.", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 3. New Google Registration ───────────────────────────────────────────────

export async function sendGoogleWelcomeEmail(to: string, name: string, isAr = true) {
  const firstName = name?.split(" ")[0] || "";
  const subject = isAr ? `مرحباً بك في ArabyWeb — سجّلت عبر Google 🎉` : `Welcome to ArabyWeb — Signed in with Google 🎉`;
  const html = wrap(
    isAr
      ? `${h1(`أهلاً ${firstName}!`)}
         ${p("لقد أنشأت حسابك بنجاح عبر حساب Google الخاص بك. أنت الآن جاهز لبناء مواقع ذكية واحترافية.")}
         ${infoBox("🔒 حسابك مرتبط بـ Google — لا تحتاج لكلمة مرور منفصلة للدخول.")}
         ${btn("https://arabyweb.net/dashboard", "اذهب للوحة التحكم")}
         ${p("رصيدك المجاني: 10 جلسات ذكاء اصطناعي", true)}`
      : `${h1(`Hello ${firstName}!`)}
         ${p("You successfully created your account using Google. You're now ready to build smart, professional websites.")}
         ${infoBox("🔒 Your account is linked to Google — no separate password needed to sign in.")}
         ${btn("https://arabyweb.net/dashboard", "Go to Dashboard")}
         ${p("Your free balance: 10 AI sessions", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 4. New Login Method Detected ────────────────────────────────────────────

export async function sendNewLoginMethodEmail(to: string, name: string, method: string, isAr = true) {
  const subject = isAr ? "تنبيه: طريقة دخول جديدة — ArabyWeb" : "Alert: New login method detected — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("تنبيه أمني 🔐")}
         ${p(`مرحباً ${name}،`)}
         ${p(`لاحظنا أنك قمت بتسجيل الدخول باستخدام <strong>${method}</strong> لأول مرة.`)}
         ${infoBox("إذا لم تكن أنت من قام بذلك، يُرجى <a href='https://arabyweb.net/settings' style='color:#10b981;'>تغيير كلمة مرورك فوراً</a> والتواصل مع الدعم.", "#f59e0b")}
         ${btn("https://arabyweb.net/settings", "مراجعة إعدادات الحساب")}`
      : `${h1("Security Alert 🔐")}
         ${p(`Hi ${name},`)}
         ${p(`We noticed you signed in using <strong>${method}</strong> for the first time.`)}
         ${infoBox("If this wasn't you, please <a href='https://arabyweb.net/settings' style='color:#10b981;'>change your password immediately</a> and contact support.", "#f59e0b")}
         ${btn("https://arabyweb.net/settings", "Review Account Settings")}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 5. Password Reset ────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string, isAr = true) {
  const subject = isAr ? "إعادة تعيين كلمة المرور — ArabyWeb" : "Reset your password — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("إعادة تعيين كلمة المرور 🔑")}
         ${p("تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.")}
         ${btn(resetUrl, "إعادة تعيين كلمة المرور")}
         ${p("الرابط صالح لمدة 30 دقيقة فقط. إذا لم تطلب هذا، تجاهل الرسالة.", true)}`
      : `${h1("Reset your password 🔑")}
         ${p("We received a request to reset your account password.")}
         ${btn(resetUrl, "Reset Password")}
         ${p("This link is valid for 30 minutes only. If you didn't request this, please ignore this email.", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 6. Site Creation Started ─────────────────────────────────────────────────

export async function sendSiteCreationStartedEmail(to: string, siteName: string, isAr = true) {
  const subject = isAr ? `جاري إنشاء موقعك: ${siteName} — ArabyWeb` : `Building your site: ${siteName} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("⚙️ جاري إنشاء موقعك...")}
         ${p(`الذكاء الاصطناعي يعمل الآن على بناء موقع <strong>${siteName}</strong>. قد يستغرق هذا بضع ثوانٍ.`)}
         ${infoBox("سيصلك إشعار آخر عند اكتمال موقعك. يمكنك متابعة العمل بينما نُنشئ الموقع لك!")}
         ${btn("https://arabyweb.net/dashboard", "متابعة اللوحة")}`
      : `${h1("⚙️ Building your website...")}
         ${p(`Our AI is now building <strong>${siteName}</strong>. This may take a few seconds.`)}
         ${infoBox("You'll receive another notification when your site is ready. Feel free to continue working while we build it!")}
         ${btn("https://arabyweb.net/dashboard", "View Dashboard")}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 7. Site Creation Completed ───────────────────────────────────────────────

export async function sendSiteCreationCompletedEmail(to: string, siteName: string, previewUrl: string, isAr = true) {
  const subject = isAr ? `✅ موقعك "${siteName}" جاهز! — ArabyWeb` : `✅ Your site "${siteName}" is ready! — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1(`🎉 موقعك جاهز!`)}
         ${p(`تم إنشاء موقع <strong>${siteName}</strong> بنجاح بالذكاء الاصطناعي.`)}
         ${infoBox("يمكنك الآن معاينته وتخصيصه ونشره بنقرة واحدة.", "#10b981")}
         ${btn(previewUrl, "معاينة الموقع →")}
         ${p("استمر في تحسين موقعك من لوحة التحكم.", true)}`
      : `${h1(`🎉 Your website is ready!`)}
         ${p(`<strong>${siteName}</strong> has been successfully created by AI.`)}
         ${infoBox("You can now preview, customize, and publish it with one click.", "#10b981")}
         ${btn(previewUrl, "Preview Site →")}
         ${p("Continue improving your site from the dashboard.", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 8. Site Creation Failed ──────────────────────────────────────────────────

export async function sendSiteCreationFailedEmail(to: string, siteName: string, isAr = true) {
  const subject = isAr ? `❌ فشل إنشاء الموقع: ${siteName} — ArabyWeb` : `❌ Site creation failed: ${siteName} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("عذراً، حدث خطأ ⚠️")}
         ${p(`للأسف، لم نتمكن من إنشاء الموقع <strong>${siteName}</strong> في هذه المرة.`)}
         ${infoBox("لم يتم خصم أي رصيد. يمكنك المحاولة مرة أخرى مجاناً.", "#ef4444")}
         ${btn("https://arabyweb.net/dashboard", "المحاولة مرة أخرى")}
         ${p("إذا استمرت المشكلة، تواصل مع الدعم الفني.", true)}`
      : `${h1("Sorry, something went wrong ⚠️")}
         ${p(`Unfortunately, we couldn't create <strong>${siteName}</strong> this time.`)}
         ${infoBox("No credits were deducted. You can try again for free.", "#ef4444")}
         ${btn("https://arabyweb.net/dashboard", "Try Again")}
         ${p("If the issue persists, please contact our support team.", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}

// ─── 9. Credit Used (per usage) ──────────────────────────────────────────────

export async function sendCreditUsedEmail(to: string, creditsUsed: number, remaining: number, action: string, isAr = true) {
  const subject = isAr ? `تم استخدام ${creditsUsed} جلسة ذكاء — ArabyWeb` : `${creditsUsed} AI session(s) used — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("استهلاك رصيد الذكاء 🤖")}
         ${p(`تم استخدام <strong>${creditsUsed} جلسة</strong> لـ: ${action}.`)}
         ${statsTable([
           ["الجلسات المستخدمة", `${creditsUsed} جلسة`],
           ["الرصيد المتبقي", `${remaining} جلسة`],
         ])}
         ${remaining <= 5 ? infoBox(`تنبيه: رصيدك المتبقي ${remaining} جلسات فقط. ${btn("https://arabyweb.net/billing", "شحن الرصيد")}`, "#f59e0b") : ""}`
      : `${h1("AI Credit Usage 🤖")}
         ${p(`<strong>${creditsUsed} session(s)</strong> used for: ${action}.`)}
         ${statsTable([
           ["Sessions Used", `${creditsUsed}`],
           ["Remaining Balance", `${remaining} sessions`],
         ])}
         ${remaining <= 5 ? infoBox(`Alert: Only ${remaining} sessions remaining. ${btn("https://arabyweb.net/billing", "Top Up Credits")}`, "#f59e0b") : ""}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 10. Low Credits Warning ──────────────────────────────────────────────────

export async function sendLowCreditsEmail(to: string, remaining = 0, isAr = true) {
  const subject = isAr ? `⚠️ رصيد الذكاء منخفض (${remaining} جلسات) — ArabyWeb` : `⚠️ Low AI credits (${remaining} sessions) — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("تنبيه: رصيد منخفض ⚠️")}
         ${p(`تبقّى لك <strong>${remaining} جلسة ذكاء</strong> فقط.`)}
         ${infoBox("للاستمرار في بناء المواقع دون انقطاع، أعد شحن رصيدك الآن.", "#f59e0b")}
         ${btn("https://arabyweb.net/billing", "شحن الرصيد الآن")}
         ${p("يمكنك ترقية خطتك للحصول على جلسات أكثر بسعر أفضل.", true)}`
      : `${h1("Warning: Low Credits ⚠️")}
         ${p(`You have only <strong>${remaining} AI sessions</strong> remaining.`)}
         ${infoBox("To continue building websites without interruption, top up your credits now.", "#f59e0b")}
         ${btn("https://arabyweb.net/billing", "Top Up Credits Now")}
         ${p("You can upgrade your plan to get more sessions at a better price.", true)}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 11. Credits Depleted ─────────────────────────────────────────────────────

export async function sendCreditsDepletedEmail(to: string, isAr = true) {
  const subject = isAr ? "🚨 نفاد رصيد الذكاء — ArabyWeb" : "🚨 AI Credits Depleted — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("نفاد رصيد الذكاء 🚨")}
         ${p("نفدت جميع جلسات الذكاء الاصطناعي في حسابك. لن تتمكن من إنشاء أو تعديل المواقع حتى تشحن رصيدك.")}
         ${infoBox("أشحن رصيدك الآن واستمر في بناء مواقعك الاحترافية!", "#ef4444")}
         ${btn("https://arabyweb.net/billing", "شحن الرصيد الآن")}`
      : `${h1("AI Credits Depleted 🚨")}
         ${p("All AI sessions in your account have been used. You won't be able to create or edit websites until you top up.")}
         ${infoBox("Top up now and continue building your professional websites!", "#ef4444")}
         ${btn("https://arabyweb.net/billing", "Top Up Credits Now")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 12. Payment Success ──────────────────────────────────────────────────────

export async function sendPaymentSuccessEmail(to: string, credits: number, amountSar: number, isAr = true) {
  const subject = isAr ? "✅ تمت عملية الدفع بنجاح — ArabyWeb" : "✅ Payment Successful — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("تمت عملية الدفع بنجاح ✅")}
         ${p("شكراً لك! تمت عملية الشراء بنجاح.")}
         ${statsTable([
           ["الجلسات المضافة", `${credits} جلسة ذكاء`],
           ["المبلغ المدفوع", `${amountSar.toFixed(2)} ريال سعودي`],
           ["الضريبة", "مشمولة (15% VAT)"],
         ])}
         ${btn("https://arabyweb.net/billing", "عرض رصيدي")}`
      : `${h1("Payment Successful ✅")}
         ${p("Thank you! Your purchase was completed successfully.")}
         ${statsTable([
           ["Sessions Added", `${credits} AI sessions`],
           ["Amount Paid", `SAR ${amountSar.toFixed(2)}`],
           ["Tax", "Included (15% VAT)"],
         ])}
         ${btn("https://arabyweb.net/billing", "View My Balance")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 13. Payment Failed ───────────────────────────────────────────────────────

export async function sendPaymentFailedEmail(to: string, amountSar: number, isAr = true) {
  const subject = isAr ? "❌ فشلت عملية الدفع — ArabyWeb" : "❌ Payment Failed — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("فشلت عملية الدفع ❌")}
         ${p(`لم تكتمل عملية الدفع بمبلغ <strong>${amountSar.toFixed(2)} ريال</strong>. لم يتم خصم أي مبلغ من حسابك.`)}
         ${infoBox("قد تكون المشكلة في بيانات البطاقة أو رصيد غير كافٍ. يُرجى المحاولة مرة أخرى.", "#ef4444")}
         ${btn("https://arabyweb.net/billing", "إعادة المحاولة")}`
      : `${h1("Payment Failed ❌")}
         ${p(`The payment of <strong>SAR ${amountSar.toFixed(2)}</strong> was not completed. No amount was charged to your account.`)}
         ${infoBox("The issue may be with card details or insufficient balance. Please try again.", "#ef4444")}
         ${btn("https://arabyweb.net/billing", "Try Again")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 14. Subscription Started ─────────────────────────────────────────────────

export async function sendSubscriptionStartedEmail(to: string, plan: string, endDate: Date, isAr = true) {
  const subject = isAr ? `🎉 بدء اشتراكك في خطة ${planName(plan, true)} — ArabyWeb` : `🎉 Your ${planName(plan, false)} subscription is active — ArabyWeb`;
  const endStr = endDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  const credits = plan === "business" ? 200 : 50;
  const html = wrap(
    isAr
      ? `${h1(`🎉 اشتراكك فعّال!`)}
         ${p(`تم تفعيل خطة <strong>${planName(plan, true)}</strong> بنجاح.`)}
         ${statsTable([
           ["الخطة", planName(plan, true)],
           ["الجلسات المضافة", `${credits} جلسة ذكاء`],
           ["الاشتراك يجدد في", endStr],
         ])}
         ${btn("https://arabyweb.net/dashboard", "ابدأ الاستخدام")}`
      : `${h1(`🎉 Your subscription is active!`)}
         ${p(`Your <strong>${planName(plan, false)}</strong> plan has been successfully activated.`)}
         ${statsTable([
           ["Plan", planName(plan, false)],
           ["Sessions Added", `${credits} AI sessions`],
           ["Renewal Date", endStr],
         ])}
         ${btn("https://arabyweb.net/dashboard", "Start Using")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 15. Subscription Renewed ─────────────────────────────────────────────────

export async function sendSubscriptionRenewedEmail(to: string, plan: string, newEndDate: Date, isAr = true) {
  const subject = isAr ? `🔄 تجديد اشتراكك في ${planName(plan, true)} — ArabyWeb` : `🔄 ${planName(plan, false)} subscription renewed — ArabyWeb`;
  const endStr = newEndDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  const html = wrap(
    isAr
      ? `${h1("تجديد الاشتراك 🔄")}
         ${p(`تم تجديد اشتراكك في خطة <strong>${planName(plan, true)}</strong> بنجاح.`)}
         ${statsTable([["الاشتراك التالي في", endStr]])}
         ${btn("https://arabyweb.net/billing", "إدارة الاشتراك")}`
      : `${h1("Subscription Renewed 🔄")}
         ${p(`Your <strong>${planName(plan, false)}</strong> subscription has been successfully renewed.`)}
         ${statsTable([["Next renewal date", endStr]])}
         ${btn("https://arabyweb.net/billing", "Manage Subscription")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 16. Plan Upgrade ─────────────────────────────────────────────────────────

export async function sendPlanUpgradedEmail(to: string, oldPlan: string, newPlan: string, isAr = true) {
  const subject = isAr ? `⬆️ ترقية خطتك إلى ${planName(newPlan, true)} — ArabyWeb` : `⬆️ Plan upgraded to ${planName(newPlan, false)} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("ترقية الخطة ⬆️")}
         ${p(`تهانينا! تمت ترقية حسابك من <strong>${planName(oldPlan, true)}</strong> إلى <strong>${planName(newPlan, true)}</strong>.`)}
         ${infoBox("تم تحديث رصيدك وصلاحياتك وفق الخطة الجديدة.", "#10b981")}
         ${btn("https://arabyweb.net/dashboard", "اكتشف المزايا الجديدة")}`
      : `${h1("Plan Upgraded ⬆️")}
         ${p(`Congratulations! Your account was upgraded from <strong>${planName(oldPlan, false)}</strong> to <strong>${planName(newPlan, false)}</strong>.`)}
         ${infoBox("Your balance and permissions have been updated according to the new plan.", "#10b981")}
         ${btn("https://arabyweb.net/dashboard", "Explore New Features")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 17. Plan Downgrade ───────────────────────────────────────────────────────

export async function sendPlanDowngradedEmail(to: string, oldPlan: string, newPlan: string, isAr = true) {
  const subject = isAr ? `⬇️ تخفيض خطتك إلى ${planName(newPlan, true)} — ArabyWeb` : `⬇️ Plan changed to ${planName(newPlan, false)} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("تغيير الخطة ⬇️")}
         ${p(`تم تغيير خطتك من <strong>${planName(oldPlan, true)}</strong> إلى <strong>${planName(newPlan, true)}</strong>.`)}
         ${infoBox("إذا كنت ترغب في العودة لخطة أعلى، يمكنك الترقية في أي وقت.", "#f59e0b")}
         ${btn("https://arabyweb.net/billing", "إدارة الاشتراك")}`
      : `${h1("Plan Changed ⬇️")}
         ${p(`Your plan was changed from <strong>${planName(oldPlan, false)}</strong> to <strong>${planName(newPlan, false)}</strong>.`)}
         ${infoBox("If you'd like to go back to a higher plan, you can upgrade anytime.", "#f59e0b")}
         ${btn("https://arabyweb.net/billing", "Manage Subscription")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 18. Subscription Expiry Reminder ────────────────────────────────────────

export async function sendSubscriptionExpiryReminderEmail(to: string, plan: string, daysLeft: number, isAr = true) {
  const subject = isAr ? `⏰ اشتراكك ينتهي خلال ${daysLeft} يوم — ArabyWeb` : `⏰ Your subscription expires in ${daysLeft} days — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1(`تنبيه: انتهاء الاشتراك قريباً ⏰`)}
         ${p(`اشتراكك في خطة <strong>${planName(plan, true)}</strong> سينتهي خلال <strong>${daysLeft} يوم</strong>.`)}
         ${infoBox("لضمان استمرارية خدمتك، جدّد اشتراكك الآن.", "#f59e0b")}
         ${btn("https://arabyweb.net/billing", "تجديد الاشتراك")}`
      : `${h1(`Subscription Expiring Soon ⏰`)}
         ${p(`Your <strong>${planName(plan, false)}</strong> subscription expires in <strong>${daysLeft} day(s)</strong>.`)}
         ${infoBox("To ensure service continuity, renew your subscription now.", "#f59e0b")}
         ${btn("https://arabyweb.net/billing", "Renew Subscription")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 19. Subscription Expired ─────────────────────────────────────────────────

export async function sendSubscriptionExpiredEmail(to: string, plan: string, isAr = true) {
  const subject = isAr ? "🔴 انتهى اشتراكك — ArabyWeb" : "🔴 Your subscription has expired — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("انتهاء الاشتراك 🔴")}
         ${p(`انتهى اشتراكك في خطة <strong>${planName(plan, true)}</strong>. تم تحويلك للخطة المجانية.`)}
         ${infoBox("جدّد اشتراكك لاستعادة جميع المزايا وجلسات الذكاء الاصطناعي.", "#ef4444")}
         ${btn("https://arabyweb.net/billing", "تجديد الاشتراك الآن")}`
      : `${h1("Subscription Expired 🔴")}
         ${p(`Your <strong>${planName(plan, false)}</strong> subscription has expired. You've been moved to the free plan.`)}
         ${infoBox("Renew your subscription to restore all features and AI sessions.", "#ef4444")}
         ${btn("https://arabyweb.net/billing", "Renew Subscription Now")}`,
    isAr
  );
  return sendMail(to, subject, html, "bills");
}

// ─── 20. System Alert ─────────────────────────────────────────────────────────

export async function sendSystemAlertEmail(to: string, title: string, message: string, isAr = true) {
  const subject = isAr ? `تنبيه النظام: ${title} — ArabyWeb` : `System Alert: ${title} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1(`تنبيه: ${title} 🔔`)}
         ${infoBox(p(message), "#6366f1")}
         ${btn("https://arabyweb.net/dashboard", "الذهاب للوحة التحكم")}`
      : `${h1(`Alert: ${title} 🔔`)}
         ${infoBox(p(message), "#6366f1")}
         ${btn("https://arabyweb.net/dashboard", "Go to Dashboard")}`,
    isAr
  );
  return sendMail(to, subject, html, "privacy");
}

// ─── 21. Support Reply ────────────────────────────────────────────────────────

export async function sendSupportReplyEmail(to: string, userName: string, ticketSubject: string, replyMessage: string, isAr = true) {
  const subject = isAr ? `رد الدعم الفني: ${ticketSubject} — ArabyWeb` : `Support Reply: ${ticketSubject} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1("رد فريق الدعم 💬")}
         ${p(`مرحباً ${userName}،`)}
         ${p("لديك رد جديد من فريق الدعم الفني:")}
         ${infoBox(`<em style="color:#334155;">"${replyMessage}"</em>`, "#6366f1")}
         ${btn("https://arabyweb.net/dashboard", "الذهاب للمنصة")}`
      : `${h1("Support Team Reply 💬")}
         ${p(`Hi ${userName},`)}
         ${p("You have a new reply from our support team:")}
         ${infoBox(`<em style="color:#334155;">"${replyMessage}"</em>`, "#6366f1")}
         ${btn("https://arabyweb.net/dashboard", "Go to Platform")}`,
    isAr
  );
  return sendMail(to, subject, html, "support");
}

// ─── 22. Announcement ─────────────────────────────────────────────────────────

export async function sendAnnouncementEmail(to: string, userName: string, title: string, message: string, isAr = true) {
  const subject = isAr ? `📢 ${title} — ArabyWeb` : `📢 ${title} — ArabyWeb`;
  const html = wrap(
    isAr
      ? `${h1(`📢 ${title}`)}
         ${p(`مرحباً ${userName}،`)}
         ${p(message)}
         ${btn("https://arabyweb.net/dashboard", "اكتشف المزيد")}`
      : `${h1(`📢 ${title}`)}
         ${p(`Hi ${userName},`)}
         ${p(message)}
         ${btn("https://arabyweb.net/dashboard", "Learn More")}`,
    isAr
  );
  return sendMail(to, subject, html, "info");
}

// ─── 23. Saudi VAT Invoice ────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  customerEmail: string;
  customerName: string;
  isCompany: boolean;
  companyName?: string;
  taxNumber?: string;
  description: string;
  amountWithVatSar: number;
  invoiceType: "subscription" | "credits";
  planOrCredits?: string;
}

export async function sendInvoiceEmail(data: InvoiceData, isAr = true): Promise<boolean> {
  const SELLER_NAME = "مؤسسة الهدف الممتاز للمعارض والمؤتمرات";
  const SELLER_NAME_EN = "Al-Hadaf Al-Mumtaz Foundation for Exhibitions & Conferences";
  const SELLER_VAT = "310268220900003";
  const SELLER_ADDRESS_AR = "الرياض، المملكة العربية السعودية";
  const SELLER_ADDRESS_EN = "Riyadh, Saudi Arabia";
  const PLATFORM_NAME = "ArabyWeb.net";

  const totalSar = data.amountWithVatSar;
  const beforeVat = parseFloat((totalSar / 1.15).toFixed(2));
  const vatAmount = parseFloat((totalSar - beforeVat).toFixed(2));

  const dateStr = data.invoiceDate.toLocaleDateString(isAr ? "ar-SA-u-nu-latn" : "en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  const invoiceTitle = isAr ? "فاتورة ضريبية" : "Tax Invoice";
  const subject = isAr
    ? `🧾 فاتورة ضريبية #${data.invoiceNumber} — ${PLATFORM_NAME}`
    : `🧾 Tax Invoice #${data.invoiceNumber} — ${PLATFORM_NAME}`;

  const buyerSection = isAr
    ? `<div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-weight:700;color:#0f172a;font-size:0.95rem;">بيانات العميل</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>الاسم:</strong> ${data.isCompany ? (data.companyName || data.customerName) : data.customerName}</p>
        ${data.isCompany && data.taxNumber ? `<p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>الرقم الضريبي:</strong> ${data.taxNumber}</p>` : ""}
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>البريد الإلكتروني:</strong> ${data.customerEmail}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>نوع العميل:</strong> ${data.isCompany ? "شركة / مؤسسة" : "فرد"}</p>
      </div>`
    : `<div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-weight:700;color:#0f172a;font-size:0.95rem;">Customer Details</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Name:</strong> ${data.isCompany ? (data.companyName || data.customerName) : data.customerName}</p>
        ${data.isCompany && data.taxNumber ? `<p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Tax Number:</strong> ${data.taxNumber}</p>` : ""}
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Email:</strong> ${data.customerEmail}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Customer Type:</strong> ${data.isCompany ? "Company / Entity" : "Individual"}</p>
      </div>`;

  const sellerSection = isAr
    ? `<div style="background:#f0fdf4;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #bbf7d0;">
        <p style="margin:0 0 8px;font-weight:700;color:#0f172a;font-size:0.95rem;">بيانات المورد</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>الاسم:</strong> ${SELLER_NAME}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>الرقم الضريبي:</strong> ${SELLER_VAT}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>العنوان:</strong> ${SELLER_ADDRESS_AR}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>المنصة:</strong> ${PLATFORM_NAME}</p>
      </div>`
    : `<div style="background:#f0fdf4;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #bbf7d0;">
        <p style="margin:0 0 8px;font-weight:700;color:#0f172a;font-size:0.95rem;">Supplier Details</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Name:</strong> ${SELLER_NAME_EN}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>VAT Number:</strong> ${SELLER_VAT}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Address:</strong> ${SELLER_ADDRESS_EN}</p>
        <p style="margin:3px 0;font-size:0.88rem;color:#475569;"><strong>Platform:</strong> ${PLATFORM_NAME}</p>
      </div>`;

  const itemsTable = isAr
    ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.88rem;direction:rtl;">
        <thead>
          <tr style="background:#6366f1;color:#fff;">
            <th style="padding:10px 14px;text-align:right;border-radius:8px 0 0 0;">البيان</th>
            <th style="padding:10px 14px;text-align:center;">الكمية</th>
            <th style="padding:10px 14px;text-align:left;border-radius:0 8px 0 0;">السعر (ريال)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px;color:#1e293b;">${data.description}</td>
            <td style="padding:10px 14px;text-align:center;color:#1e293b;">1</td>
            <td style="padding:10px 14px;text-align:left;color:#1e293b;">${beforeVat.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>`
    : `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.88rem;">
        <thead>
          <tr style="background:#6366f1;color:#fff;">
            <th style="padding:10px 14px;text-align:left;border-radius:8px 0 0 0;">Description</th>
            <th style="padding:10px 14px;text-align:center;">Qty</th>
            <th style="padding:10px 14px;text-align:right;border-radius:0 8px 0 0;">Price (SAR)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px;color:#1e293b;">${data.description}</td>
            <td style="padding:10px 14px;text-align:center;color:#1e293b;">1</td>
            <td style="padding:10px 14px;text-align:right;color:#1e293b;">${beforeVat.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>`;

  const totalsSection = isAr
    ? `<div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #e2e8f0;direction:rtl;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.9rem;color:#475569;"><span>المبلغ قبل الضريبة:</span><span>${beforeVat.toFixed(2)} ريال</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.9rem;color:#475569;"><span>ضريبة القيمة المضافة (15%):</span><span>${vatAmount.toFixed(2)} ريال</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:1.05rem;font-weight:800;color:#0f172a;border-top:2px solid #6366f1;margin-top:8px;"><span>الإجمالي شامل الضريبة:</span><span>${totalSar.toFixed(2)} ريال سعودي</span></div>
      </div>`
    : `<div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.9rem;color:#475569;"><span>Amount before VAT:</span><span>SAR ${beforeVat.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.9rem;color:#475569;"><span>VAT (15%):</span><span>SAR ${vatAmount.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:1.05rem;font-weight:800;color:#0f172a;border-top:2px solid #6366f1;margin-top:8px;"><span>Total incl. VAT:</span><span>SAR ${totalSar.toFixed(2)}</span></div>
      </div>`;

  const html = wrap(
    isAr
      ? `<div style="text-align:center;margin-bottom:8px;">
          <div style="display:inline-block;background:#6366f1;color:#fff;padding:8px 24px;border-radius:20px;font-weight:700;font-size:1rem;">${invoiceTitle}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;padding:12px 16px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;direction:rtl;">
          <div><span style="color:#64748b;font-size:0.85rem;">رقم الفاتورة</span><br/><strong style="color:#0f172a;">#${data.invoiceNumber}</strong></div>
          <div style="text-align:left;"><span style="color:#64748b;font-size:0.85rem;">تاريخ الإصدار</span><br/><strong style="color:#0f172a;">${dateStr}</strong></div>
        </div>
        ${sellerSection}${buyerSection}${itemsTable}${totalsSection}
        <p style="font-size:0.8rem;color:#94a3b8;text-align:center;margin-top:16px;">هذه فاتورة ضريبية صادرة وفق أنظمة هيئة الزكاة والضريبة والجمارك (ZATCA)</p>
        ${btn("https://arabyweb.net/billing", "عرض الاشتراك")}`
      : `<div style="text-align:center;margin-bottom:8px;">
          <div style="display:inline-block;background:#6366f1;color:#fff;padding:8px 24px;border-radius:20px;font-weight:700;font-size:1rem;">${invoiceTitle}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;padding:12px 16px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;">
          <div><span style="color:#64748b;font-size:0.85rem;">Invoice Number</span><br/><strong style="color:#0f172a;">#${data.invoiceNumber}</strong></div>
          <div style="text-align:right;"><span style="color:#64748b;font-size:0.85rem;">Issue Date</span><br/><strong style="color:#0f172a;">${dateStr}</strong></div>
        </div>
        ${sellerSection}${buyerSection}${itemsTable}${totalsSection}
        <p style="font-size:0.8rem;color:#94a3b8;text-align:center;margin-top:16px;">This is a tax invoice issued in compliance with ZATCA regulations.</p>
        ${btn("https://arabyweb.net/billing", "View Subscription")}`,
    isAr
  );

  return sendMail(data.customerEmail, subject, html, "bills");
}

// ─── Test email (for admin panel verification) ────────────────────────────────

export async function sendTestEmail(to: string, isAr = true): Promise<boolean> {
  const subject = isAr ? "✅ اختبار إعدادات SMTP — ArabyWeb" : "✅ SMTP Configuration Test — ArabyWeb";
  const html = wrap(
    isAr
      ? `${h1("إعدادات SMTP تعمل بشكل صحيح ✅")}
         ${p("وصلتك هذه الرسالة التجريبية، مما يعني أن إعدادات البريد الإلكتروني صحيحة ومتصلة.")}
         ${infoBox("ArabyWeb جاهزة لإرسال جميع الإشعارات التلقائية.", "#10b981")}`
      : `${h1("SMTP Configuration Working ✅")}
         ${p("You received this test email, which means your email settings are correct and connected.")}
         ${infoBox("ArabyWeb is ready to send all automated notifications.", "#10b981")}`,
    isAr
  );
  return sendMail(to, subject, html, "noreply");
}
