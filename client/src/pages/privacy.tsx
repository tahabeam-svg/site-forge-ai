import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Globe2, ChevronUp } from "lucide-react";

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
  const lastUpdated = lang === "ar" ? "آخر تحديث: 1 مارس 2026" : "Last updated: March 1, 2026";

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
          <button onClick={toggleLang} className="text-xs border rounded-full px-3 py-1 hover:bg-muted transition-colors cursor-pointer" data-testid="button-toggle-lang">
            {lang === "ar" ? "EN" : "عربي"}
          </button>
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
          {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">{lastUpdated}</p>

        {lang === "ar" ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. مقدمة</h2>
              <p>تلتزم منصة عربي ويب بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL).</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">2. البيانات التي نجمعها</h2>
              <p>نقوم بجمع الأنواع التالية من البيانات:</p>
              <h3 className="text-lg font-medium mt-4 mb-2">بيانات الحساب</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>الاسم الكامل</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>صورة الملف الشخصي (عند التسجيل بحساب جوجل)</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">بيانات الاستخدام</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>المواقع التي تنشئها ومحتواها</li>
                <li>سجل استخدام رصيد الذكاء</li>
                <li>تفاعلاتك مع المنصة</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">بيانات تقنية</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>عنوان IP</li>
                <li>نوع المتصفح والجهاز</li>
                <li>ملفات تعريف الارتباط (الكوكيز)</li>
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
              <h2 className="text-xl font-semibold mb-3">4. حماية البيانات</h2>
              <p>نتخذ إجراءات أمنية متقدمة لحماية بياناتك:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>تشفير البيانات أثناء النقل والتخزين (AES-256)</li>
                <li>استخدام بروتوكول HTTPS لجميع الاتصالات</li>
                <li>مراجعات أمنية دورية</li>
                <li>تقييد الوصول إلى البيانات الشخصية</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">5. مشاركة البيانات</h2>
              <p>لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك بياناتك فقط في الحالات التالية:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>مع مزودي الخدمات الضروريين (مثل معالجة الدفع)</li>
                <li>عند الاستجابة لطلبات قانونية من الجهات المختصة</li>
                <li>لحماية حقوقنا ومصالحنا المشروعة</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">6. ملفات تعريف الارتباط (الكوكيز)</h2>
              <p>نستخدم ملفات تعريف الارتباط الضرورية لعمل المنصة، مثل حفظ جلسة تسجيل الدخول وتفضيلات اللغة. لا نستخدم كوكيز التتبع لأغراض إعلانية.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">7. حقوقك</h2>
              <p>وفقاً لنظام حماية البيانات الشخصية (PDPL)، لديك الحقوق التالية:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>طلب حذف بياناتك</li>
                <li>الاعتراض على معالجة بياناتك</li>
                <li>نقل بياناتك إلى مزود خدمة آخر</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">8. الاحتفاظ بالبيانات</h2>
              <p>نحتفظ ببياناتك طوال فترة نشاط حسابك. عند حذف حسابك، يتم حذف بياناتك الشخصية خلال 30 يوماً، مع الاحتفاظ بالبيانات المطلوبة قانونياً.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">9. التغييرات على السياسة</h2>
              <p>قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">10. التواصل</h2>
              <p>لأي استفسارات حول الخصوصية أو لممارسة حقوقك، تواصل معنا عبر: <a href="mailto:privacy@arabyweb.net" className="text-emerald-600 hover:underline">privacy@arabyweb.net</a></p>
            </section>
          </div>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>ArabyWeb is committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information in compliance with Saudi Arabia's Personal Data Protection Law (PDPL).</p>
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
                <li>Credit usage history</li>
                <li>Your interactions with the Platform</li>
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">Technical Data</h3>
              <ul className="list-disc ps-6 space-y-1">
                <li>IP address</li>
                <li>Browser and device type</li>
                <li>Cookies</li>
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
              <h2 className="text-xl font-semibold mb-3">4. Data Protection</h2>
              <p>We implement advanced security measures to protect your data:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Data encryption in transit and at rest (AES-256)</li>
                <li>HTTPS protocol for all communications</li>
                <li>Regular security audits</li>
                <li>Restricted access to personal data</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
              <p>We do not sell your personal data to third parties. We may share your data only in the following cases:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>With essential service providers (e.g., payment processing)</li>
                <li>In response to legal requests from competent authorities</li>
                <li>To protect our rights and legitimate interests</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
              <p>We use essential cookies required for the Platform to function, such as session management and language preferences. We do not use tracking cookies for advertising purposes.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
              <p>Under the Personal Data Protection Law (PDPL), you have the following rights:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Data portability to another service provider</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
              <p>We retain your data for as long as your account is active. Upon account deletion, your personal data is removed within 30 days, except for data required by law.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Policy Changes</h2>
              <p>We may update this policy from time to time. You will be notified of any material changes via email or through a notice on the Platform.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
              <p>For privacy inquiries or to exercise your rights, contact us at: <a href="mailto:privacy@arabyweb.net" className="text-emerald-600 hover:underline">privacy@arabyweb.net</a></p>
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
        </div>
      </footer>
    </div>
  );
}
