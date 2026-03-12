import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ExternalLink, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const lang = language;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const getPreviewHtml = () => {
    if (!project?.generatedHtml) return "";

    const overflowFix = `<style id="aw-overflow-fix">
html,body{overflow-x:hidden!important;max-width:100%!important}
*,*::before,*::after{box-sizing:border-box}
img,video,embed,object,iframe{max-width:100%!important;height:auto}
@media(max-width:768px){
  #aw-menu-btn{display:block !important;}
  .aw-nav-links{display:none !important;}
}
</style>
<script id="aw-mobile-nav">(function(){
  var mSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  var cSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var BTNS='#aw-menu-btn,[id*="menu-btn"],[id*="hamburger"],[class*="hamburger"],[class*="menu-toggle"],[class*="nav-toggle"],[class*="burger"],[aria-controls*="menu"],[aria-controls*="nav"],[aria-label*="menu"],[aria-label*="Menu"],[aria-label*="قائمة"],[aria-label*="القائمة"],[aria-expanded]';
  function init(){
    if(window.innerWidth>768)return;
    var nav=document.querySelector('nav');
    if(!nav){var hdrs=document.querySelectorAll('header');for(var h=0;h<hdrs.length;h++){if(hdrs[h].querySelector('nav,[class*="nav"],[class*="menu"]')){nav=hdrs[h];break;}}}
    if(!nav)return;
    var existing=nav.querySelector(BTNS)||document.querySelector(BTNS);
    if(existing&&existing.id!=='aw-mobile-menu'){existing.style.cssText+='display:block!important;visibility:visible!important;opacity:1!important;';return;}
    var lc=nav.querySelector('.nav-links,.aw-nav-links,.navbar-links,.menu-links,.nav-menu,.nav-list,.header-links,[class*="nav-links"],[class*="nav-menu"],[class*="navbar-nav"],[class*="menu-links"]');
    if(!lc){var kids=nav.querySelectorAll('div,ul');for(var k=0;k<kids.length;k++){if(kids[k].querySelectorAll('a').length>=2){lc=kids[k];break;}}}
    if(!lc)return;
    lc.style.cssText+='display:none!important;';
    var anchors=lc.querySelectorAll('a');
    if(!anchors.length)return;
    var brand=nav.querySelector('[class*="brand"],[class*="logo"],.nav-brand,.logo,h1,h2,h3');
    if(brand){brand.style.whiteSpace='nowrap';brand.style.overflow='visible';brand.style.textOverflow='unset';brand.style.flexShrink='0';brand.style.maxWidth='65%';}
    /* Create mobile dropdown — appended to body to avoid hero/overflow traps */
    var mm=document.createElement('div');
    mm.id='aw-mobile-menu';
    mm.style.cssText='display:none;flex-direction:column;background:#fff;padding:0.75rem 1.25rem;position:fixed;left:0;right:0;top:60px;z-index:2147483646;box-shadow:0 8px 32px rgba(0,0,0,0.22);border-top:3px solid #e2e8f0;max-height:80vh;overflow-y:auto;';
    Array.from(anchors).forEach(function(a){
      var cl=a.cloneNode(true);
      cl.removeAttribute('style');
      cl.style.cssText='padding:0.85rem 0;font-size:1rem;font-weight:500;display:block;border-bottom:1px solid #f1f5f9;text-decoration:none;color:#1e293b;';
      cl.addEventListener('click',function(){mm.style.display='none';btn.innerHTML=mSvg;});
      mm.appendChild(cl);
    });
    var btn=document.createElement('button');
    btn.id='aw-menu-btn';btn.setAttribute('aria-label','Menu');btn.innerHTML=mSvg;
    btn.style.cssText='background:none;border:none;cursor:pointer;padding:8px;display:block!important;color:#0f172a;flex-shrink:0;line-height:1;';
    btn.addEventListener('click',function(){
      var isOpen=mm.style.display==='flex';
      if(!isOpen){
        var r=btn.getBoundingClientRect();
        mm.style.top=r.bottom+'px';
        mm.style.display='flex';
        btn.innerHTML=cSvg;
      }else{
        mm.style.display='none';
        btn.innerHTML=mSvg;
      }
    });
    document.addEventListener('click',function(e){
      if(mm.style.display==='flex'&&!mm.contains(e.target)&&e.target!==btn){
        mm.style.display='none';btn.innerHTML=mSvg;
      }
    });
    window.addEventListener('scroll',function(){
      if(mm.style.display==='flex'){var r=btn.getBoundingClientRect();mm.style.top=r.bottom+'px';}
    },{passive:true});
    var ni=nav.querySelector('.nav-inner,.nav-container,.navbar-inner,.nav-wrap,.container,[class*="nav-inner"],[class*="nav-container"],[class*="nav-wrap"]')||nav;
    ni.appendChild(btn);
    document.body.appendChild(mm);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();</script>`;
    const awBadge = `<div id="aw-free-badge" style="position:fixed;bottom:0;left:0;right:0;background:linear-gradient(90deg,#0f172a 0%,#1e293b 100%);color:#fff;text-align:center;padding:9px 16px;font-family:'Inter','Cairo',sans-serif;font-size:13px;z-index:2147483647;direction:ltr;display:flex;align-items:center;justify-content:center;gap:10px;border-top:2px solid #10b981;box-shadow:0 -2px 12px rgba(16,185,129,0.3);">Built with <strong style="color:#10b981;margin:0 4px;">ArabyWeb</strong><a href="https://arabyWeb.net/pricing" target="_blank" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:4px 14px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:bold;margin-left:6px;">Upgrade to remove</a></div>`;

    const applyFixes = (html: string) => {
      let fixed = html.replace(/<div id="aw-free-badge"[\s\S]*?<\/div>/i, awBadge);
      fixed = fixed.replace(/<style id="aw-overflow-fix">[\s\S]*?<\/style>/i, "");
      fixed = fixed.replace(/<script id="aw-mobile-nav">[\s\S]*?<\/script>/i, "");
      if (fixed.includes("</head>")) {
        fixed = fixed.replace("</head>", `${overflowFix}\n</head>`);
      } else {
        fixed = overflowFix + fixed;
      }
      return fixed;
    };

    if (project.generatedHtml.trimStart().startsWith("<!DOCTYPE")) {
      return applyFixes(project.generatedHtml);
    }

    return applyFixes(`<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.seoTitle || project.name}</title>
<meta name="description" content="${project.seoDescription || ""}">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; scroll-behavior: smooth; }
body { font-family: ${lang === "ar" ? "'Cairo', 'Tajawal', 'IBM Plex Sans Arabic'" : "'Inter', 'Poppins', 'Montserrat'"}, sans-serif; }
img { max-width: 100%; height: auto; }
${project.generatedCss || ""}
</style>
</head>
<body>
${project.generatedHtml}
</body>
</html>`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project || !project.generatedHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {lang === "ar" ? "لا يوجد محتوى للمعاينة" : "No content to preview"}
          </p>
          <Button onClick={() => navigate("/dashboard")} data-testid="button-back-dashboard">
            {t("backToDashboard", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-background shrink-0 shadow-sm">
        <Button
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-sm gap-1.5 shrink-0"
          size="sm"
          onClick={() => navigate(`/editor/${project.id}`)}
          data-testid="button-back-editor"
        >
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span className="hidden xs:inline">{lang === "ar" ? "تحرير" : "Edit"}</span>
          <span className="xs:hidden">{lang === "ar" ? "تحرير" : "Edit"}</span>
        </Button>
        <h1 className="text-sm font-semibold truncate max-w-[120px] sm:max-w-xs" data-testid="text-preview-name">{project.name}</h1>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => {
            const blob = new Blob([getPreviewHtml()], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
          }}
          data-testid="button-open-new-tab"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === "ar" ? "فتح" : "Open"}</span>
        </Button>
      </header>
      <div className="flex-1">
        <iframe
          srcDoc={getPreviewHtml()}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Full Preview"
          data-testid="iframe-full-preview"
        />
      </div>
    </div>
  );
}
