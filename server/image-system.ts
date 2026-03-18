/**
 * ArabyWeb Automatic Image System — نظام الصور الآلي
 * Selects relevant Unsplash images based on business type, design style, and section.
 */

export type DesignStyle = "luxury" | "corporate" | "modern" | "minimal" | "creative";
export type SectionType = "hero" | "about" | "gallery" | "team" | "services" | "testimonials";

interface ImageSet {
  hero: string;
  about: string;
  gallery: string[];
}

const IMAGE_LIBRARY: Record<string, Record<DesignStyle | "default", ImageSet>> = {
  restaurant: {
    luxury: {
      hero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  realestate: {
    luxury: {
      hero: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  medical: {
    default: {
      hero: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1588776814546-1ffbb172d4a8?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  beauty: {
    luxury: {
      hero: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  tech: {
    modern: {
      hero: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  luxury: {
    luxury: {
      hero: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1619559378823-8e05a2c3de1e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1619559378823-8e05a2c3de1e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  agency: {
    modern: {
      hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  gym: {
    default: {
      hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1590239926044-4131f5d0654b?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  education: {
    default: {
      hero: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
  photography: {
    creative: {
      hero: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop&q=75",
      ],
    },
    default: {
      hero: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&h=900&fit=crop&q=85",
      about: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=600&h=400&fit=crop&q=75",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop&q=75",
      ],
    },
  } as any,
};

const FALLBACK_IMAGES: Record<DesignStyle | "default", ImageSet> = {
  luxury: {
    hero: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&h=900&fit=crop&q=85",
    about: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1497366754035-f200581393ab?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop&q=75",
    ],
  },
  corporate: {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=85",
    about: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1560250097-0dc05c0f61e6?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&q=75",
    ],
  },
  modern: {
    hero: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=900&fit=crop&q=85",
    about: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1512867957657-38dbae50a35b?w=600&h=400&fit=crop&q=75",
    ],
  },
  minimal: {
    hero: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=900&fit=crop&q=85",
    about: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800&h=600&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1483389127117-b6a2102724ae?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1497366754035-f200581393ab?w=600&h=400&fit=crop&q=75",
    ],
  },
  creative: {
    hero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&q=85",
    about: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=600&h=400&fit=crop&q=75",
    ],
  },
  default: {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=85",
    about: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&q=75",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=75",
    ],
  },
};

export function getImagesForBusiness(businessType: string, style: DesignStyle | string = "modern"): ImageSet {
  const typeLib = IMAGE_LIBRARY[businessType];
  if (typeLib) {
    return (typeLib as any)[style] || (typeLib as any).default || FALLBACK_IMAGES[style as DesignStyle] || FALLBACK_IMAGES.default;
  }
  return FALLBACK_IMAGES[style as DesignStyle] || FALLBACK_IMAGES.default;
}

export function detectDesignStyle(description: string, businessType: string): DesignStyle {
  const d = description.toLowerCase();
  const luxuryKw = ["فاخر", "راقي", "بريميوم", "premium", "luxury", "vip", "exclusive", "حصري", "رفاهية", "فخم", "ذهبي", "gold", "عطر", "perfume", "مجوهرات", "jewelry", "فندق", "hotel", "مطعم فاخر"];
  const corporateKw = ["شركة", "مؤسسة", "استشارات", "consulting", "corporate", "enterprise", "مجموعة", "group", "قانوني", "legal", "محاسبة", "accounting", "استثمار", "investment", "مالي", "financial"];
  const minimalKw = ["minimal", "بسيط", "نظيف", "clean", "simple", "white", "أبيض", "أرشيف", "مدونة", "blog"];
  const creativeKw = ["إبداعي", "creative", "فن", "art", "تصميم", "design", "موسيقى", "music", "استوديو", "studio", "مصور", "photographer", "فيديو", "video", "أنيميشن"];
  if (luxuryKw.some(k => d.includes(k)) || ["luxury", "hotel", "restaurant"].includes(businessType)) return "luxury";
  if (corporateKw.some(k => d.includes(k)) || ["consulting", "legal", "finance"].includes(businessType)) return "corporate";
  if (minimalKw.some(k => d.includes(k))) return "minimal";
  if (creativeKw.some(k => d.includes(k)) || ["photography", "portfolio"].includes(businessType)) return "creative";
  return "modern";
}

export const DESIGN_STYLE_PALETTES: Record<DesignStyle, {
  primary: string; accent: string; dark: string; surface: string;
  label_ar: string; label_en: string; description_ar: string;
}> = {
  luxury: {
    primary: "#b8860b", accent: "#1a1a2e", dark: "#0d0d1a", surface: "#1a1510",
    label_ar: "فاخر", label_en: "Luxury",
    description_ar: "ذهبي وداكن — للعلامات التجارية الراقية",
  },
  corporate: {
    primary: "#1d4ed8", accent: "#0f172a", dark: "#0f172a", surface: "#1e293b",
    label_ar: "احترافي", label_en: "Corporate",
    description_ar: "أزرق مهني — للشركات والمؤسسات",
  },
  modern: {
    primary: "#7c3aed", accent: "#06b6d4", dark: "#0f0a1e", surface: "#1a103a",
    label_ar: "عصري", label_en: "Modern",
    description_ar: "بنفسجي وسماوي — للتقنية والخدمات",
  },
  minimal: {
    primary: "#18181b", accent: "#71717a", dark: "#09090b", surface: "#18181b",
    label_ar: "بسيط", label_en: "Minimal",
    description_ar: "أسود وأبيض — للمدونات والأرشيف",
  },
  creative: {
    primary: "#db2777", accent: "#f59e0b", dark: "#1a0a2e", surface: "#1f0a3c",
    label_ar: "إبداعي", label_en: "Creative",
    description_ar: "ورديّ وذهبي — للمبدعين والاستوديوهات",
  },
};

export function getStylePalette(style: string): typeof DESIGN_STYLE_PALETTES[DesignStyle] {
  return DESIGN_STYLE_PALETTES[style as DesignStyle] || DESIGN_STYLE_PALETTES.modern;
}
