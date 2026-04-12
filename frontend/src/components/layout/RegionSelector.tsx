import { MapPin } from "lucide-react";
import { useLayerStore } from "../../stores/layerStore";
import { REGIONS } from "../../data/regions";

export function RegionSelector() {
  const { selectedRegion, selectRegion } = useLayerStore();

  return (
    <div className="px-3 py-3 border-b border-border-default">
      <h2 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
        지역
      </h2>
      <div className="space-y-px max-h-48 overflow-y-auto">
        <button
          onClick={() => selectRegion(null)}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] transition-all ${
            selectedRegion === null
              ? "text-accent-teal bg-accent-teal/10"
              : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
          }`}
          style={
            selectedRegion === null
              ? { borderLeft: "2px solid #0f5040" }
              : { borderLeft: "2px solid transparent" }
          }
        >
          <MapPin size={12} />
          <span>전국</span>
        </button>
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => selectRegion(region.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-1 rounded text-[12px] transition-all ${
              selectedRegion === region.id
                ? "text-accent-blue bg-accent-blue/10"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
            }`}
            style={
              selectedRegion === region.id
                ? { borderLeft: "2px solid #3388ff" }
                : { borderLeft: "2px solid transparent" }
            }
          >
            <span>{region.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
