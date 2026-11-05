import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { MarauderMapCanvas } from "@/components/map";

export const Route = createFileRoute("/_layout/map")({
  head: () => ({
    meta: [
      { title: "The Marauder Map — Alohomora!" },
      {
        name: "description",
        content:
          "See the distance between your skills and your dream career — milestones, evidence and next quests.",
      },
      { property: "og:title", content: "The Marauder Map — Alohomora!" },
      { property: "og:description", content: "Your career-readiness roadmap, milestone by milestone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarauderMap,
});

function UnlockGate({ onReveal }: { onReveal: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-plum-deep/90 backdrop-blur-sm cursor-pointer"
      onClick={onReveal}
      role="button"
      aria-label="Click to reveal the Marauder Map"
    >
      <div className="flex flex-col items-center">
        <span className="animate-key-turn text-gold">
          <KeyRound className="size-16" />
        </span>
        <p className="mt-4 font-lore text-lg text-gold italic">
          "I solemnly swear I am up to good."
        </p>
        <p className="mt-2 text-xs text-gold/60 font-serif">Click to reveal the map</p>
      </div>
    </div>
  );
}

function MarauderMap() {
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden">
      {!gateOpen && <UnlockGate onReveal={() => setGateOpen(true)} />}
      <MarauderMapCanvas />
    </div>
  );
}
