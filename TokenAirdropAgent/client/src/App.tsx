import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/dashboard">
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/">
        {() => <Login />}
      </Route>
      <Route path="/airdrops">
        {() => (
          <AppLayout>
            <Airdrops />
          </AppLayout>
        )}
      </Route>
      <Route path="/tokens">
        {() => (
          <AppLayout>
            <Tokens />
          </AppLayout>
        )}
      </Route>
      <Route path="/users">
        {() => (
          <AppLayout>
            <Users />
          </AppLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <AppLayout>
            <Settings />
          </AppLayout>
        )}
      </Route>
      <Route path="/login">
        {() => <Login />}
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
