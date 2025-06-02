import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import DeliveryForm from "@/pages/delivery-form";
import DeliveryExpress from "@/pages/delivery-express";
import DeliveryStandard from "@/pages/delivery-standard";
import BecomeDriver from "@/pages/become-driver";
import Tracking from "@/pages/tracking";
import DriverRegistration from "@/pages/driver-registration";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminPanel from "@/pages/admin-panel";
import HelpCenter from "@/pages/help-center";
import Contact from "@/pages/contact";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import OrderRequests from "@/pages/order-requests";
import CustomerOrders from "@/pages/customer-orders";
import SmartRecommendations from "@/pages/smart-recommendations";
import AIRecommendations from "@/pages/ai-recommendations";
import CustomerAccount from "@/pages/customer-account";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Login} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/landing" component={Landing} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/delivery/express" component={DeliveryExpress} />
          <Route path="/delivery/standard" component={DeliveryStandard} />
          <Route path="/delivery" component={DeliveryForm} />
          <Route path="/driver/register" component={BecomeDriver} />
          <Route path="/driver-registration" component={DriverRegistration} />
          <Route path="/driver/orders" component={OrderRequests} />
          <Route path="/customer/orders" component={CustomerOrders} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/contact" component={Contact} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/privacy" component={PrivacyPolicy} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/delivery/express" component={DeliveryExpress} />
          <Route path="/delivery/standard" component={DeliveryStandard} />
          <Route path="/delivery" component={DeliveryForm} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/driver/register" component={BecomeDriver} />
          <Route path="/driver-registration" component={DriverRegistration} />
          <Route path="/driver/dashboard" component={DriverDashboard} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/contact" component={Contact} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/driver/orders" component={OrderRequests} />
          <Route path="/customer/orders" component={CustomerOrders} />
          <Route path="/smart-recommendations" component={SmartRecommendations} />
          <Route path="/ai-recommendations" component={AIRecommendations} />
          <Route path="/account" component={CustomerAccount} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
