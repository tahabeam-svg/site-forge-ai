import ArabyLogo from "@/components/araby-logo";

interface BrandNameProps {
  lang: string;
  className?: string;
  logoSize?: number;
}

export default function BrandName({ lang, className = "", logoSize = 58 }: BrandNameProps) {
  const isAr = lang === "ar";
  return (
    <span className={`flex items-center gap-2 ${className}`} data-testid="text-brand">
      <ArabyLogo size={logoSize} />
      <span className={isAr ? "brand-logo-ar" : "brand-logo-en"}>
        {isAr ? "عربي ويب" : "ARABYWEB"}
      </span>
    </span>
  );
}
