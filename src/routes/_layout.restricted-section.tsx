import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, BookLock, ExternalLink, Gift, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <article className={cn("card-magic flex h-full flex-col rounded-2xl border bg-card p-4", saved ? "border-gold-muted/60" : "border-border")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-foreground">{res.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{res.provider}</p>
        </div>
        <button
          onClick={onSave}
          aria-label={saved ? `Remove ${res.title} from bookmarks` : `Bookmark ${res.title}`}
          className="shrink-0 rounded-full p-1 text-gold-muted transition-colors hover:bg-gold/20"
        >
          {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-lavender/20 px-2 py-0.5 font-medium text-plum">{getSkill(res.skillId)?.name ?? res.skillId}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">{res.difficulty}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">~{res.hours}h</span>
        <span className={cn("rounded-full border px-2 py-0.5 font-bold", PRICE_COLOR[res.price])}>{res.price}</span>
      </div>
      <p className="mt-2 text-sm leading-snug text-muted-foreground">{res.why}</p>
      <a
        href={res.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-muted hover:underline"
      >
        Open resource <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </article>
  );
}

function RestrictedSection() {
  const { state, toggleBookmark } = useApp();
  const [query, setQuery] = useState("");
  const [skillF, setSkillF] = useState("all");
  const [diffF, setDiffF] = useState("all");
  const [priceF, setPriceF] = useState("all");
  const [durF, setDurF] = useState("all");

  const coverage = useMemo(() => computeCoverage(state.profile.targetRole, state.skills), [state.profile.targetRole, state.skills]);
  // Free-first ranking; paid never outranks an equivalent free resource.
  const priceRank = { Free: 0, Sponsored: 1, Paid: 2 } as const;
  const gapRank = new Map(
    coverage.areas.map((a, i) => [
      a.skill.id,
      a.status === "missing" ? i : a.status === "developing" ? 100 + i : 200 + i,
    ]),
  );
  const rankOf = (id: string) => gapRank.get(id) ?? 999;

  const filtered = RESOURCES.filter((r) => {
    if (query && !`${r.title} ${r.provider} ${r.why}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (skillF !== "all" && r.skillId !== skillF) return false;
    if (diffF !== "all" && r.difficulty !== diffF) return false;
    if (priceF !== "all" && r.price !== priceF) return false;
    if (durF === "short" && r.hours > 10) return false;
    if (durF === "medium" && (r.hours <= 10 || r.hours > 40)) return false;
    if (durF === "long" && r.hours <= 40) return false;
    return true;
  }).sort((a, b) => priceRank[a.price] - priceRank[b.price] || rankOf(a.skillId) - rankOf(b.skillId));

  const recommended = [...RESOURCES]
    .sort((a, b) => rankOf(a.skillId) - rankOf(b.skillId))
    .slice(0, 3);

  return (
    <div>
      <PageHeader
        title="The Restricted Section"
        subtitle="A curated library of learning resources, ranked free-first and matched to the gaps on your Marauder Map. Every link points to a well-known official platform."
        icon={<BookLock className="size-7" />}
      />

      {/* Recommended */}
      <section className="mb-8 rounded-3xl border border-gold-muted/40 bg-gold/10 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-wide text-foreground">
          <Sparkles className="size-5 text-gold-muted" /> Recommended for your Marauder Map
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chosen to close your biggest gaps for a {coverage.areas.length > 0 ? "target role" : "career"} — starting with skills that need evidence.
        </p>
        <ul className="mt-4 grid gap-4 lg:grid-cols-3">
          {recommended.map((r) => (
            <li key={r.id}>
              <ResourceCard res={r} saved={state.bookmarks.includes(r.id)} onSave={() => { toggleBookmark(r.id); toast.success(state.bookmarks.includes(r.id) ? "Bookmark removed." : "Bookmarked to your Spellbook shelf."); }} />
            </li>
          ))}
        </ul>
      </section>

      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="rs-search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden />
            <Input id="rs-search" className="pl-8" placeholder="Title or provider…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rs-skill">Skill</Label>
          <Select value={skillF} onValueChange={setSkillF}>
            <SelectTrigger id="rs-skill" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All skills</SelectItem>
              {SKILLS.filter((s) => RESOURCES.some((r) => r.skillId === s.id)).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rs-diff">Difficulty</Label>
          <Select value={diffF} onValueChange={setDiffF}>
            <SelectTrigger id="rs-diff" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any level</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rs-dur">Duration</Label>
          <Select value={durF} onValueChange={setDurF}>
            <SelectTrigger id="rs-dur" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any length</SelectItem>
              <SelectItem value="short">Under 10h</SelectItem>
              <SelectItem value="medium">10–40h</SelectItem>
              <SelectItem value="long">40h+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rs-price">Price</Label>
          <Select value={priceF} onValueChange={setPriceF}>
            <SelectTrigger id="rs-price" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Free & paid</SelectItem>
              <SelectItem value="Free">Free only</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Sponsored">Sponsored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">{filtered.length} resources found · free options always rank first</p>

      {filtered.length === 0 ? (
        <EmptyState
          title="The shelf is empty for that combination"
          message="Try fewer filters. The Restricted Section rewards the patient, but not the overly specific."
          action={
            <Button variant="outline" className="gold-frame bg-card font-semibold" onClick={() => { setQuery(""); setSkillF("all"); setDiffF("all"); setPriceF("all"); setDurF("all"); }}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <ResourceCard res={r} saved={state.bookmarks.includes(r.id)} onSave={() => { toggleBookmark(r.id); toast.success(state.bookmarks.includes(r.id) ? "Bookmark removed." : "Bookmarked to your Spellbook shelf."); }} />
            </li>
          ))}
        </ul>
      )}

      {/* Patronus Fund */}
      <section className="mt-10 rounded-3xl border border-lavender/60 bg-lavender/15 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-wide text-foreground">
              <Gift className="size-5 text-purple-rich" /> The Patronus Fund
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              A future showcase for sponsored learning — course access, certification vouchers and
              company challenges for high-effort students.
            </p>
          </div>
          <DemoBadge label="Preview · no live sponsors" />
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PATRONUS_FUND_PREVIEW.sponsorPromises.map((s) => (
            <li key={s.title} className="rounded-2xl border border-dashed border-purple-rich/40 bg-card/70 p-4">
              <p className="font-display font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          This is a design preview only. Alohomora! has no sponsor partnerships yet — nothing here is
          an offer, and paid placements will always be labelled transparently and kept out of career
          advice.
        </p>
      </section>
    </div>
  );
}
