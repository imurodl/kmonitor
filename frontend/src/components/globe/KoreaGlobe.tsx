import { useRef, useEffect, useCallback } from "react";
import { Viewer } from "resium";
import {
  Cartesian3,
  Ion,
  Math as CesiumMath,
  createWorldTerrainAsync,
  Cesium3DTileset,
  HeadingPitchRange,
  type Viewer as CesiumViewerType,
  type Entity as CesiumEntity,
} from "cesium";
import { Home, Plus, Minus } from "lucide-react";
import { useLayerStore } from "../../stores/layerStore";
import { getRegionById } from "../../data/regions";
import {
  useEarthquakes,
  useAirQuality,
  useDisasterAlerts,
  useWildfires,
  useWeather,
} from "../../api/hooks";
import { EarthquakeLayer } from "./layers/EarthquakeLayer";
import { AirQualityLayer } from "./layers/AirQualityLayer";
import { DisasterAlertLayer } from "./layers/DisasterAlertLayer";
import { WildfireLayer } from "./layers/WildfireLayer";
import { WeatherLayer } from "./layers/WeatherLayer";
import { RegionBoundaryLayer } from "./layers/RegionBoundaryLayer";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "";

const DEFAULT_VIEW = {
  destination: Cartesian3.fromDegrees(127.5, 36.0, 2500000),
  orientation: {
    heading: CesiumMath.toRadians(0),
    pitch: CesiumMath.toRadians(-90),
    roll: 0,
  },
};

const KOREA_BOUNDS = {
  south: CesiumMath.toRadians(30.0),
  north: CesiumMath.toRadians(42.0),
  west: CesiumMath.toRadians(120.0),
  east: CesiumMath.toRadians(135.0),
};
const MIN_HEIGHT = 500;
const MAX_HEIGHT = 10_000_000;
const TILES_3D_THRESHOLD = 50_000;

function clampCamera(viewer: CesiumViewerType) {
  const camera = viewer.scene.camera;
  const pos = camera.positionCartographic;

  let lat = pos.latitude;
  let lng = pos.longitude;
  let height = pos.height;
  let clamped = false;

  if (lat < KOREA_BOUNDS.south) { lat = KOREA_BOUNDS.south; clamped = true; }
  if (lat > KOREA_BOUNDS.north) { lat = KOREA_BOUNDS.north; clamped = true; }
  if (lng < KOREA_BOUNDS.west) { lng = KOREA_BOUNDS.west; clamped = true; }
  if (lng > KOREA_BOUNDS.east) { lng = KOREA_BOUNDS.east; clamped = true; }
  if (height < MIN_HEIGHT) { height = MIN_HEIGHT; clamped = true; }
  if (height > MAX_HEIGHT) { height = MAX_HEIGHT; clamped = true; }

  if (clamped) {
    camera.setView({
      destination: Cartesian3.fromRadians(lng, lat, height),
      orientation: { heading: camera.heading, pitch: camera.pitch, roll: camera.roll },
    });
  }
}

interface KoreaGlobeProps {
  onEntitySelect?: (entity: CesiumEntity | undefined) => void;
}

export function KoreaGlobe({ onEntitySelect }: KoreaGlobeProps) {
  const viewerRef = useRef<{ cesiumElement?: CesiumViewerType }>(null);
  const tilesetRef = useRef<InstanceType<typeof Cesium3DTileset> | null>(null);
  const { layers, selectedRegion, selectRegion } = useLayerStore();
  const earthquakes = useEarthquakes();
  const airQuality = useAirQuality();
  const disasters = useDisasterAlerts();
  const wildfires = useWildfires();
  const weather = useWeather();

  const resetView = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.selectedEntity = undefined;
    onEntitySelect?.(undefined);
    selectRegion(null);
    viewer.camera.flyTo({ ...DEFAULT_VIEW, duration: 1.5 });
  }, [onEntitySelect, selectRegion]);

  // Fly to selected region
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || !selectedRegion) return;

    const region = getRegionById(selectedRegion);
    if (!region) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(region.center[0], region.center[1], region.zoomHeight),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-60),
        roll: 0,
      },
      duration: 1.5,
    });
  }, [selectedRegion]);

  const setupViewer = useCallback(async () => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    // Enable 3D terrain
    try {
      viewer.terrainProvider = await createWorldTerrainAsync();
    } catch {
      // fallback if no ion token
    }

    // Google Photorealistic 3D Tiles via Cesium Ion
    try {
      const tileset = await Cesium3DTileset.fromIonAssetId(2275207);
      tilesetRef.current = tileset;
      tileset.show = false; // hidden by default, shown when zoomed in
      viewer.scene.primitives.add(tileset);
    } catch {
      // fallback — no 3D tiles (ion token missing or invalid)
    }

    // 3D globe settings
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
    }

    // Initial camera
    viewer.camera.setView(DEFAULT_VIEW);

    // Zoom constraints
    const controller = viewer.scene.screenSpaceCameraController;
    controller.minimumZoomDistance = MIN_HEIGHT;
    controller.maximumZoomDistance = MAX_HEIGHT;
    controller.enableTilt = true;
    controller.enableLook = false;

    // Camera bounds + altitude-based 3D tile switching
    viewer.camera.percentageChanged = 0.01;
    viewer.camera.changed.addEventListener(() => {
      clampCamera(viewer);

      // Toggle 3D tiles based on altitude
      const tileset = tilesetRef.current;
      if (tileset) {
        const height = viewer.camera.positionCartographic.height;
        const shouldShow3D = height < TILES_3D_THRESHOLD;
        if (tileset.show !== shouldShow3D) {
          tileset.show = shouldShow3D;
          viewer.scene.globe.show = !shouldShow3D;
        }
      }
    });

    // Click entity: fly to it
    viewer.selectedEntityChanged.addEventListener((entity: CesiumEntity | undefined) => {
      onEntitySelect?.(entity);

      if (entity) {
        viewer.flyTo(entity, {
          offset: new HeadingPitchRange(
            CesiumMath.toRadians(0),
            CesiumMath.toRadians(-30),
            400
          ),
          duration: 2.0,
        });
      }
    });
  }, [onEntitySelect]);

  useEffect(() => {
    const timer = setTimeout(setupViewer, 200);
    return () => clearTimeout(timer);
  }, [setupViewer]);

  return (
    <>
      <Viewer
        ref={viewerRef as any}
        full
        animation={false}
        timeline={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        infoBox={false}
        selectionIndicator={false}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {layers.regionBoundaries && <RegionBoundaryLayer />}

        {layers.earthquake && earthquakes.data && (
          <EarthquakeLayer data={earthquakes.data} />
        )}
        {layers.airQuality && airQuality.data && (
          <AirQualityLayer data={airQuality.data} />
        )}
        {layers.disaster && disasters.data && (
          <DisasterAlertLayer data={disasters.data} />
        )}
        {layers.wildfire && wildfires.data && (
          <WildfireLayer data={wildfires.data} />
        )}
        {layers.weather && weather.data && (
          <WeatherLayer data={weather.data} />
        )}
      </Viewer>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1">
        <button
          onClick={() => {
            const v = viewerRef.current?.cesiumElement;
            if (v) v.camera.zoomIn(v.camera.positionCartographic.height * 0.4);
          }}
          className="p-2 bg-bg-surface/90 backdrop-blur-sm border border-border-default rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shadow-lg"
          title="확대"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => {
            const v = viewerRef.current?.cesiumElement;
            if (v) v.camera.zoomOut(v.camera.positionCartographic.height * 0.6);
          }}
          className="p-2 bg-bg-surface/90 backdrop-blur-sm border border-border-default rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shadow-lg"
          title="축소"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-bg-surface/90 backdrop-blur-sm border border-border-default rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shadow-lg"
          title="전체 보기"
        >
          <Home size={14} />
        </button>
      </div>
    </>
  );
}
