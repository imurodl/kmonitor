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
    <header className="h-12 bg-bg-surface border-b border-border-default flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-accent-blue" />
          <span className="text-[13px] font-semibold text-text-primary tracking-wide font-[family-name:var(--font-mono)]">K-MONITOR</span>
        </div>
        <RegionDropdown />
        {summary.data && (
          <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-border-default">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-accent-red" />
              <span className="text-[11px] text-text-secondary font-[family-name:var(--font-mono)]">{summary.data.earthquakes.count24h}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-accent-amber" />
              <span className="text-[11px] text-text-secondary font-[family-name:var(--font-mono)]">{summary.data.disasters.activeAlerts}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? "bg-accent-green animate-pulse" : "bg-accent-red"}`} />
          <span className={`text-[10px] uppercase tracking-wider font-[family-name:var(--font-mono)] ${isConnected ? "text-accent-green" : "text-accent-red"}`}>
            {isConnected ? "SYS OK" : "OFFLINE"}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[12px] text-text-primary tabular-nums font-[family-name:var(--font-mono)]">{kstTime}</span>
          <span className="text-[10px] text-text-muted ml-2 hidden sm:inline">{kstDate}</span>
        </div>
      </div>
    </header>
  );
}
