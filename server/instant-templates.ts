import { buildButtonCSS, buildComponentCSS, runQualityCheck, getIconSVG, validatePageStructure, TOKENS, LAYOUT } from "./design-system.js";

export interface BusinessContent {
  business_name: string;
  business_type: "restaurant" | "agency" | "startup" | "portfolio" | "medical" | "general" | "legal" | "beauty" | "realestate" | "education" | "events" | "automotive" | "luxury" | "gym" | "ecommerce" | "tech" | "consulting" | "logistics" | "cleaning" | "photography" | "finance" | "hotel" | "charity" | "freelance";
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_text: string;
  services: { title: string; desc: string }[];
  cta_text: string;
  contact_description: string;
  phone: string;
  email: string;
  address: string;
  seo_title: string;
  seo_description: string;
  primary_color: string;
  accent_color: string;
}

export interface LangContent {
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_text: string;
  services: { title: string; desc: string }[];
  cta_text: string;
  contact_description: string;
  address: string;
  seo_title: string;
  seo_description: string;
}

export interface BilingualBusinessContent {
  business_name_ar: string;
  business_name_en: string;
  business_type: "restaurant" | "agency" | "startup" | "portfolio" | "medical" | "general" | "legal" | "beauty" | "realestate" | "education" | "events" | "automotive" | "luxury" | "gym" | "ecommerce" | "tech" | "consulting" | "logistics" | "cleaning" | "photography" | "finance" | "hotel" | "charity" | "freelance";
  ar: LangContent;
  en: LangContent;
  phone: string;
  email: string;
  primary_color: string;
  accent_color: string;
  testimonials?: { name: string; role_ar: string; role_en: string; text_ar: string; text_en: string }[];
}

const BUSINESS_CONFIGS: Record<string, {
  primary: string; accent: string; dark: string;
  hero_image: string; about_image: string;
  gallery_images: string[];
  icons: string[];
  stats: { num: string; label_ar: string; label_en: string }[];
  testimonials: { name: string; role_ar: string; role_en: string; text_ar: string; text_en: string }[];
}> = {
  restaurant: {
    primary: "#c0392b", accent: "#e67e22", dark: "#1a0a00",
    icons: ["fa-utensils","fa-wine-glass","fa-star","fa-clock","fa-fire","fa-leaf"],
    hero_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "15+", label_ar: "سنة خبرة", label_en: "Years Experience" },
      { num: "500+", label_ar: "وجبة يومياً", label_en: "Meals Daily" },
      { num: "98%", label_ar: "رضا العملاء", label_en: "Customer Satisfaction" },
      { num: "50+", label_ar: "طبق متنوع", label_en: "Menu Items" },
    ],
    testimonials: [
      { name: "محمد العتيبي", role_ar: "رجل أعمال", role_en: "Businessman", text_ar: "تجربة طعام لا تُنسى! الجودة والطعم رائعان والخدمة ممتازة جداً.", text_en: "An unforgettable dining experience! Great quality and taste with excellent service." },
      { name: "نورة القحطاني", role_ar: "مديرة تنفيذية", role_en: "Executive Manager", text_ar: "أفضل مطعم في المنطقة، الأجواء راقية والأكل لذيذ جداً.", text_en: "Best restaurant in the area, elegant atmosphere and delicious food." },
      { name: "خالد الشمري", role_ar: "مستثمر", role_en: "Investor", text_ar: "أوصي به بشدة لجميع مناسباتي الخاصة. خدمة احترافية من الدرجة الأولى.", text_en: "Highly recommend for all my special occasions. First-class professional service." },
    ],
  },
  agency: {
    primary: "#2563eb", accent: "#7c3aed", dark: "#030712",
    icons: ["fa-bullseye","fa-chart-line","fa-palette","fa-code","fa-mobile-screen","fa-magnifying-glass"],
    hero_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "200+", label_ar: "مشروع منجز", label_en: "Projects Done" },
      { num: "50+", label_ar: "عميل سعيد", label_en: "Happy Clients" },
      { num: "8+", label_ar: "سنوات خبرة", label_en: "Years Experience" },
      { num: "15+", label_ar: "خبير متخصص", label_en: "Expert Team" },
    ],
    testimonials: [
      { name: "فيصل الدوسري", role_ar: "مدير تسويق", role_en: "Marketing Director", text_ar: "تجاوزوا توقعاتنا! نتائج ممتازة وأرباح تضاعفت بعد تعاملنا معهم.", text_en: "Exceeded our expectations! Excellent results and doubled profits after working with them." },
      { name: "سارة العمري", role_ar: "رائدة أعمال", role_en: "Entrepreneur", text_ar: "فريق محترف جداً يفهم متطلبات السوق السعودي بشكل دقيق.", text_en: "Very professional team that precisely understands the Saudi market requirements." },
      { name: "عبدالله الغامدي", role_ar: "مدير عام", role_en: "General Manager", text_ar: "أنصح بهم بشدة، عمل دقيق واحترافي وتسليم في الوقت المحدد.", text_en: "Highly recommend them, precise professional work delivered on time." },
    ],
  },
  startup: {
    primary: "#7c3aed", accent: "#06b6d4", dark: "#0a0015",
    icons: ["fa-rocket","fa-lightbulb","fa-gears","fa-shield","fa-cloud","fa-chart-bar"],
    hero_image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "10K+", label_ar: "مستخدم نشط", label_en: "Active Users" },
      { num: "99.9%", label_ar: "وقت التشغيل", label_en: "Uptime" },
      { num: "4.9", label_ar: "تقييم المستخدمين", label_en: "User Rating" },
      { num: "3X", label_ar: "نمو سنوي", label_en: "Annual Growth" },
    ],
    testimonials: [
      { name: "ريم السلمان", role_ar: "مديرة منتجات", role_en: "Product Manager", text_ar: "حل مبتكر وبسيط غيّر طريقة عملنا بالكامل. توفير كبير في الوقت والتكاليف.", text_en: "An innovative simple solution that completely changed how we work. Big savings in time and costs." },
      { name: "تركي العجلان", role_ar: "مدير تقنية", role_en: "CTO", text_ar: "تقنية متقدمة مع واجهة سهلة الاستخدام. الدعم الفني ممتاز وسريع الاستجابة.", text_en: "Advanced technology with an easy-to-use interface. Excellent and responsive technical support." },
      { name: "هند المالكي", role_ar: "رائدة أعمال", role_en: "Startup Founder", text_ar: "ساعدنا على تحقيق أهدافنا بسرعة قياسية. شركاء موثوقون في رحلة نمونا.", text_en: "Helped us achieve our goals at record speed. Reliable partners in our growth journey." },
    ],
  },
  portfolio: {
    primary: "#d97706", accent: "#dc2626", dark: "#0a0805",
    icons: ["fa-pen-nib","fa-camera","fa-film","fa-desktop","fa-wand-magic-sparkles","fa-layer-group"],
    hero_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "120+", label_ar: "مشروع مكتمل", label_en: "Projects Completed" },
      { num: "80+", label_ar: "عميل راضٍ", label_en: "Satisfied Clients" },
      { num: "12+", label_ar: "سنة إبداع", label_en: "Years Creating" },
      { num: "25+", label_ar: "جائزة دولية", label_en: "International Awards" },
    ],
    testimonials: [
      { name: "لمى الزهراني", role_ar: "مديرة علامة تجارية", role_en: "Brand Director", text_ar: "إبداع حقيقي! حوّل رؤيتنا إلى واقع بصري مذهل يتجاوز كل التوقعات.", text_en: "True creativity! Transformed our vision into stunning visuals beyond all expectations." },
      { name: "بدر الحربي", role_ar: "مؤسس شركة", role_en: "Company Founder", text_ar: "احترافية عالية وذوق رفيع في التصميم. هويتنا البصرية أصبحت أكثر قوة وتميزاً.", text_en: "High professionalism and refined design taste. Our visual identity became stronger and more distinctive." },
      { name: "منال العسيري", role_ar: "مديرة تسويق", role_en: "Marketing Manager", text_ar: "نتائج استثنائية! تفاعل جمهورنا ازداد بنسبة 300% بعد تجديد هويتنا البصرية.", text_en: "Exceptional results! Our audience engagement increased 300% after visual identity renewal." },
    ],
  },
  medical: {
    primary: "#0d9488", accent: "#0284c7", dark: "#001a18",
    icons: ["fa-heart-pulse","fa-user-doctor","fa-microscope","fa-pills","fa-hospital","fa-stethoscope"],
    hero_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1584982751601-97dea52e5617?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "20K+", label_ar: "مريض شُفي", label_en: "Patients Treated" },
      { num: "50+", label_ar: "طبيب متخصص", label_en: "Specialists" },
      { num: "15+", label_ar: "سنة تميز", label_en: "Years Excellence" },
      { num: "24/7", label_ar: "خدمة متواصلة", label_en: "Continuous Care" },
    ],
    testimonials: [
      { name: "أم عبدالله الرشيدي", role_ar: "مريضة سابقة", role_en: "Former Patient", text_ar: "رعاية طبية ممتازة وفريق متخصص يُشعرك بالاهتمام الحقيقي. شفيت بفضل الله ثم بفضل جهودهم.", text_en: "Excellent medical care with a specialized team that makes you feel truly cared for." },
      { name: "أحمد البلوي", role_ar: "مراجع منتظم", role_en: "Regular Patient", text_ar: "أفضل مستشفى تعاملت معه من حيث النظافة والتنظيم وكفاءة الكوادر الطبية.", text_en: "Best hospital I've dealt with in terms of cleanliness, organization and medical staff efficiency." },
      { name: "سمر الجهني", role_ar: "مريضة", role_en: "Patient", text_ar: "جميع الأطباء متميزون والتشخيص دقيق. أنصح الجميع بهذا المستشفى بكل ثقة.", text_en: "All doctors are excellent and diagnosis is accurate. I recommend this hospital to everyone with full confidence." },
    ],
  },
  legal: {
    primary: "#1e3a5f", accent: "#c9a84c", dark: "#0a0f1a",
    icons: ["fa-scale-balanced","fa-gavel","fa-file-contract","fa-shield-halved","fa-handshake","fa-building-columns"],
    hero_image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1521587765099-8835e7201186?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"20+", label_ar:"سنة خبرة", label_en:"Years Experience" }, { num:"500+", label_ar:"قضية ناجحة", label_en:"Cases Won" }, { num:"98%", label_ar:"رضا العملاء", label_en:"Client Satisfaction" }, { num:"50+", label_ar:"محامٍ متخصص", label_en:"Specialist Lawyers" }],
    testimonials: [
      { name:"عبدالله الزهراني", role_ar:"رجل أعمال", role_en:"Businessman", text_ar:"المكتب تجاوز كل توقعاتي في القضية التجارية. محترفون وملتزمون بالنتائج.", text_en:"The office exceeded all my expectations in the commercial case. Professional and results-driven." },
      { name:"نورا الحربي", role_ar:"مديرة تنفيذية", role_en:"Executive Director", text_ar:"خبرة قانونية عالية ومتخصصة في السوق السعودي. أنصح بهم بشدة.", text_en:"High legal expertise specialized in the Saudi market. Highly recommended." },
      { name:"فهد القحطاني", role_ar:"مستثمر", role_en:"Investor", text_ar:"دفاع احترافي وصريح، وفّروا لي حقوقي كاملة. شكراً على الأمانة والكفاءة.", text_en:"Professional and honest defense, they secured all my rights. Thank you for your integrity and efficiency." },
    ],
  },
  beauty: {
    primary: "#be185d", accent: "#f59e0b", dark: "#1a0010",
    icons: ["fa-scissors","fa-spa","fa-face-smile","fa-star","fa-wand-magic-sparkles","fa-leaf"],
    hero_image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100d293?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"8+", label_ar:"سنوات خبرة", label_en:"Years Experience" }, { num:"5000+", label_ar:"عميلة سعيدة", label_en:"Happy Clients" }, { num:"50+", label_ar:"خدمة متخصصة", label_en:"Specialist Services" }, { num:"4.9", label_ar:"تقييم العملاء", label_en:"Client Rating" }],
    testimonials: [
      { name:"سارة العتيبي", role_ar:"طالبة جامعية", role_en:"University Student", text_ar:"أحلى تجربة! الصالون نظيف وأنيق والمهارة عالية جداً. صارت ثقتي بنفسي أعلى.", text_en:"Amazing experience! The salon is clean, elegant and the skill level is very high. My self-confidence soared." },
      { name:"ريم الشمري", role_ar:"مديرة أعمال", role_en:"Business Manager", text_ar:"خدمات VIP بأسعار معقولة. هذا هو الصالون الأول الذي يفهم بالضبط ما أريده.", text_en:"VIP services at reasonable prices. This is the first salon that understands exactly what I want." },
      { name:"هنود المالكي", role_ar:"مؤثرة رقمية", role_en:"Digital Influencer", text_ar:"أنصح به لكل النساء! الفريق رائع والنتائج تدوم طويلاً. الجمال الحقيقي يبدأ من هنا.", text_en:"I recommend it to all women! The team is amazing and results last long. True beauty starts here." },
    ],
  },
  realestate: {
    primary: "#059669", accent: "#f59e0b", dark: "#001a10",
    icons: ["fa-building","fa-house","fa-key","fa-map-location-dot","fa-city","fa-handshake"],
    hero_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"15+", label_ar:"سنة في السوق", label_en:"Years in Market" }, { num:"2000+", label_ar:"وحدة مُسلَّمة", label_en:"Units Delivered" }, { num:"98%", label_ar:"رضا العملاء", label_en:"Client Satisfaction" }, { num:"5B+", label_ar:"ريال حجم المبيعات", label_en:"SAR Sales Volume" }],
    testimonials: [
      { name:"خالد الدوسري", role_ar:"مستثمر عقاري", role_en:"Real Estate Investor", text_ar:"تجربة احترافية من البداية للنهاية. ساعدوني في إيجاد أفضل استثمار بالرياض.", text_en:"Professional experience from start to finish. Helped me find the best investment in Riyadh." },
      { name:"منى السبيعي", role_ar:"ربة منزل", role_en:"Homeowner", text_ar:"شريت شقتي الأولى بخطوات بسيطة وبدون ضغط. الفريق كان صادقاً وأمانته ممتازة.", text_en:"I bought my first apartment in simple steps without pressure. The team was honest and trustworthy." },
      { name:"سعد الغامدي", role_ar:"رجل أعمال", role_en:"Businessman", text_ar:"أحسن شركة عقارية تعاملت معها. سرعة في التنفيذ وشفافية كاملة في التعامل.", text_en:"Best real estate company I've worked with. Fast execution and complete transparency in dealing." },
    ],
  },
  education: {
    primary: "#1e3a8a", accent: "#f97316", dark: "#050d1a",
    icons: ["fa-graduation-cap","fa-book-open","fa-chalkboard-teacher","fa-award","fa-lightbulb","fa-users"],
    hero_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"10+", label_ar:"سنوات خبرة", label_en:"Years Experience" }, { num:"5000+", label_ar:"طالب تخرج", label_en:"Graduates" }, { num:"95%", label_ar:"نسبة النجاح", label_en:"Success Rate" }, { num:"200+", label_ar:"كورس متخصص", label_en:"Specialized Courses" }],
    testimonials: [
      { name:"يوسف الحربي", role_ar:"طالب جامعي", role_en:"University Student", text_ar:"غيّر مسيرتي التعليمية بالكامل. الطريقة التعليمية مبتكرة وتناسب كل الأعمار.", text_en:"Completely changed my educational path. The teaching method is innovative and suits all ages." },
      { name:"لمياء الغامدي", role_ar:"والدة", role_en:"Parent", text_ar:"ابني تحسن مستواه بشكل واضح بعد الالتحاق هنا. المعلمون متفانون ومتفاعلون.", text_en:"My son's level improved significantly after joining here. Teachers are dedicated and engaging." },
      { name:"أحمد المنصور", role_ar:"موظف حكومي", role_en:"Government Employee", text_ar:"كورسات احترافية بشهادات معتمدة. طوّرت مهاراتي وحصلت على ترقية في العمل.", text_en:"Professional courses with accredited certificates. Developed my skills and got a work promotion." },
    ],
  },
  events: {
    primary: "#7c3aed", accent: "#f59e0b", dark: "#0f0520",
    icons: ["fa-calendar-star","fa-music","fa-champagne-glasses","fa-camera","fa-microphone","fa-gift"],
    hero_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1478147427282-58a87a433000?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"500+", label_ar:"فعالية منظَّمة", label_en:"Events Organized" }, { num:"50K+", label_ar:"ضيف سعيد", label_en:"Happy Guests" }, { num:"12+", label_ar:"سنة خبرة", label_en:"Years Experience" }, { num:"4.9", label_ar:"تقييم العملاء", label_en:"Client Rating" }],
    testimonials: [
      { name:"بدر العجمي", role_ar:"مدير شركة", role_en:"Company Director", text_ar:"نظّموا مؤتمرنا السنوي بشكل رائع. كل تفصيل كان مثالياً وفريق العمل محترف جداً.", text_en:"They organized our annual conference brilliantly. Every detail was perfect and the team was very professional." },
      { name:"حصة الدوسري", role_ar:"عروس", role_en:"Bride", text_ar:"حفل زفافي كان حلماً حقيقياً! التنظيم والديكور تجاوزا كل توقعاتي. شكراً من القلب.", text_en:"My wedding was a real dream! The organization and decor exceeded all my expectations. Thank you from the heart." },
      { name:"طلال الزهراني", role_ar:"مدير تسويق", role_en:"Marketing Manager", text_ar:"فعالية إطلاق منتجنا كانت ناجحة بامتياز. عدد الزوار تجاوز التوقعات بفضل إدارتهم الممتازة.", text_en:"Our product launch event was an outstanding success. Visitor numbers exceeded expectations thanks to their excellent management." },
    ],
  },
  automotive: {
    primary: "#1e293b", accent: "#ef4444", dark: "#050a14",
    icons: ["fa-car","fa-wrench","fa-gear","fa-oil-can","fa-car-burst","fa-gauge-high"],
    hero_image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1562141961-b6d9dd57b5cf?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"15+", label_ar:"سنة خبرة", label_en:"Years Experience" }, { num:"20K+", label_ar:"سيارة صيانة", label_en:"Cars Serviced" }, { num:"50+", label_ar:"فني متخصص", label_en:"Expert Technicians" }, { num:"100%", label_ar:"ضمان الجودة", label_en:"Quality Guarantee" }],
    testimonials: [
      { name:"محمد العتيبي", role_ar:"صاحب سيارة", role_en:"Car Owner", text_ar:"أفضل مركز صيانة بالرياض. الفنيون محترفون والسعر معقول جداً مقارنة بالوكالة.", text_en:"Best maintenance center in Riyadh. Technicians are professional and prices are very reasonable compared to dealerships." },
      { name:"عبدالعزيز الشهري", role_ar:"رجل أعمال", role_en:"Businessman", text_ar:"يصلحون سيارتي دائماً بأمانة وبدون مفاجآت في الفاتورة. أثق فيهم ثقة عمياء.", text_en:"They always fix my car honestly and without billing surprises. I trust them blindly." },
      { name:"تركي الحربي", role_ar:"موظف", role_en:"Employee", text_ar:"سرعة الخدمة مذهلة! جاؤوا لموقعي وأصلحوا سيارتي في نفس اليوم. خدمة استثنائية.", text_en:"Amazing service speed! They came to my location and fixed my car the same day. Exceptional service." },
    ],
  },
  luxury: {
    primary: "#0a0a0a", accent: "#d4a843", dark: "#080808",
    icons: ["fa-gem","fa-crown","fa-star","fa-diamond","fa-gift","fa-award"],
    hero_image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1588776814546-1ffbb7c4f58a?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"20+", label_ar:"سنة حرفية", label_en:"Years of Craft" }, { num:"10K+", label_ar:"عميل VIP", label_en:"VIP Clients" }, { num:"100%", label_ar:"مواد أصلية", label_en:"Authentic Materials" }, { num:"50+", label_ar:"دولة نشحن إليها", label_en:"Countries Served" }],
    testimonials: [
      { name:"الأمير بندر", role_ar:"مقتنٍ للفن", role_en:"Art Collector", text_ar:"جودة استثنائية وخدمة تليق بأرقى العملاء. كل قطعة تحكي قصة من الفخامة والتميز.", text_en:"Exceptional quality and service worthy of the most distinguished clients. Every piece tells a story of luxury." },
      { name:"نوف الراشد", role_ar:"سيدة أعمال", role_en:"Businesswoman", text_ar:"تجربة تسوق فريدة ومميزة. الاهتمام بالتفاصيل والتغليف الفاخر يجعل كل هدية لا تُنسى.", text_en:"A unique and distinguished shopping experience. The attention to detail and luxury packaging makes every gift unforgettable." },
      { name:"فيصل الأنصاري", role_ar:"مستثمر", role_en:"Investor", text_ar:"منتجات أصيلة بجودة عالمية. هذا المستوى من الفخامة نادر في السوق السعودي.", text_en:"Authentic products with world-class quality. This level of luxury is rare in the Saudi market." },
    ],
  },
  gym: {
    primary: "#dc2626", accent: "#f97316", dark: "#0a0505",
    icons: ["fa-dumbbell","fa-fire","fa-person-running","fa-heart-pulse","fa-trophy","fa-bolt"],
    hero_image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=400&fit=crop&q=75",
    ],
    stats: [{ num:"5+", label_ar:"سنوات خبرة", label_en:"Years Experience" }, { num:"2000+", label_ar:"عضو نشط", label_en:"Active Members" }, { num:"50+", label_ar:"أجهزة حديثة", label_en:"Modern Equipment" }, { num:"20+", label_ar:"مدرب معتمد", label_en:"Certified Trainers" }],
    testimonials: [
      { name:"يزيد المطيري", role_ar:"رياضي", role_en:"Athlete", text_ar:"أفضل صالة بالرياض! المعدات حديثة والمدربون محترفون. خسرت 15 كيلو في 3 أشهر.", text_en:"Best gym in Riyadh! Modern equipment and professional trainers. Lost 15kg in 3 months." },
      { name:"رنا الحميدان", role_ar:"موظفة", role_en:"Employee", text_ar:"بيئة تحفيزية ومريحة. الجدول التدريبي منظم ومناسب لأوقاتي. أنصح به بشدة للمرأة السعودية.", text_en:"Motivating and comfortable environment. The training schedule is organized and suits my times. Highly recommended for Saudi women." },
      { name:"عمر السليمان", role_ar:"مدير", role_en:"Manager", text_ar:"الاشتراك يستحق كل ريال. المدرب الشخصي غيّر حياتي وأسلوبي في التفكير بالصحة.", text_en:"The subscription is worth every riyal. The personal trainer changed my life and my mindset about health." },
    ],
  },
  general: {
    primary: "#059669", accent: "#0284c7", dark: "#00100a",
    icons: ["fa-gem","fa-handshake","fa-trophy","fa-globe","fa-bolt","fa-crown"],
    hero_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "10+", label_ar: "سنوات خبرة", label_en: "Years Experience" },
      { num: "500+", label_ar: "عميل راضٍ", label_en: "Satisfied Clients" },
      { num: "100+", label_ar: "مشروع مكتمل", label_en: "Projects Done" },
      { num: "24/7", label_ar: "دعم مستمر", label_en: "Support" },
    ],
    testimonials: [
      { name: "عمر السليم", role_ar: "مدير عام", role_en: "General Manager", text_ar: "شركة متميزة وموثوقة، تقدم خدمات بمستوى عالمي. تجربتنا معهم كانت ممتازة.", text_en: "An outstanding and reliable company providing world-class services. Our experience with them was excellent." },
      { name: "مريم الحسين", role_ar: "رائدة أعمال", role_en: "Entrepreneur", text_ar: "فريق محترف يحرص على إرضاء العملاء ويتجاوز التوقعات في كل مرة.", text_en: "A professional team that strives to satisfy customers and exceeds expectations every time." },
      { name: "وليد الفهد", role_ar: "مستثمر", role_en: "Investor", text_ar: "أنصح بهم بشدة! خدمة احترافية وجودة عالية بأسعار تنافسية. شركاء نجاح حقيقيون.", text_en: "Highly recommend! Professional service, high quality at competitive prices. True success partners." },
    ],
  },
  ecommerce: {
    primary: "#f97316", accent: "#8b5cf6", dark: "#0a0500",
    icons: ["fa-cart-shopping","fa-tags","fa-truck","fa-shield-check","fa-gift","fa-percent"],
    hero_image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "50K+", label_ar: "منتج متوفر", label_en: "Products Available" },
      { num: "24h", label_ar: "توصيل سريع", label_en: "Fast Delivery" },
      { num: "99%", label_ar: "رضا العملاء", label_en: "Customer Satisfaction" },
      { num: "100%", label_ar: "ضمان الجودة", label_en: "Quality Guarantee" },
    ],
    testimonials: [
      { name: "نوف العتيبي", role_ar: "عميلة دائمة", role_en: "Loyal Customer", text_ar: "تجربة تسوق رائعة! الجودة ممتازة والتوصيل سريع جداً. أنصح به بشدة.", text_en: "Wonderful shopping experience! Excellent quality and very fast delivery. Highly recommend." },
      { name: "بندر الحربي", role_ar: "رجل أعمال", role_en: "Businessman", text_ar: "أفضل متجر للمنتجات الأصلية. الأسعار تنافسية والخدمة ممتازة دائماً.", text_en: "Best store for original products. Competitive prices and always excellent service." },
      { name: "رانيا القحطاني", role_ar: "مؤثرة رقمية", role_en: "Digital Influencer", text_ar: "كل ما أحتاجه في مكان واحد. سرعة الشحن والتغليف الأنيق يجعلان التجربة مميزة.", text_en: "Everything I need in one place. Fast shipping and elegant packaging make the experience special." },
    ],
  },
  tech: {
    primary: "#6366f1", accent: "#06b6d4", dark: "#020613",
    icons: ["fa-code","fa-microchip","fa-cloud","fa-shield","fa-robot","fa-diagram-project"],
    hero_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1536148935331-408321065b18?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "500+", label_ar: "مشروع تقني", label_en: "Tech Projects" },
      { num: "99.9%", label_ar: "وقت التشغيل", label_en: "System Uptime" },
      { num: "10+", label_ar: "سنوات خبرة", label_en: "Years Experience" },
      { num: "50+", label_ar: "مطور متخصص", label_en: "Expert Developers" },
    ],
    testimonials: [
      { name: "عبدالعزيز الراشد", role_ar: "مدير تقنية", role_en: "CTO", text_ar: "حلول تقنية متقدمة تجاوزت كل توقعاتنا. فريق يفهم احتياجات السوق السعودي.", text_en: "Advanced tech solutions that exceeded all our expectations. A team that understands the Saudi market." },
      { name: "سلمى الشهري", role_ar: "رائدة أعمال رقمية", role_en: "Digital Entrepreneur", text_ar: "سرعة التنفيذ والجودة العالية ميّزانهم عن غيرهم. نتائج ملموسة من أول أسبوع.", text_en: "Speed of execution and high quality set them apart. Tangible results from the first week." },
      { name: "فهد المطيري", role_ar: "مدير عمليات", role_en: "Operations Director", text_ar: "أتمتة رائعة وفّرت علينا ساعات من العمل اليومي. شريك تقني يُعتمد عليه.", text_en: "Excellent automation saved us hours of daily work. A reliable tech partner." },
    ],
  },
  consulting: {
    primary: "#1e40af", accent: "#d97706", dark: "#000814",
    icons: ["fa-handshake","fa-chart-line","fa-lightbulb","fa-briefcase","fa-users","fa-magnifying-glass-chart"],
    hero_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "300+", label_ar: "عميل شركة", label_en: "Corporate Clients" },
      { num: "15+", label_ar: "سنة استشارة", label_en: "Years Consulting" },
      { num: "2B+", label_ar: "ريال وفّرنا", label_en: "SAR Value Created" },
      { num: "98%", label_ar: "نجاح المشاريع", label_en: "Project Success Rate" },
    ],
    testimonials: [
      { name: "تركي المنصور", role_ar: "رئيس تنفيذي", role_en: "CEO", text_ar: "استراتيجية محكمة وتنفيذ دقيق. حوّلوا شركتنا من الخسارة إلى الربحية في عام واحد.", text_en: "Solid strategy and precise execution. They transformed our company from loss to profitability in one year." },
      { name: "هيفاء السديري", role_ar: "مديرة تطوير", role_en: "Development Director", text_ar: "رؤية استراتيجية عميقة ومعرفة واسعة بالسوق السعودي. شريك نجاح استراتيجي.", text_en: "Deep strategic vision and extensive knowledge of the Saudi market. A strategic success partner." },
      { name: "ماجد العنزي", role_ar: "مستثمر", role_en: "Investor", text_ar: "أكثر من مجرد استشاريين — شركاء حقيقيون في النمو والتوسع. أنصح بهم بشدة.", text_en: "More than just consultants — true partners in growth and expansion. Highly recommend." },
    ],
  },
  logistics: {
    primary: "#dc2626", accent: "#f59e0b", dark: "#0a0000",
    icons: ["fa-truck-fast","fa-warehouse","fa-box","fa-route","fa-ship","fa-plane"],
    hero_image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1519003300449-424ad0405076?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1609543613596-04fa8a88aed8?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "1M+", label_ar: "شحنة سنوياً", label_en: "Shipments/Year" },
      { num: "24h", label_ar: "توصيل داخلي", label_en: "Local Delivery" },
      { num: "50+", label_ar: "وجهة دولية", label_en: "Global Destinations" },
      { num: "99%", label_ar: "دقة التسليم", label_en: "Delivery Accuracy" },
    ],
    testimonials: [
      { name: "سعود الدوسري", role_ar: "مدير سلسلة التوريد", role_en: "Supply Chain Manager", text_ar: "شريك لوجستي موثوق. الشحنات تصل في وقتها دائماً وبحالة ممتازة.", text_en: "A reliable logistics partner. Shipments always arrive on time and in excellent condition." },
      { name: "نادية الزهراني", role_ar: "مديرة عمليات", role_en: "Operations Manager", text_ar: "نظام التتبع الذكي وسرعة الاستجابة ميّزانهم عن كل المنافسين.", text_en: "Smart tracking system and fast response set them apart from all competitors." },
      { name: "خالد الشهري", role_ar: "تاجر جملة", role_en: "Wholesale Trader", text_ar: "وفّرنا 30% من تكاليف الشحن بعد التعاون معهم. كفاءة عالية وأسعار تنافسية.", text_en: "Saved 30% in shipping costs after partnering with them. High efficiency and competitive prices." },
    ],
  },
  cleaning: {
    primary: "#0891b2", accent: "#22c55e", dark: "#000d14",
    icons: ["fa-spray-can","fa-broom","fa-soap","fa-leaf","fa-shield-check","fa-house"],
    hero_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1527515637462-cff94edd56f9?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "5000+", label_ar: "منزل نُظّف", label_en: "Homes Cleaned" },
      { num: "100%", label_ar: "منتجات آمنة", label_en: "Safe Products" },
      { num: "8+", label_ar: "سنوات خبرة", label_en: "Years Experience" },
      { num: "98%", label_ar: "رضا العملاء", label_en: "Client Satisfaction" },
    ],
    testimonials: [
      { name: "أمل الرشيد", role_ar: "ربة منزل", role_en: "Homeowner", text_ar: "عمل رائع وفريق أمين. البيت بلمع كأنه جديد والمنتجات آمنة تماماً للأطفال.", text_en: "Wonderful work and trustworthy team. The house sparkles like new and products are completely safe for kids." },
      { name: "محمد الجهني", role_ar: "مدير مجمع سكني", role_en: "Residential Complex Manager", text_ar: "خدمة منتظمة ودقيقة. فريق محترف يحترم الخصوصية ويقدم نتائج ممتازة.", text_en: "Regular and precise service. A professional team that respects privacy and delivers excellent results." },
      { name: "سلوى العمري", role_ar: "مديرة مكتب", role_en: "Office Manager", text_ar: "أفضل شركة تنظيف تعاملنا معها. التعقيم الشامل والرائحة المنعشة تجعل بيئة العمل أفضل.", text_en: "Best cleaning company we've worked with. Complete sanitization and fresh scent make the work environment better." },
    ],
  },
  photography: {
    primary: "#1c1917", accent: "#d97706", dark: "#050302",
    icons: ["fa-camera","fa-image","fa-film","fa-wand-magic-sparkles","fa-star","fa-circle-dot"],
    hero_image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "2000+", label_ar: "جلسة تصوير", label_en: "Photo Sessions" },
      { num: "50K+", label_ar: "صورة محترفة", label_en: "Professional Photos" },
      { num: "10+", label_ar: "سنة إبداع", label_en: "Years Creativity" },
      { num: "100%", label_ar: "ضمان الرضا", label_en: "Satisfaction Guaranteed" },
    ],
    testimonials: [
      { name: "ليلى المالكي", role_ar: "عروس سعيدة", role_en: "Happy Bride", text_ar: "أجمل صور زفافنا! المصور يمتلك عيناً فنية استثنائية وأسلوباً راقياً.", text_en: "Most beautiful wedding photos! The photographer has an exceptional artistic eye and refined style." },
      { name: "يوسف الغامدي", role_ar: "مدير علامة تجارية", role_en: "Brand Manager", text_ar: "صور المنتجات ارتفعت مبيعاتنا 40% بعد استخدامها. تصوير احترافي يبيع بالفعل.", text_en: "Product photos boosted our sales 40% after using them. Professional photography that actually sells." },
      { name: "ريم الحربي", role_ar: "مديرة فعاليات", role_en: "Events Manager", text_ar: "التقاط اللحظات بشكل مذهل. كل صورة تحكي قصة وتنقل المشاعر بصدق.", text_en: "Capturing moments beautifully. Every photo tells a story and conveys emotions authentically." },
    ],
  },
  finance: {
    primary: "#0f4c81", accent: "#22c55e", dark: "#000814",
    icons: ["fa-coins","fa-chart-pie","fa-landmark","fa-file-invoice-dollar","fa-shield","fa-calculator"],
    hero_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "500M+", label_ar: "ريال مُدار", label_en: "SAR Managed" },
      { num: "1000+", label_ar: "عميل موثوق", label_en: "Trusted Clients" },
      { num: "20+", label_ar: "سنة خبرة مالية", label_en: "Years Financial Exp." },
      { num: "100%", label_ar: "امتثال نظامي", label_en: "Regulatory Compliance" },
    ],
    testimonials: [
      { name: "عادل الكثيري", role_ar: "رجل أعمال", role_en: "Businessman", text_ar: "إدارة مالية احترافية أنقذت شركتي من مشكلات ضريبية معقدة. خبراء موثوقون.", text_en: "Professional financial management saved my company from complex tax issues. Trusted experts." },
      { name: "منى الصالح", role_ar: "مديرة مالية", role_en: "CFO", text_ar: "توفير ضريبي ملحوظ وتخطيط مالي دقيق. شريك مالي استراتيجي حقيقي.", text_en: "Significant tax savings and precise financial planning. A true strategic financial partner." },
      { name: "براء المحمد", role_ar: "مستثمر", role_en: "Investor", text_ar: "تحليلات استثمارية دقيقة وعوائد فعلية تجاوزت التوقعات. أنصح بهم للجميع.", text_en: "Precise investment analysis and actual returns that exceeded expectations. Recommend to everyone." },
    ],
  },
  hotel: {
    primary: "#92400e", accent: "#d4af37", dark: "#0a0500",
    icons: ["fa-hotel","fa-bed","fa-utensils","fa-swimming-pool","fa-spa","fa-concierge-bell"],
    hero_image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "200+", label_ar: "غرفة فاخرة", label_en: "Luxury Rooms" },
      { num: "5★", label_ar: "تصنيف عالمي", label_en: "Global Rating" },
      { num: "20K+", label_ar: "ضيف سعيد", label_en: "Happy Guests" },
      { num: "24/7", label_ar: "خدمة الضيوف", label_en: "Guest Services" },
    ],
    testimonials: [
      { name: "شيخة آل مكتوم", role_ar: "ضيفة متكررة", role_en: "Repeat Guest", text_ar: "فندق استثنائي! كل تفصيلة مُعدّة باحترافية عالية. إقامة لا تُنسى في كل مرة.", text_en: "Exceptional hotel! Every detail is prepared with high professionalism. Unforgettable stay every time." },
      { name: "أحمد الباز", role_ar: "رجل أعمال", role_en: "Businessman", text_ar: "أفضل مكان للاجتماعات وتناول الطعام. الخدمة والمطعم يستحقان كل تقدير.", text_en: "Best place for meetings and dining. The service and restaurant deserve every praise." },
      { name: "فريدة المصباح", role_ar: "مدوّنة سياحية", role_en: "Travel Blogger", text_ar: "تجربة إقامة فاخرة بحق. الموظفون ودودون والمرافق استثنائية. أعلى تقييم.", text_en: "Truly luxurious accommodation experience. Friendly staff and exceptional facilities. Highest rating." },
    ],
  },
  charity: {
    primary: "#15803d", accent: "#f59e0b", dark: "#001a0a",
    icons: ["fa-hand-holding-heart","fa-people-group","fa-seedling","fa-hands-helping","fa-circle-dollar-to-slot","fa-globe"],
    hero_image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1560252829-804f1aedf1be?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "50K+", label_ar: "مستفيد سنوياً", label_en: "Beneficiaries/Year" },
      { num: "100+", label_ar: "برنامج خيري", label_en: "Charity Programs" },
      { num: "15+", label_ar: "سنة عطاء", label_en: "Years of Giving" },
      { num: "95%", label_ar: "من التبرعات للمحتاجين", label_en: "Donations to Beneficiaries" },
    ],
    testimonials: [
      { name: "الشيخ عبدالرحمن", role_ar: "متبرع دائم", role_en: "Regular Donor", text_ar: "شفافية تامة في توزيع التبرعات وتقارير دورية تُثلج الصدر. ثقة عالية.", text_en: "Full transparency in distributing donations and periodic heartwarming reports. High trust." },
      { name: "أسماء البلوي", role_ar: "متطوعة", role_en: "Volunteer", text_ar: "تجربة تطوع ترفع الروح المعنوية. منظمة ممتازة تُحدث فارقاً حقيقياً في المجتمع.", text_en: "A volunteer experience that lifts the spirit. Excellent organization making a real difference in the community." },
      { name: "الدكتور فيصل", role_ar: "عضو مجلس الأمناء", role_en: "Board Member", text_ar: "حوكمة رشيدة وأثر اجتماعي ملموس. من أفضل الجمعيات الخيرية في المملكة.", text_en: "Sound governance and tangible social impact. One of the best charities in the Kingdom." },
    ],
  },
  freelance: {
    primary: "#7c3aed", accent: "#ec4899", dark: "#0a0012",
    icons: ["fa-laptop-code","fa-pen-nib","fa-rocket","fa-star","fa-clock","fa-handshake"],
    hero_image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1600&h=900&fit=crop&q=85",
    about_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop&q=75",
    ],
    stats: [
      { num: "300+", label_ar: "مشروع مكتمل", label_en: "Projects Completed" },
      { num: "150+", label_ar: "عميل راضٍ", label_en: "Happy Clients" },
      { num: "5+", label_ar: "سنوات خبرة", label_en: "Years Experience" },
      { num: "4.9", label_ar: "تقييم المنصات", label_en: "Platform Rating" },
    ],
    testimonials: [
      { name: "منصور الطلحي", role_ar: "صاحب مشروع", role_en: "Project Owner", text_ar: "تسليم في الوقت المحدد وجودة عالية. أفضل فريلانسر تعاملت معه حتى الآن.", text_en: "On-time delivery and high quality. Best freelancer I've worked with so far." },
      { name: "رشا القرشي", role_ar: "مديرة مشاريع", role_en: "Project Manager", text_ar: "تواصل ممتاز واستيعاب سريع للمتطلبات. يُسلّم أكثر مما تتوقع.", text_en: "Excellent communication and quick grasp of requirements. Delivers more than you expect." },
      { name: "عماد الحميدي", role_ar: "مؤسس ناشئة", role_en: "Startup Founder", text_ar: "ساعدني على إطلاق منتجي بسرعة وبتكلفة معقولة. محترف ويعمل باستقلالية.", text_en: "Helped me launch my product quickly and cost-effectively. Professional and works independently." },
    ],
  },
};

const FALLBACK_ICONS = ["fa-gem","fa-handshake","fa-trophy","fa-globe","fa-bolt","fa-crown"];

const FA_TO_SVG: Record<string, string> = {
  "fa-utensils":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  "fa-wine-glass":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 11v11"/><path d="M7 3h10l-1.68 8.39a2 2 0 0 1-1.98 1.61H9.66a2 2 0 0 1-1.98-1.61Z"/></svg>`,
  "fa-star":`<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  "fa-clock":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  "fa-fire":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  "fa-leaf":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  "fa-bullseye":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  "fa-chart-line":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  "fa-palette":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125A1.64 1.64 0 0 1 14.441 17.5h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  "fa-code":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  "fa-mobile-screen":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>`,
  "fa-magnifying-glass":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  "fa-rocket":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  "fa-lightbulb":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  "fa-gears":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  "fa-shield":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  "fa-cloud":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  "fa-chart-bar":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  "fa-pen-nib":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 15H7l-2 2 3.5 3.5 2-2v-4.5"/><path d="m15 9.5-4 4"/><path d="M21.378 4.626A3 3 0 0 0 17.04 4L12 9l1.172 1.172a2 2 0 0 1 .586 1.414V12h.414a2 2 0 0 1 1.414.586L17 14l5-4.622a3 3 0 0 0-.622-4.752z"/><path d="m5 22-2-2"/></svg>`,
  "fa-camera":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  "fa-film":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  "fa-desktop":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  "fa-wand-magic-sparkles":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>`,
  "fa-layer-group":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
  "fa-heart-pulse":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.75-1.5 1.5 3 1.5-6 1.5 4.5.75-1H21"/></svg>`,
  "fa-user-doctor":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M12 11v4"/><path d="M10 13h4"/></svg>`,
  "fa-microscope":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`,
  "fa-pills":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
  "fa-hospital":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/></svg>`,
  "fa-stethoscope":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  "fa-scale-balanced":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
  "fa-gavel":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 12.5-8 8a2.119 2.119 0 0 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></svg>`,
  "fa-file-contract":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  "fa-shield-halved":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="22"/></svg>`,
  "fa-handshake":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-1"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>`,
  "fa-building-columns":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="6" x="4" y="2" rx="1"/><path d="M2 8h20"/><path d="M4 8v14"/><path d="M20 8v14"/><path d="M2 22h20"/><path d="M10 8v4"/><path d="M14 8v4"/><path d="M8 12h8"/></svg>`,
  "fa-scissors":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>`,
  "fa-spa":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4.97 0-9-2-9-4.5v-1c0-2 1.5-4 4-5.5V9c0-2.5 2-4.5 5-4.5s5 2 5 4.5v2c2.5 1.5 4 3.5 4 5.5v1c0 2.5-4.03 4.5-9 4.5Z"/><path d="M12 22v-9"/></svg>`,
  "fa-face-smile":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  "fa-building":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  "fa-house":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  "fa-key":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
  "fa-map-location-dot":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  "fa-city":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
  "fa-graduation-cap":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  "fa-book-open":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  "fa-chalkboard-teacher":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="3" rx="2"/><path d="M3 15h18"/><circle cx="12" cy="20" r="1"/><path d="M9 20h6"/></svg>`,
  "fa-award":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  "fa-calendar-star":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m12 15 1 2 2-3-3 1-2-3 1 2z"/></svg>`,
  "fa-music":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  "fa-champagne-glasses":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H4l1 8h14z"/><path d="M12 15v7"/><path d="M8 22h8"/><path d="m7 4 .5 2"/><path d="m17 4-.5 2"/></svg>`,
  "fa-microphone":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
  "fa-gift":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  "fa-car":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/><path d="m3 7 2-4h10l2 4"/></svg>`,
  "fa-wrench":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  "fa-gear":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  "fa-oil-can":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2z"/><path d="M2 7.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9L7 7.5"/><path d="M9 2H6a2 2 0 0 0-2 2v3.5"/></svg>`,
  "fa-car-burst":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h11l2 4"/><circle cx="6" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="m17 5 4 4"/><path d="M21 5v4h-4"/></svg>`,
  "fa-gauge-high":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
  "fa-gem":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="3" x2="6" y2="9"/><line x1="12" y1="3" x2="18" y2="9"/></svg>`,
  "fa-crown":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`,
  "fa-diamond":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 12 12 22 2 12"/></svg>`,
  "fa-dumbbell":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
  "fa-person-running":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1"/><path d="M8 17.5 11 13l4-1.5 2-4.5"/><path d="M7 21l3-4"/><path d="m11 13-2 4 5 2-1 3"/></svg>`,
  "fa-trophy":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  "fa-bolt":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  "fa-cart-shopping":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  "fa-tags":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg>`,
  "fa-truck":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect width="9" height="11" x="12" y="6" rx="2"/><circle cx="18" cy="17" r="2"/><circle cx="7" cy="17" r="2"/></svg>`,
  "fa-shield-check":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  "fa-percent":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  "fa-microchip":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="10" height="10" x="7" y="7" rx="1"/><path d="M16 8h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4"/><path d="M8 16v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4"/><path d="M8 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4"/><path d="M16 8V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4"/></svg>`,
  "fa-diagram-project":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="6" height="6" x="3" y="3" rx="1"/><rect width="6" height="6" x="15" y="3" rx="1"/><rect width="6" height="6" x="9" y="15" rx="1"/><path d="M6 9v4c0 1.1.9 2 2 2h2"/><path d="M18 9v4c0 1.1-.9 2-2 2h-2"/></svg>`,
  "fa-briefcase":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  "fa-users":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "fa-magnifying-glass-chart":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3 3"/><circle cx="10" cy="10" r="7"/><path d="M4 10h2"/><path d="M6 8v4"/><path d="M9 7v6"/><path d="M12 9v4"/></svg>`,
  "fa-truck-fast":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M14 12h8l-2 3v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2l-1-3"/><circle cx="8" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>`,
  "fa-warehouse":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>`,
  "fa-box":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  "fa-route":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>`,
  "fa-ship":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/></svg>`,
  "fa-plane":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  "fa-spray-can":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h.01"/><path d="M7 5h.01"/><path d="M11 7h.01"/><path d="M3 7h.01"/><path d="M7 9h.01"/><path d="M3 11h.01"/><rect width="4" height="4" x="15" y="5"/><path d="m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2"/></svg>`,
  "fa-broom":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 11 9-9"/><path d="M14.6 9.4 11 13"/><path d="M18 15v6"/><path d="M2.4 17.4 6 14l4 4-3.6 3.6a2 2 0 0 1-2.8 0l-.8-.8a2 2 0 0 1 .6-3.4z"/></svg>`,
  "fa-soap":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 19v-1a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v1"/><path d="M12 2a3 3 0 0 1 3 3v2H9V5a3 3 0 0 1 3-3Z"/><rect width="16" height="6" x="4" y="11" rx="2"/></svg>`,
  "fa-image":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  "fa-circle-dot":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
  "fa-coins":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`,
  "fa-chart-pie":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  "fa-landmark":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
  "fa-file-invoice-dollar":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M10 9H8"/></svg>`,
  "fa-calculator":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="18" x2="12" y2="18"/></svg>`,
  "fa-hotel":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M8 10h.01"/></svg>`,
  "fa-bed":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  "fa-swimming-pool":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M4 12V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><path d="M14 2h0a2 2 0 0 1 2 2v5"/><path d="M12 12V7"/></svg>`,
  "fa-concierge-bell":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0"/><path d="M4 14a8 8 0 0 1 16 0"/><path d="M3 18h18"/><path d="M3 22h18"/><path d="M12 2v6"/></svg>`,
  "fa-hand-holding-heart":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14H8.6a2 2 0 0 1-1.7-.9L3.5 8.4a.5.5 0 0 0-.9.2V12a1 1 0 0 0 .3.7l8.7 8.7a.5.5 0 0 0 .7 0l8.7-8.7a1 1 0 0 0 0-1.4l-2.4-2.4"/><path d="M16.5 3a2.5 2.5 0 0 0-2.5 2.5v.5h-1V5.5a2.5 2.5 0 0 0-5 0c0 4 6 6.5 6 6.5s6-2.5 6-6.5A2.5 2.5 0 0 0 17.5 3z"/></svg>`,
  "fa-people-group":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "fa-seedling":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 1.3 4.2 6 6 0 0 1-2.6 5"/></svg>`,
  "fa-globe":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  "fa-laptop-code":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9l-3 3 3 3"/><path d="m14 9 3 3-3 3"/><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M2 17h20"/><path d="M5 21h14"/></svg>`,
  "fa-quote-right":`<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.365zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.558-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.365z"/></svg>`,
};

function getSvcIcon(iconClass: string): string {
  return getIconSVG(iconClass);
}

const STAR_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

// ── Multilingual UI dictionary ─────────────────────────────────────────────
export const MULTILANG_UI: Record<string, Record<string, string>> = {
  ar: { nav_about:"من نحن", nav_services:"خدماتنا", nav_gallery:"أعمالنا", nav_reviews:"آراء العملاء", nav_contact:"تواصل", discover:"اكتشف المزيد", about_us_eyebrow:"من نحن", quality:"جودة لا تُضاهى", team:"فريق محترف ومتخصص", service:"خدمة عملاء متميزة", exp:"سنة خبرة", services_eyebrow:"خدماتنا", services_title:"ما نقدمه لك", services_sub:"نقدم حلولاً متكاملة تلبي احتياجاتك وتتجاوز توقعاتك", gallery_eyebrow:"معرض الأعمال", gallery_title:"أعمالنا المميزة", ready_title:"هل أنت مستعد للبدء؟", ready_sub:"تواصل معنا اليوم وابدأ رحلة نجاحك", testi_eyebrow:"آراء العملاء", testi_title:"ماذا يقول عملاؤنا", contact_eyebrow:"تواصل معنا", contact_title:"نسعد بخدمتك", about_cta:"تواصل معنا", quick_links:"روابط سريعة", get_in_touch:"تواصل معنا", rights:"جميع الحقوق محفوظة.", phone_label:"الهاتف", email_label:"البريد", address_label:"العنوان", wa:"تواصل عبر واتساب", form_title:"أرسل رسالتك", form_name:"الاسم الكامل", form_email:"البريد الإلكتروني", form_phone:"رقم الجوال", form_msg:"رسالتك..." },
  en: { nav_about:"About", nav_services:"Services", nav_gallery:"Gallery", nav_reviews:"Reviews", nav_contact:"Contact", discover:"Discover More", about_us_eyebrow:"About Us", quality:"Unmatched Quality", team:"Professional Expert Team", service:"Outstanding Customer Service", exp:"Years Exp.", services_eyebrow:"Services", services_title:"What We Offer", services_sub:"We provide comprehensive solutions that meet your needs and exceed your expectations", gallery_eyebrow:"Portfolio", gallery_title:"Our Featured Work", ready_title:"Ready to Get Started?", ready_sub:"Contact us today and start your success journey", testi_eyebrow:"Testimonials", testi_title:"What Our Clients Say", contact_eyebrow:"Contact Us", contact_title:"We'd Love to Help", about_cta:"Get In Touch", quick_links:"Quick Links", get_in_touch:"Get In Touch", rights:"All Rights Reserved.", phone_label:"Phone", email_label:"Email", address_label:"Address", wa:"WhatsApp Us", form_title:"Send a Message", form_name:"Full Name", form_email:"Email Address", form_phone:"Phone Number", form_msg:"Your message..." },
  fr: { nav_about:"À propos", nav_services:"Services", nav_gallery:"Portfolio", nav_reviews:"Avis", nav_contact:"Contact", discover:"Découvrir plus", about_us_eyebrow:"À propos de nous", quality:"Qualité incomparable", team:"Équipe professionnelle", service:"Service client exceptionnel", exp:"Ans d'expérience", services_eyebrow:"Services", services_title:"Ce que nous offrons", services_sub:"Nous proposons des solutions complètes qui répondent à vos besoins et dépassent vos attentes", gallery_eyebrow:"Portfolio", gallery_title:"Nos travaux vedettes", ready_title:"Prêt à commencer?", ready_sub:"Contactez-nous aujourd'hui et lancez votre parcours", testi_eyebrow:"Témoignages", testi_title:"Ce que disent nos clients", contact_eyebrow:"Contactez-nous", contact_title:"Nous sommes là pour vous", about_cta:"Nous contacter", quick_links:"Liens rapides", get_in_touch:"Nous contacter", rights:"Tous droits réservés.", phone_label:"Téléphone", email_label:"E-mail", address_label:"Adresse", wa:"Contacter via WhatsApp", form_title:"Envoyer un message", form_name:"Nom complet", form_email:"Adresse e-mail", form_phone:"Numéro de téléphone", form_msg:"Votre message..." },
  tr: { nav_about:"Hakkımızda", nav_services:"Hizmetler", nav_gallery:"Galeri", nav_reviews:"Yorumlar", nav_contact:"İletişim", discover:"Daha fazla keşfet", about_us_eyebrow:"Hakkımızda", quality:"Eşsiz kalite", team:"Profesyonel uzman ekip", service:"Üstün müşteri hizmeti", exp:"Yıl deneyim", services_eyebrow:"Hizmetler", services_title:"Ne sunuyoruz", services_sub:"İhtiyaçlarınızı karşılayan ve beklentilerinizi aşan kapsamlı çözümler sunuyoruz", gallery_eyebrow:"Portföy", gallery_title:"Öne çıkan çalışmalarımız", ready_title:"Başlamaya hazır mısınız?", ready_sub:"Bugün bizimle iletişime geçin", testi_eyebrow:"Referanslar", testi_title:"Müşterilerimiz ne diyor", contact_eyebrow:"İletişim", contact_title:"Yardımcı olmaktan memnuniyet duyarız", about_cta:"İletişime geç", quick_links:"Hızlı bağlantılar", get_in_touch:"İletişim", rights:"Tüm hakları saklıdır.", phone_label:"Telefon", email_label:"E-posta", address_label:"Adres", wa:"WhatsApp'tan ulaşın", form_title:"Mesaj gönder", form_name:"Ad Soyad", form_email:"E-posta adresi", form_phone:"Telefon numarası", form_msg:"Mesajınız..." },
  ru: { nav_about:"О нас", nav_services:"Услуги", nav_gallery:"Галерея", nav_reviews:"Отзывы", nav_contact:"Контакты", discover:"Узнать больше", about_us_eyebrow:"О компании", quality:"Непревзойдённое качество", team:"Профессиональная команда", service:"Превосходный сервис", exp:"лет опыта", services_eyebrow:"Услуги", services_title:"Что мы предлагаем", services_sub:"Мы предоставляем комплексные решения, отвечающие вашим потребностям", gallery_eyebrow:"Портфолио", gallery_title:"Избранные работы", ready_title:"Готовы начать?", ready_sub:"Свяжитесь с нами сегодня", testi_eyebrow:"Отзывы", testi_title:"Что говорят наши клиенты", contact_eyebrow:"Связаться", contact_title:"Рады помочь вам", about_cta:"Связаться", quick_links:"Быстрые ссылки", get_in_touch:"Связаться", rights:"Все права защищены.", phone_label:"Телефон", email_label:"Эл. почта", address_label:"Адрес", wa:"Написать в WhatsApp", form_title:"Отправить сообщение", form_name:"Полное имя", form_email:"Эл. адрес", form_phone:"Номер телефона", form_msg:"Ваше сообщение..." },
  de: { nav_about:"Über uns", nav_services:"Leistungen", nav_gallery:"Portfolio", nav_reviews:"Bewertungen", nav_contact:"Kontakt", discover:"Mehr entdecken", about_us_eyebrow:"Über uns", quality:"Unübertroffene Qualität", team:"Professionelles Expertenteam", service:"Hervorragender Kundenservice", exp:"Jahre Erfahrung", services_eyebrow:"Leistungen", services_title:"Was wir anbieten", services_sub:"Wir bieten umfassende Lösungen, die Ihren Anforderungen entsprechen", gallery_eyebrow:"Portfolio", gallery_title:"Unsere ausgewählten Arbeiten", ready_title:"Bereit anzufangen?", ready_sub:"Kontaktieren Sie uns heute", testi_eyebrow:"Bewertungen", testi_title:"Was unsere Kunden sagen", contact_eyebrow:"Kontakt", contact_title:"Wir helfen Ihnen gerne", about_cta:"Kontaktieren", quick_links:"Schnelllinks", get_in_touch:"Kontakt", rights:"Alle Rechte vorbehalten.", phone_label:"Telefon", email_label:"E-Mail", address_label:"Adresse", wa:"WhatsApp schreiben", form_title:"Nachricht senden", form_name:"Vollständiger Name", form_email:"E-Mail-Adresse", form_phone:"Telefonnummer", form_msg:"Ihre Nachricht..." },
  zh: { nav_about:"关于我们", nav_services:"服务", nav_gallery:"作品集", nav_reviews:"客户评价", nav_contact:"联系", discover:"了解更多", about_us_eyebrow:"关于我们", quality:"卓越品质", team:"专业精英团队", service:"卓越客户服务", exp:"年经验", services_eyebrow:"服务", services_title:"我们提供什么", services_sub:"我们提供满足您需求并超越您期望的综合解决方案", gallery_eyebrow:"作品集", gallery_title:"精选作品", ready_title:"准备好开始了吗?", ready_sub:"今天联系我们，开启您的成功之旅", testi_eyebrow:"客户评价", testi_title:"我们的客户怎么说", contact_eyebrow:"联系我们", contact_title:"我们很乐意帮助您", about_cta:"联系我们", quick_links:"快速链接", get_in_touch:"联系我们", rights:"版权所有。", phone_label:"电话", email_label:"电子邮件", address_label:"地址", wa:"通过WhatsApp联系", form_title:"发送消息", form_name:"全名", form_email:"电子邮件地址", form_phone:"电话号码", form_msg:"您的留言..." },
};

export interface ExtraLang {
  code: string;
  content: LangContent;
  businessName?: string;
}

// Business type → Font Awesome icon class for auto brand icon
const BRAND_ICON_MAP: Record<string, string> = {
  cleaning:"fa-broom", restaurant:"fa-utensils", medical:"fa-stethoscope",
  realestate:"fa-building", beauty:"fa-spa", education:"fa-graduation-cap",
  construction:"fa-hammer", ecommerce:"fa-bag-shopping", gym:"fa-dumbbell",
  fitness:"fa-dumbbell", logistics:"fa-truck", legal:"fa-scale-balanced",
  photography:"fa-camera", hotel:"fa-bed", agency:"fa-bullhorn",
  startup:"fa-rocket", tech:"fa-microchip", consulting:"fa-handshake",
  finance:"fa-chart-line", automotive:"fa-car", charity:"fa-heart",
  portfolio:"fa-palette", luxury:"fa-gem", events:"fa-calendar-star",
  freelance:"fa-laptop-code", general:"fa-briefcase",
};

export function buildInstantWebsite(
  content: BilingualBusinessContent,
  primaryLang: string,
  extraLangs?: ExtraLang[],
  userSelectedLangs?: string[]
): { html: string; css: string } {
  const config = BUSINESS_CONFIGS[content.business_type] || BUSINESS_CONFIGS.general;
  const primary = content.primary_color || config.primary;
  const accent = content.accent_color || config.accent;
  const dark = config.dark;
  const isPrimaryAr = primaryLang === "ar";
  const dir = isPrimaryAr ? "rtl" : "ltr";
  const ar = content.ar;
  const en = content.en;

  // Extra language (up to 1 additional beyond ar+en)
  const e3: ExtraLang | undefined = extraLangs?.[0];
  const e3code = e3?.code;

  // Helper: escape HTML attribute values
  const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  // Helper: generate data attributes for all active languages
  // For UI strings: looks up from MULTILANG_UI dictionary
  const dUI = (ar: string, en: string, key: string): string => {
    let s = `data-ar="${esc(ar)}" data-en="${esc(en)}"`;
    if (e3code) s += ` data-${e3code}="${esc(MULTILANG_UI[e3code]?.[key] || en)}"`;
    return s;
  };
  // For dynamic (AI-generated) content
  const dDyn = (arText: string, enText: string, extraText?: string): string => {
    let s = `data-ar="${esc(arText)}" data-en="${esc(enText)}"`;
    if (e3code && extraText) s += ` data-${e3code}="${esc(extraText)}"`;
    return s;
  };
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Tajawal:wght@400;500;700&family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap');`;
  const fontHeadingAr = "'Cairo', sans-serif";
  const fontBodyAr = "'Tajawal', 'Cairo', sans-serif";
  const fontHeadingEn = "'Montserrat', 'Inter', sans-serif";
  const fontBodyEn = "'Inter', sans-serif";
  // Use Arabic as default for initial CSS
  const fontHeading = fontHeadingAr;
  const fontBody = fontBodyAr;

  const svcIcons = config.icons || FALLBACK_ICONS;
  const servicesHtml = ar.services.slice(0, 6).map((s, i) => `
    <div class="service-card" data-aos style="animation-delay:${i * 0.08}s">
      <div class="service-icon-wrap">${getSvcIcon(svcIcons[i % svcIcons.length])}</div>
      <h3 ${dDyn(s.title, en.services[i]?.title || s.title, e3?.content.services[i]?.title)}>${s.title}</h3>
      <p ${dDyn(s.desc, en.services[i]?.desc || s.desc, e3?.content.services[i]?.desc)}>${s.desc}</p>
    </div>`).join("");

  const statsHtml = config.stats.map(s => `
    <div class="stat-item" data-aos>
      <span class="stat-num" data-target="${s.num}">${s.num}</span>
      <span class="stat-label" ${dDyn(s.label_ar, s.label_en, e3code ? s.label_en : undefined)}>${s.label_ar}</span>
    </div>`).join("");

  const galleryHtml = config.gallery_images.map((url, i) => `
    <div class="gallery-item" data-aos style="animation-delay:${i * 0.08}s">
      <img src="${url}" alt="" loading="lazy"/>
      <div class="gallery-overlay"></div>
    </div>`).join("");

  const activeTestimonials = (content.testimonials && content.testimonials.length >= 3)
    ? content.testimonials
    : config.testimonials;
  const testimonialsHtml = activeTestimonials.map((t, i) => `
    <div class="testi-card" data-aos style="animation-delay:${i * 0.12}s">
      <div class="testi-quote-mark">&ldquo;</div>
      <p class="testi-text" data-ar="${esc(t.text_ar)}" data-en="${esc(t.text_en)}"${e3code ? ` data-${e3code}="${esc(t.text_en)}"` : ""}>${t.text_ar}</p>
      <div class="testi-footer">
        <div class="testi-avatar">${t.name.charAt(0)}</div>
        <div class="testi-info">
          <div class="testi-name">${t.name}</div>
          <div class="testi-role" ${dDyn(t.role_ar, t.role_en, e3code ? t.role_en : undefined)}>${t.role_ar}</div>
        </div>
        <div class="testi-stars">${STAR_SVG.repeat(5)}</div>
      </div>
    </div>`).join("");

  const whatsappNum = content.phone.replace(/\D/g, "");

  // Language filtering: only include languages the user actually selected
  const selectedLangs = (userSelectedLangs && userSelectedLangs.length > 0) ? userSelectedLangs : ["ar", "en"];
  // Build ordered language list filtered to user-selected languages only
  const knownLangs = ["ar", ...(e3code ? [e3code] : []), "en"].filter(l => selectedLangs.includes(l));
  // Put primary language first, then maintain order
  const langOrder = [primaryLang, ...knownLangs.filter(l => l !== primaryLang)];
  // Only show lang switcher if more than one language is selected
  const showLangBtn = langOrder.length > 1;
  // Initial content to display (matches primaryLang)
  const initContent = primaryLang === "ar" ? ar : primaryLang === "en" ? en : (e3?.content ?? ar);
  const initName = primaryLang === "ar" ? content.business_name_ar : primaryLang === "en" ? content.business_name_en : (e3?.businessName || content.business_name_en);
  // Initial button shows next language to switch to (always uppercase code: AR, EN, FR, etc.)
  const initialBtnLabel = showLangBtn ? langOrder[1].toUpperCase() : "";

  // Auto brand icon based on business type (shown when no logo is uploaded)
  const brandIconClass = BRAND_ICON_MAP[content.business_type] || "fa-briefcase";
  const autoIconHtml = `<div class="aw-auto-icon" id="aw-auto-icon"><i class="fa-solid ${brandIconClass}"></i></div>`;

  const html = `<div dir="${dir}" class="aw-site" id="aw-root" lang="${primaryLang}">

<!-- ===== NAV ===== -->
<nav class="aw-nav" id="aw-nav">
  <div class="aw-nav-inner">
    <div class="aw-brand-group">
      ${autoIconHtml}
      <a href="#" class="aw-brand" ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName || e3?.content.hero_title?.split(" ").slice(0,2).join(" "))}>${initName}</a>
    </div>
    <div class="aw-nav-links">
      <a href="#about" ${dUI("من نحن", "About", "nav_about")}>${MULTILANG_UI[primaryLang]?.nav_about || (isPrimaryAr ? "من نحن" : "About")}</a>
      <a href="#services" ${dUI("خدماتنا", "Services", "nav_services")}>${MULTILANG_UI[primaryLang]?.nav_services || (isPrimaryAr ? "خدماتنا" : "Services")}</a>
      <a href="#gallery" ${dUI("أعمالنا", "Gallery", "nav_gallery")}>${MULTILANG_UI[primaryLang]?.nav_gallery || (isPrimaryAr ? "أعمالنا" : "Gallery")}</a>
      <a href="#testimonials" ${dUI("آراء العملاء", "Reviews", "nav_reviews")}>${MULTILANG_UI[primaryLang]?.nav_reviews || (isPrimaryAr ? "آراء العملاء" : "Reviews")}</a>
      <a href="#contact" class="aw-nav-cta" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${initContent.cta_text}</a>
    </div>
    <div style="display:flex;align-items:center;gap:0.5rem;">
      ${showLangBtn ? `<button id="aw-lang-btn" onclick="awCycleLang()" title="Switch Language" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:0.35rem 0.75rem;border-radius:2rem;font-size:0.8rem;font-weight:700;cursor:pointer;letter-spacing:0.5px;transition:all 0.2s;font-family:inherit;">${initialBtnLabel}</button>` : ""}
      <button id="aw-menu-btn" aria-label="Menu" onclick="(function(){var m=document.getElementById('aw-mobile-menu');var open=m.style.display==='flex';m.style.display=open?'none':'flex';})()" style="display:none;background:none;border:none;cursor:pointer;padding:6px;color:#fff;line-height:1;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>
  <div id="aw-mobile-menu" style="display:none;flex-direction:column;padding:1rem 1.5rem;gap:0.25rem;border-top:1px solid rgba(255,255,255,0.1);">
    <a href="#about" onclick="document.getElementById('aw-mobile-menu').style.display='none'" class="mob-link" ${dUI("من نحن", "About", "nav_about")}>${MULTILANG_UI[primaryLang]?.nav_about || (isPrimaryAr ? "من نحن" : "About")}</a>
    <a href="#services" onclick="document.getElementById('aw-mobile-menu').style.display='none'" class="mob-link" ${dUI("خدماتنا", "Services", "nav_services")}>${MULTILANG_UI[primaryLang]?.nav_services || (isPrimaryAr ? "خدماتنا" : "Services")}</a>
    <a href="#gallery" onclick="document.getElementById('aw-mobile-menu').style.display='none'" class="mob-link" ${dUI("أعمالنا", "Gallery", "nav_gallery")}>${MULTILANG_UI[primaryLang]?.nav_gallery || (isPrimaryAr ? "أعمالنا" : "Gallery")}</a>
    <a href="#testimonials" onclick="document.getElementById('aw-mobile-menu').style.display='none'" class="mob-link" ${dUI("آراء العملاء", "Reviews", "nav_reviews")}>${MULTILANG_UI[primaryLang]?.nav_reviews || (isPrimaryAr ? "آراء العملاء" : "Reviews")}</a>
    <a href="#contact" onclick="document.getElementById('aw-mobile-menu').style.display='none'" class="mob-cta-link" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${initContent.cta_text}</a>
  </div>
</nav>

<!-- ===== HERO ===== -->
<section class="aw-hero">
  <div class="hero-bg-img" style="background-image:url('${config.hero_image}')"></div>
  <div class="hero-gradient"></div>
  <div class="hero-particles">
    <div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div>
  </div>
  <div class="aw-container hero-body">
    <div class="hero-badge" ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName)}>${initName}</div>
    <h1 class="hero-h1" ${dDyn(ar.hero_title, en.hero_title, e3?.content.hero_title)}>${initContent.hero_title}</h1>
    <p class="hero-sub" ${dDyn(ar.hero_subtitle, en.hero_subtitle, e3?.content.hero_subtitle)}>${initContent.hero_subtitle}</p>
    <div class="hero-actions">
      <a href="#contact" class="btn-glow" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${initContent.cta_text}</a>
      <a href="#services" class="btn-ghost" ${dUI("اكتشف المزيد", "Discover More", "discover")}>${MULTILANG_UI[primaryLang]?.discover || (isPrimaryAr ? "اكتشف المزيد" : "Discover More")}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
    </div>
  </div>
  <div class="hero-scroll-hint">
    <div class="scroll-dot"></div>
  </div>
</section>

<!-- ===== STATS ===== -->
<section class="aw-stats">
  <div class="aw-container stats-grid">
    ${statsHtml}
  </div>
</section>

<!-- ===== ABOUT ===== -->
<section id="about" class="aw-section">
  <div class="aw-container about-wrap">
    <div class="about-img-col" data-aos>
      <div class="about-img-frame">
        <img src="${config.about_image}" alt="${content.business_name_ar}" loading="lazy"/>
        <div class="about-exp-badge">
          <span class="exp-num">10+</span>
          <span class="exp-txt" ${dUI("سنة خبرة", "Years Exp.", "exp")}>سنة خبرة</span>
        </div>
      </div>
    </div>
    <div class="about-content" data-aos style="animation-delay:0.15s">
      <span class="eyebrow" ${dUI("من نحن", "About Us", "about_us_eyebrow")}>من نحن</span>
      <h2 class="sec-title" ${dDyn(ar.about_title, en.about_title, e3?.content.about_title)}>${ar.about_title}</h2>
      <div class="title-line"></div>
      <p class="about-para" ${dDyn(ar.about_text, en.about_text, e3?.content.about_text)}>${ar.about_text}</p>
      <div class="about-checks">
        <div class="check-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span ${dUI("جودة لا تُضاهى", "Unmatched Quality", "quality")}>جودة لا تُضاهى</span>
        </div>
        <div class="check-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span ${dUI("فريق محترف ومتخصص", "Professional Expert Team", "team")}>فريق محترف ومتخصص</span>
        </div>
        <div class="check-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span ${dUI("خدمة عملاء متميزة", "Outstanding Customer Service", "service")}>خدمة عملاء متميزة</span>
        </div>
      </div>
      <a href="#contact" class="btn-primary-solid" ${dUI("تواصل معنا", "Get In Touch", "about_cta")}>تواصل معنا</a>
    </div>
  </div>
</section>

<!-- ===== SERVICES ===== -->
<section id="services" class="aw-section bg-light">
  <div class="aw-container">
    <div class="sec-head" data-aos>
      <span class="eyebrow" ${dUI("خدماتنا", "Services", "services_eyebrow")}>خدماتنا</span>
      <h2 class="sec-title" ${dUI("ما نقدمه لك", "What We Offer", "services_title")}>ما نقدمه لك</h2>
      <div class="title-line center"></div>
      <p class="sec-sub" ${dUI("نقدم حلولاً متكاملة تلبي احتياجاتك وتتجاوز توقعاتك", "We provide comprehensive solutions that meet your needs and exceed your expectations", "services_sub")}>نقدم حلولاً متكاملة تلبي احتياجاتك وتتجاوز توقعاتك</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ===== GALLERY ===== -->
<section id="gallery" class="aw-section">
  <div class="aw-container">
    <div class="sec-head" data-aos>
      <span class="eyebrow" ${dUI("معرض الأعمال", "Portfolio", "gallery_eyebrow")}>معرض الأعمال</span>
      <h2 class="sec-title" ${dUI("أعمالنا المميزة", "Our Featured Work", "gallery_title")}>أعمالنا المميزة</h2>
      <div class="title-line center"></div>
    </div>
    <div class="gallery-grid">
      ${galleryHtml}
    </div>
  </div>
</section>

<!-- ===== CTA BAND ===== -->
<section class="cta-band" style="background:linear-gradient(135deg,${primary} 0%,${accent} 100%)">
  <div class="aw-container cta-inner" data-aos>
    <div>
      <h2 class="cta-h2" ${dUI("هل أنت مستعد للبدء؟", "Ready to Get Started?", "ready_title")}>هل أنت مستعد للبدء؟</h2>
      <p class="cta-p" ${dUI("تواصل معنا اليوم وابدأ رحلة نجاحك", "Contact us today and start your success journey", "ready_sub")}>تواصل معنا اليوم وابدأ رحلة نجاحك</p>
    </div>
    <a href="#contact" class="btn-white" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${ar.cta_text}</a>
  </div>
</section>

<!-- ===== TESTIMONIALS ===== -->
<section id="testimonials" class="aw-section testi-section">
  <div class="aw-container">
    <div class="sec-head" data-aos>
      <span class="eyebrow" style="color:${primary}" ${dUI("آراء العملاء", "Testimonials", "testi_eyebrow")}>آراء العملاء</span>
      <h2 class="sec-title" ${dUI("ماذا يقول عملاؤنا", "What Our Clients Say", "testi_title")}>ماذا يقول عملاؤنا</h2>
      <div class="title-line center"></div>
    </div>
    <div class="testi-grid">
      ${testimonialsHtml}
    </div>
  </div>
</section>

<!-- ===== CONTACT ===== -->
<section id="contact" class="aw-section contact-section">
  <div class="aw-container">
    <div class="contact-panel">

      <!-- LEFT: gradient info panel -->
      <div class="contact-info-panel" data-aos>
        <div class="cip-blob1"></div>
        <div class="cip-blob2"></div>
        <div class="cip-inner">
          <span class="cip-eyebrow" ${dUI("تواصل معنا", "Contact Us", "contact_eyebrow")}>تواصل معنا</span>
          <h2 class="cip-title" ${dUI("نسعد بخدمتك", "We'd Love to Help", "contact_title")}>نسعد بخدمتك</h2>
          <p class="cip-desc" ${dDyn(ar.contact_description, en.contact_description, e3?.content.contact_description)}>${ar.contact_description}</p>
          <div class="cip-details">
            ${content.phone ? `<div class="cip-row">
              <div class="cip-icon-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18.9a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.07 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div><div class="cip-row-label" ${dUI("الهاتف", "Phone", "phone_label")}>الهاتف</div><a href="tel:${content.phone}" class="cip-row-val" dir="ltr">${content.phone}</a></div>
            </div>` : ""}
            ${content.email ? `<div class="cip-row">
              <div class="cip-icon-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div><div class="cip-row-label" ${dUI("البريد", "Email", "email_label")}>البريد</div><a href="mailto:${content.email}" class="cip-row-val" dir="ltr">${content.email}</a></div>
            </div>` : ""}
            ${ar.address ? `<div class="cip-row">
              <div class="cip-icon-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div><div class="cip-row-label" ${dUI("العنوان", "Address", "address_label")}>العنوان</div><div class="cip-row-val" ${dDyn(ar.address, en.address, e3?.content.address)}>${ar.address}</div></div>
            </div>` : ""}
          </div>
          ${whatsappNum ? `<a href="https://wa.me/${whatsappNum}" target="_blank" rel="noreferrer noopener" class="wa-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            <span ${dUI("تواصل عبر واتساب", "WhatsApp Us", "wa")}>تواصل عبر واتساب</span>
          </a>` : ""}
        </div>
      </div>

      <!-- RIGHT: form card -->
      <div class="contact-form-card" data-aos style="animation-delay:0.18s">
        <div class="form-card-head">
          <h3 class="form-title" ${dUI("أرسل رسالتك", "Send a Message", "form_title")}>أرسل رسالتك</h3>
          <p class="form-subtitle" ${dUI("سنرد عليك في أقرب وقت", "We'll get back to you soon", "form_sub")}>سنرد عليك في أقرب وقت</p>
        </div>
        <form class="contact-form" onsubmit="var b=this.querySelector('.form-submit');var l=document.getElementById('aw-root').getAttribute('lang');b.textContent=l==='ar'?'تم الإرسال ✓':'Sent ✓';b.style.background='#10b981';b.style.boxShadow='0 8px 24px rgba(16,185,129,0.4)';event.preventDefault();">
          <div class="form-field-group">
            <label class="field-label" ${dUI("الاسم الكامل", "Full Name", "lbl_name")}>${MULTILANG_UI[primaryLang]?.form_name || "الاسم الكامل"}</label>
            <div class="fi-wrap">
              <span class="fi-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
              <input type="text" placeholder="${MULTILANG_UI[primaryLang]?.form_name || "الاسم الكامل"}" data-placeholder-ar="الاسم الكامل" data-placeholder-en="Full Name"${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_name || "Full Name")}"` : ""} class="form-inp fi-inp" required/>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-field-group">
              <label class="field-label" ${dUI("البريد الإلكتروني", "Email", "lbl_email")}>${MULTILANG_UI[primaryLang]?.form_email || "البريد الإلكتروني"}</label>
              <div class="fi-wrap">
                <span class="fi-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
                <input type="email" placeholder="${MULTILANG_UI[primaryLang]?.form_email || "البريد الإلكتروني"}" data-placeholder-ar="البريد الإلكتروني" data-placeholder-en="Email Address"${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_email || "Email Address")}"` : ""} class="form-inp fi-inp" required/>
              </div>
            </div>
            <div class="form-field-group">
              <label class="field-label" ${dUI("رقم الجوال", "Phone", "lbl_phone")}>${MULTILANG_UI[primaryLang]?.form_phone || "رقم الجوال"}</label>
              <div class="fi-wrap">
                <span class="fi-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.18z"/></svg></span>
                <input type="tel" placeholder="${MULTILANG_UI[primaryLang]?.form_phone || "رقم الجوال"}" data-placeholder-ar="رقم الجوال" data-placeholder-en="Phone Number"${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_phone || "Phone Number")}"` : ""} class="form-inp fi-inp" dir="ltr"/>
              </div>
            </div>
          </div>
          <div class="form-field-group">
            <label class="field-label" ${dUI("رسالتك", "Your Message", "lbl_msg")}>${MULTILANG_UI[primaryLang]?.form_msg?.replace("...","") || "رسالتك"}</label>
            <div class="fi-wrap fi-ta-wrap">
              <span class="fi-icon fi-icon-top"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
              <textarea placeholder="${MULTILANG_UI[primaryLang]?.form_msg || "رسالتك..."}" data-placeholder-ar="رسالتك..." data-placeholder-en="Your message..."${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_msg || "Your message...")}"` : ""} class="form-inp form-ta fi-inp" rows="4"></textarea>
            </div>
          </div>
          <button type="submit" class="form-submit" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${initContent.cta_text}</button>
        </form>
      </div>

    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="aw-footer">

  <!-- CTA Strip -->
  <div class="footer-cta-strip">
    <div class="footer-cta-strip-bg"></div>
    <div class="aw-container footer-cta-inner">
      <div class="fcta-text">
        <h3 class="fcta-title" ${dUI("هل أنت مستعد للبدء؟", "Ready to Get Started?", "ready_title")}>${MULTILANG_UI[primaryLang]?.ready_title || "هل أنت مستعد للبدء؟"}</h3>
        <p class="fcta-sub" ${dUI("تواصل معنا اليوم وابدأ رحلة نجاحك", "Contact us today and start your success journey", "ready_sub")}>${MULTILANG_UI[primaryLang]?.ready_sub || "تواصل معنا اليوم وابدأ رحلة نجاحك"}</p>
      </div>
      <a href="#contact" class="fcta-btn" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${initContent.cta_text}</a>
    </div>
  </div>

  <!-- Main Columns -->
  <div class="footer-main">
    <div class="aw-container footer-wrap">

      <div class="footer-brand-col">
        <span class="footer-logo" ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName)}>${content.business_name_ar}</span>
        <p class="footer-tagline" ${dDyn(ar.hero_subtitle.slice(0, 90), en.hero_subtitle.slice(0, 90), e3?.content.hero_subtitle?.slice(0, 90))}>${ar.hero_subtitle.slice(0, 90)}</p>
        <div class="footer-socials">
          ${content.phone ? `<a href="https://wa.me/${whatsappNum}" target="_blank" rel="noreferrer noopener" aria-label="WhatsApp" class="social-icon si-wa">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </a>` : ""}
          <a href="#" aria-label="Instagram" class="social-icon si-ig">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </a>
          <a href="#" aria-label="X / Twitter" class="social-icon si-x">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="TikTok" class="social-icon si-tt">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.28 8.28 0 0 0 4.83 1.54V6.84a4.84 4.84 0 0 1-1.06-.15z"/></svg>
          </a>
          <a href="#" aria-label="LinkedIn" class="social-icon si-li">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-links-col">
        <div class="fl-heading" ${dUI("روابط سريعة", "Quick Links", "quick_links")}>${MULTILANG_UI[primaryLang]?.quick_links || "روابط سريعة"}</div>
        <a href="#about" ${dUI("من نحن", "About", "nav_about")}>${MULTILANG_UI[primaryLang]?.nav_about || "من نحن"}</a>
        <a href="#services" ${dUI("خدماتنا", "Services", "nav_services")}>${MULTILANG_UI[primaryLang]?.nav_services || "خدماتنا"}</a>
        <a href="#gallery" ${dUI("أعمالنا", "Gallery", "nav_gallery")}>${MULTILANG_UI[primaryLang]?.nav_gallery || "أعمالنا"}</a>
        <a href="#testimonials" ${dUI("آراء العملاء", "Reviews", "nav_reviews")}>${MULTILANG_UI[primaryLang]?.nav_reviews || "آراء العملاء"}</a>
        <a href="#contact" ${dUI("تواصل معنا", "Contact", "nav_contact")}>${MULTILANG_UI[primaryLang]?.nav_contact || "تواصل"}</a>
      </div>

      <!-- Services Column (4th column) -->
      <div class="footer-services-col">
        <div class="fl-heading" ${dUI("خدماتنا", "Services", "nav_services")}>${MULTILANG_UI[primaryLang]?.nav_services || "خدماتنا"}</div>
        ${ar.services.slice(0, 4).map((svc, i) => `<a href="#services" ${dDyn(svc.title, en.services[i]?.title || svc.title, e3?.content.services[i]?.title)}>${svc.title}</a>`).join("\n        ")}
      </div>

      <div class="footer-contact-col">
        <div class="fl-heading" ${dUI("معلومات التواصل", "Get In Touch", "get_in_touch")}>${MULTILANG_UI[primaryLang]?.get_in_touch || "معلومات التواصل"}</div>
        ${content.phone ? `<div class="fc-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18.9a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.07 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <a href="tel:${content.phone}" dir="ltr">${content.phone}</a>
        </div>` : ""}
        ${content.email ? `<div class="fc-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <a href="mailto:${content.email}" dir="ltr">${content.email}</a>
        </div>` : ""}
        ${ar.address ? `<div class="fc-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span ${dDyn(ar.address, en.address, e3?.content.address)}>${ar.address}</span>
        </div>` : ""}
      </div>

    </div>
  </div>

  <!-- Footer Bottom -->
  <div class="footer-bottom">
    <div class="aw-container footer-bottom-inner">
      <p>© ${new Date().getFullYear()} <span ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName)}>${content.business_name_ar}</span>. <span ${dUI("جميع الحقوق محفوظة.", "All Rights Reserved.", "rights")}>${MULTILANG_UI[primaryLang]?.rights || "جميع الحقوق محفوظة."}</span></p>
      <p class="footer-powered">Powered by <a href="https://arabyweb.net" target="_blank" style="color:${accent};text-decoration:none;font-weight:700;">ArabyWeb</a></p>
    </div>
  </div>

</footer>

<!-- WhatsApp Float -->
${whatsappNum ? `<a href="https://wa.me/${whatsappNum}" target="_blank" rel="noreferrer noopener" style="position:fixed;bottom:1.75rem;left:1.75rem;z-index:999;background:#25D366;color:#fff;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(37,211,102,0.5);transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" aria-label="WhatsApp">
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
</a>` : ""}

</div>

<script>
(function(){
  // ===== SCROLL ANIMATIONS =====
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('aw-visible');observer.unobserve(e.target);}
    });
  },{threshold:0.12});
  document.querySelectorAll('[data-aos]').forEach(function(el){observer.observe(el);});

  // ===== NAVBAR SCROLL =====
  var nav = document.getElementById('aw-nav');
  window.addEventListener('scroll',function(){
    nav.classList.toggle('aw-nav-scrolled', window.scrollY > 60);
  },{passive:true});

  // ===== MULTILINGUAL CYCLING SWITCHER =====
  var AW_LANG_ORDER = ${JSON.stringify(langOrder)};
  var awLangIdx = 0;
  function awGetNextLabel(nextCode){
    return nextCode.toUpperCase();
  }
  function awApplyLang(lang){
    var root = document.getElementById('aw-root');
    var btn = document.getElementById('aw-lang-btn');
    var isAr = lang === 'ar';
    var dirVal = isAr ? 'rtl' : 'ltr';
    // Apply dir & lang to ALL root levels so CSS, bidi & layout all update
    document.documentElement.setAttribute('dir', dirVal);
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('dir', dirVal);
    if(root){ root.setAttribute('dir', dirVal); root.setAttribute('lang', lang); }
    var nextCode = AW_LANG_ORDER[(awLangIdx + 1) % AW_LANG_ORDER.length];
    if(btn) btn.textContent = awGetNextLabel(nextCode);
    // Switch all translatable text elements
    document.querySelectorAll('[data-ar]').forEach(function(el){
      var val = el.getAttribute('data-' + lang) || el.getAttribute('data-ar');
      if(val !== null) el.textContent = val;
    });
    // Switch placeholders
    document.querySelectorAll('[data-placeholder-ar]').forEach(function(el){
      var val = el.getAttribute('data-placeholder-' + lang) || el.getAttribute('data-placeholder-en');
      if(val) el.placeholder = val;
    });
    // Switch fonts
    document.body.style.fontFamily = isAr ? "${fontBodyAr}" : "${fontBodyEn}";
    document.querySelectorAll('.hero-h1,.sec-title,.cta-h2,.form-title,.aw-brand,.footer-logo,.service-card h3,.stat-num').forEach(function(el){
      el.style.fontFamily = isAr ? "${fontHeadingAr}" : "${fontHeadingEn}";
    });
    // Fix WhatsApp float button position for LTR/RTL
    var waBtn = document.getElementById('aw-whatsapp-btn');
    if(waBtn){ waBtn.style.left = isAr ? '1.75rem' : ''; waBtn.style.right = isAr ? '' : '1.75rem'; }
  }
  window.awCycleLang = function(){
    awLangIdx = (awLangIdx + 1) % AW_LANG_ORDER.length;
    awApplyLang(AW_LANG_ORDER[awLangIdx]);
  };
  // Initialize to primary language on page load (no-op if already ar)
  ${primaryLang !== "ar" ? `awLangIdx = ${langOrder.indexOf(primaryLang)}; awApplyLang('${primaryLang}');` : ""}
  // Keep legacy alias for any existing calls
  window.awToggleLang = window.awCycleLang;
})();
</script>`;

  // ── Quality Check ──────────────────────────────────────────
  const qr = runQualityCheck({
    ar: content.ar,
    primary_color: primary,
    accent_color: accent,
    testimonials: content.testimonials,
  });
  if (!qr.passed) {
    console.warn(`[DesignSystem] Quality check FAILED (score=${qr.score}/100):`, qr.issues);
  } else {
    console.log(`[DesignSystem] Quality check PASSED (score=${qr.score}/100)`, qr.warnings.length ? `Warnings: ${qr.warnings.join("; ")}` : "");
  }

  // ── Design System Token Snapshot (for CSS vars) ──────────
  const DS = {
    containerMax:  LAYOUT.containerMax,
    sectionPadV:   LAYOUT.sectionPadV,
    cardGap:       LAYOUT.cardGap,
    cardRadius:    TOKENS.radius.card,
    btnRadius:     TOKENS.radius.button,
    shadowCard:    TOKENS.shadow.card,
    easeSpring:    TOKENS.ease.spring,
  };

  const css = `
${fontImport}

/* ═══════════════════════════════════════════════════════════
   ArabyWeb Design System CSS
   Container: ${DS.containerMax} | Section Padding: ${DS.sectionPadV}
   Card Radius: ${DS.cardRadius} | Button Radius: ${DS.btnRadius}
   Card Gap: ${DS.cardGap}
═══════════════════════════════════════════════════════════ */

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{font-family:${fontBody};color:#0f172a;background:#fff;overflow-x:hidden;}
a{text-decoration:none;color:inherit;}
img{max-width:100%;display:block;object-fit:cover;}
input,textarea,select,button{font:inherit;}
.aw-site{position:relative;}

/* === ANIMATIONS === */
@keyframes fadeUp{from{opacity:0;transform:translateY(50px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 8px 30px ${primary}60;}50%{transform:scale(1.03);box-shadow:0 12px 40px ${primary}80;}}
@keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(40px,-50px) scale(1.04);}66%{transform:translate(-30px,30px) scale(0.96);}}
@keyframes shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}
@keyframes scrollBounce{0%,100%{transform:translateY(0);opacity:1;}60%{transform:translateY(10px);opacity:0.3;}}
@keyframes dotPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.6;transform:scale(0.85);}}

[data-aos]{opacity:0;transform:translateY(30px);transition:opacity 0.65s cubic-bezier(.22,1,.36,1),transform 0.65s cubic-bezier(.22,1,.36,1);}
[data-aos].aw-visible{opacity:1;transform:translateY(0);}

.aw-container{max-width:1200px;margin:0 auto;padding:0 1.5rem;}

/* ═══ NAVBAR ═══ */
.aw-nav{position:fixed;top:0;inset-inline:0;z-index:1000;background:rgba(5,8,22,0.72);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.08);transition:background 0.4s,box-shadow 0.4s;}
.aw-nav.aw-nav-scrolled{background:rgba(5,8,22,0.97)!important;box-shadow:0 4px 40px rgba(0,0,0,0.5);}
.aw-nav-inner{max-width:1200px;margin:0 auto;padding:1.05rem 1.5rem;display:flex;align-items:center;justify-content:space-between;}
.aw-brand-group{display:flex;align-items:center;gap:0.65rem;isolation:auto;}
.aw-brand-group img{height:40px;width:auto;object-fit:contain;flex-shrink:0;border-radius:8px;}
.aw-auto-icon{width:40px;height:40px;background:linear-gradient(135deg,${primary},${accent});border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.05rem;flex-shrink:0;box-shadow:0 4px 14px ${primary}60;}
.aw-brand-group.aw-logo-mode .aw-brand{display:none!important;}
.aw-brand-group.aw-logo-mode .aw-auto-icon{display:none!important;}
.aw-brand{font-family:${fontHeading};font-size:1.45rem;font-weight:900;background:linear-gradient(135deg,#fff 20%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;letter-spacing:-0.02em;}
.aw-nav-links{display:flex;align-items:center;gap:1.75rem;}
.aw-nav-links a{font-size:0.88rem;font-weight:500;color:rgba(255,255,255,0.72);transition:color 0.2s;position:relative;padding-bottom:2px;}
.aw-nav-links a::after{content:'';position:absolute;bottom:-2px;inset-inline-start:0;width:0;height:1.5px;background:linear-gradient(90deg,${primary},${accent});border-radius:1px;transition:width 0.3s cubic-bezier(.22,1,.36,1);}
.aw-nav-links a:hover{color:#fff;}
.aw-nav-links a:hover::after{width:100%;}
.aw-nav-cta{background:linear-gradient(135deg,${primary},${accent})!important;color:#fff!important;padding:0.5rem 1.4rem;border-radius:10px;font-weight:600!important;transition:transform 0.2s ease,box-shadow 0.2s ease,opacity 0.2s!important;box-shadow:0 4px 12px rgba(0,0,0,0.15),0 1px 3px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.15);letter-spacing:0.01em;}
.aw-nav-cta::after{display:none!important;}
.aw-nav-cta:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px ${primary}65,0 3px 6px rgba(0,0,0,0.12)!important;}
.aw-nav-cta:active{transform:translateY(1px)!important;}
#aw-mobile-menu{background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.08);}
.mob-link{display:block;padding:0.9rem 0;font-size:1rem;font-weight:500;color:rgba(255,255,255,0.75);border-bottom:1px solid rgba(255,255,255,0.06);transition:color 0.2s,padding-inline-start 0.2s;}
.mob-link:hover{color:#fff;padding-inline-start:0.5rem;}
.mob-cta-link{display:block;margin-top:0.9rem;padding:14px 26px;background:linear-gradient(135deg,${primary},${accent});color:#fff!important;border-radius:12px;font-weight:600;text-align:center;box-shadow:0 6px 16px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.2s ease,box-shadow 0.2s ease;}

/* ═══ HERO ═══ */
.aw-hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;}
.hero-bg-img{position:absolute;inset:0;background-size:cover;background-position:center;background-attachment:fixed;}
.hero-gradient{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.90) 0%,rgba(0,0,0,0.60) 55%,rgba(0,0,0,0.35) 100%);}
/* Animated glow orbs */
.hero-particles{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;}
.particle{position:absolute;border-radius:50%;filter:blur(70px);animation:orbFloat var(--dur,12s) ease-in-out infinite;}
.p1{width:600px;height:600px;background:${primary};opacity:0.28;top:-150px;${dir==="rtl"?"left:-150px":"right:-150px"};--dur:14s;}
.p2{width:450px;height:450px;background:${accent};opacity:0.22;bottom:-80px;${dir==="rtl"?"right:-80px":"left:-80px"};--dur:18s;animation-direction:reverse;}
.p3{width:280px;height:280px;background:${primary};opacity:0.14;top:40%;${dir==="rtl"?"right:30%":"left:30%"};--dur:22s;animation-delay:-6s;}
.hero-body{position:relative;z-index:2;padding:8rem 1.5rem 4rem;animation:fadeUp 0.9s cubic-bezier(.22,1,.36,1);}
.hero-badge{display:inline-flex;align-items:center;gap:0.6rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(12px);color:rgba(255,255,255,0.92);padding:0.4rem 1.1rem;border-radius:2rem;font-size:0.8rem;font-weight:700;letter-spacing:2px;margin-bottom:1.75rem;text-transform:uppercase;}
.hero-badge::before{content:'';width:7px;height:7px;border-radius:50%;background:${accent};display:inline-block;animation:dotPulse 2s ease-in-out infinite;flex-shrink:0;}
.hero-h1{font-family:${fontHeading};font-size:clamp(2.7rem,6.5vw,5.2rem);font-weight:900;color:#fff;line-height:1.1;margin-bottom:1.5rem;max-width:820px;letter-spacing:-0.025em;}
.hero-sub{font-size:1.15rem;color:rgba(255,255,255,0.68);max-width:560px;line-height:1.85;margin-bottom:3rem;}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap;}
.btn-glow{display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:14px 28px;border-radius:12px;font-weight:600;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.2s ease,box-shadow 0.2s ease;}
.btn-glow:hover{transform:translateY(-2px);box-shadow:0 12px 28px ${primary}55,0 4px 8px rgba(0,0,0,0.15);}
.btn-glow:active{transform:translateY(1px);box-shadow:0 4px 12px ${primary}40;}
.btn-ghost{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.28);color:#fff;padding:14px 24px;border-radius:12px;font-weight:600;font-size:1rem;backdrop-filter:blur(10px);transition:transform 0.2s ease,box-shadow 0.2s ease,background 0.2s ease,border-color 0.2s ease;}
.btn-ghost:hover{background:rgba(255,255,255,0.14);border-color:rgba(255,255,255,0.5);transform:translateY(-2px);}
.btn-ghost:active{transform:translateY(1px);}
.hero-scroll-hint{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);z-index:2;}
.scroll-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.45);animation:scrollBounce 2s ease infinite;}

/* ═══ STATS ═══ */
.aw-stats{background:linear-gradient(160deg,${dark} 0%,#0a1628 100%);padding:3.5rem 0;position:relative;overflow:hidden;}
.aw-stats::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,${primary}18 0%,transparent 70%);pointer-events:none;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative;}
.stat-item{padding:2.25rem 1.5rem;text-align:center;border-inline-end:1px solid rgba(255,255,255,0.06);}
.stat-item:last-child{border-inline-end:none;}
.stat-num{display:block;font-family:${fontHeading};font-size:3.1rem;font-weight:900;color:${primary};line-height:1;}
.stat-label{display:block;color:rgba(255,255,255,0.45);font-size:0.85rem;margin-top:0.6rem;font-weight:500;text-transform:uppercase;letter-spacing:1.5px;}

/* ═══ SECTIONS ═══ */
.aw-section{padding:6rem 0;}
.bg-light{background:linear-gradient(160deg,#f4f7ff 0%,#f8fafc 60%,#f0f4ff 100%);}
.bg-dark{background:linear-gradient(160deg,${dark} 0%,#0a1628 100%);}
.sec-head{text-align:center;margin-bottom:4rem;}
.eyebrow{display:inline-flex;align-items:center;gap:0.6rem;font-size:0.77rem;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:${primary};margin-bottom:0.85rem;}
.eyebrow::before,.eyebrow::after{content:'';display:inline-block;width:18px;height:1.5px;background:${primary};border-radius:1px;opacity:0.7;}
.sec-title{font-family:${fontHeading};font-size:clamp(1.9rem,3.6vw,2.9rem);font-weight:900;color:#0f172a;margin-top:0.5rem;line-height:1.18;letter-spacing:-0.02em;}
.bg-dark .sec-title{color:#fff;}
.title-line{width:56px;height:3.5px;background:linear-gradient(90deg,${primary},${accent});border-radius:3px;margin-top:1.2rem;}
.title-line.center{margin-inline:auto;}
.sec-sub{color:#64748b;font-size:1.03rem;max-width:600px;margin:1.25rem auto 0;line-height:1.85;}

/* ═══ ABOUT ═══ */
.about-wrap{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;}
.about-img-frame{position:relative;border-radius:1.75rem;overflow:visible;}
.about-img-frame::before{content:'';position:absolute;inset:-14px;border-radius:2rem;background:linear-gradient(135deg,${primary}25,${accent}18);z-index:-1;}
.about-img-frame::after{content:'';position:absolute;inset:-2px;border-radius:1.85rem;background:linear-gradient(135deg,${primary}40,transparent 50%,${accent}30);z-index:-1;}
.about-img-frame img{width:100%;height:480px;border-radius:1.75rem;box-shadow:0 30px 80px rgba(0,0,0,0.18);object-fit:cover;}
.about-exp-badge{position:absolute;bottom:-2rem;${dir==="rtl"?"right:-2rem":"left:-2rem"};background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:1.5rem;border-radius:1.25rem;text-align:center;box-shadow:0 12px 40px ${primary}55;min-width:115px;}
.exp-num{display:block;font-family:${fontHeading};font-size:2.5rem;font-weight:900;line-height:1;}
.exp-txt{display:block;font-size:0.78rem;font-weight:700;opacity:0.9;margin-top:0.25rem;text-transform:uppercase;letter-spacing:1px;}
.about-para{color:#475569;font-size:1.03rem;line-height:1.95;margin:1.25rem 0 2rem;}
.about-checks{display:flex;flex-direction:column;gap:0.85rem;margin-bottom:2.5rem;}
.check-item{display:flex;align-items:center;gap:0.75rem;font-size:0.95rem;font-weight:600;color:#334155;}
.btn-primary-solid{display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:14px 28px;border-radius:12px;font-weight:600;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.2s ease,box-shadow 0.2s ease;}
.btn-primary-solid:hover{transform:translateY(-2px);box-shadow:0 12px 28px ${primary}55,0 4px 8px rgba(0,0,0,0.15);}
.btn-primary-solid:active{transform:translateY(1px);}

/* ═══ SERVICES ═══ */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
.service-card{
  background:linear-gradient(#fff,#fff) padding-box,
  linear-gradient(135deg,${primary}35,transparent 50%,${accent}25) border-box;
  border:1.5px solid transparent;
  border-radius:1.75rem;padding:2.5rem;transition:transform 0.35s cubic-bezier(.22,1,.36,1),box-shadow 0.35s;
  position:relative;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.05);
}
.service-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${primary}06,${accent}04);opacity:0;transition:opacity 0.35s;border-radius:1.75rem;}
.service-card:hover{
  transform:translateY(-12px);
  box-shadow:0 32px 72px rgba(0,0,0,0.14);
  background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,${primary},${accent}) border-box;
}
.service-card:hover::before{opacity:1;}
.service-icon-wrap{width:70px;height:70px;background:linear-gradient(135deg,${primary}18,${accent}12);border-radius:1.25rem;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;transition:all 0.35s;position:relative;}
.service-icon-wrap svg{width:32px;height:32px;color:${primary};transition:all 0.35s;flex-shrink:0;}
.service-card:hover .service-icon-wrap{transform:scale(1.12) rotate(-6deg);background:linear-gradient(135deg,${primary},${accent});box-shadow:0 10px 25px ${primary}45;}
.service-card:hover .service-icon-wrap svg{color:#fff;}
.service-card h3{font-family:${fontHeading};font-size:1.15rem;font-weight:800;color:#0f172a;margin-bottom:0.75rem;letter-spacing:-0.01em;}
.service-card p{color:#64748b;line-height:1.78;font-size:0.94rem;}

/* ═══ GALLERY ═══ */
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.gallery-item{position:relative;border-radius:1.25rem;overflow:hidden;aspect-ratio:4/3;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
.gallery-item img{width:100%;height:100%;transition:transform 0.55s cubic-bezier(.22,1,.36,1);object-fit:cover;}
.gallery-overlay{position:absolute;inset:0;background:linear-gradient(135deg,${primary}92,${accent}75);opacity:0;transition:opacity 0.4s;display:flex;align-items:center;justify-content:center;}
.gallery-overlay::after{content:'\f06e';font-family:'Font Awesome 6 Free';font-weight:900;color:#fff;font-size:2rem;transform:scale(0.5) translateY(10px);transition:transform 0.4s cubic-bezier(.22,1,.36,1),opacity 0.3s;opacity:0;}
.gallery-item:hover img{transform:scale(1.1);}
.gallery-item:hover .gallery-overlay{opacity:1;}
.gallery-item:hover .gallery-overlay::after{transform:scale(1) translateY(0);opacity:1;}

/* ═══ CTA BAND ═══ */
.cta-band{padding:5rem 0;position:relative;overflow:hidden;}
.cta-band::before{content:'';position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,0.06);top:-200px;${dir==="rtl"?"left:-150px":"right:-150px"};pointer-events:none;}
.cta-inner{display:flex;align-items:center;justify-content:space-between;gap:2rem;flex-wrap:wrap;position:relative;}
.cta-h2{font-family:${fontHeading};font-size:2.1rem;font-weight:900;color:#fff;margin-bottom:0.5rem;line-height:1.2;letter-spacing:-0.02em;}
.cta-p{color:rgba(255,255,255,0.78);font-size:1.03rem;}
.btn-white{display:inline-flex;align-items:center;gap:0.5rem;background:#fff;color:${primary};padding:14px 28px;border-radius:12px;font-weight:700;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.9);transition:transform 0.2s ease,box-shadow 0.2s ease;white-space:nowrap;}
.btn-white:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,0.25),0 4px 8px rgba(0,0,0,0.12);}
.btn-white:active{transform:translateY(1px);}

/* ═══ TESTIMONIALS — Light Card Design ═══ */
.testi-section{background:linear-gradient(175deg,#f8faff 0%,#eef2ff 100%);position:relative;overflow:hidden;}
.testi-section::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,${primary}09 0%,transparent 70%);top:-160px;${dir==="rtl"?"right:-160px":"left:-160px"};pointer-events:none;}
.testi-section .sec-title{color:#0f172a;}
.testi-section .eyebrow{color:${primary}!important;}
.testi-section .title-line{background:linear-gradient(90deg,${primary},${accent});}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.75rem;}
.testi-card{
  background:#fff;
  border:1px solid rgba(0,0,0,0.05);
  border-radius:1.75rem;
  padding:2.25rem;
  box-shadow:0 2px 8px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.05);
  display:flex;flex-direction:column;
  transition:transform 0.35s cubic-bezier(.22,1,.36,1),box-shadow 0.35s;
  position:relative;overflow:hidden;
}
.testi-card::before{content:'';position:absolute;top:0;${dir==="rtl"?"right":"left"}:0;width:100%;height:3px;background:linear-gradient(90deg,${primary},${accent});}
.testi-card:hover{transform:translateY(-6px);box-shadow:0 8px 30px rgba(0,0,0,0.07),0 20px 60px rgba(0,0,0,0.07);}
.testi-quote-mark{font-size:4.5rem;line-height:0.9;color:${primary};opacity:0.12;font-family:Georgia,serif;font-weight:900;display:block;margin-bottom:0.5rem;user-select:none;}
.testi-text{color:#475569;font-size:0.97rem;line-height:1.95;flex:1;margin-bottom:1.5rem;}
.testi-footer{display:flex;align-items:center;gap:0.9rem;padding-top:1.25rem;border-top:1px solid #f1f5f9;}
.testi-avatar{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,${primary},${accent});color:#fff;display:flex;align-items:center;justify-content:center;font-family:${fontHeading};font-size:1.15rem;font-weight:900;flex-shrink:0;box-shadow:0 4px 14px ${primary}40;}
.testi-info{flex:1;min-width:0;}
.testi-name{color:#1e293b;font-weight:700;font-size:0.95rem;letter-spacing:-0.01em;}
.testi-role{color:${primary};font-size:0.78rem;font-weight:600;margin-top:0.18rem;opacity:0.85;}
.testi-stars{display:flex;gap:2px;flex-shrink:0;margin-bottom:0;margin-inline-start:auto;}

/* ═══ CONTACT ═══ */
.contact-section{background:linear-gradient(160deg,#f0f4ff 0%,#f8fafb 100%);padding:6rem 0!important;}
.contact-panel{display:grid;grid-template-columns:1fr 1.25fr;gap:0;border-radius:2.5rem;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.12);}
/* --- Left Info Panel --- */
.contact-info-panel{
  background:linear-gradient(160deg,${primary} 0%,${accent} 100%);
  padding:3.5rem;
  position:relative;
  overflow:hidden;
  display:flex;align-items:stretch;
}
.cip-blob1{position:absolute;width:360px;height:360px;border-radius:50%;background:rgba(255,255,255,0.08);top:-120px;${dir==="rtl"?"right:-120px":"left:-120px"};pointer-events:none;}
.cip-blob2{position:absolute;width:250px;height:250px;border-radius:50%;background:rgba(255,255,255,0.06);bottom:-80px;${dir==="rtl"?"left:-60px":"right:-60px"};pointer-events:none;}
.cip-inner{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;}
.cip-eyebrow{font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.65);margin-bottom:0.85rem;display:block;}
.cip-title{font-family:${fontHeading};font-size:2rem;font-weight:900;color:#fff;line-height:1.2;letter-spacing:-0.02em;margin-bottom:1rem;}
.cip-desc{color:rgba(255,255,255,0.75);font-size:0.95rem;line-height:1.85;margin-bottom:2rem;flex:1;}
.cip-details{display:flex;flex-direction:column;gap:0;}
.cip-row{display:flex;align-items:flex-start;gap:1rem;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,0.12);}
.cip-row:last-child{border-bottom:none;}
.cip-icon-box{width:40px;height:40px;border-radius:0.75rem;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;}
.cip-row-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.55);margin-bottom:0.2rem;}
.cip-row-val{color:#fff;font-size:0.95rem;font-weight:600;text-decoration:none;transition:opacity 0.2s;}
.cip-row-val:hover{opacity:0.8;}
.wa-btn{display:inline-flex;align-items:center;gap:0.75rem;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.35);color:#fff;padding:0.9rem 1.75rem;border-radius:3rem;font-weight:700;font-size:0.95rem;margin-top:2rem;transition:all 0.3s;cursor:pointer;}
.wa-btn:hover{background:#25D366;border-color:#25D366;box-shadow:0 12px 32px rgba(37,211,102,0.45);transform:translateY(-2px);}
/* --- Right Form Card --- */
.contact-form-card{background:#fff;padding:3.5rem;display:flex;flex-direction:column;}
.form-card-head{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:2px solid #f1f5f9;}
.form-title{font-family:${fontHeading};font-size:1.6rem;font-weight:900;color:#0f172a;margin-bottom:0.35rem;letter-spacing:-0.02em;}
.form-subtitle{color:#94a3b8;font-size:0.9rem;}
.contact-form{display:flex;flex-direction:column;gap:0;flex:1;}
.form-field-group{margin-bottom:1.25rem;}
.field-label{display:block;font-size:0.82rem;font-weight:700;color:#475569;margin-bottom:0.5rem;letter-spacing:0.3px;}
.form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:0;}
.form-row-2 .form-field-group{margin-bottom:1.25rem;}
.fi-wrap{position:relative;}
.fi-icon{position:absolute;top:50%;transform:translateY(-50%);inset-inline-start:14px;color:#94a3b8;pointer-events:none;display:flex;align-items:center;line-height:0;transition:color 0.2s;}
.fi-icon-top{top:15px;transform:none;}
.fi-wrap:focus-within .fi-icon{color:${primary};}
.form-inp{width:100%;padding:0.85rem 1rem;border:2px solid #e8eef8;border-radius:0.75rem;font-size:0.95rem;color:#1e293b;background:#fff;transition:border-color 0.25s,box-shadow 0.25s;outline:none;}
.form-inp:focus{border-color:${primary};box-shadow:0 0 0 4px ${primary}15;}
.fi-inp{padding-inline-start:40px!important;}
.form-ta{resize:vertical;min-height:110px;display:block;}
.form-submit{width:100%;padding:1rem 2rem;background:linear-gradient(135deg,${primary} 0%,${accent} 100%);color:#fff;border:none;border-radius:0.85rem;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 8px 24px ${primary}40,inset 0 1px 0 rgba(255,255,255,0.2);transition:transform 0.2s,box-shadow 0.2s;letter-spacing:0.3px;margin-top:0.5rem;}
.form-submit:hover{transform:translateY(-2px);box-shadow:0 16px 36px ${primary}55,inset 0 1px 0 rgba(255,255,255,0.2);}
.form-submit:active{transform:translateY(1px);}

/* ═══ FOOTER ═══ */
.aw-footer{background:linear-gradient(175deg,${dark} 0%,#050c1a 100%);position:relative;overflow:hidden;}
.aw-footer::after{content:'';position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,${primary}0d 0%,transparent 65%);bottom:-400px;${dir==="rtl"?"left:-200px":"right:-200px"};pointer-events:none;}

/* --- Footer CTA Strip --- */
.footer-cta-strip{position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.06);}
.footer-cta-strip-bg{position:absolute;inset:0;background:linear-gradient(135deg,${primary}22 0%,${accent}18 100%);pointer-events:none;}
.footer-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:3.5rem 0;flex-wrap:wrap;position:relative;z-index:1;}
.fcta-text{flex:1;min-width:200px;}
.fcta-title{font-family:${fontHeading};font-size:1.65rem;font-weight:900;color:#fff;letter-spacing:-0.02em;margin-bottom:0.4rem;}
.fcta-sub{color:rgba(255,255,255,0.55);font-size:0.95rem;}
.fcta-btn{display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:0.9rem 2.25rem;border-radius:12px;font-weight:700;font-size:1rem;white-space:nowrap;box-shadow:0 8px 24px ${primary}45,inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.25s,box-shadow 0.25s;flex-shrink:0;}
.fcta-btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px ${primary}60,inset 0 1px 0 rgba(255,255,255,0.15);}

/* --- Footer Main --- */
.footer-main{padding:4rem 0 3rem;}
.footer-wrap{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:3rem;}
.footer-services-col{display:flex;flex-direction:column;gap:0.85rem;}
.footer-services-col a{color:rgba(255,255,255,0.4);font-size:0.9rem;transition:color 0.2s,padding-inline-start 0.2s;display:inline-flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
.footer-services-col a::before{content:'›';margin-inline-end:0.5rem;color:${accent};font-weight:700;opacity:0.7;}
.footer-services-col a:hover{color:#fff;padding-inline-start:0.25rem;}
.footer-logo{font-family:${fontHeading};font-size:1.65rem;font-weight:900;background:linear-gradient(135deg,#fff 20%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.02em;display:block;margin-bottom:0.9rem;}
.footer-tagline{color:rgba(255,255,255,0.38);font-size:0.9rem;line-height:1.8;max-width:270px;margin-bottom:1.75rem;}
.footer-socials{display:flex;align-items:center;gap:0.65rem;flex-wrap:wrap;}
.social-icon{width:40px;height:40px;border-radius:0.65rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.09);color:rgba(255,255,255,0.45);display:flex;align-items:center;justify-content:center;transition:all 0.28s;}
.social-icon:hover{border-color:transparent;color:#fff;transform:translateY(-3px);}
.si-wa:hover{background:#25D366;box-shadow:0 8px 20px rgba(37,211,102,0.35);}
.si-ig:hover{background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);box-shadow:0 8px 20px rgba(220,39,67,0.35);}
.si-x:hover{background:#000;box-shadow:0 8px 20px rgba(0,0,0,0.4);}
.si-tt:hover{background:#000;box-shadow:0 8px 20px rgba(0,0,0,0.4);}
.si-li:hover{background:#0077b5;box-shadow:0 8px 20px rgba(0,119,181,0.35);}
.fl-heading{font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:${accent};margin-bottom:1.5rem;}
.footer-links-col,.footer-contact-col{display:flex;flex-direction:column;gap:0.85rem;}
.footer-links-col a{color:rgba(255,255,255,0.4);font-size:0.9rem;transition:color 0.2s,padding-inline-start 0.2s;display:inline-flex;align-items:center;}
.footer-links-col a:hover{color:#fff;padding-inline-start:0.35rem;}
.fc-row{display:flex;align-items:center;gap:0.7rem;color:rgba(255,255,255,0.4);font-size:0.9rem;}
.fc-row svg{flex-shrink:0;opacity:0.55;}
.fc-row a,.fc-row span{color:rgba(255,255,255,0.4);transition:color 0.2s;}
.fc-row a:hover{color:rgba(255,255,255,0.9);}

/* --- Footer Bottom --- */
.footer-bottom{border-top:1px solid rgba(255,255,255,0.06);padding:1.5rem 0;}
.footer-bottom-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;}
.footer-bottom p,.footer-powered{color:rgba(255,255,255,0.2);font-size:0.82rem;}
.footer-powered{color:rgba(255,255,255,0.18)!important;font-size:0.78rem!important;}

/* ════ DESIGN SYSTEM: Unified Button System ════ */
${buildButtonCSS(primary, accent, fontBody)}

/* ── Button aliases (legacy classes → design system) ── */
.btn-glow,.btn-primary-solid,.mob-cta-link{--_p:${primary};--_a:${accent};}
.btn-glow,.btn-primary-solid{display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:14px 28px;border-radius:12px;font-weight:600;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.25s cubic-bezier(.22,1,.36,1),box-shadow 0.25s ease;}
.btn-glow:hover,.btn-primary-solid:hover{transform:translateY(-2px);box-shadow:0 12px 28px ${primary}55,0 4px 8px rgba(0,0,0,0.15);}
.btn-glow:active,.btn-primary-solid:active{transform:translateY(1px);}
.btn-ghost{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.28);color:#fff;padding:14px 24px;border-radius:12px;font-weight:600;font-size:1rem;backdrop-filter:blur(10px);transition:transform 0.25s cubic-bezier(.22,1,.36,1),box-shadow 0.25s,background 0.2s,border-color 0.2s;}
.btn-ghost:hover{background:rgba(255,255,255,0.14);border-color:rgba(255,255,255,0.5);transform:translateY(-2px);}
.btn-ghost:active{transform:translateY(1px);}
.btn-white{display:inline-flex;align-items:center;gap:0.5rem;background:#fff;color:${primary};padding:14px 28px;border-radius:12px;font-weight:700;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.08);transition:transform 0.25s cubic-bezier(.22,1,.36,1),box-shadow 0.25s;white-space:nowrap;}
.btn-white:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,0.25);}
.btn-white:active{transform:translateY(1px);}

/* ════ DESIGN SYSTEM: Icon System ════ */
/* Icons use inline SVG — no external CDN required */
/* Service card icons are MANDATORY (quality check validates presence) */
.service-icon-wrap svg{width:32px;height:32px;color:${primary};stroke:${primary};fill:none;transition:all 0.35s;flex-shrink:0;}
.service-icon-wrap svg[fill="currentColor"]{fill:${primary};stroke:none;}
.service-card:hover .service-icon-wrap svg{color:#fff;stroke:#fff;fill:none;}
.service-card:hover .service-icon-wrap svg[fill="currentColor"]{fill:#fff;stroke:none;}

/* ════ DESIGN SYSTEM: Layout Constraints ════ */
/* Container max: ${LAYOUT.containerMax} | Section V-pad: ${LAYOUT.sectionPadV} */
/* Card grid gap: ${LAYOUT.cardGap} | Card radius: ${TOKENS.radius.card} */

/* ═══ RESPONSIVE ═══ */
@media(max-width:1024px){
  .services-grid{grid-template-columns:repeat(2,1fr);}
  .testi-grid{grid-template-columns:repeat(2,1fr);}
  .footer-wrap{grid-template-columns:1fr 1fr;gap:2rem;}
  .footer-brand-col{grid-column:1/-1;}
  .about-wrap{gap:3rem;}
  .contact-panel{grid-template-columns:1fr 1.1fr;}
  .contact-info-panel{padding:2.75rem 2.5rem;}
  .contact-form-card{padding:2.75rem 2.5rem;}
}
@media(max-width:768px){
  .aw-nav-links{display:none!important;}
  #aw-menu-btn{display:block!important;}
  .hero-bg-img{background-attachment:scroll!important;}
  .p1,.p2,.p3{filter:blur(50px);}
  .hero-body{padding:7rem 1.5rem 3.5rem;}
  .hero-h1{font-size:2.25rem;letter-spacing:-0.01em;}
  .hero-sub{font-size:0.97rem;}
  .hero-actions{flex-direction:column;align-items:flex-start;}
  .stats-grid{grid-template-columns:repeat(2,1fr);}
  .stat-item{border-inline-end:none;border-bottom:1px solid rgba(255,255,255,0.07);}
  .about-wrap{grid-template-columns:1fr;gap:3rem;}
  .about-img-frame img{height:300px;}
  .about-exp-badge{${dir==="rtl"?"right:1rem":"left:1rem"};bottom:-1.25rem;}
  .services-grid{grid-template-columns:1fr;}
  .gallery-grid{grid-template-columns:repeat(2,1fr);}
  .cta-inner{flex-direction:column;text-align:center;}
  .testi-grid{grid-template-columns:1fr;}
  .contact-panel{grid-template-columns:1fr;border-radius:2rem;}
  .contact-info-panel{padding:2.5rem 2rem;}
  .cip-title{font-size:1.6rem;}
  .contact-form-card{padding:2rem;}
  .form-row-2{grid-template-columns:1fr;}
  .footer-wrap{grid-template-columns:1fr;gap:2rem;}
  .footer-cta-inner{flex-direction:column;gap:1.5rem;}
  .fcta-title{font-size:1.35rem;}
  .fcta-btn{width:100%;justify-content:center;}
  .footer-main{padding:3rem 0 2rem;}
  .aw-section{padding:4.5rem 0;}
  .contact-section{padding:4rem 0!important;}
}
@media(max-width:480px){
  .gallery-grid{grid-template-columns:1fr;}
  .stats-grid{grid-template-columns:1fr 1fr;}
  .hero-h1{font-size:1.95rem;}
  .stat-num{font-size:2.5rem;}
  .sec-title{font-size:1.75rem;}
  .contact-info-panel{padding:2rem 1.5rem;}
  .contact-form-card{padding:1.75rem 1.5rem;}
  .fcta-title{font-size:1.2rem;}
}
`;

  // ── Page Structure Validation ──────────────────────────────
  const structureReport = validatePageStructure(html);
  if (!structureReport.valid) {
    if (structureReport.missing.length > 0)    console.warn(`[PageStructure] Missing sections: ${structureReport.missing.join(", ")}`);
    if (structureReport.duplicates.length > 0) console.warn(`[PageStructure] Duplicate sections: ${structureReport.duplicates.join(", ")}`);
  } else {
    console.log(`[PageStructure] ✓ All ${structureReport.sections.length} sections validated — no duplicates`);
  }

  return { html, css };
}
