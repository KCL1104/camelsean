import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Airdrops from "@/pages/airdrops";
import Tokens from "@/pages/tokens";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar-new";
import Header from "@/components/layout/header";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import { useState } from "react";
import { AirdropProvider } from "@/context/airdrop-context";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/dashboard">
        {() => (
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/">
        {() => {
          const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
          if (isLoggedIn) {
            window.location.href = "/dashboard";
            return null;
          }
          return <Login />;
        }}
      </Route>
      <Route path="/airdrops">
        {() => (
          <PrivateRoute>
            <AppLayout>
              <Airdrops />
            </AppLayout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/tokens">
        {() => (
          <PrivateRoute>
            <AppLayout>
              <Tokens />
            </AppLayout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/users">
        {() => (
          <PrivateRoute>
            <AppLayout>
              <Users />
            </AppLayout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <PrivateRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/login">
        {() => {
          const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
          if (isLoggedIn) {
            window.location.href = "/dashboard";
            return null;
          }
          return <Login />;
        }}
      </Route>
      <Route path="/signup">
        {() => <SignUp />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AirdropProvider>
        <Router />
        <Toaster />
      </AirdropProvider>
    </QueryClientProvider>
  );
}

export default App;
