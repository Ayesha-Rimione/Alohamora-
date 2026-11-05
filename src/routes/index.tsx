import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Compass, FlaskConical, Map as MapIcon, MessageCircle, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-library.jpg";
import { LogoLockup } from "@/components/Brand";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alohomora! — Unlock your potential. Build your proof." },
      {
        name: "description",
        content:
          "A magical career-readiness platform for university students in Bangladesh. Discover career paths, close skill gaps, build proof of your abilities.",
      },
      { property: "og:title", content: "Alohomora! — Unlock your potential. Build your proof." },
      {
        property: "og:description",
        content:
          "Your degree tells the world what you studied. Alohomora! helps you prove what you can do.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    to: "/map",
    icon: MapIcon,
    title: "The Marauder Map",
    desc: "See the honest distance between your skills today and your dream career — milestone by milestone.",
  },
  {
    to: "/potion-lab",
    icon: FlaskConical,
    title: "Potion Lab",
    desc: "A weekly learning plan brewed around your real schedule. Hands-on tasks, not endless videos.",
  },
  {
    to: "/opportunities",
    icon: Compass,
    title: "Accio Opportunities",
    desc: "Internships and entry-level roles matched to the skills you can already demonstrate.",
  },
  {
    to: "/professor",
    icon: MessageCircle,
    title: "Professor Who?",
    desc: "A study and career companion for planning projects, understanding gaps and interview prep.",
  },
];

const STEPS = [
  { n: "1", title: "Choose your destination", desc: "Pick the career you're aiming for — AI/ML engineer, frontend developer, data analyst and more." },
  { n: "2", title: "Reveal your map", desc: "Tell Alohomora! what you can already do. Your Marauder Map shows what's proven, what's growing and what's missing." },
  { n: "3", title: "Complete real quests", desc: "Short, practical quests that build evidence — projects, deployments and practice you can point employers to." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-gold-muted/25 bg-parchment/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Alohomora! home">
            <LogoLockup size={38} />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/onboarding"
              className="hidden text-sm font-medium text-plum underline-offset-4 hover:underline sm:inline"
            >
              Take the tour
            </Link>
            <Button asChild className="btn-sparkle glow-magic font-semibold">
              <Link to="/dashboard">
                Enter the Great Hall <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-14 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-rise-in">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-muted/40 bg-gold/15 px-3 py-1 text-xs font-semibold tracking-wide text-gold-muted uppercase">
              <Sparkles className="size-3.5" aria-hidden /> A magical career academy for students
            </p>
            <h1 className="font-display text-4xl leading-tight font-bold tracking-wide text-foreground sm:text-5xl">
              Unlock your potential.
              <span className="text-goldgrad block">Build your proof.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Your degree tells the world what you studied. <strong className="text-foreground">Alohomora! helps you prove what you can do</strong> — for university students in Bangladesh ready to bridge the gap between lectures and industry.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-sparkle glow-magic animate-pulse-soft font-semibold">
                <Link to="/dashboard">Enter the Great Hall</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gold-frame bg-card font-semibold">
                <Link to="/onboarding">Take the 2-minute tour</Link>
              </Button>
            </div>
            <p className="mt-4 font-lore text-sm text-plum/80 italic">
              "Every expert was once a student with a wand and a deadline." — The Keykeeper Owl
            </p>
          </div>
          <div className="relative animate-rise-in delay-1">
            <div className="gold-frame overflow-hidden rounded-3xl shadow-[0_24px_60px_-20px_oklch(0.4_0.114_303.4/0.4)]">
              <img
                src={heroImg}
                alt="A candlelit enchanted library with ancient spellbooks and scrolls"
                className="aspect-[16/10] w-full object-cover"
                width={1600}
                height={1000}
              />
            </div>
            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-gold-muted/40 bg-card px-4 py-3 shadow-magic sm:-left-8">
              <Owl size={52} alt="" />
              <div>
                <p className="font-display text-sm font-semibold text-foreground">The Keykeeper Owl</p>
                <p className="text-xs text-muted-foreground">"Your first quest is waiting."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-wide text-foreground">
          Everything a student needs to become hireable
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="card-magic group rounded-2xl border border-border bg-card p-5"
            >
              <f.icon className="size-8 text-gold-muted transition-transform group-hover:scale-110" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold-muted">
                Explore <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="parchment rounded-3xl p-6 sm:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-foreground">How the magic works</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="font-display text-4xl font-bold text-gold/60">{s.n}</span>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="btn-sparkle glow-magic font-semibold">
              <Link to="/onboarding">Begin your first chapter</Link>
            </Button>
            <span className="text-xs text-muted-foreground">Free prototype · demo data, no real listings yet</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-gold-muted/25 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
          <LogoLockup size={28} wordmarkClassName="text-base" />
          <p className="text-xs text-muted-foreground">
            Alohomora! · A career-readiness prototype for university students in Bangladesh · All opportunities, courses and sponsors are demo data
          </p>
        </div>
      </footer>
    </div>
  );
}
