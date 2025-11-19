import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { User, FileText, Settings, Activity, LogOut, User as UserIcon, Mail, IdCard, RefreshCw } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user: authUser, token } = useAuth();

  const { 
    data: user, 
    isLoading, 
    error,
    refetch 
  } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    retry: 2,
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(`${API_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }

      return res.json();
    },
  });

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Get user data from either source
  const currentUser = user || authUser;

  console.log("🔍 Home Page Debug:", { 
    user, 
    authUser, 
    currentUser,
    token, 
    isLoading, 
    error,
    localStorageToken: localStorage.getItem("token")
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">MyBankAI</h1>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <span className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {currentUser?.email || "User"}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* User Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Your Profile
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-4">
                  <p className="font-medium mb-2">Failed to load user data</p>
                  <p className="text-sm mb-4">{error.message}</p>
                  <Button onClick={() => refetch()} size="sm">
                    Try Again
                  </Button>
                </div>
              ) : currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-lg">
                        {currentUser.firstName && currentUser.lastName 
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <IdCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">User ID</p>
                      <p className="text-sm font-mono text-muted-foreground">
                        {currentUser.id}
                      </p>
                    </div>
                  </div>

                  {currentUser.createdAt && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>User data not available</p>
                  <Button onClick={() => refetch()} className="mt-2" size="sm">
                    Load Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Welcome Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold tracking-tight">
                Welcome to MyBankAI {currentUser?.firstName ? `, ${currentUser.firstName}` : ''}!
              </h2>
              <p className="text-xl text-muted-foreground">
                Manage your AI profile, control your data,
                and view AI decisions with complete transparency.
              </p>
            </div>

           
          </div>
        </div>

        {/* Customer Portal Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Customer Portal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/profile">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-profile">
                <CardHeader>
                  <User className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>My AI Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View AI-generated inferences about your financial behavior and request corrections
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/consent">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-consent">
                <CardHeader>
                  <Settings className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Data & Consent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Control how your data is used for fraud detection, offers, and financial advice
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/decisions">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-decisions">
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Recent Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Review AI decisions with detailed explanations for loans, fraud alerts, and approvals
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Admin Dashboard Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Admin Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/audit-log">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-audit-log">
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Immutable audit trail of all AI decisions for compliance and governance
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/corrections">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-corrections">
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Correction Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Review and process customer requests to correct AI profile inferences
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/fairness">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-fairness">
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Fairness Monitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor AI decision fairness across demographics for regulatory compliance
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}