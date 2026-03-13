import { useEffect } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Check, Sparkles, Globe2, ShoppingBag, Zap, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FreeWebsitePage() {
  useSEO({
    title: "بناء موقع إلكتروني مجاني في السعودية - بدون برمجة وبدون تكلفة",
    description: "أنشئ موقعك الإلكتروني المجاني احترافياً بالذكاء الاصطناعي في دقيقتين. لا برمجة، لا استضافة مدفوعة، لا خبرة تقنية مطلوبة. خصوصاً للأعمال السعودية.",
    keywords: "موقع مجاني، بناء موقع الكتروني مجاني، انشاء موقع مجاني، موقع مجاني بدون برمجة، استضافة مجانية السعودية، موقع للشركات مجاني، موقع مطعم مجاني، موقع عيادة مجاني",
    lang: "ar",
    canonical: "https://arabyweb.net/free-website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "بناء موقع إلكتروني مجاني في السعودية",
      "url": "https://arabyweb.net/free-website",
      "description": "أنشئ موقعك الإلكتروني المجاني باستخدام الذكاء الاصطناعي في دقيقتين",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://arabyweb.net/" },
          { "@type": "ListItem", "position": 2, "name": "موقع مجاني", "item": "https://arabyweb.net/free-website" }
        ]
      }
    }
  });

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-emerald-600">ArabyWeb.net</Link>
        <Link href="/auth">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">ابدأ مجاناً</Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1 rounded-full mb-4 inline-block">
            مجاني للأبد
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            بناء موقع إلكتروني مجاني<br />
            <span className="text-emerald-600">بالذكاء الاصطناعي في السعودية</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            أنشئ موقعك الإلكتروني الاحترافي مجاناً في أقل من دقيقتين. بدون برمجة، بدون تكلفة، بدون خبرة تقنية.
            مخصص للأعمال السعودية والعربية.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/auth">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 ml-2" />
                ابدأ إنشاء موقعك المجاني الآن
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                استعرض القوالب
              </Button>
            </Link>
          </div>
        </div>

        <section className="my-16">
          <h2 className="text-3xl font-bold text-center mb-8">ما الذي يشمله الموقع المجاني؟</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Globe2 className="w-6 h-6" />, title: "موقع احترافي باللغة العربية", desc: "موقع RTL جميل يدعم اللغة العربية والإنجليزية تلقائياً مع أفضل الخطوط العربية" },
              { icon: <Sparkles className="w-6 h-6" />, title: "توليد ذكاء اصطناعي", desc: "يقوم الذكاء الاصطناعي بكتابة محتوى موقعك الكامل بالعربية في ثوانٍ بناءً على نشاطك" },
              { icon: <Zap className="w-6 h-6" />, title: "نشر فوري", desc: "انشر موقعك بنقرة واحدة واحصل على رابط جاهز للمشاركة فوراً" },
              { icon: <ShoppingBag className="w-6 h-6" />, title: "قوالب لجميع القطاعات", desc: "أكثر من 50 قالب احترافي: مطاعم، متاجر، شركات، عيادات، مكاتب محاماة، وأكثر" },
              { icon: <Star className="w-6 h-6" />, title: "بدون إعلانات", desc: "موقعك نظيف ومحترف بدون إعلانات مزعجة — حتى في الخطة المجانية" },
              { icon: <Check className="w-6 h-6" />, title: "لا برمجة مطلوبة", desc: "لا تحتاج أي خبرة تقنية أو برمجية. صف نشاطك وسيتولى الذكاء الاصطناعي الباقي" },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-16 bg-emerald-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">مناسب لجميع أنواع الأعمال في السعودية</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {["مطاعم وكافيهات", "متاجر إلكترونية", "شركات وأعمال", "عيادات طبية",
              "مكاتب قانونية", "مراكز تعليمية", "شركات عقارية", "خدمات المنازل"].map((b, i) => (
              <div key={i} className="bg-white rounded-lg p-3 text-sm font-medium text-gray-700 shadow-sm">
                {b}
              </div>
            ))}
          </div>
        </section>

        <section className="my-16">
          <h2 className="text-2xl font-bold text-center mb-8">كيف تبني موقعاً مجانياً في 3 خطوات؟</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "أنشئ حسابك المجاني", desc: "سجّل في ArabyWeb.net مجاناً بدون بطاقة ائتمانية" },
              { step: "2", title: "صف نشاطك التجاري", desc: "أخبر الذكاء الاصطناعي عن نشاطك وسيبني موقعك الكامل تلقائياً" },
              { step: "3", title: "انشر واحصل على رابطك", desc: "انشر موقعك بنقرة واحدة واحصل على رابط جاهز للمشاركة" },
            ].map((s, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{s.title}</h3>
                  <p className="text-gray-600 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center my-12 p-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl text-white">
          <h2 className="text-2xl font-bold mb-3">ابدأ اليوم — مجاني للأبد</h2>
          <p className="mb-6 opacity-90">لا بطاقة ائتمانية، لا التزام، لا تكلفة خفية</p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-50 text-lg px-8">
              أنشئ موقعك المجاني الآن
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </Link>
        </div>

        <article className="prose prose-lg max-w-none text-gray-700 my-8">
          <h2 className="text-2xl font-bold text-gray-900">لماذا ArabyWeb.net هي الخيار الأول لبناء موقع مجاني في السعودية؟</h2>
          <p>
            في عالم الأعمال الرقمي اليوم، أصبح امتلاك موقع إلكتروني احترافي ضرورة وليس رفاهية. 
            لكن تكاليف بناء المواقع التقليدية يمكن أن تكون مرتفعة جداً، خاصة للأعمال الصغيرة والناشئة في المملكة العربية السعودية.
          </p>
          <p>
            هنا تأتي منصة <strong>ArabyWeb.net</strong> لتقدم حلاً مثالياً: بناء موقع إلكتروني مجاني بالكامل باستخدام الذكاء الاصطناعي،
            مع ضمان الجودة الاحترافية التي تحتاجها لتميز علامتك التجارية في السوق السعودي.
          </p>
          <h3>ما الذي يجعل ArabyWeb.net مختلفة؟</h3>
          <ul>
            <li><strong>عربية من الألف إلى الياء:</strong> مبنية خصيصاً للسوق العربي والسعودي مع دعم كامل للغة العربية RTL</li>
            <li><strong>ذكاء اصطناعي متقدم:</strong> يفهم طبيعة الأعمال السعودية ويولّد محتوى ثقافياً مناسباً</li>
            <li><strong>قوالب محلية:</strong> قوالب مصممة خصيصاً لقطاعات الأعمال في السعودية</li>
            <li><strong>لا تكلفة خفية:</strong> الخطة المجانية فعلاً مجانية بدون قيود مخفية</li>
          </ul>
        </article>
      </main>

      <footer className="border-t mt-12 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 ArabyWeb.net — منصة بناء المواقع المجانية بالذكاء الاصطناعي في السعودية</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/privacy" className="hover:text-gray-700">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-gray-700">الشروط والأحكام</Link>
          <Link href="/templates" className="hover:text-gray-700">القوالب</Link>
        </div>
      </footer>
    </div>
  );
}
