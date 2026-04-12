import { Entity, LabelGraphics, PointGraphics } from "resium";
import { Cartesian2, Cartesian3, Color, NearFarScalar, VerticalOrigin } from "cesium";
import type { WeatherObservation } from "../../../api/client";

const CONDITION_COLORS: Record<string, Color> = {
  맑음: Color.fromCssColorString("#60a5fa"),
  비: Color.fromCssColorString("#3b82f6"),
  "비/눈": Color.fromCssColorString("#6366f1"),
  눈: Color.WHITE,
  흐림: Color.GRAY,
  구름많음: Color.LIGHTGRAY,
};

const LABEL_OFFSET = new Cartesian2(0, -12);

interface Props {
  data: WeatherObservation[];
}

export function WeatherLayer({ data }: Props) {
  return (
    <>
      {data.map((obs) => {
        if (!obs.latitude || !obs.longitude) return null;
        const color = CONDITION_COLORS[obs.condition] || Color.LIGHTBLUE;
        return (
          <Entity
            key={obs.id}
            position={Cartesian3.fromDegrees(obs.longitude, obs.latitude, 500)}
            name={`${obs.stationName} 날씨`}
            description={`
              <b>도시:</b> ${obs.stationName}<br/>
              <b>기온:</b> ${obs.temperature ?? "N/A"}°C<br/>
              <b>습도:</b> ${obs.humidity ?? "N/A"}%<br/>
              <b>풍속:</b> ${obs.windSpeed ?? "N/A"} m/s<br/>
              <b>강수:</b> ${obs.precipitation ?? 0} mm<br/>
              <b>상태:</b> ${obs.condition}<br/>
              <b>관측시간:</b> ${obs.observedAt}
            `}
          >
            <PointGraphics
              pixelSize={8}
              color={color}
              outlineColor={Color.WHITE.withAlpha(0.6)}
              outlineWidth={1}
              scaleByDistance={new NearFarScalar(1e4, 1.5, 1e7, 0.5)}
            />
            <LabelGraphics
              text={obs.temperature != null ? `${obs.temperature.toFixed(0)}°` : ""}
              font="12px sans-serif"
              fillColor={Color.WHITE}
              outlineColor={Color.BLACK}
              outlineWidth={2}
              style={2}
              verticalOrigin={VerticalOrigin.BOTTOM}
              pixelOffset={LABEL_OFFSET}
              scaleByDistance={new NearFarScalar(1e4, 1.0, 1e7, 0.3)}
            />
          </Entity>
        );
      })}
    </>
  );
}
