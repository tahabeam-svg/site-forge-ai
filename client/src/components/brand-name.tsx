interface BrandNameProps {
  lang: string;
  className?: string;
}

export default function BrandName({ lang, className = "" }: BrandNameProps) {
  const isAr = lang === "ar";
  return (
    <span
      className={`${isAr ? "brand-logo-ar" : "brand-logo-en"} ${className}`}
      data-testid="text-brand"
    >
      {isAr ? "عربي ويب" : "ARABYWEB"}
    </span>
  );
}
