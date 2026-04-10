import { Viewer, CameraFlyTo } from "resium";
import { Cartesian3, Ion, createWorldTerrainAsync } from "cesium";
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

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "";

const KOREA_CENTER = Cartesian3.fromDegrees(127.5, 36.0, 800000);

export function KoreaGlobe() {
  const { layers } = useLayerStore();
  const earthquakes = useEarthquakes();
  const airQuality = useAirQuality();
  const disasters = useDisasterAlerts();
  const wildfires = useWildfires();
  const weather = useWeather();

  return (
    <Viewer
      full
      animation={false}
      timeline={false}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      infoBox={true}
      selectionIndicator={true}
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
    </Viewer>
  );
}
