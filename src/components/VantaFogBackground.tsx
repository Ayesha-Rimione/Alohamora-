import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function VantaFogBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "running" | "failed" | "reduced-motion">("loading");

  useEffect(() => {
    // 1. Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setState("reduced-motion");
      return;
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setState("reduced-motion");
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    let effect: any = null;
    let isCancelled = false;

    // 2. Start Vanta FOG inside useEffect (client-side only)
    (async () => {
      try {
        if (typeof window !== "undefined") {
          (window as any).THREE = THREE;
        }

        const vantaModule = await import("vanta/dist/vanta.fog.min.js" as any);
        const FOG =
          vantaModule.default?.default ||
          vantaModule.default ||
          (window as any).VANTA?.FOG ||
          vantaModule;

        if (typeof FOG !== "function") {
          throw new Error("VANTA.FOG function could not be resolved from module");
        }

        if (!isCancelled && vantaRef.current) {
          effect = FOG({
            el: vantaRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            highlightColor: 0x322146,
            midtoneColor: 0x873d3d,
            lowlightColor: 0xaf870e,
            baseColor: 0xf7eee9,
            speed: 1.2,
            zoom: 1.6,
          });

          if (!isCancelled) {
            setState("running");
          }
        }
      } catch (err) {
        console.error("Vanta fog failed", err);
        if (!isCancelled) {
          setState("failed");
        }
      }
    })();

    return () => {
      isCancelled = true;
      motionQuery.removeEventListener("change", handleMotionChange);
      if (effect) {
        try {
          effect.destroy();
        } catch {
          // ignore cleanup issues
        }
      }
    };
  }, []);

  // Static fallback for reduced-motion or failed initialization:
  // Gradient using the exact colors on #f7eee9:
  // highlightColor #322146, midtoneColor #873d3d, lowlightColor #af870e, baseColor #f7eee9
  const staticGradientStyle: React.CSSProperties = {
    backgroundColor: "#f7eee9",
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(50, 33, 70, 0.22) 0%, transparent 60%),
      radial-gradient(circle at 80% 40%, rgba(135, 61, 61, 0.25) 0%, transparent 65%),
      radial-gradient(circle at 50% 85%, rgba(175, 135, 14, 0.22) 0%, transparent 60%)
    `,
  };

  return (
    <div
      ref={vantaRef}
      data-vanta-state={state}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: -10,
        ...(state === "reduced-motion" || state === "failed" ? staticGradientStyle : {}),
      }}
      aria-hidden="true"
    />
  );
}
