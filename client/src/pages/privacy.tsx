import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Globe2, ChevronUp, Shield, CreditCard, Lock, AlertTriangle } from "lucide-react";

function getLang(): "ar" | "en" {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("arabyweb-lang") as "ar" | "en") || "ar";
  }
  return "ar";
}

export default function PrivacyPage() {
  const [lang, setLang] = useState<"ar" | "en">(getLang);
  const [showTop, setShowTop] = useState(false);
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.title = lang === "ar" ? "سياسة الخصوصية — عربي ويب" : "Privacy Policy — ArabyWeb";
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
  const lastUpdated = lang === "ar" ? "آخر تحديث: 13 مارس 2026" : "Last updated: March 13, 2026";

  return (
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? "font-cairo" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold" data-testid="link-home">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {lang === "ar" ? "عربي ويب" : "ArabyWeb"}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/incident-response" className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="link-incident-response">
              {lang === "ar" ? "خطة الاستجابة للحوادث" : "Incident Response Plan"}
            </Link>
            <button onClick={toggleLang} className="text-xs border rounded-full px-3 py-1 hover:bg-muted transition-colors cursor-pointer" data-testid="button-toggle-lang">
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home">
            <Arrow className="w-3 h-3 rotate-180" />
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="text-privacy-title">
          {lang === "ar" ? "سياسة الخصوصية وأمان المدفوعات" : "Privacy & Payment Security Policy"}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">{lastUpdated}</p>

        {lang === "ar" ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 leading-relaxed">

            <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Shield, label: "PDPL متوافق" },
                { icon: CreditCard, label: "PCI DSS معتمد" },
                { icon: Lock, label: "تشفير AES-256" },
                { icon: AlertTriangle, label: "استجابة 24 ساعة" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-muted/30 text-center">
                  <Icon className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. مقدمة</h2>
              <p>تلتزم منصة عربي ويب (<strong>ArabyWeb.net</strong>) بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك وفقاً لـ:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL)</li>
                <li>معايير أمان بيانات صناعة بطاقات الدفع (PCI DSS)</li>
                <li>متطلبات البنك المركزي السعودي (SAMA)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. البيانات التي نجمعها</h2>
              <h3 className="text-lg font-medium mt-4 mb-2">بيانات الحساب</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>الاسم الكامل</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>صورة الملف الشخصي (عند التسجيل بحساب جوجل)</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">بيانات الاستخدام</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>المواقع التي تنشئها ومحتواها</li>
                <li>سجل استخدام رصيد الذكاء الاصطناعي</li>
                <li>تفاعلاتك مع المنصة</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">بيانات تقنية</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>عنوان IP</li>
                <li>نوع المتصفح والجهاز</li>
                <li>ملفات تعريف الارتباط (الكوكيز) للجلسة فقط</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. كيف نستخدم بياناتك</h2>
              <ul className="list-disc ps-6 space-y-1">
                <li>تقديم خدمات المنصة وتحسينها</li>
                <li>معالجة المدفوعات وإدارة الاشتراكات</li>
                <li>إرسال إشعارات مهمة حول حسابك</li>
                <li>تحسين تجربة المستخدم وتطوير ميزات جديدة</li>
                <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. أمان المدفوعات ومعايير PCI DSS</h2>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 mb-4">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🔒 لا نخزّن أي بيانات بطاقة دفع</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">جميع عمليات الدفع تتم حصرياً عبر بوابة بايموب (Paymob) المعتمدة من البنك المركزي السعودي. نحن لا نرى ولا نخزّن أرقام البطاقات أو CVV أو تواريخ انتهاء الصلاحية.</p>
              </div>
              <p className="mb-3">نلتزم بمعايير <strong>PCI DSS (Payment Card Industry Data Security Standard)</strong> من خلال:</p>
              <ul className="list-disc ps-6 space-y-2">
                <li><strong>عدم التخزين:</strong> لا نحتفظ بأي بيانات بطاقة ائتمان أو خصم على خوادمنا</li>
                <li><strong>التحويل الآمن:</strong> يتم توجيه المدفوعات مباشرةً لخوادم Paymob المشفرة عبر iframe معزول</li>
                <li><strong>التحقق من التوقيع:</strong> نستخدم HMAC-SHA512 للتحقق من صحة كل استجابة دفع</li>
                <li><strong>HTTPS إلزامي:</strong> جميع الاتصالات مشفرة بـ TLS 1.3</li>
                <li><strong>بيئة معزولة:</strong> بيانات الدفع معزولة تماماً عن بقية بيانات التطبيق</li>
                <li><strong>مراجعات دورية:</strong> نجري مراجعات أمنية دورية على كود معالجة المدفوعات</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. حماية البيانات العامة</h2>
              <p>نتخذ إجراءات أمنية متقدمة لحماية جميع بياناتك:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>تشفير البيانات أثناء النقل (TLS 1.3) وعند التخزين (AES-256)</li>
                <li>جدار حماية (Firewall) على مستوى الشبكة</li>
                <li>تقييد صارم للوصول إلى البيانات الشخصية</li>
                <li>نسخ احتياطي يومي مشفر لقاعدة البيانات</li>
                <li>مراقبة مستمرة للنشاطات المشبوهة</li>
                <li>تحديثات أمنية منتظمة للأنظمة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. مشاركة البيانات</h2>
              <p>لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك بياناتك فقط في الحالات التالية:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li><strong>بايموب (Paymob):</strong> لمعالجة المدفوعات — الاسم والبريد الإلكتروني فقط</li>
                <li><strong>OpenAI:</strong> لتوليد المواقع — محتوى الطلب فقط بدون بيانات شخصية</li>
                <li><strong>الجهات الحكومية:</strong> عند الاستجابة لطلبات قانونية من الجهات المختصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. ملفات تعريف الارتباط (الكوكيز)</h2>
              <p>نستخدم ملفات تعريف الارتباط الضرورية لعمل المنصة فقط:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>جلسة تسجيل الدخول (session cookie)</li>
                <li>تفضيلات اللغة</li>
                <li>إعدادات المظهر (وضع النهار/الليل)</li>
              </ul>
              <p className="mt-2">لا نستخدم كوكيز التتبع أو الإعلانات.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. حقوقك (PDPL)</h2>
              <p>وفقاً لنظام حماية البيانات الشخصية، لديك الحقوق التالية:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>الوصول إلى بياناتك الشخصية ومعرفة كيفية معالجتها</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>طلب حذف بياناتك (حق النسيان)</li>
                <li>الاعتراض على معالجة بياناتك</li>
                <li>نقل بياناتك إلى مزود خدمة آخر</li>
              </ul>
              <p className="mt-3">لممارسة أي من هذه الحقوق، تواصل معنا عبر: <a href="mailto:privacy@arabyweb.net" className="text-emerald-600 hover:underline">privacy@arabyweb.net</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. الإبلاغ عن الحوادث الأمنية</h2>
              <p>إذا اكتشفت ثغرة أمنية أو لاحظت نشاطاً مشبوهاً على حسابك، يرجى الإبلاغ فوراً:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>البريد الإلكتروني للأمن: <a href="mailto:security@arabyweb.net" className="text-emerald-600 hover:underline">security@arabyweb.net</a></li>
                <li>سنستجيب لجميع البلاغات الأمنية خلال <strong>24 ساعة</strong></li>
              </ul>
              <p className="mt-3">للاطلاع على خطة استجابة الحوادث الكاملة: <Link href="/incident-response" className="text-emerald-600 hover:underline">خطة الاستجابة للحوادث</Link></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. الاحتفاظ بالبيانات</h2>
              <p>نحتفظ ببياناتك طوال فترة نشاط حسابك. عند حذف حسابك:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>حذف البيانات الشخصية خلال 30 يوماً</li>
                <li>الاحتفاظ بسجلات المدفوعات لمدة 7 سنوات (متطلب قانوني)</li>
                <li>حذف المواقع المُنشأة فوراً عند الطلب</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. التغييرات على السياسة</h2>
              <p>قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة قبل 15 يوماً من التطبيق.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. التواصل</h2>
              <p>لأي استفسارات حول الخصوصية أو لممارسة حقوقك:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>البريد الإلكتروني: <a href="mailto:privacy@arabyweb.net" className="text-emerald-600 hover:underline">privacy@arabyweb.net</a></li>
                <li>الأمن السيبراني: <a href="mailto:security@arabyweb.net" className="text-emerald-600 hover:underline">security@arabyweb.net</a></li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 leading-relaxed">

            <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Shield, label: "PDPL Compliant" },
                { icon: CreditCard, label: "PCI DSS Certified" },
                { icon: Lock, label: "AES-256 Encrypted" },
                { icon: AlertTriangle, label: "24hr Response" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-muted/30 text-center">
                  <Icon className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>ArabyWeb (<strong>ArabyWeb.net</strong>) is committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information in compliance with:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Saudi Arabia's Personal Data Protection Law (PDPL)</li>
                <li>Payment Card Industry Data Security Standard (PCI DSS)</li>
                <li>Saudi Central Bank (SAMA) requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>
              <h3 className="text-lg font-medium mt-4 mb-2">Account Data</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Profile picture (when signing in with Google)</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">Usage Data</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>Websites you create and their content</li>
                <li>AI credit usage history</li>
                <li>Your interactions with the Platform</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">Technical Data</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>IP address</li>
                <li>Browser and device type</li>
                <li>Session cookies only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc ps-6 space-y-1">
                <li>Providing and improving Platform services</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Sending important notifications about your account</li>
                <li>Enhancing user experience and developing new features</li>
                <li>Complying with legal and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Payment Security & PCI DSS Compliance</h2>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 mb-4">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🔒 We never store payment card data</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">All payments are processed exclusively through Paymob, a payment gateway authorized by the Saudi Central Bank. We never see, access, or store card numbers, CVV codes, or expiry dates.</p>
              </div>
              <p className="mb-3">We comply with <strong>PCI DSS (Payment Card Industry Data Security Standard)</strong> through:</p>
              <ul className="list-disc ps-6 space-y-2">
                <li><strong>Zero storage:</strong> No credit or debit card data is ever stored on our servers</li>
                <li><strong>Secure redirect:</strong> Payments go directly to Paymob's encrypted servers via an isolated iframe</li>
                <li><strong>Signature verification:</strong> We use HMAC-SHA512 to verify every payment response</li>
                <li><strong>HTTPS mandatory:</strong> All communications encrypted with TLS 1.3</li>
                <li><strong>Isolated environment:</strong> Payment data is completely separated from application data</li>
                <li><strong>Regular audits:</strong> We conduct periodic security reviews of payment processing code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. General Data Protection</h2>
              <p>We implement advanced security measures to protect all your data:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Data encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>Network-level firewall</li>
                <li>Strict access control to personal data</li>
                <li>Daily encrypted database backups</li>
                <li>Continuous monitoring for suspicious activity</li>
                <li>Regular security updates for all systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Sharing</h2>
              <p>We do not sell your personal data to third parties. We may share your data only in the following cases:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li><strong>Paymob:</strong> For payment processing — name and email only</li>
                <li><strong>OpenAI:</strong> For website generation — request content only, no personal data</li>
                <li><strong>Government authorities:</strong> In response to legal requests from competent authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
              <p>We use only essential cookies required for the Platform to function:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Login session (session cookie)</li>
                <li>Language preferences</li>
                <li>Theme settings (light/dark mode)</li>
              </ul>
              <p className="mt-2">We do not use tracking or advertising cookies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Your Rights (PDPL)</h2>
              <p>Under the Personal Data Protection Law, you have the following rights:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Access your personal data and understand how it is processed</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data (right to be forgotten)</li>
                <li>Object to data processing</li>
                <li>Data portability to another service provider</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, contact us at: <a href="mailto:privacy@arabyweb.net" className="text-emerald-600 hover:underline">privacy@arabyweb.net</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Security Incident Reporting</h2>
              <p>If you discover a security vulnerability or notice suspicious activity on your account, please report immediately:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Security email: <a href="mailto:security@arabyweb.net" className="text-emerald-600 hover:underline">security@arabyweb.net</a></li>
                <li>We respond to all security reports within <strong>24 hours</strong></li>
              </ul>
              <p className="mt-3">View our full incident response plan: <Link href="/incident-response" className="text-emerald-600 hover:underline">Incident Response Plan</Link></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Data Retention</h2>
              <p>We retain your data for as long as your account is active. Upon account deletion:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Personal data deleted within 30 days</li>
                <li>Payment records retained for 7 years (legal requirement)</li>
                <li>Created websites deleted immediately upon request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Policy Changes</h2>
              <p>We may update this policy from time to time. You will be notified of any material changes via email or through a notice on the Platform at least 15 days before they take effect.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
              <p>For any privacy inquiries or to exercise your rights:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Privacy: <a href="mailto:privacy@arabyweb.net" className="text-emerald-600 hover:underline">privacy@arabyweb.net</a></li>
                <li>Security: <a href="mailto:security@arabyweb.net" className="text-emerald-600 hover:underline">security@arabyweb.net</a></li>
              </ul>
            </section>
          </div>
        )}
      </main>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 end-6 w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer z-50"
          data-testid="button-scroll-top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <footer className="py-8 border-t bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"} &copy; 2026 {lang === "ar" ? "عربي ويب" : "ArabyWeb"}
          {" · "}
          <Link href="/terms" className="hover:text-foreground transition-colors">{lang === "ar" ? "الشروط والأحكام" : "Terms of Service"}</Link>
          {" · "}
          <Link href="/incident-response" className="hover:text-foreground transition-colors">{lang === "ar" ? "خطة الاستجابة للحوادث" : "Incident Response"}</Link>
        </div>
      </footer>
    </div>
  );
}
