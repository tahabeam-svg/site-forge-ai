import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import EditorPage from "@/pages/editor";
import PreviewPage from "@/pages/preview";
import TemplatesPage from "@/pages/templates";
import BillingPage from "@/pages/billing";
import AdminPage from "@/pages/admin";
import AIMarketingPage from "@/pages/ai-marketing";
import SettingsPage from "@/pages/settings";
import AnalyticsPage from "@/pages/analytics";
import PaymentMethodsPage from "@/pages/payment-methods";
import GitHubDeployPage from "@/pages/github-deploy";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

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
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/billing">{() => <ProtectedRoute component={BillingPage} />}</Route>
      <Route path="/admin">{() => <ProtectedRoute component={AdminPage} />}</Route>
      <Route path="/secure-admin">{() => <ProtectedRoute component={AdminPage} />}</Route>
      <Route path="/marketing">{() => <ProtectedRoute component={AIMarketingPage} />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={SettingsPage} />}</Route>
      <Route path="/analytics">{() => <ProtectedRoute component={AnalyticsPage} />}</Route>
      <Route path="/github-deploy">{() => <ProtectedRoute component={GitHubDeployPage} />}</Route>
      <Route path="/payment-methods">{() => <ProtectedRoute component={PaymentMethodsPage} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
