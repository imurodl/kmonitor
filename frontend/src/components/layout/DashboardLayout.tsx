import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { KoreaGlobe } from "../globe/KoreaGlobe";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 relative">
        <KoreaGlobe />
      </div>
    </div>
  );
}
