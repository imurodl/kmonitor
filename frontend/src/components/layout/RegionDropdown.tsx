import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useLayerStore } from "../../stores/layerStore";
import { REGIONS, getRegionById } from "../../data/regions";

export function RegionDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { selectedRegion, selectRegion } = useLayerStore();

  const regionName = selectedRegion
    ? getRegionById(selectedRegion)?.name ?? "전국"
    : "전국";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSelect(id: string | null) {
    selectRegion(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[12px] text-chrome-accent border border-chrome-accent/30 bg-chrome-accent/10 px-2 py-0.5 rounded hover:bg-chrome-accent/20 transition-colors"
      >
        <MapPin size={11} />
        <span>{regionName}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 max-h-64 overflow-y-auto bg-bg-surface border border-border-default rounded-md shadow-xl z-50 py-1">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
              selectedRegion === null
                ? "text-chrome-accent bg-chrome-accent/10"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            전국
          </button>
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => handleSelect(region.id)}
              className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                selectedRegion === region.id
                  ? "text-chrome-accent bg-chrome-accent/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
