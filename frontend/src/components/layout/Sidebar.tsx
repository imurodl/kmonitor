import {
  Activity,
  Wind,
  AlertTriangle,
  Flame,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLayerStore } from "../../stores/layerStore";
import { useDashboardSummary, useDisasterAlerts } from "../../api/hooks";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const LAYER_CONFIG = [
  { key: "earthquake" as const, label: "지진", icon: Activity, color: "#ef4444" },
  { key: "airQuality" as const, label: "대기질", icon: Wind, color: "#22c55e" },
  { key: "disaster" as const, label: "재난문자", icon: AlertTriangle, color: "#f59e0b" },
  { key: "wildfire" as const, label: "산불", icon: Flame, color: "#ff6b35" },
  { key: "weather" as const, label: "날씨", icon: Cloud, color: "#60a5fa" },
];

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "bg-severity-critical-bg", text: "text-severity-critical", border: "border-l-accent-red" },
  WARNING: { bg: "bg-severity-warning-bg", text: "text-severity-warning", border: "border-l-accent-amber" },
  INFO: { bg: "bg-severity-info-bg", text: "text-severity-info", border: "border-l-accent-blue" },
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border-default ${className}`} />;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { layers, toggleLayer, setAllLayers } = useLayerStore();
  const summary = useDashboardSummary();
  const disasters = useDisasterAlerts();
  const allOn = Object.values(layers).every(Boolean);

  if (collapsed) {
    return (
      <div className="w-12 h-full bg-bg-surface border-r border-border-default flex flex-col items-center py-3 gap-0.5 shrink-0">
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors mb-3"
        >
          <ChevronRight size={14} />
        </button>
        {LAYER_CONFIG.map(({ key, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className="p-2.5 rounded-md transition-colors hover:bg-bg-elevated"
            style={{ color: layers[key] ? color : "#4b5563" }}
            title={LAYER_CONFIG.find(l => l.key === key)?.label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-bg-surface border-r border-border-default flex flex-col overflow-hidden shrink-0">
      {/* Layer Toggles */}
      <div className="px-3 py-3 border-b border-border-default">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-[12px] font-medium text-text-muted uppercase tracking-wider">
            레이어
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAllLayers(!allOn)}
              className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
              title={allOn ? "모두 끄기" : "모두 켜기"}
            >
              {allOn ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button
              onClick={onToggle}
              className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
        <div className="space-y-px">
          {LAYER_CONFIG.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] transition-all ${
                layers[key]
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
              }`}
              style={
                layers[key]
                  ? { backgroundColor: `${color}15`, borderLeft: `2px solid ${color}` }
                  : { borderLeft: "2px solid transparent" }
              }
            >
              <Icon size={16} style={{ color: layers[key] ? color : undefined }} />
              <span>{label}</span>
              <div
                className="ml-auto w-2 h-2 rounded-full"
                style={{ backgroundColor: layers[key] ? color : "#374151" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-3 border-b border-border-default">
        <h2 className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
          현황
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {summary.isLoading ? (
            <>
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </>
          ) : summary.data ? (
            <>
              <StatCard label="지진 (24h)" value={summary.data.earthquakes.count24h} color="#ef4444" />
              <StatCard label="재난문자" value={summary.data.disasters.activeAlerts} color="#f59e0b" />
              <StatCard label="대기질" value={summary.data.airQuality.stationsReporting} color="#22c55e" />
              <StatCard label="산불" value={summary.data.wildfires.activeHotspots} color="#ff6b35" />
            </>
          ) : (
            <div className="col-span-2 text-center py-3 text-text-muted text-[11px]">
              데이터 로딩 실패
            </div>
          )}
        </div>
      </div>

      {/* Alert Feed */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <h2 className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
          최근 재난문자
        </h2>
        <div className="space-y-1.5">
          {disasters.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))
          ) : disasters.data && disasters.data.length > 0 ? (
            disasters.data.slice(0, 20).map((alert) => {
              const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.INFO;
              return (
                <div
                  key={alert.id}
                  className={`p-2.5 bg-bg-card rounded border border-border-default border-l-3 ${style.border}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-text-muted truncate">
                      {alert.regionName}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-snug line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    {formatDistanceToNow(new Date(alert.issuedAt), { addSuffix: true, locale: ko })}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-text-muted">
              <AlertTriangle size={20} className="mb-1.5 opacity-30" />
              <p className="text-[11px]">재난문자 없음</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="bg-bg-card rounded p-2.5 border border-border-default border-l-3"
      style={{ borderLeftColor: color, backgroundColor: `${color}08` }}
    >
      <p className="text-[11px] text-text-muted leading-tight">{label}</p>
      <p className="text-2xl font-semibold mt-0.5 font-[family-name:var(--font-mono)]" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
