import { Entity, PointGraphics } from "resium";
import { Cartesian3, Color, NearFarScalar } from "cesium";
import type { Wildfire } from "../../../api/client";

interface Props {
  data: Wildfire[];
}

export function WildfireLayer({ data }: Props) {
  return (
    <>
      {data.map((fire) => (
        <Entity
          key={fire.id}
          position={Cartesian3.fromDegrees(fire.longitude, fire.latitude)}
          name="산불 감지"
          description={`
            <b>위성:</b> ${fire.satellite}<br/>
            <b>신뢰도:</b> ${fire.confidence ?? "N/A"}%<br/>
            <b>밝기:</b> ${fire.brightness?.toFixed(1) ?? "N/A"} K<br/>
            <b>FRP:</b> ${fire.frp?.toFixed(1) ?? "N/A"} MW<br/>
            <b>감지시간:</b> ${fire.detectedAt}
          `}
        >
          <PointGraphics
            pixelSize={12}
            color={Color.fromCssColorString("#ff6b35").withAlpha(0.9)}
            outlineColor={Color.fromCssColorString("#ff4500")}
            outlineWidth={2}
            scaleByDistance={new NearFarScalar(1e4, 2.0, 1e7, 0.5)}
          />
        </Entity>
      ))}
    </>
  );
}
