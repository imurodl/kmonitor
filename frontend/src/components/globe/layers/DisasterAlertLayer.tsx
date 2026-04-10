import { Entity, BillboardGraphics } from "resium";
import { Cartesian3, VerticalOrigin } from "cesium";
import type { DisasterAlert } from "../../../api/client";

// Region center coordinates for placing alert markers
const REGION_COORDS: Record<string, [number, number]> = {
  서울특별시: [37.5665, 126.978],
  부산광역시: [35.1796, 129.0756],
  대구광역시: [35.8714, 128.6014],
  인천광역시: [37.4563, 126.7052],
  광주광역시: [35.1595, 126.8526],
  대전광역시: [36.3504, 127.3845],
  울산광역시: [35.5384, 129.3114],
  세종특별자치시: [36.4801, 127.2561],
  경기도: [37.4138, 127.5183],
  강원특별자치도: [37.8228, 128.1555],
  충청북도: [36.6357, 127.4913],
  충청남도: [36.5184, 126.8],
  전북특별자치도: [35.7175, 127.153],
  전라남도: [34.8679, 126.991],
  경상북도: [36.249, 128.8714],
  경상남도: [35.4606, 128.2132],
  제주특별자치도: [33.4996, 126.5312],
};

function createWarningIcon(severity: string): string {
  const color =
    severity === "CRITICAL" ? "#ef4444" : severity === "WARNING" ? "#f59e0b" : "#3b82f6";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

interface Props {
  data: DisasterAlert[];
}

export function DisasterAlertLayer({ data }: Props) {
  return (
    <>
      {data.map((alert) => {
        // Try to find coordinates for the region
        const coords = Object.entries(REGION_COORDS).find(([key]) =>
          alert.regionName?.includes(key.replace(/특별자치|광역|특별/, "").substring(0, 2))
        );
        if (!coords) return null;

        const [, [lat, lng]] = coords;
        return (
          <Entity
            key={alert.id}
            position={Cartesian3.fromDegrees(lng, lat, 1000)}
            name={`재난문자 - ${alert.regionName}`}
            description={`
              <b>유형:</b> ${alert.category}<br/>
              <b>심각도:</b> ${alert.severity}<br/>
              <b>지역:</b> ${alert.regionName}<br/>
              <b>내용:</b> ${alert.message}<br/>
              <b>발송시간:</b> ${alert.issuedAt}
            `}
          >
            <BillboardGraphics
              image={createWarningIcon(alert.severity)}
              scale={1.2}
              verticalOrigin={VerticalOrigin.BOTTOM}
            />
          </Entity>
        );
      })}
    </>
  );
}
