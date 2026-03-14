/**
 * AI Industry Engine - طبقة ذكاء الصناعة
 * Detects the business industry from a prompt and enriches generation with
 * industry-specific knowledge (services, design patterns, SEO keywords).
 */

export interface IndustryProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  keywords: string[];
  keywordsEn: string[];
  typicalServices: { ar: string; en: string }[];
  seoKeywords: { ar: string[]; en: string[] };
  designHints: {
    colorPalette: string;
    mood: string;
    typography: string;
    heroStyle: string;
  };
  trustSignals: { ar: string; en: string }[];
  ctaVariants: { ar: string; en: string }[];
}

// ═══════════════════════════════════════════════════════════════
// INDUSTRY KNOWLEDGE BASE — قاعدة معرفة الصناعات
// ═══════════════════════════════════════════════════════════════
export const INDUSTRY_ENGINE: Record<string, IndustryProfile> = {
  cleaning: {
    id: "cleaning",
    nameAr: "خدمات النظافة",
    nameEn: "Cleaning Services",
    keywords: ["نظافة", "تنظيف", "مكافحة حشرات", "غسيل", "تلميع", "جلي", "كنس", "ترتيب", "صرف", "مجاري", "سباكة نظافة"],
    keywordsEn: ["clean", "cleaning", "maid", "housekeeping", "sanitize", "pest", "janitorial", "sweep", "polish"],
    typicalServices: [
      { ar: "تنظيف المنازل", en: "Home Cleaning" },
      { ar: "تنظيف المكاتب", en: "Office Cleaning" },
      { ar: "غسيل السيارات", en: "Car Washing" },
      { ar: "تنظيف الخزانات", en: "Tank Cleaning" },
      { ar: "مكافحة الحشرات", en: "Pest Control" },
      { ar: "جلي الرخام والبلاط", en: "Marble & Tile Polishing" },
    ],
    seoKeywords: {
      ar: ["شركة تنظيف", "تنظيف منازل", "خدمات نظافة احترافية", "أفضل شركة تنظيف", "تنظيف مكاتب"],
      en: ["cleaning company", "home cleaning service", "professional cleaners", "maid service", "office cleaning"],
    },
    designHints: {
      colorPalette: "blue-green-white — conveys freshness, trust, hygiene",
      mood: "Clean, professional, trustworthy, fresh",
      typography: "Modern sans-serif, rounded letterforms",
      heroStyle: "Before/after split or sparkling clean environment",
    },
    trustSignals: [
      { ar: "فريق مدرب ومعتمد", en: "Certified & Trained Team" },
      { ar: "منتجات صديقة للبيئة", en: "Eco-Friendly Products" },
      { ar: "ضمان الجودة 100٪", en: "100% Quality Guarantee" },
      { ar: "خبرة أكثر من 10 سنوات", en: "10+ Years Experience" },
    ],
    ctaVariants: [
      { ar: "احجز تنظيف الآن", en: "Book Cleaning Now" },
      { ar: "احصل على عرض سعر", en: "Get Free Quote" },
      { ar: "تواصل معنا اليوم", en: "Contact Us Today" },
    ],
  },

  restaurant: {
    id: "restaurant",
    nameAr: "المطاعم والمقاهي",
    nameEn: "Restaurant & Café",
    keywords: ["مطعم", "مقهى", "كافيه", "وجبات", "طعام", "أكل", "مأكولات", "شاورما", "برغر", "بيتزا", "مشويات", "حلويات", "كيك", "قهوة", "فطور", "غداء", "عشاء"],
    keywordsEn: ["restaurant", "cafe", "food", "dining", "burger", "pizza", "shawarma", "coffee", "breakfast", "lunch", "dinner", "menu", "chef"],
    typicalServices: [
      { ar: "وجبات رئيسية", en: "Main Dishes" },
      { ar: "مشروبات وعصائر", en: "Drinks & Juices" },
      { ar: "خدمة التوصيل", en: "Delivery Service" },
      { ar: "حجز الطاولات", en: "Table Reservation" },
      { ar: "وجبات عائلية", en: "Family Meals" },
      { ar: "حفلات خاصة", en: "Private Events" },
    ],
    seoKeywords: {
      ar: ["مطعم سعودي", "أفضل مطعم", "وجبات لذيذة", "توصيل طعام", "مطعم عائلي"],
      en: ["restaurant near me", "best food", "food delivery", "dine in", "family restaurant"],
    },
    designHints: {
      colorPalette: "warm gold-red-brown — appetite-stimulating, premium feel",
      mood: "Warm, inviting, appetizing, premium dining experience",
      typography: "Elegant serif for headings, clean body",
      heroStyle: "Stunning food photography, warm ambient lighting",
    },
    trustSignals: [
      { ar: "مكونات طازجة يومياً", en: "Daily Fresh Ingredients" },
      { ar: "طهاة محترفون", en: "Professional Chefs" },
      { ar: "معتمد صحياً 100٪", en: "100% Health Certified" },
      { ar: "أكثر من 50000 عميل سعيد", en: "50,000+ Happy Customers" },
    ],
    ctaVariants: [
      { ar: "اطلب الآن", en: "Order Now" },
      { ar: "احجز طاولة", en: "Reserve a Table" },
      { ar: "اكتشف قائمتنا", en: "View Our Menu" },
    ],
  },

  medical: {
    id: "medical",
    nameAr: "الصحة والطب",
    nameEn: "Healthcare & Medical",
    keywords: ["طبيب", "عيادة", "مستشفى", "طب", "صحة", "علاج", "أسنان", "عيون", "نظارة", "جراحة", "بصريات", "تغذية", "تأمين صحي", "دكتور", "فيزياء"],
    keywordsEn: ["doctor", "clinic", "hospital", "health", "medical", "dentist", "teeth", "eyes", "optician", "surgery", "therapy", "nutrition", "wellness"],
    typicalServices: [
      { ar: "استشارة طبية", en: "Medical Consultation" },
      { ar: "فحص شامل", en: "Full Checkup" },
      { ar: "تشخيص ومتابعة", en: "Diagnosis & Follow-up" },
      { ar: "عمليات جراحية", en: "Surgical Operations" },
      { ar: "تحاليل مخبرية", en: "Lab Tests" },
      { ar: "حجز مواعيد أونلاين", en: "Online Appointment" },
    ],
    seoKeywords: {
      ar: ["عيادة طبية", "دكتور متخصص", "حجز موعد", "علاج أمراض", "طب وصحة"],
      en: ["medical clinic", "specialist doctor", "book appointment", "healthcare services", "medical treatment"],
    },
    designHints: {
      colorPalette: "blue-white-mint — trust, cleanliness, professionalism",
      mood: "Professional, calm, trustworthy, reassuring",
      typography: "Clean, highly readable, medical-grade clarity",
      heroStyle: "Clean medical environment, professional staff, patient care imagery",
    },
    trustSignals: [
      { ar: "معتمد من وزارة الصحة", en: "MOH Certified" },
      { ar: "أطباء متخصصون معتمدون", en: "Board-Certified Specialists" },
      { ar: "أكثر من 15 عاماً من الخبرة", en: "15+ Years of Excellence" },
      { ar: "تقنية طبية متطورة", en: "Advanced Medical Technology" },
    ],
    ctaVariants: [
      { ar: "احجز موعدك الآن", en: "Book Your Appointment" },
      { ar: "استشر طبيبنا", en: "Consult Our Doctor" },
      { ar: "تواصل مع العيادة", en: "Contact the Clinic" },
    ],
  },

  realestate: {
    id: "realestate",
    nameAr: "العقارات",
    nameEn: "Real Estate",
    keywords: ["عقار", "شقة", "فيلا", "أرض", "بيع", "إيجار", "عقارات", "مبنى", "وحدات سكنية", "تطوير عقاري", "استثمار عقاري", "مكتب", "محل", "مجمع"],
    keywordsEn: ["real estate", "property", "apartment", "villa", "land", "buy", "rent", "sale", "housing", "investment", "commercial", "residential"],
    typicalServices: [
      { ar: "بيع العقارات", en: "Property Sales" },
      { ar: "تأجير الوحدات", en: "Unit Rental" },
      { ar: "إدارة العقارات", en: "Property Management" },
      { ar: "تقييم العقارات", en: "Property Valuation" },
      { ar: "استشارات استثمارية", en: "Investment Consulting" },
      { ar: "تطوير مشاريع سكنية", en: "Residential Development" },
    ],
    seoKeywords: {
      ar: ["شراء شقق", "عقارات للبيع", "شركة عقارية", "استثمار عقاري", "فلل للإيجار"],
      en: ["buy property", "real estate for sale", "property investment", "apartments for rent", "real estate agency"],
    },
    designHints: {
      colorPalette: "navy-gold-white — prestige, trust, luxury",
      mood: "Premium, prestigious, sophisticated, aspirational",
      typography: "Elegant serif headings, refined body text",
      heroStyle: "Luxury property photography, aerial drone shots, lifestyle imagery",
    },
    trustSignals: [
      { ar: "معتمدون من هيئة العقار السعودية", en: "Saudi Real Estate Authority Certified" },
      { ar: "أكثر من 500 صفقة ناجحة", en: "500+ Successful Deals" },
      { ar: "خبرة أكثر من 20 عاماً", en: "20+ Years in Real Estate" },
      { ar: "عملاء موثوقون ومتعددون", en: "Trusted By Top Investors" },
    ],
    ctaVariants: [
      { ar: "ابحث عن عقارك", en: "Find Your Property" },
      { ar: "احجز جولة معاينة", en: "Book a Viewing" },
      { ar: "تحدث مع مستشارنا", en: "Talk to Our Advisor" },
    ],
  },

  beauty: {
    id: "beauty",
    nameAr: "الجمال والعناية",
    nameEn: "Beauty & Wellness",
    keywords: ["صالون", "حلاقة", "مكياج", "تجميل", "عناية", "بشرة", "شعر", "مانيكير", "باديكير", "سبا", "مساج", "كيراتين", "رموش", "حواجب", "لاش", "حنة"],
    keywordsEn: ["salon", "beauty", "hair", "makeup", "spa", "skincare", "nails", "manicure", "massage", "lashes", "brows", "cosmetics", "barber"],
    typicalServices: [
      { ar: "قص وتصفيف الشعر", en: "Hair Cut & Styling" },
      { ar: "مكياج احترافي", en: "Professional Makeup" },
      { ar: "جلسات بشرة وعناية", en: "Skin Care Sessions" },
      { ar: "مانيكير وباديكير", en: "Manicure & Pedicure" },
      { ar: "تمديد الرموش", en: "Lash Extensions" },
      { ar: "جلسات سبا وتدليك", en: "Spa & Massage" },
    ],
    seoKeywords: {
      ar: ["صالون تجميل", "مكياج عروس", "عناية بشرة", "صالون حلاقة", "سبا ومساج"],
      en: ["beauty salon", "hair salon", "bridal makeup", "skincare clinic", "spa near me"],
    },
    designHints: {
      colorPalette: "rose-gold-nude-white — femininity, elegance, luxury",
      mood: "Elegant, luxurious, feminine, relaxing, aspirational",
      typography: "Script for headings, clean sans for body — organic feel",
      heroStyle: "Lifestyle beauty shots, close-ups of results, before-after transformations",
    },
    trustSignals: [
      { ar: "خبرات جمالية تتجاوز 15 عاماً", en: "15+ Years of Beauty Expertise" },
      { ar: "منتجات فاخرة معتمدة", en: "Premium Certified Products" },
      { ar: "آلاف العميلات الراضيات", en: "Thousands of Happy Clients" },
      { ar: "جلسات خاصة وسرية", en: "Private & Discreet Sessions" },
    ],
    ctaVariants: [
      { ar: "احجزي موعدك الآن", en: "Book Your Appointment" },
      { ar: "اطلعي على خدماتنا", en: "Explore Our Services" },
      { ar: "تواصلي معنا", en: "Get in Touch" },
    ],
  },

  education: {
    id: "education",
    nameAr: "التعليم والتدريب",
    nameEn: "Education & Training",
    keywords: ["مدرسة", "أكاديمية", "تعليم", "تدريب", "دورة", "كورس", "دروس", "تأهيل", "شهادة", "معهد", "جامعة", "طالب", "مدرس", "معلم", "منهج", "تعلم"],
    keywordsEn: ["school", "academy", "education", "training", "course", "lesson", "certificate", "institute", "university", "student", "teacher", "learning"],
    typicalServices: [
      { ar: "دورات تدريبية متخصصة", en: "Specialized Training Courses" },
      { ar: "تعليم أونلاين مباشر", en: "Live Online Learning" },
      { ar: "برامج تأهيل مهني", en: "Professional Qualification" },
      { ar: "شهادات معتمدة دولياً", en: "International Certifications" },
      { ar: "إرشاد وتوجيه أكاديمي", en: "Academic Counseling" },
      { ar: "برامج للأطفال", en: "Children's Programs" },
    ],
    seoKeywords: {
      ar: ["أكاديمية تعليمية", "دورات تدريبية", "تعلم أونلاين", "شهادات معتمدة", "برامج تأهيل"],
      en: ["online courses", "training academy", "certified programs", "e-learning", "professional development"],
    },
    designHints: {
      colorPalette: "blue-orange-white — knowledge, energy, optimism",
      mood: "Inspiring, motivating, professional, forward-thinking",
      typography: "Modern, bold headings — clear and academic body text",
      heroStyle: "Students learning, graduation moments, modern classroom",
    },
    trustSignals: [
      { ar: "معتمدون من وزارة التعليم", en: "Ministry of Education Accredited" },
      { ar: "أكثر من 10,000 خريج ناجح", en: "10,000+ Successful Graduates" },
      { ar: "مدربون معتمدون دولياً", en: "Internationally Certified Trainers" },
      { ar: "نسبة توظيف 95٪", en: "95% Employment Rate" },
    ],
    ctaVariants: [
      { ar: "سجّل الآن", en: "Enroll Now" },
      { ar: "ابدأ رحلتك التعليمية", en: "Start Your Journey" },
      { ar: "احجز مقعدك", en: "Reserve Your Spot" },
    ],
  },

  construction: {
    id: "construction",
    nameAr: "المقاولات والبناء",
    nameEn: "Construction & Contracting",
    keywords: ["مقاول", "بناء", "إنشاء", "تشييد", "تصميم معماري", "ديكور", "تشطيب", "صيانة", "ترميم", "تسليح", "هندسة مدنية", "معماري", "ألمنيوم", "زجاج"],
    keywordsEn: ["contractor", "construction", "building", "architecture", "interior design", "renovation", "civil engineering", "maintenance", "finishing"],
    typicalServices: [
      { ar: "تصميم معماري", en: "Architectural Design" },
      { ar: "تنفيذ مشاريع البناء", en: "Construction Execution" },
      { ar: "تشطيب الوحدات", en: "Interior Finishing" },
      { ar: "أعمال الديكور", en: "Decoration Works" },
      { ar: "صيانة المباني", en: "Building Maintenance" },
      { ar: "ترميم وتجديد", en: "Renovation & Restoration" },
    ],
    seoKeywords: {
      ar: ["شركة مقاولات", "بناء منازل", "تشطيب شقق", "ديكور داخلي", "تصميم معماري"],
      en: ["construction company", "building contractor", "interior design", "renovation", "civil contractor"],
    },
    designHints: {
      colorPalette: "dark-navy-orange-steel — strength, precision, reliability",
      mood: "Strong, reliable, industrial, professional, bold",
      typography: "Heavy bold headings, clean technical body text",
      heroStyle: "Impressive completed projects, blueprint overlays, before-after",
    },
    trustSignals: [
      { ar: "ترخيص هيئة المقاولين السعودية", en: "Saudi Contractor Authority Licensed" },
      { ar: "أكثر من 300 مشروع منجز", en: "300+ Completed Projects" },
      { ar: "معايير جودة ISO معتمدة", en: "ISO Quality Standards" },
      { ar: "فريق هندسي محترف", en: "Professional Engineering Team" },
    ],
    ctaVariants: [
      { ar: "احصل على عرض سعر مجاني", en: "Get Free Quote" },
      { ar: "اطلب زيارة هندسية", en: "Request Site Visit" },
      { ar: "تحدث مع مهندسنا", en: "Talk to Our Engineer" },
    ],
  },

  ecommerce: {
    id: "ecommerce",
    nameAr: "التجارة الإلكترونية",
    nameEn: "E-commerce & Retail",
    keywords: ["متجر", "تجارة", "منتج", "سلعة", "بيع", "شراء", "طلب", "توصيل", "تسوق", "كوبون", "خصم", "عروض", "ملابس", "إلكترونيات", "هدايا", "عبايات", "ساعات"],
    keywordsEn: ["store", "shop", "ecommerce", "product", "buy", "sell", "order", "delivery", "discount", "offer", "fashion", "clothes", "electronics", "gifts"],
    typicalServices: [
      { ar: "تسوق أونلاين آمن", en: "Secure Online Shopping" },
      { ar: "توصيل سريع لباب البيت", en: "Fast Home Delivery" },
      { ar: "إرجاع واستبدال مجاني", en: "Free Returns & Exchanges" },
      { ar: "عروض وتخفيضات دورية", en: "Regular Offers & Discounts" },
      { ar: "برنامج ولاء وعملاء مميزون", en: "Loyalty Rewards Program" },
      { ar: "دفع آمن بوسائل متعددة", en: "Multiple Secure Payment Options" },
    ],
    seoKeywords: {
      ar: ["متجر إلكتروني", "تسوق أونلاين", "عروض وخصومات", "توصيل سريع", "أفضل الأسعار"],
      en: ["online store", "buy online", "fast delivery", "best prices", "shop now"],
    },
    designHints: {
      colorPalette: "vibrant brand colors — energetic, conversion-focused",
      mood: "Energetic, conversion-driven, trustworthy, inviting",
      typography: "Bold, punchy headlines with clear price callouts",
      heroStyle: "Product hero shots, lifestyle imagery, promotional banners",
    },
    trustSignals: [
      { ar: "مدفوعات مؤمّنة بالكامل", en: "100% Secure Payments" },
      { ar: "أكثر من 50,000 عميل سعيد", en: "50,000+ Happy Customers" },
      { ar: "توصيل خلال 24 ساعة", en: "24-Hour Delivery" },
      { ar: "ضمان أصالة المنتجات", en: "Authenticity Guaranteed" },
    ],
    ctaVariants: [
      { ar: "تسوق الآن", en: "Shop Now" },
      { ar: "اكتشف المنتجات", en: "Explore Products" },
      { ar: "اطلب الآن واستلم غداً", en: "Order Now, Get Tomorrow" },
    ],
  },

  fitness: {
    id: "fitness",
    nameAr: "اللياقة والرياضة",
    nameEn: "Fitness & Sports",
    keywords: ["جيم", "نادي رياضي", "لياقة", "رياضة", "تمرين", "يوغا", "كروسفيت", "بودي بيلدنج", "تغذية رياضية", "مدرب شخصي", "زومبا", "سباحة", "تنس"],
    keywordsEn: ["gym", "fitness", "sport", "workout", "yoga", "crossfit", "bodybuilding", "personal trainer", "swimming", "tennis", "health club"],
    typicalServices: [
      { ar: "تمارين لياقة بدنية", en: "Physical Fitness Training" },
      { ar: "تدريب شخصي", en: "Personal Training" },
      { ar: "حصص جماعية متنوعة", en: "Group Classes" },
      { ar: "خطط تغذية مخصصة", en: "Custom Nutrition Plans" },
      { ar: "متابعة التقدم والأهداف", en: "Progress & Goal Tracking" },
      { ar: "برامج إنقاص الوزن", en: "Weight Loss Programs" },
    ],
    seoKeywords: {
      ar: ["نادي رياضي", "تمارين لياقة", "مدرب شخصي", "إنقاص وزن", "صالة جيم"],
      en: ["gym near me", "personal trainer", "fitness center", "weight loss", "workout classes"],
    },
    designHints: {
      colorPalette: "bold-black-red-neon — energy, power, motivation",
      mood: "Energetic, powerful, motivating, bold, aspirational",
      typography: "Heavy impact fonts — strong and commanding",
      heroStyle: "Action shots, transformation before-after, athletic imagery",
    },
    trustSignals: [
      { ar: "مدربون معتمدون دولياً", en: "Internationally Certified Trainers" },
      { ar: "أكثر من 5,000 عضو نشط", en: "5,000+ Active Members" },
      { ar: "أجهزة تدريب عالمية المستوى", en: "World-Class Equipment" },
      { ar: "نتائج مضمونة في 90 يوماً", en: "Results Guaranteed in 90 Days" },
    ],
    ctaVariants: [
      { ar: "ابدأ رحلتك الآن", en: "Start Your Journey" },
      { ar: "سجّل اليوم", en: "Join Today" },
      { ar: "احصل على تجربة مجانية", en: "Get Free Trial" },
    ],
  },

  logistics: {
    id: "logistics",
    nameAr: "الشحن والخدمات اللوجستية",
    nameEn: "Shipping & Logistics",
    keywords: ["شحن", "توصيل", "نقل", "لوجستيك", "بريد", "طرود", "شحن دولي", "مستودع", "سلسلة توريد", "تخليص جمركي", "كريم", "ارامكس", "دهل"],
    keywordsEn: ["shipping", "delivery", "logistics", "courier", "freight", "warehouse", "supply chain", "customs", "tracking", "express"],
    typicalServices: [
      { ar: "شحن داخلي وخارجي", en: "Local & International Shipping" },
      { ar: "توصيل سريع وآمن", en: "Fast & Safe Delivery" },
      { ar: "تتبع الشحنات لحظياً", en: "Real-time Shipment Tracking" },
      { ar: "تخليص جمركي", en: "Customs Clearance" },
      { ar: "خدمات المستودعات", en: "Warehousing Services" },
      { ar: "شحن ضخم وبضائع", en: "Bulk & Cargo Shipping" },
    ],
    seoKeywords: {
      ar: ["شركة شحن", "توصيل طرود", "شحن دولي", "خدمات لوجستية", "نقل بضائع"],
      en: ["shipping company", "logistics services", "international freight", "courier service", "cargo"],
    },
    designHints: {
      colorPalette: "dark-yellow-blue — reliability, speed, professionalism",
      mood: "Reliable, efficient, trustworthy, fast-moving",
      typography: "Bold, high-contrast — readability at speed",
      heroStyle: "Fleet imagery, warehouse operations, global map overlays",
    },
    trustSignals: [
      { ar: "تسليم في الوقت المحدد بنسبة 99٪", en: "99% On-Time Delivery" },
      { ar: "تأمين كامل على الشحنات", en: "Full Shipment Insurance" },
      { ar: "أكثر من 50 دولة حول العالم", en: "50+ Countries Worldwide" },
      { ar: "تتبع فوري على مدار الساعة", en: "24/7 Real-time Tracking" },
    ],
    ctaVariants: [
      { ar: "احسب تكلفة الشحن", en: "Calculate Shipping Cost" },
      { ar: "اطلب الاستلام", en: "Schedule Pickup" },
      { ar: "تحدث مع فريقنا", en: "Talk to Our Team" },
    ],
  },

  general: {
    id: "general",
    nameAr: "أعمال عامة",
    nameEn: "General Business",
    keywords: [],
    keywordsEn: [],
    typicalServices: [
      { ar: "خدمة احترافية متميزة", en: "Premium Professional Service" },
      { ar: "استشارات متخصصة", en: "Expert Consulting" },
      { ar: "حلول مخصصة لاحتياجاتك", en: "Tailored Solutions" },
      { ar: "دعم وخدمة عملاء", en: "Customer Support" },
      { ar: "جودة معتمدة ومضمونة", en: "Certified Quality" },
      { ar: "تنفيذ سريع واحترافي", en: "Fast Professional Execution" },
    ],
    seoKeywords: {
      ar: ["خدمات احترافية", "أفضل شركة", "جودة عالية", "خدمة متميزة"],
      en: ["professional services", "best company", "quality service", "trusted provider"],
    },
    designHints: {
      colorPalette: "professional blue-white — trust, credibility",
      mood: "Professional, credible, trustworthy, modern",
      typography: "Clean modern sans-serif throughout",
      heroStyle: "Professional environment, team at work, satisfied customers",
    },
    trustSignals: [
      { ar: "جودة معتمدة ومضمونة", en: "Certified & Guaranteed Quality" },
      { ar: "خدمة عملاء على مدار الساعة", en: "24/7 Customer Service" },
      { ar: "خبرة وكفاءة عالية", en: "High Expertise & Efficiency" },
      { ar: "ثقة آلاف العملاء", en: "Trusted by Thousands" },
    ],
    ctaVariants: [
      { ar: "تواصل معنا الآن", en: "Contact Us Now" },
      { ar: "احصل على استشارة مجانية", en: "Get Free Consultation" },
      { ar: "ابدأ اليوم", en: "Start Today" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// INDUSTRY DETECTOR — كاشف الصناعة
// ═══════════════════════════════════════════════════════════════

/**
 * Detects the industry from the user's prompt using keyword matching.
 * Returns the industry ID (e.g., "cleaning", "restaurant", "medical")
 */
export function detectIndustry(prompt: string): string {
  const text = prompt.toLowerCase();

  let bestMatch = "general";
  let bestScore = 0;

  for (const [id, profile] of Object.entries(INDUSTRY_ENGINE)) {
    if (id === "general") continue;

    let score = 0;

    for (const kw of profile.keywords) {
      if (text.includes(kw.toLowerCase())) score += 2;
    }
    for (const kw of profile.keywordsEn) {
      if (text.includes(kw.toLowerCase())) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = id;
    }
  }

  return bestMatch;
}

// ═══════════════════════════════════════════════════════════════
// PROMPT ENRICHER — مُحسّن البرومبت
// ═══════════════════════════════════════════════════════════════

/**
 * Enriches the raw prompt with industry-specific context before AI generation.
 * Adds: typical services, design hints, trust signals, CTA variants.
 */
export function enrichPromptWithIndustry(
  rawPrompt: string,
  industryId: string,
  isArabicUI: boolean
): string {
  const profile = INDUSTRY_ENGINE[industryId] || INDUSTRY_ENGINE.general;

  const services = profile.typicalServices.map(s => isArabicUI ? s.ar : s.en).join(", ");
  const trust = profile.trustSignals.map(t => isArabicUI ? t.ar : t.en).join(", ");
  const ctas = profile.ctaVariants.map(c => isArabicUI ? c.ar : c.en).join(" | ");
  const seo = (isArabicUI ? profile.seoKeywords.ar : profile.seoKeywords.en).join(", ");

  if (isArabicUI) {
    return `${rawPrompt}

[معلومات إضافية لمحرك الصناعة - Industry Engine Context]:
- القطاع المكتشف: ${profile.nameAr}
- الخدمات النموذجية لهذا القطاع: ${services}
- عناصر الثقة الموصى بها: ${trust}
- عبارات الدعوة للعمل المقترحة: ${ctas}
- الكلمات المفتاحية السيو: ${seo}
- اقتراح التصميم: ${profile.designHints.mood} — ${profile.designHints.colorPalette}
- ملاحظة: استخدم هذه المعلومات لإثراء المحتوى فقط — لا تُدرجها حرفياً إذا كانت لا تتناسب مع البيانات الفعلية للنشاط التجاري.`;
  } else {
    return `${rawPrompt}

[Industry Engine Context]:
- Detected Sector: ${profile.nameEn}
- Typical Services: ${services}
- Trust Signals: ${trust}
- CTA Variants: ${ctas}
- SEO Keywords: ${seo}
- Design Mood: ${profile.designHints.mood} — ${profile.designHints.colorPalette}
- Note: Use this information to enrich content only — do not include it verbatim if it doesn't match the actual business data.`;
  }
}

// Map Arabic activity types (from dashboard wizard) to industry IDs
const ACTIVITY_TO_INDUSTRY: Record<string, string> = {
  "خدمات نظافة": "cleaning",
  "خدمات تنظيف": "cleaning",
  "نظافة": "cleaning",
  "مطعم": "restaurant",
  "مطعم ومقهى": "restaurant",
  "مقهى": "restaurant",
  "كافيه": "restaurant",
  "طعام": "restaurant",
  "عيادة طبية": "medical",
  "طب": "medical",
  "صحة": "medical",
  "عقارات": "realestate",
  "عقار": "realestate",
  "صالون تجميل": "beauty",
  "تجميل": "beauty",
  "تعليم": "education",
  "أكاديمية": "education",
  "تدريب": "education",
  "مقاولات": "construction",
  "بناء": "construction",
  "تجارة إلكترونية": "ecommerce",
  "متجر": "ecommerce",
  "لياقة بدنية": "fitness",
  "جيم": "fitness",
  "شحن ولوجستيات": "logistics",
  "شحن": "logistics",
  "لوجستيك": "logistics",
};

/**
 * Maps an Arabic activity type to an industry ID.
 */
export function mapActivityToIndustry(activityType: string): string | undefined {
  if (!activityType || activityType === "other") return undefined;
  const lower = activityType.toLowerCase().trim();
  for (const [key, id] of Object.entries(ACTIVITY_TO_INDUSTRY)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return id;
    }
  }
  return undefined;
}

/**
 * Main entry point for the Industry Engine.
 * Detects industry and returns an enriched prompt + the detected industry profile.
 */
export function runIndustryEngine(
  rawPrompt: string,
  isArabicUI: boolean = true,
  overrideIndustryId?: string
): { enrichedPrompt: string; industryId: string; industryProfile: IndustryProfile } {
  const industryId = overrideIndustryId || detectIndustry(rawPrompt);
  const industryProfile = INDUSTRY_ENGINE[industryId] || INDUSTRY_ENGINE.general;
  const enrichedPrompt = enrichPromptWithIndustry(rawPrompt, industryId, isArabicUI);

  return { enrichedPrompt, industryId, industryProfile };
}
