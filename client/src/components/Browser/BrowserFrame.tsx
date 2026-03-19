import { useLocation } from "wouter";
import React, { useEffect } from "react";
import { Bot, Settings, MessageCircle, Zap, LayoutDashboard, Compass, Users, Ticket, LogOut, User, Shield, Receipt, Package, Rocket, Beaker, TrendingUp, MapPin, Droplets, Star, Database, Layout, Code, Code2, Store, Layers, Building2 } from "lucide-react";
const browserIcon = "/arcadia_suite_icon.png";
import { useAuth } from "@/hooks/use-auth";
import { useNavigationTracking } from "@/hooks/use-navigation-tracking";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrowserFrameProps {
  children: React.ReactNode;
}

function CompactNavigationBar() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { trackPageView } = useNavigationTracking();
  
  const navigateTo = (path: string, pageName: string) => {
    trackPageView(pageName, path);
    setLocation(path);
  };
  
  return (
    <div className="h-10 bg-background border-b border-border flex items-center px-3 gap-2 text-xs text-muted-foreground shadow-xs z-10">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
        {(user?.role === "admin" || user?.role === "master") && (
          <div 
            className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
            onClick={() => navigateTo("/admin", "Administração")}
            data-testid="bookmark-admin"
          >
            <div className="w-4 h-4 bg-gradient-to-br from-slate-700 to-slate-900 rounded-sm flex items-center justify-center">
              <Settings className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="hidden md:inline">Administração</span>
          </div>
        )}
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/", "Início")}
          data-testid="bookmark-home"
        >
          <img src={browserIcon} className="w-4 h-4 rounded-sm object-cover" alt="" />
          <span className="hidden md:inline">Início</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/agent", "Agent")}
          data-testid="bookmark-agent"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-primary to-blue-600 rounded-sm flex items-center justify-center">
            <Bot className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Agent</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/xos/inbox", "XOS Inbox")}
          data-testid="bookmark-xos-inbox"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-[#00a884] to-[#25D366] rounded-sm flex items-center justify-center">
            <MessageCircle className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Inbox</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/automations", "Automações")}
          data-testid="bookmark-automations"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-[#c89b3c] to-[#d4a94a] rounded-sm flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Automações</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/insights", "Insights")}
          data-testid="bookmark-insights"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-[#1f334d] to-[#2d4a6f] rounded-sm flex items-center justify-center">
            <LayoutDashboard className="w-2.5 h-2.5 text-[#c89b3c]" />
          </div>
          <span className="hidden md:inline">Insights</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/compass", "Compass")}
          data-testid="bookmark-compass"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-[#c89b3c] to-[#1f334d] rounded-sm flex items-center justify-center">
            <Compass className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Compass</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/production", "Produção")}
          data-testid="bookmark-production"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-sm flex items-center justify-center">
            <Users className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Produção</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/support", "Suporte")}
          data-testid="bookmark-support"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-rose-500 to-rose-700 rounded-sm flex items-center justify-center">
            <Ticket className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Suporte</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/soe", "SOE")}
          data-testid="bookmark-soe"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center">
            <Building2 className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">SOE</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/retail", "Retail")}
          data-testid="bookmark-retail"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-sm flex items-center justify-center">
            <Store className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Retail</span>
        </div>
        {/* Plus hidden temporarily */}
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/fisco", "Fisco")}
          data-testid="bookmark-fisco"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-sm flex items-center justify-center">
            <Receipt className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Fisco</span>
        </div>
        <div 
          className="flex items-center gap-1 hover:bg-muted px-2 py-1.5 rounded cursor-pointer transition-colors flex-shrink-0"
          onClick={() => navigateTo("/engineering", "Engenharia")}
          data-testid="bookmark-engineering"
        >
          <div className="w-4 h-4 bg-gradient-to-br from-teal-500 to-green-700 rounded-sm flex items-center justify-center">
            <Compass className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="hidden md:inline">Engenharia</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0 border-l pl-3 ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5" data-testid="button-user-menu">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline text-xs">{user?.name || user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">@{user?.username}</p>
                {(user?.role === "admin" || user?.role === "master") && (
                  <p className="text-xs leading-none text-primary flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3" />
                    {user?.role === "master" ? "Administrador Master" : "Administrador"}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            {(user?.role === "admin" || user?.role === "master") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Plataforma</DropdownMenuLabel>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigateTo("/development", "Desenvolvimento")}
                  data-testid="menu-development"
                >
                  <Code2 className="mr-2 h-4 w-4" />
                  <span>Centro de Desenvolvimento</span>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function BrowserFrame({ children }: BrowserFrameProps) {
  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      {/* Navigation Bar */}
      <CompactNavigationBar />

      {/* Content Area */}
      <div className="flex-1 bg-white relative overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}