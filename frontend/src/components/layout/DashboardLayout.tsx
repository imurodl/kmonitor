import { useState, useCallback } from "react";
import { type Entity as CesiumEntity } from "cesium";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DetailPanel } from "./DetailPanel";
import { KoreaGlobe } from "../globe/KoreaGlobe";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<CesiumEntity | undefined>();

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
        </div>
      </div>
    </div>
  );
}
