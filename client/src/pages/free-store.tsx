import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Check, ShoppingBag, Globe2, Zap, Star, ArrowLeft, CreditCard, Package, Users, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FreeStorePage() {
  useSEO({
    title: "إنشاء متجر إلكتروني مجاني في السعودية - متاجر مجانية بالذكاء الاصطناعي",
    description: "أنشئ متجرك الإلكتروني المجاني احترافياً بالذكاء الاصطناعي في دقيقتين. متاجر مجانية للأعمال السعودية بدون برمجة ولا تكلفة. قوالب متاجر عربية جاهزة.",
    keywords: "متجر مجاني، متاجر مجانية، انشاء متجر الكتروني مجاني، متجر بدون برمجة، متجر السعودية مجاني، تجارة الكترونية مجانية، بناء متجر الكتروني، متجر عربي مجاني",
    lang: "ar",
    canonical: "https://arabyweb.net/free-store",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "إنشاء متجر إلكتروني مجاني في السعودية",
      "url": "https://arabyweb.net/free-store",
      "description": "أنشئ متجرك الإلكتروني المجاني في السعودية باستخدام الذكاء الاصطناعي",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://arabyweb.net/" },
          { "@type": "ListItem", "position": 2, "name": "متجر مجاني", "item": "https://arabyweb.net/free-store" }
        ]
      }
    }
  });

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <Link href="/" className="font-bold text-xl text-emerald-600">ArabyWeb.net</Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            +1,200 صاحب عمل انضموا هذا الشهر
          </span>
          <Link href="/auth">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-header-start">
              ابدأ مجاناً
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 pb-28 sm:pb-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-1 rounded-full inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> متجر مجاني للأبد — لا بطاقة مطلوبة
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> المتجر جاهز في دقيقتين
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            إنشاء متجر إلكتروني مجاني<br />
            <span className="text-emerald-600">بالذكاء الاصطناعي في السعودية</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            أنشئ متجرك الإلكتروني الاحترافي مجاناً في دقيقتين. بدون برمجة، بدون تكلفة،
            مع قوالب متاجر عربية احترافية مخصصة للسوق السعودي.
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9/5 من +500 مراجعة</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-600" /> +1,200 متجر مُنشأ</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-blue-500" /> إطلاق خلال دقيقتين</span>
          </div>

          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/auth">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8" data-testid="button-hero-start">
                <ShoppingBag className="w-5 h-5 ml-2" />
                أنشئ متجرك المجاني الآن
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-templates">
                قوالب المتاجر
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-400">بدون بطاقة ائتمانية · بدون التزام · إلغاء في أي وقت</p>
        </div>

        <section className="my-16">
          <h2 className="text-3xl font-bold text-center mb-8">ماذا يشمل متجرك المجاني؟</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <ShoppingBag className="w-6 h-6" />, title: "صفحة عرض منتجات", desc: "عرض منتجاتك بشكل احترافي مع صور وأسعار وأوصاف جذابة بالعربية والإنجليزية" },
              { icon: <Globe2 className="w-6 h-6" />, title: "دعم العربية RTL", desc: "متجرك يدعم اللغة العربية بالكامل مع تخطيط RTL مثالي لتجربة مستخدم ممتازة" },
              { icon: <Package className="w-6 h-6" />, title: "قوالب متاجر احترافية", desc: "قوالب مصممة خصيصاً للمتاجر السعودية: ملابس، إلكترونيات، مواد غذائية، أثاث وأكثر" },
              { icon: <Zap className="w-6 h-6" />, title: "توليد محتوى بالذكاء الاصطناعي", desc: "الذكاء الاصطناعي يكتب أوصاف منتجاتك وعروضك الترويجية بالعربية تلقائياً" },
              { icon: <CreditCard className="w-6 h-6" />, title: "جاهز للدفع الإلكتروني", desc: "متجرك مُعدّ لقبول وسائل الدفع الإلكترونية الشائعة في السعودية (مدى، فيزا، ماستركارد)" },
              { icon: <Star className="w-6 h-6" />, title: "تحسين محركات البحث (SEO)", desc: "متجرك مُحسَّن تلقائياً لمحركات البحث ليظهر في نتائج Google بالعربية والإنجليزية" },
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

        <section className="my-12 bg-emerald-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">قوالب متاجر لجميع القطاعات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              "أزياء وملابس", "إلكترونيات", "مواد غذائية", "مستحضرات تجميل",
              "أثاث ومفروشات", "كتب ومستلزمات", "ألعاب وهوايات", "عطور وتوابل"
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-lg p-3 text-sm font-medium text-gray-700 shadow-sm">
                {b}
              </div>
            ))}
          </div>
        </section>

        <div className="my-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex -space-x-2 -space-x-reverse">
              {["🛍️", "👗", "📱", "🍕"].map((e, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-lg">{e}</div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gray-900">+1,200 متجر إلكتروني سعودي يعمل الآن</p>
              <p className="text-sm text-gray-500 mt-0.5">أزياء، إلكترونيات، مواد غذائية، عطور وأكثر</p>
            </div>
            <div className="flex items-center gap-1 mr-auto">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              <span className="text-sm font-semibold text-gray-700 mr-1">4.9</span>
            </div>
          </div>
        </div>

        <div className="text-center my-12 p-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl text-white">
          <h2 className="text-2xl font-bold mb-3">ابدأ متجرك اليوم — مجاناً</h2>
          <p className="mb-6 opacity-90">لا بطاقة ائتمانية، لا التزام، لا تكلفة خفية</p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-50 text-lg px-8" data-testid="button-bottom-cta">
              أنشئ متجرك المجاني الآن
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </Link>
        </div>

        <article className="prose prose-lg max-w-none text-gray-700 my-8">
          <h2 className="text-2xl font-bold text-gray-900">لماذا تختار ArabyWeb لإنشاء متجرك المجاني في السعودية؟</h2>
          <p>
            مع تنامي التجارة الإلكترونية في المملكة العربية السعودية، أصبح امتلاك متجر إلكتروني احترافي
            ضرورة حتمية لكل صاحب عمل. لكن تكاليف بناء المتاجر الإلكترونية التقليدية غالباً ما تكون مرتفعة.
          </p>
          <p>
            توفر منصة <strong>ArabyWeb.net</strong> متجراً إلكترونياً مجانياً احترافياً بالذكاء الاصطناعي،
            مع قوالب مصممة خصيصاً للسوق السعودي، ودعم كامل للغة العربية، وتحسين محركات البحث تلقائياً.
          </p>
          <h3>الفرق بين ArabyWeb والمنصات الأخرى</h3>
          <ul>
            <li><strong>مجاني حقيقي:</strong> خطة مجانية دائمة بدون قيود مخفية</li>
            <li><strong>عربي أولاً:</strong> مبني من الأساس لخدمة السوق العربي والسعودي</li>
            <li><strong>ذكاء اصطناعي محلي:</strong> يفهم طبيعة الأعمال والثقافة السعودية</li>
            <li><strong>سرعة فائقة:</strong> متجرك جاهز في دقيقتين وليس أيام أو أسابيع</li>
          </ul>
        </article>
      </main>

      <footer className="border-t mt-12 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 ArabyWeb.net — متاجر إلكترونية مجانية بالذكاء الاصطناعي في السعودية</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/privacy" className="hover:text-gray-700">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-gray-700">الشروط والأحكام</Link>
          <Link href="/free-website" className="hover:text-gray-700">موقع مجاني</Link>
        </div>
      </footer>

      <div className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t shadow-xl px-4 py-3 z-50 flex gap-3">
        <Link href="/auth" className="flex-1">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-base font-bold py-5" data-testid="button-sticky-cta">
            <ShoppingBag className="w-4 h-4 ml-2" />
            أنشئ متجرك مجاناً
          </Button>
        </Link>
      </div>
    </div>
  );
}
