import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Search, ZoomIn, ZoomOut, Maximize2, Layers, AlertCircle, RefreshCw, Compass } from "lucide-react";
import { api, USE_MOCK_API } from "@/lib/api";
import type { MapPayload } from "@/lib/api/types";
import { useApp } from "@/state/app-state";

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

  // Live dynamic student data
  const { state: localState } = useApp();
  const [liveMap, setLiveMap] = useState<MapPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCareerRoleId, setActiveCareerRoleId] = useState<string>(
    localState.profile?.targetRole || "aiml"
  );

  const fetchLiveMap = useCallback(async (roleId?: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.map.getMap(roleId || activeCareerRoleId);
      setLiveMap(res);
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load dynamic Marauder Map data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeCareerRoleId]);

  useEffect(() => {
    fetchLiveMap(activeCareerRoleId);
  }, [activeCareerRoleId, fetchLiveMap]);

  // Map database skills & career progress to visual nodes
  const dynamicNodes = useMemo<MapNode[]>(() => {
    return SAMPLE_NODES.map((node) => {
      // If it's a career destination node
      if (node.type === "destination") {
        const isCurrentRole =
          (node.id === "dest_aiml_engineer" && activeCareerRoleId === "aiml") ||
          (node.id === "dest_fullstack_dev" && (activeCareerRoleId === "swe" || activeCareerRoleId === "frontend"));

        return {
          ...node,
          description: liveMap?.roleTitle
            ? `${node.description} — Active Progress: ${liveMap.coveragePercent}% requirements coverage.`
            : node.description,
          selfAssessedLevel: isCurrentRole ? (liveMap?.coveragePercent && liveMap.coveragePercent >= 80 ? 4 : 2) : 1,
        };
      }

      // Map node id (e.g. skill_python -> python)
      const canonicalSkillId = node.id.replace(/^skill_/, "").replace(/_/g, "-");

      // Check detail from liveMap API response
      const liveDetail = liveMap?.details?.find(
        (d) => d.skillId === canonicalSkillId || node.id.includes(d.skillId)
      );

      // Check local state fallback
      const localSkill = localState.skills[canonicalSkillId];

      const assessedLevel = liveDetail !== undefined
        ? liveDetail.assessedLevel
        : localSkill?.level !== undefined
        ? localSkill.level
        : node.selfAssessedLevel;

      const hasEvidence = liveDetail !== undefined
        ? liveDetail.hasEvidence
        : Boolean(localSkill?.evidence && localSkill.evidence.trim().length > 0);

      return {
        ...node,
        selfAssessedLevel: (Math.max(0, Math.min(4, assessedLevel)) as any),
        submittedEvidence: hasEvidence
          ? {
              title: "Attached Project Artifact",
              url: localSkill?.evidence || "https://github.com/student/evidence",
            }
          : null,
        reviewStatus: hasEvidence ? "submitted_unreviewed" : "unsubmitted",
        verifiedStatus: "not_verified",
      };
    });
  }, [liveMap, localState.skills, activeCareerRoleId]);

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
      dynamicNodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [searchQuery, dynamicNodes]);

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
        {/* Map Title & Career Destination */}
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm font-bold text-[#3d291d] hidden sm:block">
            🗺 Marauder Map
          </span>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#8b5a2b]/30 bg-[#f0e6d0] px-2.5 py-1 text-xs">
            <Compass className="size-3.5 text-gold-muted" />
            <span className="font-serif font-semibold text-[#3d291d]">
              Target:
            </span>
            <select
              value={activeCareerRoleId}
              onChange={(e) => setActiveCareerRoleId(e.target.value)}
              className="bg-transparent font-serif font-bold text-plum-900 border-none outline-none cursor-pointer"
            >
              <option value="aiml">AI/ML Engineer</option>
              <option value="swe">Software Engineer</option>
              <option value="frontend">Frontend Developer</option>
              <option value="data-analyst">Data Analyst</option>
              <option value="product-designer">Product Designer</option>
              <option value="mobile-dev">Mobile App Developer</option>
            </select>
          </div>
        </div>

        {/* Live Dynamic Status Badges */}
        {isLoading ? (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground animate-pulse font-serif">
            <RefreshCw className="size-3 animate-spin" /> Synchronizing map...
          </span>
        ) : loadError ? (
          <span className="flex items-center gap-1 text-[11px] text-destructive font-serif">
            <AlertCircle className="size-3" /> Map sync offline
          </span>
        ) : liveMap ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-gold uppercase tracking-wider">
              {liveMap.coveragePercent}% Requirements Coverage
            </span>
            <span className="rounded-full border border-[#5a6978]/40 bg-[#5a6978]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#3d291d] uppercase tracking-wider hidden md:inline">
              Evidence: {liveMap.evidenceCount ?? 0} proof(s) attached ({liveMap.evidencePercent ?? 0}%)
            </span>
            {!liveMap.isOnboarded && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
                Starting Gate: Onboarding Incomplete
              </span>
            )}
          </div>
        ) : null}

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
                      y={ry + Math.max(22, 26 * zoom)}
                      textAnchor="middle"
                      fontFamily="Cinzel, serif"
                      fontWeight="bold"
                      fontSize={Math.max(12, 18 * zoom)}
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
                      y={ry + Math.max(38, 44 * zoom)}
                      textAnchor="middle"
                      fontFamily="IM Fell English, serif"
                      fontStyle="italic"
                      fontSize={Math.max(10, 13 * zoom)}
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
                        y={ry + Math.max(24, 28 * zoom)}
                        textAnchor="middle"
                        fontFamily="Cinzel, serif"
                        fontWeight="bold"
                        fontSize={Math.max(14, 20 * zoom)}
                        fill={r.colorTheme}
                        fillOpacity="0.95"
                      >
                        {r.name}
                      </text>
                      <text
                        x={rx + rw / 2}
                        y={ry + Math.max(42, 48 * zoom)}
                        textAnchor="middle"
                        fontFamily="IM Fell English, serif"
                        fontStyle="italic"
                        fontSize={Math.max(11, 14 * zoom)}
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
            {dynamicNodes.map((node) => {
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
                        fontSize={Math.max(9, baseR * 0.85)}
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
                      y={baseR + Math.max(14, 18 * zoom)}
                      textAnchor="middle"
                      fontFamily="IM Fell English, serif"
                      fontWeight="600"
                      fontSize={Math.max(12, 15 * zoom)}
                      fill={color}
                      stroke="#f5ede0"
                      strokeWidth={3.5}
                      paintOrder="stroke"
                    >
                      {node.label}
                    </text>
                  )}

                  {/* Quest prompt snippet — quest zoom only */}
                  {zoomLevel === "quest" && node.questTitle && (
                    <text
                      y={baseR + Math.max(30, 36 * zoom)}
                      textAnchor="middle"
                      fontFamily="IM Fell English, serif"
                      fontStyle="italic"
                      fontSize={Math.max(10, 12 * zoom)}
                      fill="#8b5a2b"
                      opacity="0.9"
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
          {liveMap ? (
            <span>
              Dynamic student coverage: <strong>{liveMap.coveragePercent}%</strong> of {liveMap.roleTitle} requirements ({liveMap.demonstratedCount} demonstrated, {liveMap.developingCount} developing, {liveMap.evidenceCount ?? 0} proof attached) — Educational gap estimate, not a hiring probability.
            </span>
          ) : (
            <span>
              Role requirement coverage represents self-assessed and evidence-backed educational progress — not a hiring probability.
            </span>
          )}
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

