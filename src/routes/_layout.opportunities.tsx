import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CalendarClock,
  Clock,
  ExternalLink,
  Info,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

function OpportunityCard({
  opp,
  matched,
  missing,
  saved,
  onSave,
  onOpenDetails,
}: {
  opp: OpportunityDef;
  matched: string[];
  missing: string[];
  saved: boolean;
  onSave: () => void;
  onOpenDetails: () => void;
}) {
  const totalSkills = opp.skills.length;
  const matchedCount = matched.length;

  return (
    <Card
      className={cn(
        "flex h-full flex-col justify-between transition-colors",
        saved ? "border-gold-muted/70 bg-card" : "border-border bg-card",
      )}
    >
      <div className="space-y-4">
        {/* Header: Title, Company, Sample Label & Save */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gold/15 px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider text-gold-muted">
                Sample
              </span>
              <span className="rounded-md bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
                Checked 5 Nov 2026
              </span>
            </div>
            <h3 className="mt-2 font-display text-xl font-bold leading-snug text-foreground">
              {opp.role}
            </h3>
            <p className="text-base text-muted-foreground">{opp.company}</p>
          </div>
          <button
            onClick={onSave}
            aria-label={saved ? `Remove ${opp.role} from saved` : `Save ${opp.role}`}
            className="shrink-0 rounded-full p-2 text-gold-muted transition-colors hover:bg-gold/20"
          >
            {saved ? <BookmarkCheck className="size-6" /> : <Bookmark className="size-6" />}
          </button>
        </div>

        {/* 3 chips: Location/Mode, Internship or Full-time, Level */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">
            {opp.remote ? "Remote OK" : opp.location}
          </span>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">
            {opp.type}
          </span>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">
            {opp.level}
          </span>
        </div>

        {/* Coverage line */}
        <p className="text-base font-medium text-foreground">
          You have <span className="font-bold text-success">{matchedCount}</span> of {totalSkills} skills
        </p>

        {/* Deadline only if known */}
        {opp.deadline && (
          <p className="flex items-center gap-2 text-sm text-plum">
            <CalendarClock className="size-4 text-gold-muted" aria-hidden />
            Sample deadline: {new Date(`${opp.deadline}T00:00:00Z`).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        )}
      </div>

      {/* Two action buttons */}
      <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-border/40">
        <Button
          onClick={onOpenDetails}
          variant="outline"
          size="sm"
          className="w-full min-h-[44px] text-sm font-semibold"
        >
          Why this matches you
        </Button>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="w-full min-h-[44px] text-sm font-semibold"
        >
          <a href="https://www.bdjobs.com/" target="_blank" rel="noopener noreferrer">
            Apply on official site <ExternalLink className="size-4 ml-1.5" aria-hidden />
          </a>
        </Button>
      </div>
    </Card>
  );
}

function Opportunities() {
  const { state, toggleBookmark } = useApp();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [placeFilter, setPlaceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [selectedOpp, setSelectedOpp] = useState<OpportunityDef | null>(null);

  const coverage = useMemo(
    () => computeCoverage(state.profile.targetRole, state.skills),
    [state.profile.targetRole, state.skills],
  );
  const have = new Set(
    coverage.areas.filter((a) => a.status !== "missing").map((a) => a.skill.id),
  );

  const roleOptions = useMemo(() => [...new Set(OPPORTUNITIES.map((o) => o.role))], []);
  const levelOptions = useMemo(() => [...new Set(OPPORTUNITIES.map((o) => o.level))], []);
  const locationOptions = useMemo(() => [...new Set(OPPORTUNITIES.map((o) => o.location))], []);

  const filtered = useMemo(() => {
    return OPPORTUNITIES.filter((o) => {
      if (
        query &&
        !`${o.role} ${o.company} ${o.location}`.toLowerCase().includes(query.toLowerCase())
      ) {
        return false;
      }
      if (roleFilter !== "all" && o.role !== roleFilter) return false;
      if (placeFilter !== "all" && o.location !== placeFilter) return false;
      if (typeFilter !== "all" && o.type !== typeFilter) return false;
      if (levelFilter !== "all" && o.level !== levelFilter) return false;
      if (modeFilter === "remote" && !o.remote) return false;
      if (modeFilter === "onsite" && o.remote) return false;
      return true;
    }).sort(
      (a, b) =>
        b.skills.filter((s) => have.has(s)).length - a.skills.filter((s) => have.has(s)).length,
    );
  }, [query, roleFilter, placeFilter, typeFilter, levelFilter, modeFilter, have]);

  const clearFilters = () => {
    setQuery("");
    setRoleFilter("all");
    setPlaceFilter("all");
    setTypeFilter("all");
    setLevelFilter("all");
    setModeFilter("all");
  };

  const selectedMatched = selectedOpp ? selectedOpp.skills.filter((s) => have.has(s)) : [];
  const selectedMissing = selectedOpp ? selectedOpp.skills.filter((s) => !have.has(s)) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accio Opportunities"
        subtitle="Sample tech roles matched to your demonstrated skills."
        icon={<Briefcase className="size-8" />}
      />

      {/* ONE horizontal bar with search, big selects and Clear filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-3.5 size-5 text-muted-foreground" aria-hidden />
          <Input
            id="op-search"
            className="pl-10 min-h-[48px] text-base"
            placeholder="Search role or company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[170px] min-h-[48px] text-base">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roleOptions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={placeFilter} onValueChange={setPlaceFilter}>
          <SelectTrigger className="w-full sm:w-[170px] min-h-[48px] text-base">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locationOptions.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[170px] min-h-[48px] text-base">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Entry-level">Entry-level</SelectItem>
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[150px] min-h-[48px] text-base">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {levelOptions.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {lvl}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-full sm:w-[150px] min-h-[48px] text-base">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>
            <SelectItem value="remote">Remote OK</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={clearFilters}
          variant="outline"
          className="min-h-[48px] text-base px-4 font-semibold"
        >
          Clear filters
        </Button>
      </div>

      <div className="flex items-center justify-between text-base text-muted-foreground">
        <span>{filtered.length} sample listings</span>
        {state.bookmarks.filter((b) => b.startsWith("opp-")).length > 0 && (
          <span>{state.bookmarks.filter((b) => b.startsWith("opp-")).length} saved</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No listings match those filters"
          message="Try loosening filters or searching another keyword."
          action={
            <Button
              variant="outline"
              className="gold-frame bg-card font-semibold min-h-[48px] text-base"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard
              key={o.id}
              opp={o}
              matched={o.skills.filter((s) => have.has(s))}
              missing={o.skills.filter((s) => !have.has(s))}
              saved={state.bookmarks.includes(o.id)}
              onSave={() => {
                toggleBookmark(o.id);
                toast.success(
                  state.bookmarks.includes(o.id)
                    ? "Removed from saved."
                    : "Saved — find it again any time.",
                );
              }}
              onOpenDetails={() => setSelectedOpp(o)}
            />
          ))}
        </div>
      )}

      {/* Side Drawer for Details */}
      <Sheet open={Boolean(selectedOpp)} onOpenChange={(open) => !open && setSelectedOpp(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto space-y-6 p-6 sm:p-8">
          {selectedOpp && (
            <>
              <SheetHeader className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-gold/15 px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider text-gold-muted">
                    Sample
                  </span>
                  <span className="text-sm text-muted-foreground">Checked 5 Nov 2026</span>
                </div>
                <SheetTitle className="font-display text-2xl font-bold text-foreground">
                  {selectedOpp.role}
                </SheetTitle>
                <SheetDescription className="text-base text-muted-foreground">
                  {selectedOpp.company} · {selectedOpp.location}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 text-base">
                <div className="rounded-xl border border-gold-muted/30 bg-gold/10 p-5">
                  <h4 className="font-bold text-gold-muted text-sm uppercase tracking-wider">
                    Why this matches you
                  </h4>
                  <p className="mt-2 text-foreground leading-relaxed">{selectedOpp.why}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Skills you demonstrate</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatched.length ? (
                      selectedMatched.map((id) => (
                        <span
                          key={id}
                          className="rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success"
                        >
                          {getSkill(id)?.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">None yet</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Missing skills to build</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMissing.length ? (
                      selectedMissing.map((id) => (
                        <span
                          key={id}
                          className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
                        >
                          {getSkill(id)?.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-success text-sm font-medium">
                        You meet all skill requirements!
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">Source & Verification</p>
                  <p>
                    Sample listing from mock catalog. When live listings are enabled, real
                    recruitment posts and source URLs are verified.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  asChild
                  className="w-full min-h-[48px] text-base font-semibold"
                >
                  <a href="https://www.bdjobs.com/" target="_blank" rel="noopener noreferrer">
                    Apply on official site <ExternalLink className="size-4 ml-2" />
                  </a>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
