import React from "react";
import { MAP_REALM_BOUNDS, SAMPLE_REGIONS, SAMPLE_NODES } from "@/data/map-sample-data";

interface MinimapProps {
  viewX: number;
  viewY: number;
  viewWidth: number;
  viewHeight: number;
  onNavigate: (x: number, y: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Minimap({
  viewX,
  viewY,
  viewWidth,
  viewHeight,
  onNavigate,
  isOpen,
  onToggle,
}: MinimapProps) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-30 rounded-xl border border-gold/40 bg-card/90 px-3 py-1.5 text-xs font-serif font-bold text-gold shadow-magic backdrop-blur hover:bg-gold/20"
        title="Open Cartographic Minimap"
      >
        🗺️ Minimap
      </button>
    );
  }

  const mmWidth = 180;
  const mmHeight = 126;

  // Transform world coordinates to minimap coordinates
  function worldToMinimap(wx: number, wy: number) {
    const nx = (wx - MAP_REALM_BOUNDS.minX) / MAP_REALM_BOUNDS.width;
    const ny = (wy - MAP_REALM_BOUNDS.minY) / MAP_REALM_BOUNDS.height;
    return {
      mx: nx * mmWidth,
      my: ny * mmHeight,
    };
  }

  function handleMinimapClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const nx = clickX / mmWidth;
    const ny = clickY / mmHeight;

    const wx = MAP_REALM_BOUNDS.minX + nx * MAP_REALM_BOUNDS.width;
    const wy = MAP_REALM_BOUNDS.minY + ny * MAP_REALM_BOUNDS.height;

    onNavigate(wx, wy);
  }

  const vpTopLeft = worldToMinimap(viewX, viewY);
  const vpBottomRight = worldToMinimap(viewX + viewWidth, viewY + viewHeight);
  const vpW = Math.max(16, vpBottomRight.mx - vpTopLeft.mx);
  const vpH = Math.max(12, vpBottomRight.my - vpTopLeft.my);

  return (
    <div className="fixed bottom-4 right-4 z-30 rounded-2xl border-2 border-gold/40 bg-card/95 p-2 shadow-magic backdrop-blur">
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-gold/20 text-[10px] font-serif font-bold text-gold">
        <span>Cartographic Overview</span>
        <button
          type="button"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground px-1"
          title="Minimize Minimap"
        >
          ✕
        </button>
      </div>

      <svg
        width={mmWidth}
        height={mmHeight}
        className="mt-1 rounded border border-border bg-[#efe4ce] cursor-crosshair"
        onClick={handleMinimapClick}
      >
        {/* Regions */}
        {SAMPLE_REGIONS.map((r) => {
          const pt = worldToMinimap(r.x, r.y);
          const sz = worldToMinimap(r.x + r.width, r.y + r.height);
          const w = sz.mx - pt.mx;
          const h = sz.my - pt.my;
          return (
            <rect
              key={r.id}
              x={pt.mx}
              y={pt.my}
              width={Math.max(w, 8)}
              height={Math.max(h, 8)}
              fill="#dec8a2"
              stroke="#a68352"
              strokeWidth="0.8"
              opacity="0.8"
            />
          );
        })}

        {/* Nodes */}
        {SAMPLE_NODES.map((n) => {
          const pt = worldToMinimap(n.x, n.y);
          return (
            <circle
              key={n.id}
              cx={pt.mx}
              cy={pt.my}
              r={n.type === "destination" ? 3.5 : 2}
              fill={n.type === "destination" ? "#8b2500" : "#3d291d"}
            />
          );
        })}

        {/* Viewport Indicator Box */}
        <rect
          x={Math.max(0, vpTopLeft.mx)}
          y={Math.max(0, vpTopLeft.my)}
          width={Math.min(mmWidth - vpTopLeft.mx, vpW)}
          height={Math.min(mmHeight - vpTopLeft.my, vpH)}
          fill="#ebcb7a"
          fillOpacity="0.25"
          stroke="#8b2500"
          strokeWidth="1.5"
          strokeDasharray="2 1"
        />
      </svg>
      <div className="text-[9px] text-muted-foreground text-center pt-1 italic font-serif">
        Click to pan camera
      </div>
    </div>
  );
}

