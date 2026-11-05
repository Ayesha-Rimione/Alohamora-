import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoLockup } from "@/components/Brand";

// Placeholder legal pages linked from the registration checkbox.
// TODO: replace with reviewed legal copy before launch.
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Alohomora!" },
      { name: "description", content: "Placeholder privacy notice for the Alohomora! prototype." },
      { property: "og:title", content: "Privacy Notice — Alohomora!" },
      { property: "og:description", content: "Placeholder privacy notice for the Alohomora! prototype." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <main>
        <Link to="/" aria-label="Alohomora! home" className="inline-block">
          <LogoLockup size={38} />
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold tracking-wide text-foreground">Privacy Notice</h1>
        <p className="mt-1 text-sm text-muted-foreground">Placeholder — prototype copy, not legal advice.</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
          <p>
            We collect only what the platform needs to work: your name, university email, student ID,
            university and the study preferences and progress you enter. We never store your password in
            readable form, and passwords are never kept in your browser.
          </p>
          <p>
            In this prototype, your preferences and progress are saved locally in your browser only. Nothing
            is shared with employers, universities or third parties, and we don't sell data — ever.
          </p>
          <p>
            You can request deletion of your account and data at any time by contacting the team. When the
            real backend is connected, this notice will be updated with the full details.
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
