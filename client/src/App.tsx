import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import DeliveryForm from "@/pages/delivery-form";
import Tracking from "@/pages/tracking";
import DriverRegistration from "@/pages/driver-registration";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminPanel from "@/pages/admin-panel";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/delivery/express" component={Landing} />
          <Route path="/delivery/standard" component={Landing} />
          <Route path="/delivery" component={Landing} />
          <Route path="/driver/register" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/delivery/express" component={DeliveryForm} />
          <Route path="/delivery/standard" component={DeliveryForm} />
          <Route path="/delivery" component={DeliveryForm} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/driver/register" component={DriverRegistration} />
          <Route path="/driver/dashboard" component={DriverDashboard} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
