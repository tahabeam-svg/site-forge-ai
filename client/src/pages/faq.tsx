import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Globe2, ChevronUp, ChevronDown } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

function getLang(): "ar" | "en" {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("arabyweb-lang") as "ar" | "en") || "ar";
  }
  return "ar";
}

interface FAQItem {
  q: string;
  a: string;
}

function FAQAccordion({ items, lang }: { items: FAQItem[]; lang: "ar" | "en" }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border rounded-xl overflow-hidden bg-card" data-testid={`faq-item-${i}`}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start font-medium hover:bg-muted/50 transition-colors cursor-pointer"
            data-testid={`button-faq-toggle-${i}`}
          >
            <span>{item.q}</span>
            <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-muted-foreground leading-relaxed border-t pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  const [lang, setLang] = useState<"ar" | "en">(getLang);
  const [showTop, setShowTop] = useState(false);
  const isRTL = lang === "ar";

  useSEO({
    title: lang === "ar"
      ? "الأسئلة الشائعة — عربي ويب | بناء مواقع مجانية بالذكاء الاصطناعي"
      : "FAQ — ArabyWeb | Free AI Website Builder",
    description: lang === "ar"
      ? "إجابات على جميع أسئلتك حول منصة عربي ويب: الأسعار، رصيد الذكاء، التعديلات، النشر، وطرق الدفع. بناء موقع مجاني في السعودية."
      : "Answers to all your questions about ArabyWeb: pricing, AI credits, edits, publishing, and payment. Build a free website in Saudi Arabia.",
    keywords: lang === "ar"
      ? "أسئلة شائعة عربي ويب، أسعار بناء موقع، رصيد ذكاء، بناء موقع مجاني، استفسارات المنصة"
      : "ArabyWeb FAQ, website builder pricing, AI credits, free website Saudi Arabia",
    lang,
    canonical: "https://arabyweb.net/faq",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "ما هي منصة عربي ويب؟",
          "acceptedAnswer": { "@type": "Answer", "text": "عربي ويب هي منصة لبناء المواقع الإلكترونية بالذكاء الاصطناعي، مصممة خصيصاً للسوق العربي والسعودي." }
        },
        {
          "@type": "Question",
          "name": "هل بناء الموقع مجاني؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، التسجيل وبناء المواقع مجاني. تحصل على 5 جلسات ذكاء مجانية شهرياً مع الخطة المجانية." }
        },
        {
          "@type": "Question",
          "name": "ما هي أسعار خطط عربي ويب؟",
          "acceptedAnswer": { "@type": "Answer", "text": "الخطة المجانية: 5 جلسات/شهر. الاحترافية: 49 ر.س/شهر (50 جلسة). الأعمال: 99 ر.س/شهر (200 جلسة). جميع الأسعار لا تشمل VAT 15%." }
        },
        {
          "@type": "Question",
          "name": "هل تحتاج خبرة برمجية؟",
          "acceptedAnswer": { "@type": "Answer", "text": "لا، لا تحتاج أي خبرة برمجية. فقط صف ما تريده وسيبني الذكاء الاصطناعي موقعك تلقائياً." }
        },
        {
          "@type": "Question",
          "name": "هل يمكنني ربط نطاق خاص؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، يمكنك ربط دومين خاص بموقعك من خلال إعدادات النشر في لوحة التحكم." }
        }
      ]
    }
  });

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

  const faqAr: { category: string; items: FAQItem[] }[] = [
    {
      category: "عام",
      items: [
        { q: "ما هي منصة عربي ويب؟", a: "عربي ويب هي منصة لبناء المواقع الإلكترونية بالذكاء الاصطناعي، مصممة خصيصاً للسوق العربي والسعودي. تتيح لك إنشاء موقع احترافي في أقل من دقيقتين فقط بوصف رؤيتك." },
        { q: "هل أحتاج خبرة برمجية لاستخدام المنصة؟", a: "لا، لا تحتاج أي خبرة برمجية. فقط صف ما تريده بالعربية أو الإنجليزية وسيقوم الذكاء الاصطناعي ببناء موقعك تلقائياً." },
        { q: "هل المنصة تدعم اللغة العربية بالكامل؟", a: "نعم، المنصة مصممة بالكامل لدعم اللغة العربية مع اتجاه RTL، وتدعم أيضاً اللغة الإنجليزية." },
        { q: "هل يمكنني استخدام المنصة على الجوال؟", a: "نعم، المنصة متجاوبة بالكامل وتعمل على جميع الأجهزة: الجوال، التابلت، والكمبيوتر." },
      ],
    },
    {
      category: "الحساب والتسجيل",
      items: [
        { q: "كيف أسجل في المنصة؟", a: "يمكنك التسجيل بسهولة عبر حساب جوجل بنقرة واحدة، أو إنشاء حساب جديد بالبريد الإلكتروني وكلمة المرور." },
        { q: "هل التسجيل مجاني؟", a: "نعم، التسجيل مجاني تماماً. تحصل على 5 جلسات ذكاء مجانية شهرياً مع الخطة المجانية لتجربة المنصة." },
        { q: "هل يمكنني تغيير خطتي لاحقاً؟", a: "نعم، يمكنك ترقية أو تغيير خطتك في أي وقت من صفحة الفوترة في لوحة التحكم." },
      ],
    },
    {
      category: "الأسعار والدفع",
      items: [
        { q: "ما هي خطط الأسعار المتاحة؟", a: "نوفر ثلاث خطط: المجانية (5 جلسات ذكاء/شهر)، الاحترافية بـ 49 ر.س/شهر (50 جلسة ذكاء)، وخطة الأعمال بـ 99 ر.س/شهر (200 جلسة ذكاء). جميع الأسعار لا تشمل ضريبة القيمة المضافة 15%." },
        { q: "ما هي طرق الدفع المتاحة؟", a: "ندعم الدفع بالبطاقات الائتمانية (فيزا، ماستركارد)، مدى، وأبل باي." },
        { q: "هل يتم إضافة ضريبة القيمة المضافة؟", a: "نعم، تُضاف ضريبة القيمة المضافة (15%) عند إتمام عملية الدفع وفقاً لأنظمة هيئة الزكاة والضريبة والجمارك (ZATCA). الأسعار المعروضة لا تشمل الضريبة." },
        { q: "هل يمكنني الحصول على فاتورة ضريبية؟", a: "نعم، يتم إصدار فاتورة ضريبية متوافقة مع نظام ZATCA لكل عملية دفع. يمكنك تنزيلها من صفحة الفوترة." },
        { q: "هل هناك خصم على الاشتراك السنوي؟", a: "نعم، تحصل على خصم 20% عند الاشتراك بالخطة السنوية مقارنة بالدفع الشهري." },
      ],
    },
    {
      category: "رصيد الذكاء",
      items: [
        { q: "ما هو رصيد الذكاء؟", a: "رصيد الذكاء هو نظام جلسات الذكاء الاصطناعي في عربي ويب. كل تفاعل مع الذكاء الاصطناعي (مثل إنشاء موقع، تعديل ذكي، أو توليد محتوى تسويقي) يستهلك جلسة ذكاء واحدة. التعديلات المجانية لكل موقع مدرجة ضمن خطتك، وأي تعديل إضافي يخصم جلسة ذكاء واحدة." },
        { q: "ماذا يحدث عند نفاد رصيد الذكاء؟", a: "عند نفاد رصيدك، يمكنك شراء جلسات إضافية أو الانتظار حتى التجديد الشهري أو ترقية خطتك للحصول على جلسات أكثر." },
        { q: "هل تُرحّل الجلسات غير المستخدمة؟", a: "لا، الجلسات غير المستخدمة لا تُرحّل إلى الشهر التالي. يتم تجديد رصيد الذكاء بالكامل في بداية كل دورة فوترة." },
      ],
    },
    {
      category: "التعديلات على المواقع",
      items: [
        { q: "كم عدد التعديلات المجانية لكل موقع؟", a: "لكل موقع حد مجاني للتعديلات حسب الخطة:\n• الخطة المجانية: تعديلان (2) مجانيان لكل موقع\n• الخطة الاحترافية: 5 تعديلات مجانية لكل موقع\n• خطة الأعمال: 10 تعديلات مجانية لكل موقع\nبعد الاستنفاد تُخصم جلسة ذكاء واحدة لكل تعديل إضافي." },
        { q: "هل التعديلات الإضافية مدفوعة؟", a: "نعم، بعد استنفاد التعديلات المجانية لكل موقع، تُخصم جلسة ذكاء واحدة من رصيدك لكل تعديل إضافي. إذا لم يكن لديك رصيد كافٍ ستحتاج لشراء جلسات إضافية أو ترقية خطتك." },
        { q: "هل التعديلات محسوبة لكل موقع أم للحساب كله؟", a: "التعديلات المجانية محسوبة لكل موقع على حدة. كل موقع جديد تنشئه يبدأ بعدد التعديلات المجانية كاملاً حسب خطتك." },
      ],
    },
    {
      category: "المواقع والنشر",
      items: [
        { q: "ما اللغات التي يدعمها منشئ المواقع؟", a: "يدعم منشئ المواقع 7 لغات: العربية 🇸🇦، الإنجليزية 🇬🇧، الفرنسية 🇫🇷، التركية 🇹🇷، الروسية 🇷🇺، الألمانية 🇩🇪، والصينية 🇨🇳." },
        { q: "هل يمكنني ربط دومين خاص بموقعي؟", a: "نعم، يمكنك ربط نطاق (دومين) خاص بموقعك من خلال إعدادات النشر." },
        { q: "هل المواقع متجاوبة مع الجوال؟", a: "نعم، جميع المواقع التي تُنشأ عبر المنصة متجاوبة تلقائياً وتعمل بشكل مثالي على جميع أحجام الشاشات." },
        { q: "هل يمكنني تعديل الموقع بعد إنشائه؟", a: "نعم، يمكنك تعديل موقعك في أي وقت باستخدام المحرر المدمج أو عبر أوامر الذكاء الاصطناعي. لكل موقع حد مجاني للتعديلات حسب خطتك." },
        { q: "هل يمكنني نشر موقعي على GitHub؟", a: "نعم، المنصة تدعم النشر المباشر على GitHub Pages لاستضافة مجانية وسريعة." },
      ],
    },
  ];

  const faqEn: { category: string; items: FAQItem[] }[] = [
    {
      category: "General",
      items: [
        { q: "What is ArabyWeb?", a: "ArabyWeb is an AI-powered website building platform designed specifically for the Arab and Saudi market. It allows you to create a professional website in less than 2 minutes just by describing your vision." },
        { q: "Do I need coding experience?", a: "No, you don't need any coding experience. Simply describe what you want in Arabic or English, and the AI will build your website automatically." },
        { q: "Does the platform fully support Arabic?", a: "Yes, the platform is fully designed to support Arabic with RTL direction, and also supports English." },
        { q: "Can I use the platform on mobile?", a: "Yes, the platform is fully responsive and works on all devices: mobile, tablet, and desktop." },
      ],
    },
    {
      category: "Account & Registration",
      items: [
        { q: "How do I sign up?", a: "You can easily sign up with your Google account in one click, or create a new account with email and password." },
        { q: "Is registration free?", a: "Yes, registration is completely free. You get 5 free AI sessions per month with the Free plan to try the platform." },
        { q: "Can I change my plan later?", a: "Yes, you can upgrade or change your plan at any time from the Billing page in your dashboard." },
      ],
    },
    {
      category: "Pricing & Payment",
      items: [
        { q: "What pricing plans are available?", a: "We offer three plans: Free (5 AI sessions/month), Pro at 49 SAR/month (50 AI sessions), and Business at 99 SAR/month (200 AI sessions). All prices are exclusive of 15% VAT." },
        { q: "What payment methods are supported?", a: "We support credit cards (Visa, Mastercard), Mada, and Apple Pay." },
        { q: "Is VAT added to the prices?", a: "Yes, VAT (15%) is added at checkout in compliance with ZATCA regulations. Displayed prices are exclusive of VAT." },
        { q: "Can I get a tax invoice?", a: "Yes, a ZATCA-compliant tax invoice is issued for every payment. You can download it from the Billing page." },
        { q: "Is there a discount for annual subscriptions?", a: "Yes, you get a 20% discount when subscribing to an annual plan compared to monthly billing." },
      ],
    },
    {
      category: "AI Credits",
      items: [
        { q: "How do AI credits work?", a: "Each AI interaction (creating a website, AI editing, or marketing content) consumes one AI session. Free edits per project are included in your plan; extra edits beyond the limit cost 1 AI session each." },
        { q: "What happens when I run out of AI credits?", a: "When your AI credits run out, you can purchase extra sessions, wait for the monthly renewal, or upgrade your plan for more sessions." },
        { q: "Do unused AI sessions roll over?", a: "No, unused AI sessions do not roll over to the next month. Your credits are fully renewed at the start of each billing cycle." },
      ],
    },
    {
      category: "Website Edits",
      items: [
        { q: "How many free edits does each website get?", a: "Each website has a free-edit limit based on your plan:\n• Free Plan: 2 free edits per site\n• Pro Plan: 5 free edits per site\n• Business Plan: 10 free edits per site\nAfter the free edits are used, each additional edit costs 1 AI session." },
        { q: "Are extra edits paid?", a: "Yes, once the free edits for a site are used up, each additional edit deducts 1 AI session from your balance. If you're low on AI credits, you can purchase more sessions or upgrade your plan." },
        { q: "Are edit limits per site or per account?", a: "Edit limits are per site. Every new site you create starts fresh with the full number of free edits for your plan." },
      ],
    },
    {
      category: "Websites & Publishing",
      items: [
        { q: "What languages does the website builder support?", a: "The builder supports 7 languages: Arabic 🇸🇦, English 🇬🇧, French 🇫🇷, Turkish 🇹🇷, Russian 🇷🇺, German 🇩🇪, and Chinese 🇨🇳." },
        { q: "Can I connect a custom domain?", a: "Yes, you can connect a custom domain to your website through the publishing settings." },
        { q: "Are the websites mobile-responsive?", a: "Yes, all websites created through the platform are automatically responsive and work perfectly on all screen sizes." },
        { q: "Can I edit my website after creating it?", a: "Yes, you can edit your website at any time using the built-in editor or through AI commands. Each site has a free-edit limit based on your plan." },
        { q: "Can I publish my site to GitHub?", a: "Yes, the platform supports direct publishing to GitHub Pages for free and fast hosting." },
      ],
    },
  ];

  const faqData = lang === "ar" ? faqAr : faqEn;

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

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" data-testid="text-faq-title">
            {lang === "ar" ? "الأسئلة المتكررة" : "Frequently Asked Questions"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {lang === "ar"
              ? "إجابات على أكثر الأسئلة شيوعاً حول منصة عربي ويب"
              : "Answers to the most common questions about ArabyWeb"}
          </p>
        </div>

        <div className="space-y-10">
          {faqData.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold mb-4 text-emerald-600 dark:text-emerald-400" data-testid={`text-faq-category-${i}`}>
                {section.category}
              </h2>
              <FAQAccordion items={section.items} lang={lang} />
            </section>
          ))}
        </div>

        <div className="mt-16 text-center border rounded-2xl p-8 bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">
            {lang === "ar" ? "لم تجد إجابتك؟" : "Didn't find your answer?"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {lang === "ar"
              ? "تواصل معنا وسنرد عليك في أقرب وقت"
              : "Contact us and we'll get back to you as soon as possible"}
          </p>
          <a
            href="mailto:support@arabyweb.net"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            data-testid="link-contact-support"
          >
            {lang === "ar" ? "تواصل مع الدعم" : "Contact Support"}
          </a>
        </div>
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
