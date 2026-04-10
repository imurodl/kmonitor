import { Entity, EllipseGraphics } from "resium";
import {
  Cartesian3,
  Color,
  HeightReference,
} from "cesium";
import type { Earthquake } from "../../../api/client";

const MAGNITUDE_COLORS: Record<string, Color> = {
  minor: Color.YELLOW.withAlpha(0.6),
  light: Color.ORANGE.withAlpha(0.6),
  moderate: Color.RED.withAlpha(0.7),
  strong: Color.DARKRED.withAlpha(0.8),
};

function getMagnitudeColor(magnitude: number | null): Color {
  if (!magnitude) return MAGNITUDE_COLORS.minor;
  if (magnitude < 3) return MAGNITUDE_COLORS.minor;
  if (magnitude < 4) return MAGNITUDE_COLORS.light;
  if (magnitude < 5) return MAGNITUDE_COLORS.moderate;
  return MAGNITUDE_COLORS.strong;
}

function getMagnitudeRadius(magnitude: number | null): number {
  if (!magnitude) return 10000;
  return Math.max(10000, magnitude * 15000);
}

interface Props {
  data: Earthquake[];
}

export function EarthquakeLayer({ data }: Props) {
  return (
    <>
      {data.map((eq) => {
        if (!eq.latitude || !eq.longitude) return null;
        return (
          <Entity
            key={eq.id}
            position={Cartesian3.fromDegrees(eq.longitude, eq.latitude)}
            name={`지진 M${eq.magnitude || "?"}`}
            description={`
              <b>규모:</b> ${eq.magnitude || "N/A"}<br/>
              <b>깊이:</b> ${eq.depth || "N/A"} km<br/>
              <b>위치:</b> ${eq.locationName || "N/A"}<br/>
              <b>시간:</b> ${eq.occurredAt}
            `}
          >
            <EllipseGraphics
              semiMajorAxis={getMagnitudeRadius(eq.magnitude)}
              semiMinorAxis={getMagnitudeRadius(eq.magnitude)}
              material={getMagnitudeColor(eq.magnitude)}
              outline
              outlineColor={Color.RED.withAlpha(0.8)}
              outlineWidth={1}
              heightReference={HeightReference.CLAMP_TO_GROUND}
            />
          </Entity>
        );
      })}
    </>
  );
}
