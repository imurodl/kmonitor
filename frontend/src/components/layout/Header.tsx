import { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import { useDashboardSummary } from "../../api/hooks";
import { useLayerStore } from "../../stores/layerStore";
import { getRegionById } from "../../data/regions";

export function Header() {
  const [time, setTime] = useState(new Date());
  const summary = useDashboardSummary();
  const selectedRegion = useLayerStore((s) => s.selectedRegion);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const kstTime = time.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const kstDate = time.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const isConnected = summary.data !== undefined && !summary.isError;
  const regionName = selectedRegion ? getRegionById(selectedRegion)?.name : null;

  return (
    <header className="h-10 bg-bg-surface border-b border-border-default flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-accent-blue" />
          <span className="text-[13px] font-semibold text-text-primary tracking-wide">K-MONITOR</span>
        </div>
        {regionName && (
          <span className="text-[11px] text-accent-blue border border-accent-blue/30 bg-accent-blue/10 px-2 py-0.5 rounded">
            {regionName}
          </span>
        )}
        {!regionName && (
          <span className="text-[11px] text-text-faint hidden sm:inline">
            한국 재난 상황 모니터링
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? "bg-accent-green animate-pulse" : "bg-accent-red"}`} />
          <span className={`text-[10px] uppercase tracking-wider ${isConnected ? "text-accent-green" : "text-accent-red"}`}>
            {isConnected ? "SYS OK" : "OFFLINE"}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[12px] text-text-primary tabular-nums">{kstTime}</span>
          <span className="text-[10px] text-text-muted ml-2 hidden sm:inline">{kstDate}</span>
        </div>
      </div>
    </header>
  );
}
