import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Globe2, ChevronUp } from "lucide-react";

function getLang(): "ar" | "en" {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("arabyweb-lang") as "ar" | "en") || "ar";
  }
  return "ar";
}

export default function TermsPage() {
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

        <h1 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="text-terms-title">
          {lang === "ar" ? "شروط الاستخدام" : "Terms of Service"}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">{lastUpdated}</p>

        {lang === "ar" ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. مقدمة</h2>
              <p>مرحباً بك في منصة عربي ويب ("المنصة"، "نحن"، "لنا"). باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام المنصة.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">2. وصف الخدمة</h2>
              <p>عربي ويب هي منصة لبناء المواقع الإلكترونية باستخدام الذكاء الاصطناعي، تتيح للمستخدمين إنشاء مواقع ويب احترافية وإدارة محتوى التسويق الرقمي. تشمل الخدمات:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>إنشاء المواقع الإلكترونية بالذكاء الاصطناعي</li>
                <li>إدارة وتعديل المحتوى</li>
                <li>إنشاء محتوى تسويقي للسوشيال ميديا</li>
                <li>نشر المواقع واستضافتها</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">3. التسجيل والحساب</h2>
              <p>عند إنشاء حساب في المنصة، تلتزم بما يلي:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>تقديم معلومات صحيحة ودقيقة</li>
                <li>الحفاظ على سرية بيانات الدخول الخاصة بك</li>
                <li>إخطارنا فوراً في حالة أي استخدام غير مصرح به لحسابك</li>
                <li>أن تكون مسؤولاً عن جميع الأنشطة التي تتم من خلال حسابك</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">4. نظام الرصيد (الكريدت)</h2>
              <p>تعمل المنصة بنظام الرصيد (الكريدت) لاستخدام خدمات الذكاء الاصطناعي:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>كل عملية ذكاء اصطناعي تستهلك رصيداً واحداً</li>
                <li>الأرصدة غير قابلة للتحويل أو الاسترداد</li>
                <li>يتم تجديد الأرصدة شهرياً حسب خطة الاشتراك</li>
                <li>الأرصدة غير المستخدمة لا تُرحّل للشهر التالي</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">5. الملكية الفكرية</h2>
              <p>المحتوى الذي تنشئه باستخدام المنصة يبقى ملكاً لك. ومع ذلك، تحتفظ عربي ويب بجميع الحقوق المتعلقة بالمنصة نفسها، بما في ذلك التصميم والكود والعلامة التجارية.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">6. الاستخدام المقبول</h2>
              <p>يُحظر استخدام المنصة في:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>إنشاء محتوى غير قانوني أو مخالف للأنظمة السعودية</li>
                <li>انتهاك حقوق الملكية الفكرية للآخرين</li>
                <li>نشر محتوى ضار أو مضلل أو احتيالي</li>
                <li>محاولة اختراق أو تعطيل المنصة</li>
                <li>استخدام المنصة لإرسال رسائل غير مرغوب فيها (سبام)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">7. الدفع والفواتير</h2>
              <p>جميع الأسعار المعروضة بالريال السعودي ولا تشمل ضريبة القيمة المضافة (15%). تُضاف الضريبة عند إتمام عملية الدفع وفقاً لأنظمة هيئة الزكاة والضريبة والجمارك (ZATCA).</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">8. إنهاء الخدمة</h2>
              <p>يحق لنا تعليق أو إنهاء حسابك في حالة مخالفة هذه الشروط. كما يمكنك إلغاء حسابك في أي وقت من خلال إعدادات الحساب.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">9. تحديد المسؤولية</h2>
              <p>يتم تقديم المنصة "كما هي" دون أي ضمانات صريحة أو ضمنية. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">10. التعديلات</h2>
              <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">11. القانون الحاكم</h2>
              <p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية. أي نزاعات تنشأ عن استخدام المنصة تخضع للاختصاص القضائي للمحاكم السعودية.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">12. التواصل</h2>
              <p>لأي استفسارات بخصوص شروط الاستخدام، يمكنك التواصل معنا عبر البريد الإلكتروني: <a href="mailto:support@arabyweb.net" className="text-emerald-600 hover:underline">support@arabyweb.net</a></p>
            </section>
          </div>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>Welcome to ArabyWeb ("Platform", "we", "us"). By using the Platform, you agree to be bound by these Terms of Service. If you do not agree to any of these terms, please do not use the Platform.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
              <p>ArabyWeb is an AI-powered website building platform that enables users to create professional websites and manage digital marketing content. Services include:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>AI-powered website creation</li>
                <li>Content management and editing</li>
                <li>Social media marketing content generation</li>
                <li>Website publishing and hosting</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
              <p>When creating an account, you agree to:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities conducted through your account</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Credit System</h2>
              <p>The Platform operates on a credit-based system for AI services:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Each AI operation consumes one credit</li>
                <li>Credits are non-transferable and non-refundable</li>
                <li>Credits are renewed monthly based on your subscription plan</li>
                <li>Unused credits do not roll over to the next month</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
              <p>Content you create using the Platform remains your property. However, ArabyWeb retains all rights related to the Platform itself, including design, code, and branding.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Acceptable Use</h2>
              <p>You may not use the Platform to:</p>
              <ul className="list-disc ps-6 space-y-1 mt-2">
                <li>Create illegal content or content violating Saudi regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Publish harmful, misleading, or fraudulent content</li>
                <li>Attempt to hack or disrupt the Platform</li>
                <li>Use the Platform for sending unsolicited messages (spam)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Payment and Billing</h2>
              <p>All prices are displayed in Saudi Riyals (SAR) and are exclusive of Value Added Tax (VAT) at 15%. VAT is added at checkout in compliance with ZATCA regulations.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Service Termination</h2>
              <p>We reserve the right to suspend or terminate your account for violation of these Terms. You may also cancel your account at any time through account settings.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p>The Platform is provided "as is" without any express or implied warranties. We are not liable for any direct or indirect damages resulting from the use of the Platform.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
              <p>We reserve the right to modify these Terms at any time. You will be notified of any material changes via email or through a notice on the Platform.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
              <p>These Terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes arising from the use of the Platform shall be subject to the jurisdiction of Saudi courts.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
              <p>For any inquiries regarding these Terms, you can reach us at: <a href="mailto:support@arabyweb.net" className="text-emerald-600 hover:underline">support@arabyweb.net</a></p>
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
