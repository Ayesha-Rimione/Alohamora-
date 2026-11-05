import {
  AlarmClock,
  Bell,
  BookLock,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  Castle,
  ChevronLeft,
  FlaskConical,
  LogOut,
  Map as MapIcon,
  Menu,
  MessageCircle,
  RotateCcw,
  Trophy,
  UserRoundPen,
  X,
} from "lucide-react";
import { Link, Outlet, createFileRoute, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { toast } from "sonner";

import { api, USE_MOCK_API } from "@/lib/api";

import { LogoLockup } from "@/components/Brand";
import { Owl } from "@/components/Owl";
import { DemoBadge } from "@/components/StatusPill";
import { useApp } from "@/state/app-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Career & Skill Development",
    items: [
      { to: "/dashboard", label: "The Great Hall", hint: "Main dashboard", icon: Castle },
      { to: "/map", label: "The Marauder Map", hint: "Career-readiness roadmap", icon: MapIcon },
      { to: "/potion-lab", label: "Potion Lab", hint: "Personalized learning plans", icon: FlaskConical },
      { to: "/opportunities", label: "Accio Opportunities", hint: "Jobs & internships", icon: Briefcase },
      { to: "/restricted-section", label: "The Restricted Section", hint: "Curated learning resources", icon: BookLock },
      { to: "/spellbook", label: "Spellbook", hint: "Academic materials & quizzes", icon: BookOpen },
    ],
  },
  {
    group: "Academic Life",
    items: [
      { to: "/marauder-mode", label: "Marauder Mode", hint: "Semester planner & deadlines", icon: CalendarDays },
      { to: "/grades", label: "Accio Grades", hint: "CGPA goal calculator", icon: Calculator },
      { to: "/owl-panic-room", label: "OWL Panic Room", hint: "Last-minute exam rescue", icon: AlarmClock },
      { to: "/codex", label: "The Comeback Codex", hint: "Achievements, streaks & quests", icon: Trophy },
    ],
  },
  {
    group: "AI Companion",
    items: [
      { to: "/professor", label: "Professor Who?", hint: "AI study & career assistant", icon: MessageCircle },
    ],
  },
];

function findLabel(pathname: string): string {
  for (const g of NAV) for (const i of g.items) if (i.to === pathname) return i.label;
  return "Alohomora!";
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col overflow-y-auto pb-4">
      <div className={cn("flex items-center px-4 pt-5 pb-4", collapsed && "justify-center px-2")}>
        <Link to="/dashboard" onClick={onNavigate} aria-label="Alohomora! home">
          {collapsed ? (
            <img
              src="/favicon.png"
              alt="Alohomora!"
              width={34}
              height={34}
              className="rounded-lg bg-gold/10 p-0.5"
            />
          ) : (
            <LogoLockup size={34} wordmarkClassName="text-lg text-cream" />
          )}
        </Link>
      </div>
      {NAV.map((group) => (
        <div key={group.group} className="mb-3">
          {!collapsed && (
            <p className="px-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fairy/70">
              {group.group}
            </p>
          )}
          <ul className="space-y-0.5 px-2.5">
            {group.items.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-gold/20 text-gold shadow-[inset_0_0_0_1px_oklch(0.852_0.107_88.5/0.35)]"
                        : "text-cream/85 hover:bg-lavender/10 hover:text-cream",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <item.icon className={cn("size-[18px] shrink-0", active ? "text-gold" : "text-lavender group-hover:text-gold")} />
                    {!collapsed && (
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium leading-tight">{item.label}</span>
                        <span className="truncate text-[11px] text-fairy/80">{item.hint}</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {!collapsed && (
        <p className="mt-auto px-5 pt-3 text-[10px] leading-relaxed text-fairy/60">
          Alohomora! prototype · demo data only
        </p>
      )}
    </nav>
  );
}

function DashboardShell() {
  const { state, resetDemo } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(3);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const label = findLabel(pathname);

  const notifications = [
    { id: "n1", title: "New quest unlocked", body: "APIs & deployment quest is ready in your Potion Lab.", time: "2h ago" },
    { id: "n2", title: "Deadline approaching", body: "Algorithm assignment 3 (CSE 331) is due soon.", time: "Today" },
    { id: "n3", title: "The Restricted Section", body: "New free resources matched to your skill gaps.", time: "Yesterday" },
  ];

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "plum-panel fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-gold/15 transition-[width] duration-200 md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-6 z-50 flex size-7 items-center justify-center rounded-full border border-gold/40 bg-plum text-gold transition-transform hover:scale-110"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 md:hidden", drawerOpen ? "" : "pointer-events-none")}>
        <div
          className={cn(
            "absolute inset-0 bg-plum-deep/60 backdrop-blur-sm transition-opacity",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
        <aside
          className={cn(
            "plum-panel absolute inset-y-0 left-0 w-72 border-r border-gold/15 shadow-2xl transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-full text-cream/80 hover:bg-lavender/10"
          >
            <X className="size-4" />
          </button>
          <SidebarContent collapsed={false} onNavigate={() => setDrawerOpen(false)} />
        </aside>
      </div>

      {/* Main column */}
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "md:pl-[72px]" : "md:pl-64")}>
        <header className="sticky top-0 z-30 border-b border-gold-muted/25 bg-parchment/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button
              className="flex size-9 items-center justify-center rounded-lg text-plum hover:bg-gold/20 md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
              <Link to="/dashboard" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline">
                Alohomora!
              </Link>
              <span className="hidden text-gold-muted sm:inline" aria-hidden>
                /
              </span>
              <span className="truncate font-display font-semibold tracking-wide text-foreground">{label}</span>
            </nav>
            <div className="ml-auto flex items-center gap-1.5">
              <DemoBadge className="hidden sm:inline-flex" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative flex size-9 items-center justify-center rounded-full text-plum transition-colors hover:bg-gold/20"
                    aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
                  >
                    <Bell className="size-[18px]" />
                    {unread > 0 && (
                      <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="font-display tracking-wide">Notifications</span>
                    <button
                      className="text-xs font-medium text-gold-muted hover:underline"
                      onClick={() => {
                        setUnread(0);
                        toast.success("All caught up — the owl approves.");
                      }}
                    >
                      Mark all read
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                      <span className="text-sm font-semibold text-foreground">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.body}</span>
                      <span className="text-[10px] uppercase tracking-wider text-fairy">{n.time} · demo</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full border border-gold-muted/30 bg-card py-1 pl-1 pr-2.5 transition-colors hover:bg-gold/15"
                    aria-label="Profile menu"
                  >
                    <Owl size={26} animate={false} alt="" />
                    <span className="hidden max-w-24 truncate text-xs font-semibold text-plum sm:inline">
                      {state.profile.name || "Student"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{state.profile.name || "Student"}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {state.profile.degree} · {state.profile.academicYear}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/map" })}>
                    <UserRoundPen className="size-4" /> Edit career profile
                  </DropdownMenuItem>
                  {USE_MOCK_API && (
                    <DropdownMenuItem
                      onClick={() => {
                        resetDemo();
                        toast.success("Fresh parchment! Demo data has been reset.");
                      }}
                    >
                      <RotateCcw className="size-4" /> Reset demo data
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      if (!USE_MOCK_API) {
                        try {
                          await api.auth.logout();
                        } catch {
                          // ignore
                        }
                        toast.success("Signed out successfully. The owl waves goodbye. ✦");
                        navigate({ to: "/login" });
                      } else {
                        toast("Signed out of the demo. The owl waves goodbye. ✦");
                        navigate({ to: "/" });
                      }
                    }}
                  >
                    <LogOut className="size-4" /> {USE_MOCK_API ? "Sign out (demo)" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {!state.onboarded && (
          <div className="border-b border-gold-muted/25 bg-gold/20">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-sm sm:px-6">
              <Owl size={26} animate={false} alt="" />
              <span className="text-plum">The Keykeeper wants to know you — finish the 2-minute tour to personalize your map.</span>
              <Button asChild size="sm" variant="link" className="ml-auto h-auto p-0 text-plum underline">
                <Link to="/onboarding">Take the tour</Link>
              </Button>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-gold-muted/25 py-4">
          <p className="mx-auto max-w-6xl px-4 text-center text-[11px] text-muted-foreground sm:px-6">
            Alohomora! prototype · Opportunities, courses and sponsors shown are demo data, not live offers · Made with ✦ for university students in Bangladesh
          </p>
        </footer>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_layout")({
  beforeLoad: async () => {
    if (!USE_MOCK_API) {
      const user = await api.auth.getCurrentUser();
      if (!user) {
        throw redirect({ to: "/login" });
      }
      return { user };
    }
  },
  component: DashboardShell,
});
