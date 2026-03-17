import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import ChatWidget from "@/components/chat-widget";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import EditorPage from "@/pages/editor";
import PreviewPage from "@/pages/preview";
import BillingPage from "@/pages/billing";
import AdminPage from "@/pages/admin";
import AIMarketingPage from "@/pages/ai-marketing";
import SettingsPage from "@/pages/settings";
import AnalyticsPage from "@/pages/analytics";
import PaymentMethodsPage from "@/pages/payment-methods";
import GitHubDeployPage from "@/pages/github-deploy";
import DomainsPage from "@/pages/domains";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import FAQPage from "@/pages/faq";
import DeployGuidePage from "@/pages/deploy-guide";
import ResetPasswordPage from "@/pages/reset-password";
import PaymentTestPage from "@/pages/payment-test";
import IncidentResponsePage from "@/pages/incident-response";
import FreeWebsitePage from "@/pages/free-website";
import FreeStorePage from "@/pages/free-store";
import AIBuilderPage from "@/pages/ai-builder";

import { useEffect } from "react";

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
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/payment-test">{() => <ProtectedRoute component={PaymentTestPage} />}</Route>
      <Route path="/free-website" component={FreeWebsitePage} />
      <Route path="/free-store" component={FreeStorePage} />
      <Route path="/ai-builder">{() => <ProtectedRoute component={AIBuilderPage} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const [location] = useLocation();
  const hideChat = location.startsWith("/editor/") || location.startsWith("/preview/");
  return (
    <>
      <Toaster />
      <Router />
      {!hideChat && <ChatWidget />}
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
