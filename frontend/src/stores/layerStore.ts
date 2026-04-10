import { create } from "zustand";

interface LayerState {
  layers: {
    earthquake: boolean;
    airQuality: boolean;
    disaster: boolean;
    wildfire: boolean;
    weather: boolean;
  };
  toggleLayer: (layer: keyof LayerState["layers"]) => void;
  setAllLayers: (visible: boolean) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: {
    earthquake: true,
    airQuality: true,
    disaster: true,
    wildfire: true,
    weather: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  setAllLayers: (visible) =>
    set(() => ({
      layers: {
        earthquake: visible,
        airQuality: visible,
        disaster: visible,
        wildfire: visible,
        weather: visible,
      },
    })),
}));
