import { Entity, PointGraphics } from "resium";
import { Cartesian3, Color, NearFarScalar } from "cesium";
import type { AirQualityReading } from "../../../api/client";

const GRADE_COLORS: Record<string, Color> = {
  좋음: Color.fromCssColorString("#22c55e"),
  보통: Color.fromCssColorString("#eab308"),
  나쁨: Color.fromCssColorString("#f97316"),
  매우나쁨: Color.fromCssColorString("#ef4444"),
  알수없음: Color.GRAY,
};

interface Props {
  data: AirQualityReading[];
}

export function AirQualityLayer({ data }: Props) {
  return (
    <>
      {data.map((reading) => {
        if (!reading.latitude || !reading.longitude) return null;
        const color = GRADE_COLORS[reading.grade] || GRADE_COLORS["알수없음"];
        return (
          <Entity
            key={reading.id}
            position={Cartesian3.fromDegrees(reading.longitude, reading.latitude)}
            name={`${reading.stationName} 대기질`}
            description={JSON.stringify({ type: "airQuality", data: reading })}
          >
            <PointGraphics
              pixelSize={10}
              color={color}
              outlineColor={Color.WHITE.withAlpha(0.5)}
              outlineWidth={1}
              scaleByDistance={new NearFarScalar(1e4, 1.5, 1e7, 0.5)}
            />
          </Entity>
        );
      })}
    </>
  );
}
