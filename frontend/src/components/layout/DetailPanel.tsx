import { type Entity as CesiumEntity } from "cesium";
import { X, MapPin } from "lucide-react";
import type {
  EntityMetadata,
  Earthquake,
  AirQualityReading,
  DisasterAlert,
  Wildfire,
  WeatherObservation,
} from "../../api/client";

interface Props {
  entity: CesiumEntity;
  onClose: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-accent-red/20 text-accent-red",
  WARNING: "bg-accent-amber/20 text-accent-amber",
  INFO: "bg-accent-blue/20 text-accent-blue",
};

const GRADE_COLORS: Record<string, string> = {
  "좋음": "text-accent-green",
  "보통": "text-accent-amber",
  "나쁨": "text-accent-amber",
  "매우나쁨": "text-accent-red",
};

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between items-baseline gap-3">
      <span className="text-[11px] text-text-muted shrink-0">{label}</span>
      <span className="text-[12px] text-text-primary text-right font-[family-name:var(--font-mono)]">{value}</span>
    </div>
  );
}

function EarthquakeCard({ data }: { data: Earthquake }) {
  return (
    <div className="space-y-1.5 px-3 py-2.5">
      <DetailRow label="규모" value={data.magnitude} />
      <DetailRow label="깊이" value={data.depth != null ? `${data.depth} km` : null} />
      <DetailRow label="위치" value={data.locationName} />
      <DetailRow label="발생시간" value={data.occurredAt} />
    </div>
  );
}

function AirQualityCard({ data }: { data: AirQualityReading }) {
  const gradeColor = GRADE_COLORS[data.grade] || "text-text-primary";
  return (
    <div className="space-y-1.5 px-3 py-2.5">
      <div className="flex justify-between items-baseline gap-3">
        <span className="text-[11px] text-text-muted">등급</span>
        <span className={`text-[12px] font-medium ${gradeColor}`}>{data.grade}</span>
      </div>
      <DetailRow label="PM2.5" value={data.pm25 != null ? `${data.pm25} ug/m3` : null} />
      <DetailRow label="PM10" value={data.pm10 != null ? `${data.pm10} ug/m3` : null} />
      <DetailRow label="통합지수" value={data.aqi} />
      <DetailRow label="측정시간" value={data.measuredAt} />
    </div>
  );
}

function DisasterCard({ data }: { data: DisasterAlert }) {
  const sevStyle = SEVERITY_COLORS[data.severity] || SEVERITY_COLORS.INFO;
  return (
    <div className="space-y-1.5 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sevStyle}`}>
          {data.severity}
        </span>
        <span className="text-[11px] text-text-muted">{data.category}</span>
      </div>
      <p className="text-[12px] text-text-secondary leading-relaxed">{data.message}</p>
      <DetailRow label="지역" value={data.regionName} />
      <DetailRow label="발송시간" value={data.issuedAt} />
    </div>
  );
}

function WildfireCard({ data }: { data: Wildfire }) {
  return (
    <div className="space-y-1.5 px-3 py-2.5">
      <DetailRow label="위성" value={data.satellite} />
      <DetailRow label="신뢰도" value={data.confidence != null ? `${data.confidence}%` : null} />
      <DetailRow label="밝기" value={data.brightness != null ? `${data.brightness.toFixed(1)} K` : null} />
      <DetailRow label="FRP" value={data.frp != null ? `${data.frp.toFixed(1)} MW` : null} />
      <DetailRow label="감지시간" value={data.detectedAt} />
    </div>
  );
}

function WeatherCard({ data }: { data: WeatherObservation }) {
  return (
    <div className="space-y-1.5 px-3 py-2.5">
      <DetailRow label="기온" value={data.temperature != null ? `${data.temperature}°C` : null} />
      <DetailRow label="상태" value={data.condition} />
      <DetailRow label="습도" value={data.humidity != null ? `${data.humidity}%` : null} />
      <DetailRow label="풍속" value={data.windSpeed != null ? `${data.windSpeed} m/s` : null} />
      <DetailRow label="강수" value={data.precipitation != null ? `${data.precipitation} mm` : null} />
      <DetailRow label="관측시간" value={data.observedAt} />
    </div>
  );
}

function MetadataCard({ meta }: { meta: EntityMetadata }) {
  switch (meta.type) {
    case "earthquake": return <EarthquakeCard data={meta.data} />;
    case "airQuality": return <AirQualityCard data={meta.data} />;
    case "disaster": return <DisasterCard data={meta.data} />;
    case "wildfire": return <WildfireCard data={meta.data} />;
    case "weather": return <WeatherCard data={meta.data} />;
  }
}

export function DetailPanel({ entity, onClose }: Props) {
  const name = entity.name || "선택된 항목";
  const rawDesc = entity.description?.getValue(new Date() as any) || "";

  let meta: EntityMetadata | null = null;
  try {
    meta = JSON.parse(rawDesc);
  } catch {
    // not JSON — fallback
  }

  return (
    <div className="absolute top-3 right-3 z-40 w-72">
      <div className="bg-bg-surface/95 backdrop-blur-md border border-border-default rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-default bg-bg-elevated/50">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={14} className="text-chrome-accent shrink-0" />
            <h3 className="text-[13px] font-semibold text-text-primary truncate">
              {name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>
        {meta ? (
          <MetadataCard meta={meta} />
        ) : (
          <div className="px-3 py-4 text-xs text-text-muted text-center">
            상세 정보 없음
          </div>
        )}
      </div>
    </div>
  );
}
