import { type Entity as CesiumEntity } from "cesium";
import { X, MapPin } from "lucide-react";

interface Props {
  entity: CesiumEntity;
  onClose: () => void;
}

function formatDescription(html: string): string {
  return html
    .replace(/N\/A/g, "-")
    .replace(/null/g, "-")
    .replace(/undefined/g, "-");
}

export function DetailPanel({ entity, onClose }: Props) {
  const name = entity.name || "선택된 항목";
  const rawDesc = entity.description?.getValue(new Date() as any) || "";
  const description = formatDescription(rawDesc);

  return (
    <div className="absolute top-3 right-3 z-40 w-72">
      <div className="bg-bg-surface/95 backdrop-blur-md border border-border-default rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-default bg-bg-elevated/50">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={14} className="text-accent-blue shrink-0" />
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
        {description ? (
          <div
            className="px-3 py-2.5 text-[12px] text-text-secondary leading-relaxed [&_b]:text-text-primary [&_b]:font-medium [&_b]:text-[11px] [&_b]:uppercase [&_b]:tracking-wide [&_b]:text-text-muted"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <div className="px-3 py-4 text-xs text-text-muted text-center">
            상세 정보 없음
          </div>
        )}
      </div>
    </div>
  );
}
