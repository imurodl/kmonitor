import { useState, useCallback, useEffect } from "react";
import { type Entity as CesiumEntity } from "cesium";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DetailPanel } from "./DetailPanel";
import { LegendStrip } from "./LegendStrip";
import { KoreaGlobe } from "../globe/KoreaGlobe";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => !window.matchMedia("(min-width: 768px)").matches);
  const [selectedEntity, setSelectedEntity] = useState<CesiumEntity | undefined>();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setSidebarCollapsed(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleEntitySelect = useCallback((entity: CesiumEntity | undefined) => {
    setSelectedEntity(entity);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-base">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 relative">
          <KoreaGlobe onEntitySelect={handleEntitySelect} />
          {selectedEntity && (
            <DetailPanel
              entity={selectedEntity}
              onClose={() => setSelectedEntity(undefined)}
            />
          )}
          <LegendStrip />
        </div>
      </div>
    </div>
  );
}
