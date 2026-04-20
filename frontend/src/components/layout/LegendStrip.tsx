import { useLayerStore } from "../../stores/layerStore";
import { AQI_TIERS, MAGNITUDE_TIERS, FIRE_TIERS } from "../../lib/layerTheme";

const SEVERITY_TIERS = [
  { label: "INFO", color: "var(--color-severity-info)" },
  { label: "WARNING", color: "var(--color-severity-warning)" },
  { label: "CRITICAL", color: "var(--color-severity-critical)" },
];

function LegendGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 pr-4 mr-4 border-r border-border-subtle last:border-r-0 last:mr-0">
      <span className="text-[10px] text-text-muted uppercase tracking-[0.14em] shrink-0">
        {title}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-2.5 h-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] text-text-secondary">{label}</span>
    </div>
  );
}

function Dot({ color, size, label }: { color: string; size: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block rounded-full shrink-0"
        style={{ width: size, height: size, backgroundColor: color }}
      />
      <span className="text-[11px] text-text-secondary tabular-nums font-[family-name:var(--font-mono)]">
        {label}
      </span>
    </div>
  );
}

export function LegendStrip() {
  const { layers } = useLayerStore();
  const anyOn =
    layers.airQuality || layers.earthquake || layers.wildfire || layers.disaster;

  if (!anyOn) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-12 bg-bg-surface/85 backdrop-blur-md border-t border-border-default">
      <div className="h-full flex items-center px-4 overflow-x-auto gap-0 whitespace-nowrap">
        {layers.airQuality && (
          <LegendGroup title="대기질">
            {AQI_TIERS.map((tier) => (
              <Swatch key={tier.label} color={tier.color} label={tier.label} />
            ))}
          </LegendGroup>
        )}

        {layers.earthquake && (
          <LegendGroup title="규모">
            {MAGNITUDE_TIERS.map((tier) => (
              <Dot
                key={tier.label}
                color={tier.color}
                size={tier.size}
                label={tier.label}
              />
            ))}
          </LegendGroup>
        )}

        {layers.wildfire && (
          <LegendGroup title="산불 신뢰도">
            {FIRE_TIERS.map((tier) => (
              <Swatch key={tier.label} color={tier.color} label={tier.label} />
            ))}
          </LegendGroup>
        )}

        {layers.disaster && (
          <LegendGroup title="재난문자">
            {SEVERITY_TIERS.map((tier) => (
              <Swatch key={tier.label} color={tier.color} label={tier.label} />
            ))}
          </LegendGroup>
        )}
      </div>
    </div>
  );
}
