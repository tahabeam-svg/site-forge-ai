import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Globe2, ChevronUp, ArrowLeft, ArrowRight, Printer, Download,
  AlertTriangle, Clock, Phone, Shield, CheckCircle2, Users, Server, Eye,
} from "lucide-react";

function getLang(): "ar" | "en" {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("arabyweb-lang") as "ar" | "en") || "ar";
  }
  return "ar";
}

const COMPANY = "ArabyWeb.net";
const VERSION = "1.0";
const DATE_AR = "13 مارس 2026";
const DATE_EN = "March 13, 2026";

export default function IncidentResponsePage() {
  const [lang, setLang] = useState<"ar" | "en">(getLang);
  const [showTop, setShowTop] = useState(false);
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.title = lang === "ar"
      ? "خطة الاستجابة للحوادث الأمنية — عربي ويب"
      : "Cybersecurity Incident Response Plan — ArabyWeb";
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang, isRTL]);

  const toggleLang = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("arabyweb-lang", newLang);
    setLang(newLang);
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const handlePrint = () => window.print();

  return (
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? "font-cairo" : ""}`} dir={isRTL ? "rtl" : "ltr"}>

      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { font-size: 12pt; }
          .prose { max-width: 100% !important; }
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold" data-testid="link-home">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{COMPANY}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs border rounded-full px-3 py-1 hover:bg-muted transition-colors cursor-pointer" data-testid="button-print">
              <Printer className="w-3 h-3" />
              {lang === "ar" ? "طباعة" : "Print"}
            </button>
            <button onClick={toggleLang} className="text-xs border rounded-full px-3 py-1 hover:bg-muted transition-colors cursor-pointer" data-testid="button-toggle-lang">
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        <div className="mb-8 no-print">
          <Link href="/privacy" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-privacy">
            <Arrow className="w-3 h-3 rotate-180" />
            {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>
        </div>

        <div className="border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 mb-10 bg-red-50/50 dark:bg-red-950/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              {lang === "ar" ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">خطة الاستجابة للحوادث الأمنية</h1>
                  <p className="text-muted-foreground text-sm">
                    {COMPANY} · الإصدار {VERSION} · تاريخ الإصدار: {DATE_AR} · سري للاستخدام الداخلي
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">Cybersecurity Incident Response Plan</h1>
                  <p className="text-muted-foreground text-sm">
                    {COMPANY} · Version {VERSION} · Issued: {DATE_EN} · Confidential — Internal Use Only
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {lang === "ar" ? <ArabicContent /> : <EnglishContent />}
      </main>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 end-6 w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer z-50 no-print"
          data-testid="button-scroll-top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <footer className="py-8 border-t bg-background no-print">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 {COMPANY} ·{" "}
          <Link href="/privacy" className="hover:text-foreground transition-colors">سياسة الخصوصية / Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ icon: Icon, title, children, color = "emerald" }: { icon: any; title: string; children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  };
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{num}</div>
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border mb-6">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>{headers.map(h => <th key={h} className="text-start p-3 font-semibold border-b">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/20"}>
              {row.map((cell, j) => <td key={j} className="p-3 border-b last:border-b-0">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArabicContent() {
  return (
    <div className="space-y-2">
      <Section icon={Eye} title="1. الهدف والنطاق">
        <p className="text-muted-foreground mb-4 leading-relaxed">
          تحدد هذه الخطة الإجراءات الواجب اتباعها عند اكتشاف أي حادث أمني يؤثر على منصة ArabyWeb.net، بياناتها، أو عملائها. تشمل الخطة جميع الحوادث المرتبطة بـ:
        </p>
        <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
          <li>اختراق قاعدة البيانات أو سرقة بيانات المستخدمين</li>
          <li>حوادث تتعلق ببوابة الدفع (Paymob) أو بيانات بطاقات العملاء</li>
          <li>استغلال ثغرات في التطبيق (SQL Injection، XSS، إلخ)</li>
          <li>هجمات رفض الخدمة (DDoS)</li>
          <li>اختراق حسابات الموظفين أو المسؤولين</li>
          <li>تسرب مفاتيح API أو بيانات الاعتماد</li>
        </ul>
      </Section>

      <Section icon={Users} title="2. فريق الاستجابة للحوادث" color="blue">
        <Table
          headers={["الدور", "المسؤولية", "جهة التواصل"]}
          rows={[
            ["قائد الاستجابة (Incident Commander)", "يقود الاستجابة ويتخذ القرارات التنفيذية", "المدير التقني / CTO"],
            ["مسؤول الأمن (Security Lead)", "التحليل التقني وتحديد نطاق الحادث", "security@arabyweb.net"],
            ["مطور الخلفية (Backend Dev)", "إيقاف الثغرة، إصلاح الكود، الاسترداد", "الفريق التقني"],
            ["مسؤول التواصل", "إبلاغ العملاء وشركاء الدفع والجهات الرقابية", "المدير التنفيذي / CEO"],
            ["المستشار القانوني", "تقييم الالتزامات القانونية وإعداد الإفصاحات", "خارجي عند الحاجة"],
          ]}
        />
      </Section>

      <Section icon={AlertTriangle} title="3. تصنيف الحوادث" color="amber">
        <Table
          headers={["المستوى", "التصنيف", "الوصف", "وقت الاستجابة"]}
          rows={[
            ["P1 — حرج", "🔴", "اختراق بيانات العملاء، سرقة بيانات دفع، تعطل كامل للخدمة", "فوري — خلال ساعة"],
            ["P2 — عالي", "🟠", "محاولة اختراق مُكتشفة، ثغرة أمنية نشطة، تسرب جزئي للبيانات", "خلال 4 ساعات"],
            ["P3 — متوسط", "🟡", "نشاط مشبوه، ثغرة منخفضة الخطر، مشكلة في المصادقة", "خلال 24 ساعة"],
            ["P4 — منخفض", "🟢", "بلاغ ثغرة من خارج، مشكلة إعدادات غير نشطة", "خلال 72 ساعة"],
          ]}
        />
      </Section>

      <Section icon={Clock} title="4. مراحل الاستجابة" color="violet">
        <Step num={1} title="الاكتشاف والتحقق (0 — 30 دقيقة)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>استلام البلاغ من: مراقبة النظام / بلاغ موظف / بلاغ عميل / Paymob</li>
            <li>التحقق من وجود الحادث فعلياً وعدم كونه إيجابية كاذبة</li>
            <li>تسجيل الوقت الدقيق في سجل الحوادث (Incident Log)</li>
            <li>إخطار قائد الاستجابة فوراً</li>
          </ul>
        </Step>

        <Step num={2} title="الاحتواء الفوري (30 دقيقة — 2 ساعة)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li><strong>حوادث P1:</strong> إيقاف الخدمة جزئياً أو كلياً إذا لزم الأمر</li>
            <li>عزل المكونات المتأثرة (قاعدة البيانات، API، إلخ)</li>
            <li>تغيير جميع كلمات المرور ومفاتيح API والبيانات الاعتمادية فوراً</li>
            <li>إلغاء الجلسات النشطة المشبوهة</li>
            <li>إبلاغ Paymob إذا كانت بيانات الدفع متأثرة: support@paymob.com</li>
            <li>تفعيل وضع الصيانة للمستخدمين</li>
          </ul>
        </Step>

        <Step num={3} title="التحليل والتحقيق (ساعتان — 8 ساعات)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>تحليل سجلات الخادم (Server Logs) لتحديد نقطة الاختراق</li>
            <li>تحديد النطاق الكامل للحادث: ما البيانات المتأثرة؟ كم مستخدم؟</li>
            <li>التوثيق الكامل لمسار الهجوم (Attack Vector)</li>
            <li>الحفاظ على الأدلة الرقمية (Forensic Evidence) بدون تعديل</li>
            <li>تقييم ما إذا كان الاختراق لا يزال نشطاً</li>
          </ul>
        </Step>

        <Step num={4} title="الإبلاغ والإخطار (خلال 24 ساعة — إلزامي)">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-3 text-sm">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ التزامات قانونية إلزامية</p>
            <ul className="list-disc ps-6 space-y-1 text-red-700 dark:text-red-400">
              <li>نظام حماية البيانات PDPL: إبلاغ الهيئة السعودية للبيانات خلال 72 ساعة</li>
              <li>عقد بايموب: إبلاغ Paymob عبر support@paymob.com خلال 24 ساعة</li>
              <li>إبلاغ المستخدمين المتأثرين مباشرةً إذا تعرضت بياناتهم للخطر</li>
            </ul>
          </div>
          <Table
            headers={["الجهة", "قناة الإبلاغ", "المهلة"]}
            rows={[
              ["Paymob", "support@paymob.com", "24 ساعة"],
              ["الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)", "البوابة الإلكترونية", "72 ساعة"],
              ["البنك المركزي السعودي (SAMA)", "عند تأثر بيانات الدفع", "فوري"],
              ["العملاء المتأثرون", "البريد الإلكتروني", "48 ساعة"],
            ]}
          />
        </Step>

        <Step num={5} title="الاسترداد والإصلاح (8 ساعات — 7 أيام)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>إصلاح الثغرة الأمنية في الكود أو الإعدادات</li>
            <li>اختبار الإصلاح في بيئة معزولة قبل النشر</li>
            <li>استعادة البيانات من النسخ الاحتياطية عند الحاجة</li>
            <li>إعادة تشغيل الخدمة بشكل تدريجي مع مراقبة مكثفة</li>
            <li>إعلام المستخدمين بعودة الخدمة وملخص للحادث</li>
          </ul>
        </Step>

        <Step num={6} title="المراجعة والتعلم (خلال 14 يوماً)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>إعداد تقرير ما بعد الحادث (Post-Incident Report) كاملاً</li>
            <li>جلسة مراجعة مع الفريق: ماذا حدث؟ لماذا؟ كيف نمنع تكراره؟</li>
            <li>تحديث سياسات الأمان والضوابط التقنية</li>
            <li>تحديث هذه الخطة إذا لزم الأمر</li>
            <li>إجراء تدريب إضافي للفريق إذا كان الحادث بسبب خطأ بشري</li>
          </ul>
        </Step>
      </Section>

      <Section icon={Server} title="5. ضوابط أمنية وقائية" color="emerald">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: "مراقبة مستمرة", desc: "مراقبة السجلات والنشاطات المشبوهة على مدار الساعة" },
            { title: "نسخ احتياطي يومي", desc: "نسخ احتياطي مشفر تلقائي لقاعدة البيانات كل 24 ساعة" },
            { title: "تحديثات الأمان", desc: "تطبيق تحديثات الأمان الحرجة خلال 48 ساعة من إصدارها" },
            { title: "اختبار الاختراق", desc: "اختبار أمني دوري (ربع سنوي) للتطبيق والبنية التحتية" },
            { title: "صلاحيات محدودة", desc: "مبدأ الصلاحية الدنيا — كل شخص يصل فقط لما يحتاجه" },
            { title: "مصادقة ثنائية 2FA", desc: "إلزامي لجميع حسابات المسؤولين ولوحة تحكم Paymob" },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-3 p-4 rounded-xl border bg-muted/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Phone} title="6. جهات الاتصال الطارئة" color="red">
        <Table
          headers={["الجهة", "البريد الإلكتروني", "الوقت"]}
          rows={[
            ["فريق الأمن الداخلي", "security@arabyweb.net", "24/7"],
            ["دعم Paymob", "support@paymob.com", "24/7"],
            ["الهيئة الوطنية للأمن السيبراني (NCA)", "هاتف: 966115353535", "أوقات العمل"],
            ["الهيئة السعودية للبيانات (SDAIA)", "www.sdaia.gov.sa", "أوقات العمل"],
          ]}
        />
        <div className="bg-muted/30 rounded-xl p-4 text-sm">
          <p className="font-semibold mb-2">📋 نموذج تقرير الحادث (يُعبأ فوراً عند الاكتشاف)</p>
          <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
            {[
              "تاريخ ووقت الاكتشاف:",
              "اسم المُبلّغ ودوره:",
              "نوع الحادث:",
              "المستوى (P1-P4):",
              "الأنظمة المتأثرة:",
              "عدد المستخدمين المتأثرين (تقدير):",
              "الإجراءات الفورية المتخذة:",
              "الجهات التي تم إبلاغها:",
            ].map(field => (
              <div key={field} className="flex items-center gap-2">
                <span className="text-xs">□</span>
                <span className="text-xs">{field}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="border rounded-xl p-5 bg-muted/20 text-sm text-muted-foreground mt-8">
        <p className="font-semibold text-foreground mb-1">اعتماد الخطة وجدول المراجعة</p>
        <p>تُراجع هذه الخطة وتُحدَّث كل 6 أشهر، أو بعد كل حادث أمني، أيهما أقرب. آخر مراجعة: {DATE_AR}. الإصدار: {VERSION}.</p>
        <p className="mt-2">هذا المستند سري ومخصص للاستخدام الداخلي في {COMPANY}. يجب عدم مشاركته خارج الفريق إلا عند الحاجة القانونية أو التنظيمية.</p>
      </div>
    </div>
  );
}

function EnglishContent() {
  return (
    <div className="space-y-2">
      <Section icon={Eye} title="1. Purpose & Scope">
        <p className="text-muted-foreground mb-4 leading-relaxed">
          This plan defines the procedures to follow when a security incident is detected affecting ArabyWeb.net, its data, or its customers. The plan covers all incidents related to:
        </p>
        <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
          <li>Database breaches or theft of user data</li>
          <li>Payment gateway (Paymob) incidents or customer card data exposure</li>
          <li>Application vulnerability exploitation (SQL Injection, XSS, etc.)</li>
          <li>Denial-of-Service (DDoS) attacks</li>
          <li>Compromise of employee or admin accounts</li>
          <li>Leaked API keys or credentials</li>
        </ul>
      </Section>

      <Section icon={Users} title="2. Incident Response Team" color="blue">
        <Table
          headers={["Role", "Responsibility", "Contact"]}
          rows={[
            ["Incident Commander", "Leads response and makes executive decisions", "CTO / Technical Director"],
            ["Security Lead", "Technical analysis and scope assessment", "security@arabyweb.net"],
            ["Backend Developer", "Patch vulnerability, fix code, recovery", "Technical Team"],
            ["Communications Officer", "Notify customers, payment partners, regulators", "CEO / Executive Director"],
            ["Legal Advisor", "Assess legal obligations, prepare disclosures", "External when needed"],
          ]}
        />
      </Section>

      <Section icon={AlertTriangle} title="3. Incident Classification" color="amber">
        <Table
          headers={["Level", "Severity", "Description", "Response Time"]}
          rows={[
            ["P1 — Critical", "🔴", "Customer data breach, payment data theft, full service outage", "Immediate — within 1 hour"],
            ["P2 — High", "🟠", "Active attack detected, live vulnerability, partial data leak", "Within 4 hours"],
            ["P3 — Medium", "🟡", "Suspicious activity, low-risk vulnerability, auth issue", "Within 24 hours"],
            ["P4 — Low", "🟢", "External vulnerability report, inactive config issue", "Within 72 hours"],
          ]}
        />
      </Section>

      <Section icon={Clock} title="4. Response Phases" color="violet">
        <Step num={1} title="Detection & Verification (0–30 minutes)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>Receive report from: monitoring systems / employee / customer / Paymob alert</li>
            <li>Verify the incident is real and not a false positive</li>
            <li>Record the exact time in the Incident Log</li>
            <li>Notify Incident Commander immediately</li>
          </ul>
        </Step>

        <Step num={2} title="Immediate Containment (30 min – 2 hours)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li><strong>P1 incidents:</strong> Partially or fully suspend service if necessary</li>
            <li>Isolate affected components (database, API, etc.)</li>
            <li>Immediately rotate all passwords, API keys, and credentials</li>
            <li>Revoke suspicious active sessions</li>
            <li>Notify Paymob if payment data is affected: support@paymob.com</li>
            <li>Enable maintenance mode for users</li>
          </ul>
        </Step>

        <Step num={3} title="Analysis & Investigation (2–8 hours)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>Analyze server logs to identify the entry point</li>
            <li>Determine full scope: What data was affected? How many users?</li>
            <li>Document the complete attack vector</li>
            <li>Preserve forensic evidence without modification</li>
            <li>Assess whether the breach is still active</li>
          </ul>
        </Step>

        <Step num={4} title="Notification & Reporting (within 24 hours — mandatory)">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-3 text-sm">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Mandatory Legal Obligations</p>
            <ul className="list-disc ps-6 space-y-1 text-red-700 dark:text-red-400">
              <li>PDPL (Saudi Data Protection Law): Notify SDAIA within 72 hours</li>
              <li>Paymob contract: Notify via support@paymob.com within 24 hours</li>
              <li>Directly notify affected users if their data was compromised</li>
            </ul>
          </div>
          <Table
            headers={["Party", "Notification Channel", "Deadline"]}
            rows={[
              ["Paymob", "support@paymob.com", "24 hours"],
              ["SDAIA (Saudi Data Authority)", "Online portal", "72 hours"],
              ["SAMA (Saudi Central Bank)", "When payment data affected", "Immediate"],
              ["Affected customers", "Email", "48 hours"],
            ]}
          />
        </Step>

        <Step num={5} title="Recovery & Remediation (8 hours – 7 days)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>Fix the security vulnerability in code or configuration</li>
            <li>Test the fix in an isolated environment before deployment</li>
            <li>Restore data from backups if needed</li>
            <li>Gradually restart service with intensive monitoring</li>
            <li>Notify users of service restoration and incident summary</li>
          </ul>
        </Step>

        <Step num={6} title="Post-Incident Review (within 14 days)">
          <ul className="list-disc ps-6 space-y-1 text-sm text-muted-foreground">
            <li>Prepare a complete Post-Incident Report</li>
            <li>Team review session: What happened? Why? How to prevent recurrence?</li>
            <li>Update security policies and technical controls</li>
            <li>Update this plan if necessary</li>
            <li>Provide additional training if the incident was caused by human error</li>
          </ul>
        </Step>
      </Section>

      <Section icon={Server} title="5. Preventive Security Controls" color="emerald">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: "Continuous Monitoring", desc: "24/7 monitoring of logs and suspicious activities" },
            { title: "Daily Backups", desc: "Automated encrypted database backup every 24 hours" },
            { title: "Security Updates", desc: "Critical security patches applied within 48 hours of release" },
            { title: "Penetration Testing", desc: "Quarterly security testing of application and infrastructure" },
            { title: "Least Privilege", desc: "Each person accesses only what they need" },
            { title: "Two-Factor Auth (2FA)", desc: "Mandatory for all admin accounts and Paymob dashboard" },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-3 p-4 rounded-xl border bg-muted/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Phone} title="6. Emergency Contacts" color="red">
        <Table
          headers={["Party", "Contact", "Availability"]}
          rows={[
            ["Internal Security Team", "security@arabyweb.net", "24/7"],
            ["Paymob Support", "support@paymob.com", "24/7"],
            ["National Cybersecurity Authority (NCA)", "Phone: +966 11 535 3535", "Business hours"],
            ["SDAIA (Saudi Data Authority)", "www.sdaia.gov.sa", "Business hours"],
          ]}
        />
        <div className="bg-muted/30 rounded-xl p-4 text-sm">
          <p className="font-semibold mb-2">📋 Incident Report Form (fill immediately upon discovery)</p>
          <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
            {[
              "Date and time of discovery:",
              "Reporter name and role:",
              "Incident type:",
              "Severity level (P1–P4):",
              "Affected systems:",
              "Estimated affected users:",
              "Immediate actions taken:",
              "Parties notified:",
            ].map(field => (
              <div key={field} className="flex items-center gap-2">
                <span className="text-xs">□</span>
                <span className="text-xs">{field}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="border rounded-xl p-5 bg-muted/20 text-sm text-muted-foreground mt-8">
        <p className="font-semibold text-foreground mb-1">Plan Approval & Review Schedule</p>
        <p>This plan is reviewed and updated every 6 months, or after every security incident, whichever is sooner. Last review: {DATE_EN}. Version: {VERSION}.</p>
        <p className="mt-2">This document is confidential and for internal use within {COMPANY} only. It must not be shared outside the team except when legally or regulatorily required.</p>
      </div>
    </div>
  );
}
