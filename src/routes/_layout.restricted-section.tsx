import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, BookLock, ExternalLink, Gift, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/state/app-state";
import { PATRONUS_FUND_PREVIEW, RESOURCES, type ResourceDef } from "@/data/resources";
import { computeCoverage, getSkill, SKILLS } from "@/data/skills";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/restricted-section")({
  head: () => ({
    meta: [
      { title: "The Restricted Section — Alohomora!" },
      {
        name: "description",
        content: "A curated magical library of free and paid learning resources, matched to your skill gaps.",
      },
      { property: "og:title", content: "The Restricted Section — Alohomora!" },
      { property: "og:description", content: "Curated resources matched to your skill gaps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RestrictedSection,
});

const PRICE_COLOR: Record<ResourceDef["price"], string> = {
  Free: "bg-success/15 text-success border-success/40",
  Paid: "bg-gold/20 text-gold-muted border-gold-muted/50",
  Sponsored: "bg-lavender/25 text-plum border-lavender/60",
};

function ResourceCard({ res, saved, onSave }: { res: ResourceDef; saved: boolean; onSave: () => void }) {
  return (
    <Card className={cn("flex h-full flex-col justify-between transition-colors", saved ? "border-gold-muted/60 bg-card" : "border-border bg-card")}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold leading-snug text-foreground">{res.title}</h3>
            <p className="mt-1 text-base text-muted-foreground">{res.provider}</p>
          </div>
          <button
            onClick={onSave}
            aria-label={saved ? `Remove ${res.title} from bookmarks` : `Bookmark ${res.title}`}
            className="shrink-0 rounded-full p-2 text-gold-muted transition-colors hover:bg-gold/20"
          >
            {saved ? <BookmarkCheck className="size-6" /> : <Bookmark className="size-6" />}
          </button>
        </div>

        {/* chips: Free or Paid, level, time */}
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-3 py-1 text-sm font-bold", PRICE_COLOR[res.price])}>
            {res.price}
          </span>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">
            {res.difficulty}
          </span>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">
            ~{res.hours}h
          </span>
        </div>

        {/* one-line reason */}
        <p className="text-base text-muted-foreground line-clamp-1">{res.why}</p>
      </div>

      {/* Bookmark button and Open button */}
      <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
        <Button
          onClick={onSave}
          variant="outline"
          size="sm"
          className="flex-1 min-h-[44px] text-sm font-medium"
        >
          {saved ? "Bookmarked" : "Bookmark"}
        </Button>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="flex-1 min-h-[44px] text-sm font-medium"
        >
          <a href={res.url} target="_blank" rel="noopener noreferrer">
            Open <ExternalLink className="size-4 ml-1.5" aria-hidden />
          </a>
        </Button>
      </div>
    </Card>
  );
}

function RestrictedSection() {
  const { state, toggleBookmark } = useApp();
  const [query, setQuery] = useState("");
  const [skillF, setSkillF] = useState("all");
  const [diffF, setDiffF] = useState("all");
  const [activeTab, setActiveTab] = useState<"All" | "Free" | "Paid" | "Sponsored">("All");

  const coverage = useMemo(() => computeCoverage(state.profile.targetRole, state.skills), [state.profile.targetRole, state.skills]);

  // Free resources are never ranked below paid ones just because they are free
  const priceRank = { Free: 0, Sponsored: 1, Paid: 2 } as const;
  const gapRank = new Map(
    coverage.areas.map((a, i) => [
      a.skill.id,
      a.status === "missing" ? i : a.status === "developing" ? 100 + i : 200 + i,
    ]),
  );
  const rankOf = (id: string) => gapRank.get(id) ?? 999;

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (query && !`${r.title} ${r.provider} ${r.why}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (skillF !== "all" && r.skillId !== skillF) return false;
      if (diffF !== "all" && r.difficulty !== diffF) return false;
      if (activeTab !== "All" && r.price !== activeTab) return false;
      return true;
    }).sort((a, b) => priceRank[a.price] - priceRank[b.price] || rankOf(a.skillId) - rankOf(b.skillId));
  }, [query, skillF, diffF, activeTab, rankOf]);

  const recommended = useMemo(() => {
    return [...RESOURCES]
      .sort((a, b) => priceRank[a.price] - priceRank[b.price] || rankOf(a.skillId) - rankOf(b.skillId))
      .slice(0, 3);
  }, [rankOf]);

  const clearFilters = () => {
    setQuery("");
    setSkillF("all");
    setDiffF("all");
    setActiveTab("All");
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="The Restricted Section"
        subtitle="Curated learning resources matched to your skill gaps."
        icon={<BookLock className="size-8" />}
      />

      {/* Top: Recommended for your map, a row of exactly 3 cards */}
      <section className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
            <Sparkles className="size-6 text-gold-muted" /> Recommended for your map
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Top 3 resources prioritized for your active gaps.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recommended.map((r) => (
            <ResourceCard
              key={`rec-${r.id}`}
              res={r}
              saved={state.bookmarks.includes(r.id)}
              onSave={() => {
                toggleBookmark(r.id);
                toast.success(state.bookmarks.includes(r.id) ? "Bookmark removed." : "Bookmarked to your shelf.");
              }}
            />
          ))}
        </div>
      </section>

      {/* Below: large tabs All / Free / Paid / Sponsored, a search box and 2 big filters */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <TabsList className="grid grid-cols-4 max-w-lg min-h-[48px] p-1 bg-muted/60">
              <TabsTrigger value="All" className="text-base font-semibold min-h-[40px]">All</TabsTrigger>
              <TabsTrigger value="Free" className="text-base font-semibold min-h-[40px]">Free</TabsTrigger>
              <TabsTrigger value="Paid" className="text-base font-semibold min-h-[40px]">Paid</TabsTrigger>
              <TabsTrigger value="Sponsored" className="text-base font-semibold min-h-[40px]">Sponsored</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-3.5 size-5 text-muted-foreground" aria-hidden />
              <Input
                id="rs-search"
                className="pl-10 min-h-[48px] text-base"
                placeholder="Search title or provider…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Select value={skillF} onValueChange={setSkillF}>
              <SelectTrigger className="w-full sm:w-[200px] min-h-[48px] text-base">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All skills</SelectItem>
                {SKILLS.filter((s) => RESOURCES.some((r) => r.skillId === s.id)).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={diffF} onValueChange={setDiffF}>
              <SelectTrigger className="w-full sm:w-[170px] min-h-[48px] text-base">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any level</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
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
        </div>

        <div className="flex items-center justify-between text-base text-muted-foreground">
          <span>{filtered.length} resources available</span>
          <span>Free options ranked first</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No resources match those filters"
            message="Try widening your search or choosing another level."
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
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                res={r}
                saved={state.bookmarks.includes(r.id)}
                onSave={() => {
                  toggleBookmark(r.id);
                  toast.success(state.bookmarks.includes(r.id) ? "Bookmark removed." : "Bookmarked to your shelf.");
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* The Patronus Fund: ONE preview card with a "Preview" label and two lines of text at most */}
      <Card className="border-lavender/60 bg-lavender/15 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Gift className="size-6 text-purple-rich" />
            <h3 className="font-display text-xl font-bold text-foreground">The Patronus Fund</h3>
          </div>
          <span className="rounded-md bg-purple-rich/20 px-3 py-1 text-sm font-bold uppercase tracking-wider text-purple-rich">
            Preview
          </span>
        </div>
        <p className="mt-3 text-base text-foreground leading-relaxed">
          Sponsored vouchers, certification funds, and company challenges will be listed here.
          No commercial promotions will ever influence skill gap rankings.
        </p>
      </Card>
    </div>
  );
}
