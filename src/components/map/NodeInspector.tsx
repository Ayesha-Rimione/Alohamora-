import React, { useEffect } from "react";
import { type MapNode } from "@/data/map-sample-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ExternalLink,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Star,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface NodeInspectorProps {
  node: MapNode | null;
  onClose: () => void;
}

export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!node) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 border-l-2 border-gold/40 bg-card/95 text-foreground shadow-magic backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200"
      aria-label="Waypoint Inspector"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gold/20 p-4 bg-gold/5">
        <div>
          <span className="rounded-full bg-gold/15 border border-gold-muted/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-gold uppercase tracking-wider">
            {node.category}
          </span>
          <h2 className="font-serif text-lg font-bold text-foreground mt-1">
            {node.label}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-gold/10 hover:text-foreground transition-colors"
          aria-label="Close Inspector"
        >
          ✕
        </button>
      </div>

      {/* Illustrative Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-[10px] text-amber-300 font-serif flex items-center gap-1.5">
        <AlertCircle className="size-3 shrink-0" />
        <span>Phase 1 Prototype: Visibly labelled sample waypoint data.</span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Description */}
        <div>
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-gold-muted">
            Cartographic Lore & Scope
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {node.description}
          </p>
        </div>

        {/* 1. Self-Assessment (Subjective) */}
        <div className="rounded-xl border border-border bg-background p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">1. Self-Assessed Rating</span>
            <span className="text-xs font-mono font-bold text-gold">
              Level {node.selfAssessedLevel}/5
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`size-3.5 ${
                  node.selfAssessedLevel >= s
                    ? "fill-gold text-gold"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-2">
              {node.selfAssessedLevel === 0
                ? "Unassessed"
                : node.selfAssessedLevel <= 2
                ? "Developing"
                : "Competent"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            * Self-assessed claim; not an independently evaluated skill.
          </p>
        </div>

        {/* 2. Submitted Evidence (Student Portfolio Proof) */}
        <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">2. Project Evidence</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-border text-muted-foreground">
              {node.submittedEvidence ? "Attached" : "None"}
            </span>
          </div>

          {node.submittedEvidence ? (
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-foreground">{node.submittedEvidence.title}</p>
              <a
                href={node.submittedEvidence.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline font-mono"
              >
                {node.submittedEvidence.url} <ExternalLink className="size-3" />
              </a>
              <p className="text-[10px] text-muted-foreground italic pt-1">
                Evidence submitted by student. Pending review.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No project artifact or GitHub repository linked yet.
            </p>
          )}
        </div>

        {/* 3. Verification State (Honest Platform Status) */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
            <ShieldAlert className="size-3.5" />
            <span>3. External Verification</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Status: <strong className="text-foreground">No independent review</strong>. External faculty review is not active in this prototype — evidence here is self-reported only.
          </p>
        </div>

        {/* 4. University Coursework Link */}
        <div className="rounded-xl border border-border bg-background p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <GraduationCap className="size-3.5 text-gold" />
            <span>4. Academic Coursework</span>
          </div>
          {node.coursework ? (
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="font-semibold text-foreground font-mono">
                {node.coursework.code}: {node.coursework.name}
              </p>
              <p className="text-[11px]">
                Grade: <strong className="text-foreground">{node.coursework.grade}</strong> ({node.coursework.credits} Credit Hours)
              </p>
              <p className="text-[10px] text-muted-foreground italic pt-1">
                Coursework demonstrates theoretical instruction, not portfolio proof.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No matching university course record mapped.
            </p>
          )}
        </div>

        {/* 5. Recommended Practical Quest */}
        {node.questTitle && (
          <div className="rounded-xl border border-gold-muted/40 bg-gold/10 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-gold">
              <Sparkles className="size-3.5" />
              <span>Recommended Quest: {node.questTitle}</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {node.questPrompt}
            </p>
            <Button
              size="sm"
              onClick={() => {
                toast.success(`Quest "${node.questTitle}" noted in your Potion Lab! ✦`);
              }}
              className="w-full text-xs font-bold btn-sparkle h-8 mt-1"
            >
              Take Quest in Potion Lab
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gold/20 p-3 bg-card/80 text-center">
        <Button variant="outline" size="sm" onClick={onClose} className="w-full text-xs">
          Dismiss Inspector
        </Button>
      </div>
    </aside>
  );
}

