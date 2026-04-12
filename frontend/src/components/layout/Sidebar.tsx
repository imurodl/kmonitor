import {
  Activity,
  Wind,
  AlertTriangle,
  Flame,
  Cloud,
  Radio,
  ChevronLeft,
  ChevronRight,
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
  const { layers, toggleLayer } = useLayerStore();
  const summary = useDashboardSummary();
  const disasters = useDisasterAlerts();

  if (collapsed) {
    return (
      <div className="w-14 h-full bg-bg-surface border-r border-border-default flex flex-col items-center py-4 gap-1 shrink-0">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors mb-4"
        >
          <ChevronRight size={16} />
        </button>
        {LAYER_CONFIG.map(({ key, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: layers[key] ? color : "#4b5563" }}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-bg-surface border-r border-border-default flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Radio size={18} className="text-accent-blue" />
            K-Monitor
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            한국 재난 상황 모니터링
          </p>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="px-4 py-3 border-b border-border-default">
        <h2 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
          레이어
        </h2>
        <div className="space-y-0.5">
          {LAYER_CONFIG.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                layers[key]
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
              }`}
              style={
                layers[key]
                  ? { backgroundColor: `${color}10`, borderLeft: `2px solid ${color}` }
                  : { borderLeft: "2px solid transparent" }
              }
            >
              <Icon size={15} style={{ color: layers[key] ? color : undefined }} />
              <span className="text-[13px]">{label}</span>
              <div
                className="ml-auto w-1.5 h-1.5 rounded-full transition-colors"
                style={{ backgroundColor: layers[key] ? color : "#374151" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-b border-border-default">
        <h2 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
          현황
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {summary.isLoading ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : summary.data ? (
            <>
              <StatCard label="지진 (24h)" value={summary.data.earthquakes.count24h} color="#ef4444" />
              <StatCard label="재난문자" value={summary.data.disasters.activeAlerts} color="#f59e0b" />
              <StatCard label="대기질 측정소" value={summary.data.airQuality.stationsReporting} color="#22c55e" />
              <StatCard label="산불 감지" value={summary.data.wildfires.activeHotspots} color="#ff6b35" />
            </>
          ) : null}
        </div>
      </div>

      {/* Alert Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h2 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
          최근 재난문자
        </h2>
        <div className="space-y-1.5">
          {disasters.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))
          ) : disasters.data && disasters.data.length > 0 ? (
            disasters.data.slice(0, 20).map((alert) => {
              const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.INFO;
              return (
                <div
                  key={alert.id}
                  className={`p-3 bg-bg-card rounded-md border border-border-default border-l-2 ${style.border}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-text-muted truncate">
                      {alert.regionName}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1.5">
                    {formatDistanceToNow(new Date(alert.issuedAt), { addSuffix: true, locale: ko })}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <AlertTriangle size={24} className="mb-2 opacity-40" />
              <p className="text-xs">재난문자 없음</p>
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
      className="bg-bg-card rounded-md p-3 border border-border-default border-l-2"
      style={{ borderLeftColor: color }}
    >
      <p className="text-[11px] text-text-muted leading-tight">{label}</p>
      <p className="text-xl font-semibold mt-1" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
