import { Sidebar } from "./Sidebar";
import { KoreaGlobe } from "../globe/KoreaGlobe";

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <KoreaGlobe />
      </div>
    </div>
  );
}
