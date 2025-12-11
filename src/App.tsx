import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { UserProvider } from "@/contexts/UserContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AIProvider } from "@/contexts/AIContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatWindow } from "@/components/chat/ChatWindow";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkspaceSelect from "./pages/WorkspaceSelect";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Boards from "./pages/Boards";
import ProjectPlanning from "./pages/ProjectPlanning";
import CalendarPage from "./pages/CalendarPage";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <UserProvider>
        <WorkspaceProvider>
          <AIProvider>
            <NotificationsProvider>
              <ChatProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/features" element={<FeaturesPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/workspaces" element={<WorkspaceSelect />} />
                      <Route path="/join/:code" element={<WorkspaceSelect />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<Projects />} />
                      <Route path="/boards" element={<Boards />} />
                      <Route path="/planning" element={<ProjectPlanning />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <ChatWindow />
                  </BrowserRouter>
                </TooltipProvider>
              </ChatProvider>
            </NotificationsProvider>
          </AIProvider>
        </WorkspaceProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
