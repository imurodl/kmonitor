import {
  Activity,
  Wind,
  AlertTriangle,
  Flame,
  Cloud,
  BarChart3,
} from "lucide-react";
import { useLayerStore } from "../../stores/layerStore";
import { useDashboardSummary, useDisasterAlerts } from "../../api/hooks";
import { format } from "date-fns";

const LAYER_CONFIG = [
  { key: "earthquake" as const, label: "지진", icon: Activity, color: "#ef4444" },
  { key: "airQuality" as const, label: "대기질", icon: Wind, color: "#22c55e" },
  { key: "disaster" as const, label: "재난문자", icon: AlertTriangle, color: "#f59e0b" },
  { key: "wildfire" as const, label: "산불", icon: Flame, color: "#ff6b35" },
  { key: "weather" as const, label: "날씨", icon: Cloud, color: "#60a5fa" },
];

export function Sidebar() {
  const { layers, toggleLayer } = useLayerStore();
  const summary = useDashboardSummary();
  const disasters = useDisasterAlerts();

  return (
    <div className="w-[300px] h-full bg-[#111827] border-r border-[#1e293b] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b]">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-500" />
          K-Monitor
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          한국 재난 상황 모니터링
        </p>
      </div>

      {/* Layer Toggles */}
      <div className="p-4 border-b border-[#1e293b]">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          데이터 레이어
        </h2>
        <div className="space-y-2">
          {LAYER_CONFIG.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                layers[key]
                  ? "bg-[#1e293b] text-white"
                  : "bg-transparent text-gray-500 hover:bg-[#1e293b]/50"
              }`}
            >
              <Icon size={16} style={{ color: layers[key] ? color : "#6b7280" }} />
              <span>{label}</span>
              <div
                className={`ml-auto w-2 h-2 rounded-full`}
                style={{ backgroundColor: layers[key] ? color : "#374151" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {summary.data && (
        <div className="p-4 border-b border-[#1e293b]">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            현황
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="지진 (24h)"
              value={summary.data.earthquakes.count24h}
              color="#ef4444"
            />
            <StatCard
              label="재난문자"
              value={summary.data.disasters.activeAlerts}
              color="#f59e0b"
            />
            <StatCard
              label="대기질 측정소"
              value={summary.data.airQuality.stationsReporting}
              color="#22c55e"
            />
            <StatCard
              label="산불"
              value={summary.data.wildfires.activeHotspots}
              color="#ff6b35"
            />
          </div>
        </div>
      )}

      {/* Alert Feed */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          최근 재난문자
        </h2>
        <div className="space-y-2">
          {disasters.data && disasters.data.length > 0 ? (
            disasters.data.slice(0, 20).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-[#0a0e1a] rounded-lg border border-[#1e293b]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor:
                        alert.severity === "CRITICAL"
                          ? "#991b1b"
                          : alert.severity === "WARNING"
                          ? "#92400e"
                          : "#1e3a5f",
                      color: "white",
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {alert.regionName}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {alert.message}
                </p>
                <p className="text-[10px] text-gray-600 mt-1">
                  {format(new Date(alert.issuedAt), "MM/dd HH:mm")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-600">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e293b]">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
