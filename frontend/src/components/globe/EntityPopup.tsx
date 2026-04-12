import { useEffect, useState, useCallback, type RefObject } from "react";
import { type Viewer as CesiumViewerType, type Entity, SceneTransforms } from "cesium";
import { X } from "lucide-react";

interface Props {
  viewerRef: RefObject<{ cesiumElement?: CesiumViewerType } | null>;
}

interface PopupState {
  name: string;
  description: string;
  screenX: number;
  screenY: number;
}

export function EntityPopup({ viewerRef }: Props) {
  const [popup, setPopup] = useState<PopupState | null>(null);

  const updatePosition = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || !viewer.selectedEntity?.position) {
      return;
    }

    const entity = viewer.selectedEntity;
    const pos = entity.position?.getValue(viewer.clock.currentTime);
    if (!pos) return;

    const screenPos = SceneTransforms.worldToWindowCoordinates(viewer.scene, pos);
    if (!screenPos) {
      setPopup(null);
      return;
    }

    setPopup({
      name: entity.name || "",
      description: entity.description?.getValue(viewer.clock.currentTime) || "",
      screenX: screenPos.x,
      screenY: screenPos.y,
    });
  }, [viewerRef]);

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    const onSelect = (entity: Entity | undefined) => {
      if (!entity) {
        setPopup(null);
        return;
      }
      updatePosition();
    };

    viewer.selectedEntityChanged.addEventListener(onSelect);

    let animationId: number;
    const tick = () => {
      if (popup) updatePosition();
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);

    return () => {
      viewer.selectedEntityChanged.removeEventListener(onSelect);
      cancelAnimationFrame(animationId);
    };
  }, [viewerRef, popup, updatePosition]);

  if (!popup) return null;

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: popup.screenX + 16,
        top: popup.screenY - 16,
        maxWidth: 320,
      }}
    >
      <div className="bg-bg-surface/95 backdrop-blur-sm border border-border-default rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
          <span className="text-sm font-medium text-text-primary truncate">
            {popup.name}
          </span>
          <button
            onClick={() => {
              setPopup(null);
              const viewer = viewerRef.current?.cesiumElement;
              if (viewer) viewer.selectedEntity = undefined;
            }}
            className="text-text-muted hover:text-text-primary ml-2 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
        <div
          className="px-3 py-2 text-xs text-text-secondary leading-relaxed [&_b]:text-text-primary [&_b]:font-medium"
          dangerouslySetInnerHTML={{ __html: popup.description }}
        />
      </div>
    </div>
  );
}
