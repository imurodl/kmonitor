import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import {
  GeoJsonDataSource,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian2,
  type Viewer as CesiumViewerType,
  type Entity as CesiumEntity,
  Cartesian3,
  Math as CesiumMath,
} from "cesium";
import { useLayerStore } from "../../../stores/layerStore";
import { REGIONS } from "../../../data/regions";

const GEOJSON_URL = "/data/korea-provinces.json";

const NAME_MAP: Record<string, string> = {
  Seoul: "seoul",
  Busan: "busan",
  Daegu: "daegu",
  Incheon: "incheon",
  "Gwangju": "gwangju",
  Daejeon: "daejeon",
  Ulsan: "ulsan",
  Sejong: "sejong",
  "Gyeonggi-do": "gyeonggi",
  "Gangwon-do": "gangwon",
  "Chungcheongbuk-do": "chungbuk",
  "Chungcheongnam-do": "chungnam",
  "Jeollabuk-do": "jeonbuk",
  "Jeollanam-do": "jeonnam",
  "Gyeongsangbuk-do": "gyeongbuk",
  "Gyeongsangnam-do": "gyeongnam",
  "Jeju": "jeju",
};

export function RegionBoundaryLayer() {
  const { viewer } = useCesium();
  const dsRef = useRef<GeoJsonDataSource | null>(null);
  const { selectRegion, selectedRegion } = useLayerStore();

  useEffect(() => {
    if (!viewer) return;
    const cesiumViewer = viewer as CesiumViewerType;

    let ds: GeoJsonDataSource;

    const UNSELECTED_FILL = Color.fromBytes(65, 80, 112).withAlpha(0.0);
    const UNSELECTED_STROKE = Color.fromBytes(65, 80, 112).withAlpha(0.18);

    (async () => {
      ds = await GeoJsonDataSource.load(GEOJSON_URL, {
        fill: UNSELECTED_FILL,
        stroke: UNSELECTED_STROKE,
        strokeWidth: 1,
      });

      dsRef.current = ds;
      cesiumViewer.dataSources.add(ds);

      // Map each entity to a region ID
      ds.entities.values.forEach((entity: CesiumEntity) => {
        const props = entity.properties;
        if (!props) return;
        const name1 = props.NAME_1?.getValue(cesiumViewer.clock.currentTime);
        const regionId = NAME_MAP[name1] || name1?.toLowerCase();
        if (regionId) {
          entity.name = regionId;
          const region = REGIONS.find((r) => r.id === regionId);
          if (region) {
            entity.description = region.name as any;
          }
        }
      });
    })();

    // Click handler for region selection
    const handler = new ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
    handler.setInputAction((click: { position: Cartesian2 }) => {
      const picked = cesiumViewer.scene.pick(click.position);
      if (picked?.id && dsRef.current?.entities.contains(picked.id)) {
        const regionId = picked.id.name;
        const region = REGIONS.find((r) => r.id === regionId);
        if (region) {
          selectRegion(regionId);
          cesiumViewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(region.center[0], region.center[1], region.zoomHeight),
            orientation: {
              heading: CesiumMath.toRadians(0),
              pitch: CesiumMath.toRadians(-60),
              roll: 0,
            },
            duration: 1.5,
          });
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      if (ds && cesiumViewer.dataSources.contains(ds)) {
        cesiumViewer.dataSources.remove(ds);
      }
    };
  }, [viewer, selectRegion]);

  // Highlight selected region
  useEffect(() => {
    const ds = dsRef.current;
    if (!ds) return;

    // Chrome accent (signal amber) for the selected region, faint slate for the rest.
    const CHROME_FILL = Color.fromBytes(234, 182, 88).withAlpha(0.14);
    const CHROME_STROKE = Color.fromBytes(234, 182, 88).withAlpha(0.85);
    const IDLE_FILL = Color.fromBytes(65, 80, 112).withAlpha(0.0);
    const IDLE_STROKE = Color.fromBytes(65, 80, 112).withAlpha(0.18);

    ds.entities.values.forEach((entity: CesiumEntity) => {
      const isSelected = entity.name === selectedRegion;
      if (entity.polygon) {
        entity.polygon.material = (isSelected ? CHROME_FILL : IDLE_FILL) as any;
        entity.polygon.outlineColor = (isSelected ? CHROME_STROKE : IDLE_STROKE) as any;
      }
    });
  }, [selectedRegion]);

  return null;
}
