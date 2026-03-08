import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Upload,
  Globe2,
  Server,
  FileArchive,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Monitor,
  Smartphone,
  Copy,
  Check,
  Zap,
  Shield,
  HelpCircle,
  Rocket,
  FileText,
  Image,
  Code2,
  Github,
} from "lucide-react";
import type { Project } from "@shared/schema";

type HostingProvider = "hostinger" | "cpanel" | "netlify" | "vercel" | "github" | "manual";

const providers: { id: HostingProvider; name: string; nameAr: string; icon: any; color: string; difficulty: string; difficultyAr: string; free: boolean }[] = [
  { id: "netlify", name: "Netlify", nameAr: "Netlify", icon: Globe2, color: "from-teal-500 to-cyan-600", difficulty: "Very Easy", difficultyAr: "سهل جداً", free: true },
  { id: "vercel", name: "Vercel", nameAr: "Vercel", icon: Zap, color: "from-zinc-600 to-zinc-800", difficulty: "Very Easy", difficultyAr: "سهل جداً", free: true },
  { id: "github", name: "GitHub Pages", nameAr: "صفحات GitHub", icon: Github, color: "from-gray-600 to-gray-800", difficulty: "Easy", difficultyAr: "سهل", free: true },
  { id: "hostinger", name: "Hostinger", nameAr: "هوستنجر", icon: Server, color: "from-purple-600 to-indigo-700", difficulty: "Easy", difficultyAr: "سهل", free: false },
  { id: "cpanel", name: "cPanel", nameAr: "سي بانل", icon: Monitor, color: "from-orange-500 to-red-600", difficulty: "Medium", difficultyAr: "متوسط", free: false },
  { id: "manual", name: "Any Hosting", nameAr: "أي استضافة", icon: Upload, color: "from-blue-600 to-blue-800", difficulty: "Medium", difficultyAr: "متوسط", free: false },
];

function CopyButton({ text, lang }: { text: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
      data-testid="button-copy-text"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? (lang === "ar" ? "تم النسخ" : "Copied") : (lang === "ar" ? "نسخ" : "Copy")}
    </button>
  );
}

function StepCard({ number, title, children, lang }: { number: number; title: string; children: React.ReactNode; lang: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">{number}</div>
        <div className="w-px h-full bg-zinc-800 mx-auto mt-2" />
      </div>
      <div className="pb-8 flex-1">
        <h4 className="font-semibold text-white text-sm mb-2">{title}</h4>
        <div className="text-sm text-zinc-400 space-y-2">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-3 font-mono text-xs text-zinc-300 relative group" dir="ltr">
      <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} lang={lang} />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

export default function DeployGuidePage() {
  const { language } = useAuth();
  const lang = language;
  const isRTL = lang === "ar";
  const [, params] = useRoute("/deploy-guide/:id");
  const projectId = params?.id ? parseInt(params.id) : null;

  const [selectedProvider, setSelectedProvider] = useState<HostingProvider | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const downloadProject = () => {
    if (projectId) {
      window.open(`/api/projects/${projectId}/export?type=static`, "_blank");
    }
  };

  const downloadFull = () => {
    if (projectId) {
      window.open(`/api/projects/${projectId}/export?type=full`, "_blank");
    }
  };

  const faqs = [
    {
      q: lang === "ar" ? "هل أحتاج خبرة برمجية لرفع موقعي؟" : "Do I need coding experience to deploy?",
      a: lang === "ar" ? "لا أبداً! كل ما تحتاجه هو تحميل ملف ZIP واتباع الخطوات البسيطة المشروحة بالصور. الأمر أشبه برفع ملف على Google Drive." : "Not at all! Just download the ZIP file and follow the simple steps. It's as easy as uploading a file to Google Drive.",
    },
    {
      q: lang === "ar" ? "كم تكلفة الاستضافة؟" : "How much does hosting cost?",
      a: lang === "ar" ? "Netlify و Vercel و GitHub Pages تقدم استضافة مجانية للمواقع الثابتة. أما Hostinger فتبدأ من 12 ر.س شهرياً تقريباً مع اسم نطاق مجاني." : "Netlify, Vercel, and GitHub Pages offer free hosting for static sites. Hostinger starts from about $3/month with a free domain.",
    },
    {
      q: lang === "ar" ? "هل يمكنني ربط اسم نطاق خاص (مثل mysite.com)؟" : "Can I connect a custom domain (like mysite.com)?",
      a: lang === "ar" ? "نعم! جميع المنصات تدعم ربط اسم نطاق خاص. يمكنك شراء نطاق من Namecheap أو GoDaddy وربطه بسهولة." : "Yes! All platforms support custom domains. You can buy a domain from Namecheap or GoDaddy and connect it easily.",
    },
    {
      q: lang === "ar" ? "ماذا يحتوي ملف التحميل؟" : "What's inside the download file?",
      a: lang === "ar" ? "ملف ZIP يحتوي على: index.html (الصفحة الرئيسية)، مجلد css للتنسيقات، مجلد assets للصور، وملف README بالتعليمات." : "A ZIP file containing: index.html (main page), css folder for styles, assets folder for images, and a README with instructions.",
    },
    {
      q: lang === "ar" ? "هل الموقع يعمل على الجوال؟" : "Is the site mobile-friendly?",
      a: lang === "ar" ? "نعم! جميع المواقع المُنشأة بـ عربي ويب متجاوبة وتعمل بشكل ممتاز على جميع الأجهزة." : "Yes! All sites built with ArabyWeb are responsive and work perfectly on all devices.",
    },
  ];

  const renderGuide = (provider: HostingProvider) => {
    switch (provider) {
      case "netlify":
        return (
          <div className="space-y-1">
            <StepCard number={1} title={lang === "ar" ? "حمّل ملفات موقعك" : "Download your site files"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط على زر "تحميل الملفات" أعلاه لتحميل ملف ZIP.' : 'Click the "Download Files" button above to get your ZIP file.'}</p>
              <p>{lang === "ar" ? "فُك ضغط الملف على جهازك. ستجد مجلد باسم website بداخله ملفاتك." : "Extract the ZIP on your computer. You'll find a folder called website with your files."}</p>
            </StepCard>
            <StepCard number={2} title={lang === "ar" ? "افتح موقع Netlify" : "Open Netlify"} lang={lang}>
              <p>
                {lang === "ar" ? "اذهب إلى " : "Go to "}
                <a href="https://app.netlify.com/drop" target="_blank" rel="noopener" className="text-emerald-400 underline">app.netlify.com/drop</a>
              </p>
              <p>{lang === "ar" ? "لا تحتاج حتى لإنشاء حساب! فقط افتح الرابط." : "You don't even need an account! Just open the link."}</p>
            </StepCard>
            <StepCard number={3} title={lang === "ar" ? "اسحب وأفلت المجلد" : "Drag & Drop the folder"} lang={lang}>
              <p>{lang === "ar" ? 'اسحب مجلد "website" من جهازك وأفلته في المنطقة المحددة على صفحة Netlify.' : 'Drag the "website" folder from your computer and drop it into the designated area on the Netlify page.'}</p>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">{lang === "ar" ? "اسحب المجلد هنا (مثال توضيحي)" : "Drag folder here (illustration)"}</p>
              </div>
            </StepCard>
            <StepCard number={4} title={lang === "ar" ? "موقعك جاهز!" : "Your site is live!"} lang={lang}>
              <p>{lang === "ar" ? "خلال ثوانٍ سيكون موقعك متاحاً على رابط مثل:" : "Within seconds your site will be available at a link like:"}</p>
              <CodeBlock code="https://your-site-name.netlify.app" lang={lang} />
              <p>{lang === "ar" ? "يمكنك لاحقاً ربط اسم نطاق خاص من إعدادات Netlify." : "You can later connect a custom domain from Netlify settings."}</p>
            </StepCard>
          </div>
        );

      case "vercel":
        return (
          <div className="space-y-1">
            <StepCard number={1} title={lang === "ar" ? "حمّل ملفات موقعك" : "Download your site files"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط على "تحميل الملفات" لتحميل ملف ZIP، ثم فك الضغط.' : 'Click "Download Files" to get the ZIP, then extract it.'}</p>
            </StepCard>
            <StepCard number={2} title={lang === "ar" ? "أنشئ حساب Vercel مجاني" : "Create a free Vercel account"} lang={lang}>
              <p>
                {lang === "ar" ? "اذهب إلى " : "Go to "}
                <a href="https://vercel.com/signup" target="_blank" rel="noopener" className="text-emerald-400 underline">vercel.com</a>
                {lang === "ar" ? " وسجّل بحساب Google أو GitHub." : " and sign up with Google or GitHub."}
              </p>
            </StepCard>
            <StepCard number={3} title={lang === "ar" ? "ارفع ملفاتك" : "Upload your files"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط "New Project" ثم "Import from folder" وحدد مجلد website.' : 'Click "New Project" then "Import from folder" and select the website folder.'}</p>
              <p>{lang === "ar" ? 'في Framework Preset اختر "Other" ثم اضغط Deploy.' : 'In Framework Preset select "Other" then click Deploy.'}</p>
            </StepCard>
            <StepCard number={4} title={lang === "ar" ? "موقعك جاهز!" : "Your site is live!"} lang={lang}>
              <p>{lang === "ar" ? "ستحصل على رابط مثل:" : "You'll get a link like:"}</p>
              <CodeBlock code="https://your-site.vercel.app" lang={lang} />
            </StepCard>
          </div>
        );

      case "github":
        return (
          <div className="space-y-1">
            <StepCard number={1} title={lang === "ar" ? "حمّل ملفات موقعك" : "Download your site files"} lang={lang}>
              <p>{lang === "ar" ? "حمّل ملف ZIP وفك الضغط." : "Download the ZIP and extract it."}</p>
            </StepCard>
            <StepCard number={2} title={lang === "ar" ? "أنشئ مستودع GitHub جديد" : "Create a new GitHub repository"} lang={lang}>
              <p>
                {lang === "ar" ? "اذهب إلى " : "Go to "}
                <a href="https://github.com/new" target="_blank" rel="noopener" className="text-emerald-400 underline">github.com/new</a>
              </p>
              <p>{lang === "ar" ? 'سمّ المستودع ثم اضغط "Create repository".' : 'Name the repo then click "Create repository".'}</p>
            </StepCard>
            <StepCard number={3} title={lang === "ar" ? "ارفع الملفات" : "Upload files"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط "uploading an existing file" ثم اسحب كل ملفات مجلد website.' : 'Click "uploading an existing file" then drag all files from the website folder.'}</p>
              <p>{lang === "ar" ? 'اضغط "Commit changes".' : 'Click "Commit changes".'}</p>
            </StepCard>
            <StepCard number={4} title={lang === "ar" ? "فعّل GitHub Pages" : "Enable GitHub Pages"} lang={lang}>
              <p>{lang === "ar" ? 'اذهب إلى Settings → Pages → Source → اختر "main" واضغط Save.' : 'Go to Settings → Pages → Source → select "main" and click Save.'}</p>
            </StepCard>
            <StepCard number={5} title={lang === "ar" ? "موقعك جاهز!" : "Your site is live!"} lang={lang}>
              <CodeBlock code="https://username.github.io/repo-name" lang={lang} />
            </StepCard>
          </div>
        );

      case "hostinger":
        return (
          <div className="space-y-1">
            <StepCard number={1} title={lang === "ar" ? "حمّل ملفات موقعك" : "Download your site files"} lang={lang}>
              <p>{lang === "ar" ? "حمّل ملف ZIP (لا تفك الضغط)." : "Download the ZIP file (don't extract it)."}</p>
            </StepCard>
            <StepCard number={2} title={lang === "ar" ? "ادخل لوحة تحكم Hostinger" : "Login to Hostinger panel"} lang={lang}>
              <p>
                {lang === "ar" ? "سجّل الدخول في " : "Login at "}
                <a href="https://hpanel.hostinger.com" target="_blank" rel="noopener" className="text-emerald-400 underline">hpanel.hostinger.com</a>
              </p>
              <p>{lang === "ar" ? 'اختر موقعك ثم اذهب إلى "File Manager" (مدير الملفات).' : 'Select your website then go to "File Manager".'}</p>
            </StepCard>
            <StepCard number={3} title={lang === "ar" ? "ادخل مجلد public_html" : "Open public_html folder"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط على مجلد "public_html". هذا هو المجلد الرئيسي لموقعك.' : 'Click on the "public_html" folder. This is your website\'s root directory.'}</p>
              <p>{lang === "ar" ? "احذف أي ملفات قديمة موجودة (مثل index.html الافتراضي)." : "Delete any existing old files (like the default index.html)."}</p>
            </StepCard>
            <StepCard number={4} title={lang === "ar" ? "ارفع ملف ZIP" : "Upload the ZIP file"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط "Upload" ثم حدد ملف ZIP المُحمّل.' : 'Click "Upload" then select the downloaded ZIP file.'}</p>
              <p>{lang === "ar" ? "بعد الرفع، اضغط بالزر الأيمن على ملف ZIP واختر \"Extract\" (فك الضغط)." : 'After uploading, right-click the ZIP file and select "Extract".'}</p>
            </StepCard>
            <StepCard number={5} title={lang === "ar" ? "انقل الملفات للمكان الصحيح" : "Move files to the right place"} lang={lang}>
              <p>{lang === "ar" ? "بعد فك الضغط ستجد مجلد website. ادخل فيه وحدد كل الملفات (index.html, css, assets)." : "After extraction you'll find a website folder. Go inside and select all files (index.html, css, assets)."}</p>
              <p>{lang === "ar" ? 'اضغط "Move" وانقلها إلى /public_html/ مباشرة.' : 'Click "Move" and move them to /public_html/ directly.'}</p>
            </StepCard>
            <StepCard number={6} title={lang === "ar" ? "موقعك جاهز!" : "Your site is live!"} lang={lang}>
              <p>{lang === "ar" ? "افتح اسم نطاقك في المتصفح وستجد موقعك يعمل!" : "Open your domain in the browser and your site is live!"}</p>
              <CodeBlock code="https://yourdomain.com" lang={lang} />
            </StepCard>
          </div>
        );

      case "cpanel":
        return (
          <div className="space-y-1">
            <StepCard number={1} title={lang === "ar" ? "حمّل ملفات موقعك" : "Download your site files"} lang={lang}>
              <p>{lang === "ar" ? "حمّل ملف ZIP (لا تفك الضغط)." : "Download the ZIP file (don't extract it)."}</p>
            </StepCard>
            <StepCard number={2} title={lang === "ar" ? "ادخل cPanel" : "Login to cPanel"} lang={lang}>
              <p>{lang === "ar" ? "عادةً يكون على:" : "Usually at:"}</p>
              <CodeBlock code="https://yourdomain.com:2083" lang={lang} />
              <p>{lang === "ar" ? "أو من لوحة تحكم شركة الاستضافة." : "Or from your hosting provider's dashboard."}</p>
            </StepCard>
            <StepCard number={3} title={lang === "ar" ? 'افتح "File Manager"' : 'Open "File Manager"'} lang={lang}>
              <p>{lang === "ar" ? 'في cPanel ابحث عن "File Manager" واضغط عليه.' : 'In cPanel search for "File Manager" and click it.'}</p>
              <p>{lang === "ar" ? "ادخل مجلد public_html." : "Navigate to public_html folder."}</p>
            </StepCard>
            <StepCard number={4} title={lang === "ar" ? "ارفع ملف ZIP وفك الضغط" : "Upload ZIP and extract"} lang={lang}>
              <p>{lang === "ar" ? 'اضغط "Upload" من الشريط العلوي، ارفع ملف ZIP.' : 'Click "Upload" from the top bar, upload the ZIP file.'}</p>
              <p>{lang === "ar" ? 'ارجع لمجلد public_html، اضغط بالزر الأيمن على ZIP واختر "Extract".' : 'Go back to public_html, right-click the ZIP and select "Extract".'}</p>
            </StepCard>
            <StepCard number={5} title={lang === "ar" ? "انقل الملفات" : "Move files"} lang={lang}>
              <p>{lang === "ar" ? 'ادخل مجلد website المستخرج، حدد كل الملفات، اضغط "Move" وانقلها إلى /public_html/.' : 'Enter the extracted website folder, select all files, click "Move" and move to /public_html/.'}</p>
            </StepCard>
            <StepCard number={6} title={lang === "ar" ? "تم! موقعك يعمل" : "Done! Your site is live"} lang={lang}>
              <p>{lang === "ar" ? "افتح اسم نطاقك في المتصفح." : "Open your domain in the browser."}</p>
            </StepCard>
          </div>
        );

      case "manual":
        return (
          <div className="space-y-1">
            <StepCard number={1} title={lang === "ar" ? "حمّل الملفات" : "Download files"} lang={lang}>
              <p>{lang === "ar" ? "حمّل ملف ZIP وفك الضغط. ستجد:" : "Download the ZIP and extract. You'll find:"}</p>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400" /><span dir="ltr">index.html</span> — {lang === "ar" ? "الصفحة الرئيسية" : "Main page"}</div>
                <div className="flex items-center gap-2"><Code2 className="w-4 h-4 text-green-400" /><span dir="ltr">css/style.css</span> — {lang === "ar" ? "التنسيقات" : "Styles"}</div>
                <div className="flex items-center gap-2"><Image className="w-4 h-4 text-purple-400" /><span dir="ltr">assets/</span> — {lang === "ar" ? "الصور والملفات" : "Images & files"}</div>
              </div>
            </StepCard>
            <StepCard number={2} title={lang === "ar" ? "ارفع إلى مجلد الموقع" : "Upload to website folder"} lang={lang}>
              <p>{lang === "ar" ? "في أي استضافة، ارفع محتويات مجلد website إلى المجلد الرئيسي (عادةً public_html أو www أو htdocs)." : "On any hosting, upload the contents of the website folder to the root directory (usually public_html, www, or htdocs)."}</p>
            </StepCard>
            <StepCard number={3} title={lang === "ar" ? "تأكد من الهيكل" : "Verify the structure"} lang={lang}>
              <p>{lang === "ar" ? "يجب أن يكون الهيكل هكذا:" : "The structure should look like this:"}</p>
              <CodeBlock code={`public_html/\n├── index.html\n├── css/\n│   └── style.css\n└── assets/\n    ├── images/\n    ├── js/\n    └── fonts/`} lang={lang} />
            </StepCard>
            <StepCard number={4} title={lang === "ar" ? "اختبر موقعك" : "Test your site"} lang={lang}>
              <p>{lang === "ar" ? "افتح اسم نطاقك في المتصفح. إذا ظهر الموقع بشكل صحيح فأنت جاهز!" : "Open your domain in the browser. If it displays correctly, you're all set!"}</p>
            </StepCard>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {projectId && (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back-dashboard">
                <BackArrow className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-deploy-title">
              {lang === "ar" ? "انشر موقعك على الإنترنت" : "Publish Your Site Online"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? "دليل خطوة بخطوة لرفع موقعك وتشغيله — بدون أي خبرة برمجية"
                : "Step-by-step guide to upload and launch your site — no coding needed"}
            </p>
          </div>
        </div>

        {/* Project Info + Download */}
        {project && (
          <Card className="p-4 border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Globe2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold" data-testid="text-project-name">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{project.description?.slice(0, 80)}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={downloadProject} className="flex-1 sm:flex-none" data-testid="button-download-static">
                  <Download className="w-4 h-4 me-1" />
                  {lang === "ar" ? "تحميل الملفات" : "Download Files"}
                </Button>
                <Button onClick={downloadFull} variant="outline" className="flex-1 sm:flex-none" data-testid="button-download-full">
                  <FileArchive className="w-4 h-4 me-1" />
                  {lang === "ar" ? "نسخة كاملة" : "Full Package"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Download (if no project) */}
        {!project && (
          <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {lang === "ar" ? "الخطوة الأولى: حمّل ملفات موقعك" : "Step 1: Download your site files"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {lang === "ar"
                    ? 'اذهب إلى لوحة التحكم، واضغط على زر "تحميل" في مشروعك لتحميل ملف ZIP.'
                    : 'Go to your dashboard and click the "Download" button on your project to get the ZIP file.'}
                </p>
                <Link href="/dashboard">
                  <Button size="sm" className="mt-3" data-testid="button-go-dashboard">
                    {lang === "ar" ? "اذهب للوحة التحكم" : "Go to Dashboard"}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Choose Provider */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {lang === "ar" ? "اختر منصة الاستضافة" : "Choose Your Hosting Platform"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "ar"
              ? "اختر المنصة التي تريد رفع موقعك عليها. ننصح بـ Netlify للمبتدئين (مجاني وسهل جداً)."
              : "Choose where you want to host your site. We recommend Netlify for beginners (free and very easy)."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`p-4 rounded-xl border-2 transition-all text-start cursor-pointer ${
                  selectedProvider === p.id
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-border hover:border-muted-foreground/30 bg-card"
                }`}
                data-testid={`button-provider-${p.id}`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-2`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-sm">{lang === "ar" ? p.nameAr : p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{lang === "ar" ? p.difficultyAr : p.difficulty}</span>
                  {p.free && (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">
                      {lang === "ar" ? "مجاني" : "Free"}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Guide */}
        {selectedProvider && (
          <Card className="p-5 border-border">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              {(() => {
                const p = providers.find((x) => x.id === selectedProvider)!;
                return (
                  <>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold" data-testid="text-provider-name">{lang === "ar" ? p.nameAr : p.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {lang === "ar" ? `مستوى الصعوبة: ${p.difficultyAr}` : `Difficulty: ${p.difficulty}`}
                        {p.free && ` • ${lang === "ar" ? "مجاني" : "Free"}`}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            {renderGuide(selectedProvider)}
          </Card>
        )}

        {/* Tips */}
        <Card className="p-5 border-border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            {lang === "ar" ? "نصائح مهمة بعد النشر" : "Important Tips After Publishing"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                icon: Globe2,
                title: lang === "ar" ? "اربط اسم نطاق" : "Connect a domain",
                desc: lang === "ar" ? "اشترِ اسم نطاق (.com أو .net) واربطه بموقعك لمظهر احترافي" : "Buy a domain (.com or .net) and connect it for a professional look",
              },
              {
                icon: Shield,
                title: lang === "ar" ? "فعّل شهادة SSL" : "Enable SSL certificate",
                desc: lang === "ar" ? "تأكد من أن موقعك يعمل بـ https:// لحماية الزوار" : "Make sure your site works with https:// to protect visitors",
              },
              {
                icon: Smartphone,
                title: lang === "ar" ? "اختبر على الجوال" : "Test on mobile",
                desc: lang === "ar" ? "افتح موقعك من جوالك للتأكد من أنه يعمل بشكل صحيح" : "Open your site from your phone to make sure it works correctly",
              },
              {
                icon: Rocket,
                title: lang === "ar" ? "شارك موقعك" : "Share your site",
                desc: lang === "ar" ? "انشر رابط موقعك على وسائل التواصل وبطاقات العمل" : "Share your site link on social media and business cards",
              },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50" data-testid={`tip-${i}`}>
                <tip.icon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-5 border-border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            {lang === "ar" ? "أسئلة شائعة عن النشر" : "Deployment FAQ"}
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden" data-testid={`faq-deploy-${i}`}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-start cursor-pointer hover:bg-muted/50 transition-colors"
                  data-testid={`button-faq-toggle-${i}`}
                >
                  <span className="text-sm font-medium pe-4">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-3 pb-3 text-sm text-muted-foreground">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Need Help */}
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="text-center">
            <HelpCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">
              {lang === "ar" ? "تحتاج مساعدة؟" : "Need Help?"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              {lang === "ar"
                ? "إذا واجهت أي مشكلة في نشر موقعك، تواصل معنا وسنساعدك مباشرة"
                : "If you face any issues deploying your site, contact us and we'll help you directly"}
            </p>
            <a href="mailto:support@arabyweb.net">
              <Button data-testid="button-contact-support">
                {lang === "ar" ? "تواصل مع الدعم" : "Contact Support"}
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
