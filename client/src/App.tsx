import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AiProfilePage from "@/pages/customer/ai-profile";
import DataConsentPage from "@/pages/customer/data-consent";
import RecentDecisionsPage from "@/pages/customer/recent-decisions";
import AuditLogPage from "@/pages/admin/audit-log";
import CorrectionQueuePage from "@/pages/admin/correction-queue";
import FairnessMonitorPage from "@/pages/admin/fairness-monitor";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}

function Router() {
  const { user, token, isLoading } = useAuth();

  console.log("🔍 Router Debug:", { 
    isLoading, 
    hasToken: !!token, 
    hasUser: !!user,
    path: window.location.pathname 
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Switch>
      {/* Root route - show Home if authenticated, Landing if not */}
      <Route path="/">
        {token && user ? <Home /> : <Landing />}
      </Route>

      {/* Auth routes - show auth pages only if not authenticated */}
      <Route path="/login">
        {token && user ? <Home /> : <LoginPage />}
      </Route>

      <Route path="/signup">
        {token && user ? <Home /> : <SignupPage />}
      </Route>

      {/* Protected routes */}
      <Route path="/profile">
        {token && user ? <AiProfilePage /> : <Landing />}
      </Route>

      <Route path="/consent">
        {token && user ? <DataConsentPage /> : <Landing />}
      </Route>

      <Route path="/decisions">
        {token && user ? <RecentDecisionsPage /> : <Landing />}
      </Route>

      {/* Admin routes */}
      <Route path="/admin/audit-log">
        {token && user ? <AuditLogPage /> : <Landing />}
      </Route>

      <Route path="/admin/corrections">
        {token && user ? <CorrectionQueuePage /> : <Landing />}
      </Route>

      <Route path="/admin/fairness">
        {token && user ? <FairnessMonitorPage /> : <Landing />}
      </Route>

      {/* 404 */}
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