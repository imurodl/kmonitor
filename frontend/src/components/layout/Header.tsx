import { useState, useEffect } from "react";
import { Radio, Activity, AlertTriangle } from "lucide-react";
import { useDashboardSummary } from "../../api/hooks";
import { RegionDropdown } from "./RegionDropdown";

export function Header() {
  const [time, setTime] = useState(new Date());
  const summary = useDashboardSummary();

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

  return (
    <header className="h-12 bg-bg-surface/90 backdrop-blur-md border-b border-border-default flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio size={15} className="text-chrome-accent" />
          <span className="text-[14px] font-extrabold text-text-primary tracking-[0.08em]">
            K-MONITOR
          </span>
          <span className="hidden md:inline text-[11px] text-text-muted tracking-wide ml-0.5">
            한국 재난 상황
          </span>
        </div>
        <RegionDropdown />
        {summary.data && (
          <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-border-default">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-accent-red" />
              <span className="text-[11px] text-text-secondary tabular-nums font-[family-name:var(--font-mono)]">
                {summary.data.earthquakes.count24h}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-accent-amber" />
              <span className="text-[11px] text-text-secondary tabular-nums font-[family-name:var(--font-mono)]">
                {summary.data.disasters.activeAlerts}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-accent-green animate-pulse" : "bg-accent-red"
            }`}
          />
          <span
            className={`text-[10px] font-medium uppercase tracking-[0.15em] ${
              isConnected ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isConnected ? "SYS OK" : "OFFLINE"}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-text-primary tabular-nums font-[family-name:var(--font-mono)]">
            {kstTime}
          </span>
          <span className="text-[10px] text-text-muted hidden sm:inline">
            {kstDate}
          </span>
        </div>
      </div>
    </header>
  );
}
