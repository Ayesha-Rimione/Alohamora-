import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoLockup } from "@/components/Brand";

// Placeholder legal pages linked from the registration checkbox.
// TODO: replace with reviewed legal copy before launch.
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Alohomora!" },
      { name: "description", content: "Placeholder terms of use for the Alohomora! prototype." },
      { property: "og:title", content: "Terms of Use — Alohomora!" },
      { property: "og:description", content: "Placeholder terms of use for the Alohomora! prototype." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <main>
        <Link to="/" aria-label="Alohomora! home" className="inline-block">
          <LogoLockup size={38} />
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold tracking-wide text-foreground">Terms of Use</h1>
        <p className="mt-1 text-sm text-muted-foreground">Placeholder — prototype copy, not legal advice.</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
          <p>
            Alohomora! is a career-readiness platform for university students in Bangladesh. By creating an
            account you agree to use the platform honestly: represent your own skills, don't share your
            account, and treat other students with respect.
          </p>
          <p>
            This is a prototype. Learning plans, skill coverage, opportunities and resources shown in the app
            are sample data and do not constitute job offers, guarantees of employment or verified listings.
          </p>
          <p>
            We may update these terms as the product evolves. Continued use of the platform after an update
            means you accept the revised terms.
          </p>
        </div>
        <p className="mt-8 text-sm">
          <Link to="/" className="font-semibold text-gold-muted hover:underline">
            Back to Alohomora!
          </Link>
        </p>
      </main>
    </div>
  );
}
