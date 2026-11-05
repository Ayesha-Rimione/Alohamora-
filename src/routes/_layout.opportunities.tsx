import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Briefcase, CalendarClock, ExternalLink, Info, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/state/app-state";
import { OPPORTUNITIES, type OpportunityDef } from "@/data/opportunities";
import { computeCoverage, getSkill } from "@/data/skills";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/opportunities")({
  head: () => ({
    meta: [
      { title: "Accio Opportunities — Alohomora!" },
      {
        name: "description",
        content: "Internships and entry-level tech roles matched to the skills you can demonstrate.",
      },
      { property: "og:title", content: "Accio Opportunities — Alohomora!" },
      { property: "og:description", content: "Opportunities matched to your demonstrated skills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Opportunities,
});

function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86_400_000);
}

function OpportunityCard({
  opp,
  matched,
  missing,
  saved,
  onSave,
}: {
  opp: OpportunityDef;
  matched: string[];
  missing: string[];
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className={cn("card-magic flex h-full flex-col rounded-2xl border bg-card p-5", saved ? "border-gold-muted/60" : "border-border")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground">{opp.role}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{opp.company}</p>
        </div>
        <button
          onClick={onSave}
          aria-label={saved ? `Remove ${opp.role} from saved` : `Save ${opp.role}`}
          className="shrink-0 rounded-full p-1.5 text-gold-muted transition-colors hover:bg-gold/20"
        >
          {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">{opp.type}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">{opp.level}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">{opp.location}</span>
        {opp.remote && <span className="rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">Remote OK</span>}
      </div>

      {opp.deadline && (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-plum">
          <CalendarClock className="size-3.5 text-gold-muted" aria-hidden />
          Demo deadline: {new Date(`${opp.deadline}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
          {daysUntil(opp.deadline) >= 0 && ` · ${daysUntil(opp.deadline)} days left`}
        </p>
      )}

      <div className="mt-3 space-y-1.5 text-xs">
        <p>
          <span className="font-semibold text-success">You demonstrate: </span>
          {matched.length ? matched.map((id) => getSkill(id)?.name).join(", ") : "—"}
        </p>
        <p>
          <span className="font-semibold text-muted-foreground">Gaps to close: </span>
          {missing.length ? missing.map((id) => getSkill(id)?.name).join(", ") : "none — you tick every box"}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-gold-muted/35 bg-gold/10 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-muted">Why this matches you</p>
        <p className="mt-1 text-sm leading-snug text-foreground">{opp.why}</p>
      </div>

      <div className="mt-auto pt-3">
        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Demo listing — not a live opening. When real listings are configured, verified application links appear here. For practice, browse roles on{" "}
          <a href="https://www.bdjobs.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-gold-muted hover:underline">
            bdjobs.com <ExternalLink className="size-3 inline" aria-hidden />
          </a>
        </p>
      </div>
    </article>
  );
}

function Opportunities() {
  const { state, toggleBookmark } = useApp();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [placeFilter, setPlaceFilter] = useState("all");

  const coverage = useMemo(() => computeCoverage(state.profile.targetRole, state.skills), [state.profile.targetRole, state.skills]);
  const have = new Set(coverage.areas.filter((a) => a.status !== "missing").map((a) => a.skill.id));

  const roleOptions = [...new Set(OPPORTUNITIES.map((o) => o.role))];

  const filtered = OPPORTUNITIES.filter((o) => {
    if (query && !`${o.role} ${o.company} ${o.location}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (roleFilter !== "all" && o.role !== roleFilter) return false;
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (placeFilter === "remote" && !o.remote) return false;
    if (placeFilter === "onsite" && o.remote) return false;
    return true;
  }).sort(
    (a, b) => b.skills.filter((s) => have.has(s)).length - a.skills.filter((s) => have.has(s)).length,
  );

  return (
    <div>
      <PageHeader
        title="Accio Opportunities"
        subtitle="Internships and entry-level roles across Bangladesh's tech market, ranked by how much of each listing's skill list you already demonstrate."
        icon={<Briefcase className="size-7" />}
      />

      {/* Filters */}
      <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="op-search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden />
            <Input id="op-search" className="pl-8" placeholder="Role, company or city…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="op-role">Role</Label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger id="op-role" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="op-type">Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="op-type" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Internship & full-time</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Entry-level">Entry-level / full-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="op-place">Location</Label>
          <Select value={placeFilter} onValueChange={setPlaceFilter}>
            <SelectTrigger id="op-place" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any location</SelectItem>
              <SelectItem value="remote">Remote OK</SelectItem>
              <SelectItem value="onsite">On-site / hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        {filtered.length} demo {filtered.length === 1 ? "listing" : "listings"} matched to your profile
        {state.bookmarks.filter((b) => b.startsWith("opp-")).length > 0 &&
          ` · ${state.bookmarks.filter((b) => b.startsWith("opp-")).length} saved`}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No listings match those filters"
          message="Loosen a filter or two — or widen your search. The owl promises the right door exists."
          action={
            <Button
              variant="outline"
              className="gold-frame bg-card font-semibold"
              onClick={() => {
                setQuery("");
                setRoleFilter("all");
                setTypeFilter("all");
                setPlaceFilter("all");
              }}
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((o) => (
            <li key={o.id}>
              <OpportunityCard
                opp={o}
                matched={o.skills.filter((s) => have.has(s))}
                missing={o.skills.filter((s) => !have.has(s))}
                saved={state.bookmarks.includes(o.id)}
                onSave={() => {
                  toggleBookmark(o.id);
                  toast.success(state.bookmarks.includes(o.id) ? "Removed from saved." : "Saved — find it again any time.");
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-lavender/50 bg-lavender/15 p-4">
        <DemoBadge />
        <p className="flex-1 text-sm leading-snug text-plum">
          Every listing here is invented for the prototype. No real company openings, deadlines or
          salaries are shown, and none of these cards link to a live application. The structure is
          ready to receive real listings later.
        </p>
      </div>
    </div>
  );
}
