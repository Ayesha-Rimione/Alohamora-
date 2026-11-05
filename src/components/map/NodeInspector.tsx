import { useEffect } from "react";
import {
  AlertCircle,
  ExternalLink,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface NodeInspectorProps {
  node: {
    id: string;
    label: string;
    category: string;
    description: string;
    selfAssessedLevel: number; // 0-5
    evidenceStatus: "verified" | "submitted" | "unverified" | "missing";
    submittedEvidence?: {
      title: string;
      url: string;
    } | null;
    coursework?: {
      code: string;
      name: string;
      grade: string;
      credits: number;
    } | null;
    questTitle?: string;
    questPrompt?: string;
  } | null;
  onClose: () => void;
}

export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] border-l-2 border-gold/40 bg-card/95 text-foreground shadow-magic backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200"
      aria-label="Waypoint Inspector"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gold/20 p-5 bg-gold/5">
        <div>
          <span className="rounded-full bg-gold/15 border border-gold-muted/30 px-3 py-1 text-sm font-mono font-bold text-gold uppercase tracking-wider">
            {node.category}
          </span>
          <h2 className="font-serif text-2xl font-bold text-foreground mt-2">
            {node.label}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-gold/10 hover:text-foreground transition-colors"
          aria-label="Close Inspector"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Illustrative Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 text-sm text-amber-700 font-serif flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0" />
        <span>Sample waypoint data for active prototype.</span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-gold-muted">
            Cartographic Lore & Scope
          </h3>
          <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
            {node.description}
          </p>
        </div>

        {/* 1. Self-Assessment (Subjective) */}
        <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">1. Self-Assessed Rating</span>
            <span className="text-base font-mono font-bold text-gold">
              Level {node.selfAssessedLevel}/5
            </span>
          </div>
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`size-4 ${
                  node.selfAssessedLevel >= s
                    ? "fill-gold text-gold"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              {node.selfAssessedLevel === 0
                ? "Unassessed"
                : node.selfAssessedLevel <= 2
                ? "Developing"
                : "Competent"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground italic">
            * Self-assessed rating; not an independently evaluated skill.
          </p>
        </div>

        {/* 2. Submitted Evidence (Student Portfolio Proof) */}
        <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">2. Project Evidence</span>
            <span className="text-sm font-bold uppercase px-2.5 py-0.5 rounded bg-border text-muted-foreground">
              {node.submittedEvidence ? "Attached" : "None"}
            </span>
          </div>

          {node.submittedEvidence ? (
            <div className="space-y-1.5 text-base">
              <p className="font-semibold text-foreground">{node.submittedEvidence.title}</p>
              <a
                href={node.submittedEvidence.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline font-mono"
              >
                {node.submittedEvidence.url} <ExternalLink className="size-4" />
              </a>
              <p className="text-sm text-muted-foreground italic pt-1">
                Evidence submitted by student. Pending review.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No project artifact or GitHub repository linked yet.
            </p>
          )}
        </div>

        {/* 3. Verification State (Honest Platform Status) */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-base font-bold text-destructive">
            <ShieldAlert className="size-4" />
            <span>3. External Verification</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Status: <strong className="text-foreground">No independent review</strong>. External faculty review is not active in this prototype — evidence here is self-reported only.
          </p>
        </div>

        {/* 4. University Coursework Link */}
        <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <GraduationCap className="size-5 text-gold" />
            <span>4. Academic Coursework</span>
          </div>
          {node.coursework ? (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground font-mono text-base">
                {node.coursework.code}: {node.coursework.name}
              </p>
              <p>
                Grade: <strong className="text-foreground">{node.coursework.grade}</strong> ({node.coursework.credits} Credit Hours)
              </p>
              <p className="text-muted-foreground italic pt-1">
                Coursework demonstrates theoretical instruction, not portfolio proof.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No matching university course record mapped.
            </p>
          )}
        </div>

        {/* 5. Recommended Practical Quest */}
        {node.questTitle && (
          <div className="rounded-2xl border border-gold-muted/40 bg-gold/10 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-serif font-bold text-gold">
              <Sparkles className="size-4" />
              <span>Recommended Quest: {node.questTitle}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {node.questPrompt}
            </p>
            <Button
              onClick={() => {
                toast.success(`Quest "${node.questTitle}" noted in your Potion Lab! ✦`);
              }}
              className="w-full text-base font-bold btn-sparkle min-h-[44px] mt-1"
            >
              Take Quest in Potion Lab
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gold/20 p-4 bg-card/80 text-center">
        <Button variant="outline" onClick={onClose} className="w-full min-h-[44px] text-base">
          Dismiss Inspector
        </Button>
      </div>
    </aside>
  );
}
