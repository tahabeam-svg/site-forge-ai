import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";

// ── Eager-load only what every visitor sees immediately ──────────────────────
import LandingPage from "@/pages/landing";
import NotFound from "@/pages/not-found";

// ── Lazy-load everything else ────────────────────────────────────────────────
const AuthPage             = lazy(() => import("@/pages/auth"));
const DashboardPage        = lazy(() => import("@/pages/dashboard"));
const EditorPage           = lazy(() => import("@/pages/editor"));
const PreviewPage          = lazy(() => import("@/pages/preview"));
const BillingPage          = lazy(() => import("@/pages/billing"));
const AdminPage            = lazy(() => import("@/pages/admin"));
const AIMarketingPage      = lazy(() => import("@/pages/ai-marketing"));
const SettingsPage         = lazy(() => import("@/pages/settings"));
const AnalyticsPage        = lazy(() => import("@/pages/analytics"));
const PaymentMethodsPage   = lazy(() => import("@/pages/payment-methods"));
const GitHubDeployPage     = lazy(() => import("@/pages/github-deploy"));
const DomainsPage          = lazy(() => import("@/pages/domains"));
const TermsPage            = lazy(() => import("@/pages/terms"));
const PrivacyPage          = lazy(() => import("@/pages/privacy"));
const FAQPage              = lazy(() => import("@/pages/faq"));
const DeployGuidePage      = lazy(() => import("@/pages/deploy-guide"));
const DownloadCenterPage   = lazy(() => import("@/pages/download-center"));
const ResetPasswordPage    = lazy(() => import("@/pages/reset-password"));
const PaymentTestPage      = lazy(() => import("@/pages/payment-test"));
const IncidentResponsePage = lazy(() => import("@/pages/incident-response"));
const FreeWebsitePage      = lazy(() => import("@/pages/free-website"));
const FreeStorePage        = lazy(() => import("@/pages/free-store"));
const AIBuilderPage        = lazy(() => import("@/pages/ai-builder"));
const TemplatesPage        = lazy(() => import("@/pages/templates"));
const BlogPage             = lazy(() => import("@/pages/blog"));
const BlogPostPage         = lazy(() => import("@/pages/blog-post"));
const SeoAiWebsiteBuilderPage     = lazy(() => import("@/pages/seo-ai-website-builder"));
const SeoDigitalMarketingPage     = lazy(() => import("@/pages/seo-digital-marketing"));
const SeoWebsiteSaudiArabiaPage   = lazy(() => import("@/pages/seo-website-saudi-arabia"));
const ChatWidget           = lazy(() => import("@/components/chat-widget"));

// ── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function PricingRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/billing"); }, []);
  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/auth");
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Component />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard">{() => <ProtectedRoute component={DashboardPage} />}</Route>
        <Route path="/editor/:id">{() => <ProtectedRoute component={EditorPage} />}</Route>
        <Route path="/preview/:id">{() => <ProtectedRoute component={PreviewPage} />}</Route>
        <Route path="/billing">{() => <ProtectedRoute component={BillingPage} />}</Route>
        <Route path="/admin">{() => <ProtectedRoute component={AdminPage} />}</Route>
        <Route path="/secure-admin">{() => <ProtectedRoute component={AdminPage} />}</Route>
        <Route path="/marketing">{() => <ProtectedRoute component={AIMarketingPage} />}</Route>
        <Route path="/ai-marketing">{() => <ProtectedRoute component={AIMarketingPage} />}</Route>
        <Route path="/domains">{() => <ProtectedRoute component={DomainsPage} />}</Route>
        <Route path="/settings">{() => <ProtectedRoute component={SettingsPage} />}</Route>
        <Route path="/analytics">{() => <ProtectedRoute component={AnalyticsPage} />}</Route>
        <Route path="/github-deploy">{() => <ProtectedRoute component={GitHubDeployPage} />}</Route>
        <Route path="/payment-methods">{() => <ProtectedRoute component={PaymentMethodsPage} />}</Route>
        <Route path="/pricing" component={PricingRedirect} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/incident-response" component={IncidentResponsePage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/deploy-guide">{() => <ProtectedRoute component={DeployGuidePage} />}</Route>
        <Route path="/deploy-guide/:id">{() => <ProtectedRoute component={DeployGuidePage} />}</Route>
        <Route path="/download-center">{() => <ProtectedRoute component={DownloadCenterPage} />}</Route>
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/payment-test">{() => <ProtectedRoute component={PaymentTestPage} />}</Route>
        <Route path="/free-website" component={FreeWebsitePage} />
        <Route path="/free-store" component={FreeStorePage} />
        <Route path="/ai-builder">{() => <ProtectedRoute component={AIBuilderPage} />}</Route>
        <Route path="/templates">{() => <ProtectedRoute component={TemplatesPage} />}</Route>
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/ai-website-builder" component={SeoAiWebsiteBuilderPage} />
        <Route path="/digital-marketing-ai" component={SeoDigitalMarketingPage} />
        <Route path="/website-saudi-arabia" component={SeoWebsiteSaudiArabiaPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppInner() {
  const [location] = useLocation();
  const hideChat = location.startsWith("/editor/") || location.startsWith("/preview/");
  return (
    <>
      <Toaster />
      <Router />
      {!hideChat && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
