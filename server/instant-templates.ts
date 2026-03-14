export interface BusinessContent {
  business_name: string;
  business_type: "restaurant" | "agency" | "startup" | "portfolio" | "medical" | "general" | "legal" | "beauty" | "realestate" | "education" | "events" | "automotive" | "luxury" | "gym";
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
  business_type: "restaurant" | "agency" | "startup" | "portfolio" | "medical" | "general" | "legal" | "beauty" | "realestate" | "education" | "events" | "automotive" | "luxury" | "gym";
  ar: LangContent;
  en: LangContent;
  phone: string;
  email: string;
  primary_color: string;
  accent_color: string;
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
};

const FALLBACK_ICONS = ["fa-gem","fa-handshake","fa-trophy","fa-globe","fa-bolt","fa-crown"];

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

export function buildInstantWebsite(
  content: BilingualBusinessContent,
  primaryLang: string,
  extraLangs?: ExtraLang[]
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
      <div class="service-icon-wrap">
        <i class="fa-solid ${svcIcons[i % svcIcons.length]}"></i>
      </div>
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

  const testimonialsHtml = config.testimonials.map((t, i) => `
    <div class="testi-card" data-aos style="animation-delay:${i * 0.12}s">
      <div class="testi-quote-icon"><i class="fa-solid fa-quote-right"></i></div>
      <div class="testi-stars">${STAR_SVG.repeat(5)}</div>
      <p class="testi-text" data-ar='"${t.text_ar}"' data-en='"${t.text_en}"'${e3code ? ` data-${e3code}='"${esc(t.text_en)}"'` : ""}>"${t.text_ar}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-role" ${dDyn(t.role_ar, t.role_en, e3code ? t.role_en : undefined)}>${t.role_ar}</div>
        </div>
      </div>
    </div>`).join("");

  const whatsappNum = content.phone.replace(/\D/g, "");

  // Language order for switcher: primary language first, then others
  const knownLangs = ["ar", "en", ...(e3code ? [e3code] : [])];
  // Put primary language first, then maintain order
  const langOrder = [primaryLang, ...knownLangs.filter(l => l !== primaryLang)];
  // Initial content to display (matches primaryLang)
  const initContent = primaryLang === "ar" ? ar : primaryLang === "en" ? en : (e3?.content ?? ar);
  const initName = primaryLang === "ar" ? content.business_name_ar : primaryLang === "en" ? content.business_name_en : (e3?.businessName || content.business_name_en);
  // Initial button shows next language to switch to (always uppercase code: AR, EN, FR, etc.)
  const initialBtnLabel = langOrder[1].toUpperCase();

  const html = `<div dir="${dir}" class="aw-site" id="aw-root" lang="${primaryLang}">

<!-- ===== NAV ===== -->
<nav class="aw-nav" id="aw-nav">
  <div class="aw-nav-inner">
    <a href="#" class="aw-brand" ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName || e3?.content.hero_title?.split(" ").slice(0,2).join(" "))}>${initName}</a>
    <div class="aw-nav-links">
      <a href="#about" ${dUI("من نحن", "About", "nav_about")}>${MULTILANG_UI[primaryLang]?.nav_about || (isPrimaryAr ? "من نحن" : "About")}</a>
      <a href="#services" ${dUI("خدماتنا", "Services", "nav_services")}>${MULTILANG_UI[primaryLang]?.nav_services || (isPrimaryAr ? "خدماتنا" : "Services")}</a>
      <a href="#gallery" ${dUI("أعمالنا", "Gallery", "nav_gallery")}>${MULTILANG_UI[primaryLang]?.nav_gallery || (isPrimaryAr ? "أعمالنا" : "Gallery")}</a>
      <a href="#testimonials" ${dUI("آراء العملاء", "Reviews", "nav_reviews")}>${MULTILANG_UI[primaryLang]?.nav_reviews || (isPrimaryAr ? "آراء العملاء" : "Reviews")}</a>
      <a href="#contact" class="aw-nav-cta" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${initContent.cta_text}</a>
    </div>
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <button id="aw-lang-btn" onclick="awCycleLang()" title="Switch Language" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:0.35rem 0.75rem;border-radius:2rem;font-size:0.8rem;font-weight:700;cursor:pointer;letter-spacing:0.5px;transition:all 0.2s;font-family:inherit;">${initialBtnLabel}</button>
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
<section id="testimonials" class="aw-section bg-dark">
  <div class="aw-container">
    <div class="sec-head" data-aos>
      <span class="eyebrow" style="color:${accent}" ${dUI("آراء العملاء", "Testimonials", "testi_eyebrow")}>آراء العملاء</span>
      <h2 class="sec-title" style="color:#fff" ${dUI("ماذا يقول عملاؤنا", "What Our Clients Say", "testi_title")}>ماذا يقول عملاؤنا</h2>
      <div class="title-line center"></div>
    </div>
    <div class="testi-grid">
      ${testimonialsHtml}
    </div>
  </div>
</section>

<!-- ===== CONTACT ===== -->
<section id="contact" class="aw-section">
  <div class="aw-container contact-wrap">
    <div class="contact-left" data-aos>
      <span class="eyebrow" ${dUI("تواصل معنا", "Contact Us", "contact_eyebrow")}>تواصل معنا</span>
      <h2 class="sec-title" ${dUI("نسعد بخدمتك", "We'd Love to Help", "contact_title")}>نسعد بخدمتك</h2>
      <div class="title-line"></div>
      <p class="contact-desc" ${dDyn(ar.contact_description, en.contact_description, e3?.content.contact_description)}>${ar.contact_description}</p>
      <div class="contact-details">
        ${content.phone ? `<a href="tel:${content.phone}" class="contact-row">
          <div class="contact-icon-box" style="background:${primary}15;color:${primary}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18.9a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.07 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div><div class="ci-label" ${dUI("الهاتف", "Phone", "phone_label")}>الهاتف</div><div class="ci-val" dir="ltr">${content.phone}</div></div>
        </a>` : ""}
        ${content.email ? `<a href="mailto:${content.email}" class="contact-row">
          <div class="contact-icon-box" style="background:${primary}15;color:${primary}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div><div class="ci-label" ${dUI("البريد", "Email", "email_label")}>البريد</div><div class="ci-val" dir="ltr">${content.email}</div></div>
        </a>` : ""}
        ${ar.address ? `<div class="contact-row">
          <div class="contact-icon-box" style="background:${primary}15;color:${primary}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div><div class="ci-label" ${dUI("العنوان", "Address", "address_label")}>العنوان</div><div class="ci-val" ${dDyn(ar.address, en.address, e3?.content.address)}>${ar.address}</div></div>
        </div>` : ""}
      </div>
      ${whatsappNum ? `<a href="https://wa.me/${whatsappNum}" target="_blank" class="wa-btn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        <span ${dUI("تواصل عبر واتساب", "WhatsApp Us", "wa")}>تواصل عبر واتساب</span>
      </a>` : ""}
    </div>
    <div class="contact-right" data-aos style="animation-delay:0.15s">
      <form class="contact-form" onsubmit="var b=this.querySelector('.form-submit');var l=document.getElementById('aw-root').getAttribute('lang');b.textContent=l==='ar'?'تم الإرسال ✓':'Sent ✓';b.style.background='#10b981';event.preventDefault();">
        <h3 class="form-title" ${dUI("أرسل رسالتك", "Send a Message", "form_title")}>أرسل رسالتك</h3>
        <div class="form-row">
          <input type="text" placeholder="الاسم الكامل" data-placeholder-ar="الاسم الكامل" data-placeholder-en="Full Name"${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_name || "Full Name")}"` : ""} class="form-inp" required/>
          <input type="email" placeholder="البريد الإلكتروني" data-placeholder-ar="البريد الإلكتروني" data-placeholder-en="Email Address"${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_email || "Email Address")}"` : ""} class="form-inp" required/>
        </div>
        <input type="tel" placeholder="رقم الجوال" data-placeholder-ar="رقم الجوال" data-placeholder-en="Phone Number"${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_phone || "Phone Number")}"` : ""} class="form-inp" dir="ltr"/>
        <textarea placeholder="رسالتك..." data-placeholder-ar="رسالتك..." data-placeholder-en="Your message..."${e3code ? ` data-placeholder-${e3code}="${esc(MULTILANG_UI[e3code]?.form_msg || "Your message...")}"` : ""} class="form-inp form-ta" rows="4"></textarea>
        <button type="submit" class="form-submit" ${dDyn(ar.cta_text, en.cta_text, e3?.content.cta_text)}>${ar.cta_text}</button>
      </form>
    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="aw-footer">
  <div class="aw-container footer-wrap">
    <div class="footer-brand-col">
      <span class="footer-logo" ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName)}>${content.business_name_ar}</span>
      <p class="footer-tagline" ${dDyn(ar.hero_subtitle.slice(0, 80), en.hero_subtitle.slice(0, 80), e3?.content.hero_subtitle?.slice(0, 80))}>${ar.hero_subtitle.slice(0, 80)}</p>
    </div>
    <div class="footer-links-col">
      <div class="fl-heading" ${dUI("روابط سريعة", "Quick Links", "quick_links")}>روابط سريعة</div>
      <a href="#about" ${dUI("من نحن", "About", "nav_about")}>من نحن</a>
      <a href="#services" ${dUI("خدماتنا", "Services", "nav_services")}>خدماتنا</a>
      <a href="#gallery" ${dUI("أعمالنا", "Gallery", "nav_gallery")}>أعمالنا</a>
      <a href="#contact" ${dUI("تواصل معنا", "Contact", "nav_contact")}>تواصل معنا</a>
    </div>
    <div class="footer-contact-col">
      <div class="fl-heading" ${dUI("تواصل معنا", "Get In Touch", "get_in_touch")}>تواصل معنا</div>
      ${content.phone ? `<a href="tel:${content.phone}" dir="ltr">${content.phone}</a>` : ""}
      ${content.email ? `<a href="mailto:${content.email}" dir="ltr">${content.email}</a>` : ""}
      ${ar.address ? `<span ${dDyn(ar.address, en.address, e3?.content.address)}>${ar.address}</span>` : ""}
    </div>
  </div>
  <div class="footer-bottom">
    <div class="aw-container footer-bottom-inner">
      <p>© 2026 <span ${dDyn(content.business_name_ar, content.business_name_en, e3?.businessName)}>${content.business_name_ar}</span>. <span ${dUI("جميع الحقوق محفوظة.", "All Rights Reserved.", "rights")}>جميع الحقوق محفوظة.</span></p>
      <div class="footer-socials">
        ${content.phone ? `<a href="https://wa.me/${whatsappNum}" target="_blank" aria-label="WhatsApp" class="social-icon"><i class="fa-brands fa-whatsapp"></i></a>` : ""}
        <a href="#" aria-label="Instagram" class="social-icon"><i class="fa-brands fa-instagram"></i></a>
        <a href="#" aria-label="Twitter/X" class="social-icon"><i class="fa-brands fa-x-twitter"></i></a>
        <a href="#" aria-label="LinkedIn" class="social-icon"><i class="fa-brands fa-linkedin-in"></i></a>
      </div>
    </div>
  </div>
</footer>

<!-- WhatsApp Float -->
${whatsappNum ? `<a href="https://wa.me/${whatsappNum}" target="_blank" style="position:fixed;bottom:1.75rem;left:1.75rem;z-index:999;background:#25D366;color:#fff;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(37,211,102,0.5);transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" aria-label="WhatsApp">
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
    root.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    var nextCode = AW_LANG_ORDER[(awLangIdx + 1) % AW_LANG_ORDER.length];
    btn.textContent = awGetNextLabel(nextCode);
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

  const css = `
${fontImport}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{font-family:${fontBody};color:#0f172a;background:#fff;overflow-x:hidden;}
a{text-decoration:none;color:inherit;}
img{max-width:100%;display:block;object-fit:cover;}
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
.aw-brand{font-family:${fontHeading};font-size:1.45rem;font-weight:900;background:linear-gradient(135deg,#fff 20%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;letter-spacing:-0.02em;}
.aw-nav-links{display:flex;align-items:center;gap:1.75rem;}
.aw-nav-links a{font-size:0.88rem;font-weight:500;color:rgba(255,255,255,0.72);transition:color 0.2s;position:relative;padding-bottom:2px;}
.aw-nav-links a::after{content:'';position:absolute;bottom:-2px;inset-inline-start:0;width:0;height:1.5px;background:linear-gradient(90deg,${primary},${accent});border-radius:1px;transition:width 0.3s cubic-bezier(.22,1,.36,1);}
.aw-nav-links a:hover{color:#fff;}
.aw-nav-links a:hover::after{width:100%;}
.aw-nav-cta{background:linear-gradient(135deg,${primary},${accent})!important;color:#fff!important;padding:0.48rem 1.35rem;border-radius:2rem;font-weight:700!important;transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s!important;box-shadow:0 4px 18px ${primary}55;letter-spacing:0.01em;}
.aw-nav-cta::after{display:none!important;}
.aw-nav-cta:hover{transform:translateY(-2px)!important;box-shadow:0 8px 28px ${primary}75!important;}
#aw-mobile-menu{background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.08);}
.mob-link{display:block;padding:0.9rem 0;font-size:1rem;font-weight:500;color:rgba(255,255,255,0.75);border-bottom:1px solid rgba(255,255,255,0.06);transition:color 0.2s,padding-inline-start 0.2s;}
.mob-link:hover{color:#fff;padding-inline-start:0.5rem;}
.mob-cta-link{display:block;margin-top:0.9rem;padding:0.9rem 1.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff!important;border-radius:2rem;font-weight:700;text-align:center;box-shadow:0 4px 18px ${primary}50;}

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
.btn-glow{display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:1.05rem 2.5rem;border-radius:3rem;font-weight:700;font-size:1rem;box-shadow:0 8px 32px ${primary}65;transition:transform 0.3s,box-shadow 0.3s;animation:pulse 3s ease-in-out infinite;}
.btn-glow:hover{transform:translateY(-4px);box-shadow:0 18px 45px ${primary}85;}
.btn-ghost{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.28);color:#fff;padding:1.05rem 2rem;border-radius:3rem;font-weight:600;font-size:1rem;backdrop-filter:blur(10px);transition:all 0.3s;}
.btn-ghost:hover{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.55);transform:translateY(-3px);}
.hero-scroll-hint{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);z-index:2;}
.scroll-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.45);animation:scrollBounce 2s ease infinite;}

/* ═══ STATS ═══ */
.aw-stats{background:linear-gradient(160deg,${dark} 0%,#0a1628 100%);padding:3.5rem 0;position:relative;overflow:hidden;}
.aw-stats::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,${primary}18 0%,transparent 70%);pointer-events:none;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative;}
.stat-item{padding:2.25rem 1.5rem;text-align:center;border-inline-end:1px solid rgba(255,255,255,0.06);}
.stat-item:last-child{border-inline-end:none;}
.stat-num{display:block;font-family:${fontHeading};font-size:3.1rem;font-weight:900;background:linear-gradient(135deg,${primary} 30%,${accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
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
.btn-primary-solid{display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:0.95rem 2.5rem;border-radius:3rem;font-weight:700;font-size:1rem;box-shadow:0 8px 28px ${primary}45;transition:transform 0.3s,box-shadow 0.3s;}
.btn-primary-solid:hover{transform:translateY(-3px);box-shadow:0 16px 38px ${primary}65;}

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
.service-icon-wrap i{font-size:1.7rem;color:${primary};transition:all 0.35s;line-height:1;}
.service-card:hover .service-icon-wrap{transform:scale(1.12) rotate(-6deg);background:linear-gradient(135deg,${primary},${accent});box-shadow:0 10px 25px ${primary}45;}
.service-card:hover .service-icon-wrap i{color:#fff;}
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
.btn-white{display:inline-flex;align-items:center;gap:0.5rem;background:#fff;color:${primary};padding:1.05rem 2.5rem;border-radius:3rem;font-weight:800;font-size:1rem;box-shadow:0 8px 30px rgba(0,0,0,0.25);transition:transform 0.3s,box-shadow 0.3s;white-space:nowrap;}
.btn-white:hover{transform:translateY(-3px);box-shadow:0 18px 42px rgba(0,0,0,0.35);}

/* ═══ TESTIMONIALS ═══ */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
.testi-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:1.75rem;padding:2.25rem;backdrop-filter:blur(12px);transition:transform 0.35s,background 0.35s,border-color 0.35s;position:relative;overflow:hidden;}
.testi-card::after{content:'';position:absolute;bottom:0;inset-inline-start:0;width:100%;height:2px;background:linear-gradient(90deg,${primary},${accent});transform:scaleX(0);transform-origin:inset-inline-start;transition:transform 0.4s cubic-bezier(.22,1,.36,1);}
.testi-card:hover{background:rgba(255,255,255,0.07);transform:translateY(-6px);border-color:${primary}45;}
.testi-card:hover::after{transform:scaleX(1);}
.testi-quote-icon{position:absolute;top:1.25rem;inset-inline-end:1.5rem;color:${accent};opacity:0.18;font-size:3rem;line-height:1;}
.testi-stars{display:flex;gap:3px;margin-bottom:1.25rem;}
.testi-text{color:rgba(255,255,255,0.78);font-size:0.97rem;line-height:1.88;margin-bottom:1.75rem;font-style:italic;}
.testi-author{display:flex;align-items:center;gap:1rem;}
.testi-avatar{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,${primary},${accent});color:#fff;display:flex;align-items:center;justify-content:center;font-family:${fontHeading};font-size:1.2rem;font-weight:800;flex-shrink:0;box-shadow:0 4px 15px ${primary}65;}
.testi-name{color:#fff;font-weight:700;font-size:0.95rem;}
.testi-role{color:rgba(255,255,255,0.38);font-size:0.82rem;margin-top:0.2rem;}

/* ═══ CONTACT ═══ */
.contact-wrap{display:grid;grid-template-columns:1fr 1.15fr;gap:5rem;align-items:start;}
.contact-desc{color:#64748b;font-size:1.03rem;line-height:1.88;margin:1.25rem 0 2rem;}
.contact-details{display:flex;flex-direction:column;gap:0.85rem;margin-bottom:2rem;}
.contact-row{display:flex;align-items:center;gap:1rem;padding:0.85rem;border-radius:1rem;transition:background 0.2s;}
.contact-row:hover{background:#f4f7ff;}
.contact-icon-box{width:44px;height:44px;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ci-label{font-size:0.76rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:0.15rem;}
.ci-val{font-size:0.95rem;font-weight:600;color:#334155;}
.wa-btn{display:inline-flex;align-items:center;gap:0.75rem;background:#25D366;color:#fff;padding:0.85rem 2rem;border-radius:3rem;font-weight:700;font-size:0.95rem;box-shadow:0 8px 28px rgba(37,211,102,0.4);transition:transform 0.3s,box-shadow 0.3s;}
.wa-btn:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(37,211,102,0.55);}
.contact-right{background:#fff;border:1.5px solid #e8eef8;border-radius:2rem;padding:2.75rem;box-shadow:0 20px 70px rgba(0,0,0,0.08);}
.form-title{font-family:${fontHeading};font-size:1.35rem;font-weight:800;color:#0f172a;margin-bottom:1.75rem;letter-spacing:-0.01em;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-bottom:0.85rem;}
.form-inp{width:100%;padding:0.9rem 1.15rem;border:1.5px solid #e2e8f0;border-radius:0.9rem;font-family:${fontBody};font-size:0.95rem;color:#1e293b;background:#f8fafc;transition:border-color 0.25s,background 0.25s,box-shadow 0.25s;outline:none;}
.form-inp:focus{border-color:${primary};background:#fff;box-shadow:0 0 0 4px ${primary}18;}
.form-ta{resize:vertical;min-height:115px;margin-bottom:1rem;display:block;}
.form-submit{width:100%;padding:1rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;border:none;border-radius:2rem;font-family:${fontBody};font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 8px 28px ${primary}45;transition:transform 0.3s,box-shadow 0.3s;}
.form-submit:hover{transform:translateY(-2px);box-shadow:0 16px 38px ${primary}65;}

/* ═══ FOOTER ═══ */
.aw-footer{background:linear-gradient(160deg,${dark} 0%,#060c18 100%);padding:5rem 0 0;position:relative;overflow:hidden;}
.aw-footer::before{content:'';position:absolute;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,${primary}12 0%,transparent 65%);top:-300px;${dir==="rtl"?"left:-200px":"right:-200px"};pointer-events:none;}
.footer-wrap{display:grid;grid-template-columns:2fr 1fr 1fr;gap:4rem;padding-bottom:4rem;border-bottom:1px solid rgba(255,255,255,0.07);}
.footer-logo{font-family:${fontHeading};font-size:1.5rem;font-weight:900;background:linear-gradient(135deg,#fff 20%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.02em;}
.footer-tagline{color:rgba(255,255,255,0.35);font-size:0.9rem;line-height:1.75;margin-top:0.75rem;max-width:280px;}
.fl-heading{font-size:0.77rem;font-weight:800;text-transform:uppercase;letter-spacing:2.5px;color:${accent};margin-bottom:1.25rem;}
.footer-links-col,.footer-contact-col{display:flex;flex-direction:column;gap:0.75rem;}
.footer-links-col a,.footer-contact-col a,.footer-contact-col span{color:rgba(255,255,255,0.38);font-size:0.9rem;transition:color 0.2s;}
.footer-links-col a:hover,.footer-contact-col a:hover{color:#fff;}
.footer-bottom{padding:1.5rem 0;border-top:1px solid rgba(255,255,255,0.06);}
.footer-bottom-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;}
.footer-bottom p{color:rgba(255,255,255,0.2);font-size:0.85rem;}
.footer-socials{display:flex;align-items:center;gap:0.75rem;}
.social-icon{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.42);display:flex;align-items:center;justify-content:center;font-size:0.9rem;transition:all 0.25s;}
.social-icon:hover{background:linear-gradient(135deg,${primary},${accent});border-color:transparent;color:#fff;transform:translateY(-3px);}

/* ═══ RESPONSIVE ═══ */
@media(max-width:1024px){
  .services-grid{grid-template-columns:repeat(2,1fr);}
  .testi-grid{grid-template-columns:repeat(2,1fr);}
  .footer-wrap{grid-template-columns:1fr 1fr;gap:2.5rem;}
  .about-wrap{gap:3rem;}
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
  .contact-wrap{grid-template-columns:1fr;gap:2.5rem;}
  .form-row{grid-template-columns:1fr;}
  .footer-wrap{grid-template-columns:1fr;gap:2rem;}
  .aw-section{padding:4.5rem 0;}
  .contact-right{padding:2rem;}
}
@media(max-width:480px){
  .gallery-grid{grid-template-columns:1fr;}
  .stats-grid{grid-template-columns:1fr 1fr;}
  .hero-h1{font-size:1.95rem;}
  .stat-num{font-size:2.5rem;}
  .sec-title{font-size:1.75rem;}
}
`;

  return { html, css };
}
