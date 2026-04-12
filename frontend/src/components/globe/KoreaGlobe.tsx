import { useRef, useEffect, useCallback } from "react";
import { Viewer, CameraFlyTo } from "resium";
import {
  Cartesian3,
  Ion,
  Math as CesiumMath,
  type Viewer as CesiumViewerType,
} from "cesium";
import { useLayerStore } from "../../stores/layerStore";
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
import { EntityPopup } from "./EntityPopup";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "";

const KOREA_CENTER = Cartesian3.fromDegrees(127.5, 36.0, 800000);

const KOREA_BOUNDS = {
  south: CesiumMath.toRadians(32.5),
  north: CesiumMath.toRadians(39.5),
  west: CesiumMath.toRadians(123.5),
  east: CesiumMath.toRadians(132.5),
};
const MIN_HEIGHT = 50_000;
const MAX_HEIGHT = 2_000_000;

function clampCamera(viewer: CesiumViewerType) {
  const camera = viewer.scene.camera;
  const pos = camera.positionCartographic;

  let lat = pos.latitude;
  let lng = pos.longitude;
  let height = pos.height;
  let clamped = false;

  if (lat < KOREA_BOUNDS.south) {
    lat = KOREA_BOUNDS.south;
    clamped = true;
  }
  if (lat > KOREA_BOUNDS.north) {
    lat = KOREA_BOUNDS.north;
    clamped = true;
  }
  if (lng < KOREA_BOUNDS.west) {
    lng = KOREA_BOUNDS.west;
    clamped = true;
  }
  if (lng > KOREA_BOUNDS.east) {
    lng = KOREA_BOUNDS.east;
    clamped = true;
  }
  if (height < MIN_HEIGHT) {
    height = MIN_HEIGHT;
    clamped = true;
  }
  if (height > MAX_HEIGHT) {
    height = MAX_HEIGHT;
    clamped = true;
  }

  if (clamped) {
    camera.setView({
      destination: Cartesian3.fromRadians(lng, lat, height),
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
    });
  }
}

export function KoreaGlobe() {
  const viewerRef = useRef<{ cesiumElement?: CesiumViewerType }>(null);
  const { layers } = useLayerStore();
  const earthquakes = useEarthquakes();
  const airQuality = useAirQuality();
  const disasters = useDisasterAlerts();
  const wildfires = useWildfires();
  const weather = useWeather();

  const setupCamera = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    const controller = viewer.scene.screenSpaceCameraController;
    controller.minimumZoomDistance = MIN_HEIGHT;
    controller.maximumZoomDistance = MAX_HEIGHT;

    viewer.camera.percentageChanged = 0.01;
    viewer.camera.changed.addEventListener(() => clampCamera(viewer));
  }, []);

  useEffect(() => {
    const timer = setTimeout(setupCamera, 100);
    return () => clearTimeout(timer);
  }, [setupCamera]);

  return (
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
      <CameraFlyTo destination={KOREA_CENTER} duration={0} />

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

      <EntityPopup viewerRef={viewerRef} />
    </Viewer>
  );
}
