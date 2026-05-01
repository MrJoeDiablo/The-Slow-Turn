import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, ListChecks, LineChart, GitBranch, Terminal, Settings, LogOut, BookOpen, Shield, Flame, Link as LinkIcon, KeyRound } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { GatewayPill } from "./GatewayPill";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const baseNav = [
  { to: "/app",           label: "Dashboard",   icon: LayoutDashboard, end: true },
  { to: "/app/agents",    label: "Agents",      icon: Users },
  { to: "/app/chat",      label: "Chat",        icon: MessageSquare },
  { to: "/app/tasks",     label: "Tasks",       icon: ListChecks },
  { to: "/app/crawl",     label: "Crawl",       icon: Flame },
  { to: "/app/links",     label: "Links",       icon: LinkIcon },
  { to: "/app/vault",     label: "Vault",       icon: KeyRound },
  { to: "/app/trading",   label: "Trading",     icon: LineChart },
  { to: "/app/github",    label: "GitHub",      icon: GitBranch },
  { to: "/app/logs",      label: "Logs",        icon: Terminal },
  { to: "/app/reference", label: "Reference",   icon: BookOpen },
  { to: "/app/settings",  label: "Settings",    icon: Settings },
];

export default function AppShell() {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();
  const isAdmin = roles.includes("admin") || roles.includes("owner");
  const nav = isAdmin
    ? [...baseNav.slice(0, -1), { to: "/app/admin/infra", label: "Infra", icon: Shield }, baseNav[baseNav.length - 1]]
    : baseNav;
  const mobileNav = nav.slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <Logo />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end as any}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-[0.15em] transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <n.icon size={15} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          v0.5 · phase 5
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 gap-3 sticky top-0 z-30 safe-top">
          <div className="md:hidden"><Logo /></div>
          <div className="flex-1" />
          <GatewayPill />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-primary/10 text-primary font-mono">{initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.15em] truncate max-w-[200px]">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-bottom">
          <div className="grid grid-cols-5">
            {mobileNav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end as any}
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono uppercase tracking-wider",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <n.icon size={18} />
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}