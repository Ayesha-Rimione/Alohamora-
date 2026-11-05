import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MAP_REALM_BOUNDS,
  SAMPLE_EDGES,
  SAMPLE_LANDMARKS,
  SAMPLE_NODES,
  SAMPLE_REGIONS,
  type MapNode,
} from "@/data/map-sample-data";
import { CartographicBorder, CartographicDefs } from "./CartographicAssets";
import { Minimap } from "./Minimap";
import { NodeInspector } from "./NodeInspector";
import { Search, ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4.0;
const ZOOM_SPEED = 0.001;
const CANVAS_W = 2000; // virtual world width
const CANVAS_H = 1400; // virtual world height

type ZoomLevel = "world" | "territory" | "quest";

function deriveZoomLevel(z: number): ZoomLevel {
  if (z < 0.65) return "world";
  if (z < 1.75) return "territory";
  return "quest";
}

// Edge stroke style by relationship type
const EDGE_STYLES: Record<
  string,
  { stroke: string; strokeWidth: number; strokeDasharray?: string; opacity: number }
> = {
  ACADEMIC_SEQUENCE: { stroke: "#8b5a2b", strokeWidth: 2, opacity: 0.85 },
  MANDATORY_SKILL_PREREQUISITE: { stroke: "#53234f", strokeWidth: 2.5, opacity: 0.9 },
  RECOMMENDED_SKILL_FOUNDATION: {
    stroke: "#5a6978",
    strokeWidth: 1.5,
    strokeDasharray: "5 4",
    opacity: 0.75,
  },
  CAREER_REQUIRED_COMPETENCY: { stroke: "#ebcb7a", strokeWidth: 3, opacity: 1 },
  OPTIONAL_SPECIALIZATION: {
    stroke: "#7a9e8b",
    strokeWidth: 1,
    strokeDasharray: "3 5",
    opacity: 0.6,
  },
};

// Node colour by category
function nodeColor(node: MapNode): string {
  if (node.type === "destination") return "#8b2500";
  const map: Record<string, string> = {
    Foundations: "#8b5a2b",
    Systems: "#4a3b32",
    Intelligence: "#53234f",
    "Web & Cloud": "#241c30",
    "Career Citadel": "#8b2500",
  };
  return map[node.category] ?? "#3d291d";
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MarauderMapCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 900, h: 600 });

  // Camera state
  const [zoom, setZoom] = useState(0.42);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Interaction state
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouches = useRef<React.TouchList | null>(null);
  const pinchDist = useRef<number | null>(null);

  // UI state
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [minimapOpen, setMinimapOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapNode[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // ── Resize observer ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSvgSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    setSvgSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ── Coordinate transforms ────────────────────────────────────────────────
  // World → screen: world origin (0,0) maps to (svgW/2 + panX, svgH/2 + panY)
  function worldToScreen(wx: number, wy: number) {
    return {
      sx: wx * zoom + svgSize.w / 2 + panX,
      sy: wy * zoom + svgSize.h / 2 + panY,
    };
  }

  function screenToWorld(sx: number, sy: number) {
    return {
      wx: (sx - svgSize.w / 2 - panX) / zoom,
      wy: (sy - svgSize.h / 2 - panY) / zoom,
    };
  }

  // ── Zoom helper (zoom around a screen point) ─────────────────────────────
  function applyZoom(newZoom: number, screenX: number, screenY: number) {
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
    // Keep the world point under the cursor stationary
    const wx = (screenX - svgSize.w / 2 - panX) / zoom;
    const wy = (screenY - svgSize.h / 2 - panY) / zoom;
    setPanX(screenX - svgSize.w / 2 - wx * clamped);
    setPanY(screenY - svgSize.h / 2 - wy * clamped);
    setZoom(clamped);
  }

  // ── Fit-to-map ───────────────────────────────────────────────────────────
  function fitToMap() {
    const padding = 60;
    const scaleX = (svgSize.w - padding * 2) / CANVAS_W;
    const scaleY = (svgSize.h - padding * 2) / CANVAS_H;
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(scaleX, scaleY)));
    setZoom(newZoom);
    setPanX(0);
    setPanY(0);
  }

  // ── Navigate-to (minimap click / search focus) ───────────────────────────
  const navigateTo = useCallback(
    (wx: number, wy: number, targetZoom?: number) => {
      const z = targetZoom ?? zoom;
      setPanX(-(wx * z));
      setPanY(-(wy * z));
      if (targetZoom !== undefined) setZoom(targetZoom);
    },
    [zoom]
  );

  // ── Wheel zoom ───────────────────────────────────────────────────────────
  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const delta = -e.deltaY * ZOOM_SPEED * zoom;
    applyZoom(zoom + delta, sx, sy);
  }

  // ── Mouse drag ───────────────────────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPanX((p) => p + dx);
    setPanY((p) => p + dy);
  }

  function handleMouseUp() {
    isDragging.current = false;
  }

  // ── Touch events (pinch-to-zoom + single-finger pan) ────────────────────
  function handleTouchStart(e: React.TouchEvent<SVGSVGElement>) {
    if (e.touches.length === 2) {
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      pinchDist.current = Math.hypot(
        t1.clientX - t0.clientX,
        t1.clientY - t0.clientY
      );
    } else {
      const t = e.touches[0]!;
      lastMouse.current = { x: t.clientX, y: t.clientY };
    }
    lastTouches.current = e.touches;
  }

  function handleTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    e.preventDefault();
    if (e.touches.length === 2 && pinchDist.current !== null) {
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const scale = dist / pinchDist.current;
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const rect = svgRef.current!.getBoundingClientRect();
      applyZoom(zoom * scale, midX - rect.left, midY - rect.top);
      pinchDist.current = dist;
    } else if (e.touches.length === 1) {
      const t = e.touches[0]!;
      const dx = t.clientX - lastMouse.current.x;
      const dy = t.clientY - lastMouse.current.y;
      lastMouse.current = { x: t.clientX, y: t.clientY };
      setPanX((p) => p + dx);
      setPanY((p) => p + dy);
    }
  }

  function handleTouchEnd(e: React.TouchEvent<SVGSVGElement>) {
    if (e.touches.length < 2) pinchDist.current = null;
  }

  // ── Search ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      SAMPLE_NODES.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [searchQuery]);

  function selectAndFocus(node: MapNode) {
    navigateTo(node.x, node.y, 1.4);
    setSelectedNode(node);
    setSearchQuery("");
    setSearchOpen(false);
  }

  // ── Derived state ────────────────────────────────────────────────────────
  const zoomLevel = deriveZoomLevel(zoom);

  // Viewport bounds in world coordinates (for minimap)
  const vpTopLeft = screenToWorld(0, 0);
  const vpBottomRight = screenToWorld(svgSize.w, svgSize.h);
  const viewWidth = vpBottomRight.wx - vpTopLeft.wx;
  const viewHeight = vpBottomRight.wy - vpTopLeft.wy;

  // ── Edge path builder (Bezier) ───────────────────────────────────────────
  function buildEdgePath(sId: string, tId: string): string {
    const src = SAMPLE_NODES.find((n) => n.id === sId);
    const tgt = SAMPLE_NODES.find((n) => n.id === tId);
    if (!src || !tgt) return "";
    const mx = (src.x + tgt.x) / 2;
    const my = (src.y + tgt.y) / 2 - 40; // slight arc upward
    return `M ${src.x} ${src.y} Q ${mx} ${my} ${tgt.x} ${tgt.y}`;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f5ede0]">
      {/* ── HUD Toolbar ── */}
      <div className="relative z-20 flex items-center gap-2 border-b border-[#8b5a2b]/30 bg-[#f5ede0]/95 px-4 py-2 backdrop-blur">
        {/* Map Title */}
        <span className="font-serif text-sm font-bold text-[#3d291d] mr-2 hidden sm:block">
          🗺 Marauder Map
        </span>
        <span className="rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider">
          Phase 1 · Illustrative Data
        </span>

        {/* Search */}
        <div className="relative ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-[#8b5a2b]/30 bg-[#f0e6d0] px-3 py-1 text-xs text-[#3d291d] hover:bg-[#e8d9b8] transition-colors"
          >
            <Search className="size-3.5" />
            <span className="hidden sm:inline">{searchQuery || "Search waypoints…"}</span>
          </button>
          {searchOpen && (
            <div className="absolute top-8 right-0 z-30 w-72 rounded-xl border-2 border-[#8b5a2b]/30 bg-[#f5ede0]/98 shadow-lg backdrop-blur">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, careers…"
                className="w-full rounded-t-xl border-b border-[#8b5a2b]/20 bg-transparent px-3 py-2 text-xs text-[#3d291d] outline-none font-serif"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }
                  if (e.key === "Enter" && searchResults.length > 0) {
                    selectAndFocus(searchResults[0]!);
                  }
                }}
              />
              {searchResults.length === 0 && searchQuery.trim() && (
                <p className="px-3 py-2 text-[11px] text-[#8b5a2b] italic">No waypoints match.</p>
              )}
              {searchResults.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => selectAndFocus(n)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#e8d9b8] transition-colors last:rounded-b-xl"
                >
                  <span className="mt-0.5 size-2 shrink-0 rounded-full" style={{ background: nodeColor(n) }} />
                  <div>
                    <p className="text-xs font-bold text-[#3d291d] font-serif">{n.label}</p>
                    <p className="text-[10px] text-[#8b5a2b]">{n.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={() => applyZoom(zoom * 1.3, svgSize.w / 2, svgSize.h / 2)}
            className="rounded-lg border border-[#8b5a2b]/30 bg-[#f0e6d0] p-1.5 text-[#3d291d] hover:bg-[#e8d9b8] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyZoom(zoom * 0.77, svgSize.w / 2, svgSize.h / 2)}
            className="rounded-lg border border-[#8b5a2b]/30 bg-[#f0e6d0] p-1.5 text-[#3d291d] hover:bg-[#e8d9b8] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={fitToMap}
            className="rounded-lg border border-[#8b5a2b]/30 bg-[#f0e6d0] p-1.5 text-[#3d291d] hover:bg-[#e8d9b8] transition-colors"
            title="Fit Map to View"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>

        {/* Semantic zoom badge */}
        <div
          className="flex items-center gap-1 rounded-lg border border-[#8b5a2b]/20 bg-[#f0e6d0] px-2 py-1 text-[10px] font-mono font-bold text-[#8b5a2b] uppercase"
          title="Current Detail Level"
        >
          <Layers className="size-3" />
          {zoomLevel}
        </div>
      </div>

      {/* ── SVG Canvas ── */}
      <div className="relative flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          width={svgSize.w}
          height={svgSize.h}
          className="absolute inset-0 touch-none"
          style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="img"
          aria-label="Marauder Map: Interactive Career Navigation"
        >
          <CartographicDefs />

          {/* Parchment background */}
          <rect width={svgSize.w} height={svgSize.h} fill="#f0e6d0" />
          <rect
            width={svgSize.w}
            height={svgSize.h}
            fill="url(#parchment-stipple)"
            filter="url(#parchment-stipple)"
            opacity="0.08"
          />

          {/* ── Graticule grid ── */}
          <g opacity="0.12" stroke="#8b5a2b" strokeWidth="0.5">
            {[-800, -600, -400, -200, 0, 200, 400, 600, 800].map((wx) => {
              const { sx: x1, sy: y1 } = worldToScreen(wx, MAP_REALM_BOUNDS.minY);
              const { sx: x2, sy: y2 } = worldToScreen(wx, MAP_REALM_BOUNDS.maxY);
              return <line key={`vg${wx}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            {[-600, -400, -200, 0, 200, 400, 600].map((wy) => {
              const { sx: x1, sy: y1 } = worldToScreen(MAP_REALM_BOUNDS.minX, wy);
              const { sx: x2, sy: y2 } = worldToScreen(MAP_REALM_BOUNDS.maxX, wy);
              return <line key={`hg${wy}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>

          {/* ── World-space transform group ── */}
          <g>
            {/* Layer 0: Landmarks */}
            {SAMPLE_LANDMARKS.map((lm) => {
              const { sx, sy } = worldToScreen(lm.x, lm.y);
              const sc = lm.scale ?? 1;
              const symbolId =
                lm.type === "compass"
                  ? "#compass-rose"
                  : lm.type === "mountains"
                  ? "#mountain-cluster"
                  : lm.type === "forest"
                  ? "#forest-grove"
                  : lm.type === "sea_monster"
                  ? "#sea-monster"
                  : null;
              if (!symbolId) return null;
              return (
                <use
                  key={lm.id}
                  href={symbolId}
                  x={sx}
                  y={sy}
                  transform={`translate(${sx},${sy}) scale(${sc * zoom}) translate(${-sx},${-sy})`}
                  opacity={zoomLevel === "quest" ? 0.4 : 0.75}
                  aria-hidden="true"
                />
              );
            })}

            {/* Layer 1: Regions */}
            {SAMPLE_REGIONS.map((r) => {
              const { sx: rx, sy: ry } = worldToScreen(r.x, r.y);
              const rw = r.width * zoom;
              const rh = r.height * zoom;
              return (
                <g key={r.id} aria-label={r.name}>
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    fill={r.colorTheme}
                    fillOpacity="0.07"
                    stroke={r.colorTheme}
                    strokeWidth="1.5"
                    strokeOpacity="0.35"
                    rx={6}
                  />
                  {/* Region name — world level only shows banners */}
                  {zoomLevel !== "quest" && (
                    <text
                      x={rx + rw / 2}
                      y={ry + 18}
                      textAnchor="middle"
                      fontFamily="Cinzel, serif"
                      fontWeight="bold"
                      fontSize={Math.max(8, 13 * zoom)}
                      fill={r.colorTheme}
                      fillOpacity="0.9"
                      aria-hidden="true"
                    >
                      {r.name}
                    </text>
                  )}
                  {/* Latin motto at territory+ */}
                  {zoomLevel === "territory" && (
                    <text
                      x={rx + rw / 2}
                      y={ry + 32}
                      textAnchor="middle"
                      fontFamily="IM Fell English, serif"
                      fontStyle="italic"
                      fontSize={Math.max(6, 9 * zoom)}
                      fill={r.colorTheme}
                      fillOpacity="0.6"
                      aria-hidden="true"
                    >
                      {r.latinMotto}
                    </text>
                  )}
                  {/* At quest level show full motto + region name stacked */}
                  {zoomLevel === "quest" && (
                    <>
                      <text
                        x={rx + rw / 2}
                        y={ry + 20}
                        textAnchor="middle"
                        fontFamily="Cinzel, serif"
                        fontWeight="bold"
                        fontSize={Math.max(10, 14 * zoom)}
                        fill={r.colorTheme}
                        fillOpacity="0.95"
                      >
                        {r.name}
                      </text>
                      <text
                        x={rx + rw / 2}
                        y={ry + 36}
                        textAnchor="middle"
                        fontFamily="IM Fell English, serif"
                        fontStyle="italic"
                        fontSize={Math.max(7, 10 * zoom)}
                        fill={r.colorTheme}
                        fillOpacity="0.65"
                      >
                        {r.latinMotto}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Layer 2: Edges (paths) */}
            {SAMPLE_EDGES.map((edge) => {
              const src = SAMPLE_NODES.find((n) => n.id === edge.sourceId);
              const tgt = SAMPLE_NODES.find((n) => n.id === edge.targetId);
              if (!src || !tgt) return null;
              const { sx: x1, sy: y1 } = worldToScreen(src.x, src.y);
              const { sx: x2, sy: y2 } = worldToScreen(tgt.x, tgt.y);
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2 - 40 * zoom;
              const style = EDGE_STYLES[edge.type] ?? EDGE_STYLES["RECOMMENDED_SKILL_FOUNDATION"]!;
              const scaledWidth = style.strokeWidth * Math.max(0.5, zoom);
              return (
                <path
                  key={edge.id}
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={scaledWidth}
                  strokeDasharray={style.strokeDasharray}
                  opacity={style.opacity}
                  markerEnd={
                    edge.type === "CAREER_REQUIRED_COMPETENCY"
                      ? undefined
                      : undefined
                  }
                  aria-hidden="true"
                />
              );
            })}

            {/* Layer 3: Nodes */}
            {SAMPLE_NODES.map((node) => {
              const { sx, sy } = worldToScreen(node.x, node.y);
              const isSelected = selectedNode?.id === node.id;
              const isDest = node.type === "destination";
              const baseR = isDest ? 26 * zoom : 18 * zoom;
              const color = nodeColor(node);

              // Skip tiny nodes at world zoom
              if (zoomLevel === "world" && baseR < 4) return null;

              return (
                <g
                  key={node.id}
                  transform={`translate(${sx},${sy})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Waypoint: ${node.label}`}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedNode(node);
                    }
                  }}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      r={baseR + 6}
                      fill="none"
                      stroke="#ebcb7a"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      className={prefersReducedMotion.current ? "" : "animate-spin"}
                      style={
                        prefersReducedMotion.current
                          ? {}
                          : { animationDuration: "8s", transformOrigin: "center" }
                      }
                    />
                  )}

                  {/* Node body */}
                  {isDest ? (
                    // Citadel fortress for career destinations
                    <>
                      <use
                        href="#citadel-fortress"
                        transform={`scale(${zoom * 0.75})`}
                        filter="url(#carto-shadow)"
                      />
                    </>
                  ) : (
                    // Waypoint rune stone for skill nodes
                    <>
                      <circle
                        r={baseR}
                        fill="#f4ebd9"
                        stroke={color}
                        strokeWidth={2 * Math.max(0.5, zoom)}
                        filter="url(#carto-shadow)"
                      />
                      <circle
                        r={baseR * 0.75}
                        fill="none"
                        stroke={color}
                        strokeWidth={1}
                        strokeDasharray="3 2"
                        opacity="0.6"
                      />
                      {/* Category icon letter */}
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="Cinzel, serif"
                        fontWeight="bold"
                        fontSize={Math.max(6, baseR * 0.75)}
                        fill={color}
                      >
                        {node.category[0] ?? "?"}
                      </text>
                    </>
                  )}

                  {/* Evidence ring (submitted but unreviewed) */}
                  {node.submittedEvidence && (
                    <circle
                      r={baseR + 3}
                      fill="none"
                      stroke="#ebcb7a"
                      strokeWidth={1.5}
                      opacity="0.7"
                    />
                  )}

                  {/* Node label — territory and quest zoom levels */}
                  {zoomLevel !== "world" && (
                    <text
                      y={baseR + Math.max(10, 14 * zoom)}
                      textAnchor="middle"
                      fontFamily="IM Fell English, serif"
                      fontSize={Math.max(9, 11 * zoom)}
                      fill={color}
                      stroke="#f5ede0"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {node.label}
                    </text>
                  )}

                  {/* Quest prompt snippet — quest zoom only */}
                  {zoomLevel === "quest" && node.questTitle && (
                    <text
                      y={baseR + Math.max(23, 28 * zoom)}
                      textAnchor="middle"
                      fontFamily="IM Fell English, serif"
                      fontStyle="italic"
                      fontSize={Math.max(7, 8.5 * zoom)}
                      fill="#8b5a2b"
                      opacity="0.8"
                    >
                      ✦ {node.questTitle}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Border overlay */}
            <CartographicBorder width={CANVAS_W * zoom} height={CANVAS_H * zoom} />
          </g>

          {/* Dismiss search on canvas click */}
          {searchOpen && (
            <rect
              width={svgSize.w}
              height={svgSize.h}
              fill="transparent"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
            />
          )}
        </svg>

        {/* ── Coverage disclaimer strip ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-amber-400/30 bg-amber-500/8 px-4 py-1 text-center text-[10px] font-serif italic text-amber-700">
          [ILLUSTRATIVE] Coverage estimates shown are sample values only — not hiring probabilities or verified competency assessments.
        </div>

        {/* ── Minimap ── */}
        <Minimap
          viewX={vpTopLeft.wx}
          viewY={vpTopLeft.wy}
          viewWidth={viewWidth}
          viewHeight={viewHeight}
          onNavigate={(wx, wy) => navigateTo(wx, wy)}
          isOpen={minimapOpen}
          onToggle={() => setMinimapOpen((v) => !v)}
        />
      </div>

      {/* ── Node Inspector ── */}
      {selectedNode && (
        <NodeInspector node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}

