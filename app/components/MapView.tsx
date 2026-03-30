'use client';

import 'leaflet/dist/leaflet.css';
import type { GeoJSONCollection, GeoJSONFeature } from '@/lib/types';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

const ANNOTATION_URL =
  'https://surinametijdmachine.org/iiif/mapathon/kaart-van-suriname-1930.json';

// Monkey-patch L.DomUtil.getPosition so that _leaflet_pos is never
// undefined.  Allmaps' WebGL renderer continuously reads _leaflet_pos
// from map pane elements; if a pane hasn't been positioned yet the
// read throws a TypeError.  By intercepting the read we guarantee a
// safe fallback of Point(0,0).
const _origGetPosition = L.DomUtil.getPosition;
L.DomUtil.getPosition = function (el: HTMLElement): L.Point {
  if (!(el as unknown as Record<string, unknown>)._leaflet_pos) {
    (el as unknown as Record<string, unknown>)._leaflet_pos = new L.Point(0, 0);
  }
  return _origGetPosition.call(this, el);
};

interface MapViewProps {
  geojson: GeoJSONCollection | null;
  selectedPlantationUri: string | null;
  highlightedName: string | null;
  panelOpen: boolean;
  onSelectPlantation: (feature: GeoJSONFeature) => void;
  onHighlightName: (name: string) => void;
}

export default function MapView({
  geojson,
  selectedPlantationUri,
  highlightedName,
  panelOpen,
  onSelectPlantation,
  onHighlightName,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const warpedLayerRef = useRef<L.Layer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedUriRef = useRef(selectedPlantationUri);
  const highlightedNameRef = useRef(highlightedName);
  const onSelectRef = useRef(onSelectPlantation);
  const [opacity, setOpacity] = useState(0.7);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState(true);

  // Keep callback ref in sync
  useEffect(() => {
    onSelectRef.current = onSelectPlantation;
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [5.5, -55.2],
      zoom: 8,
      zoomControl: false,
      zoomAnimation: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Add 1930 historical map overlay via Allmaps.
    // The monkey-patch on L.DomUtil.getPosition (above) ensures that
    // _leaflet_pos is always defined, so we can add the layer directly.
    map.whenReady(() => {
      import('@allmaps/leaflet')
        .then(({ WarpedMapLayer }) => {
          if (!mapRef.current) return;
          const warpedMapLayer = new WarpedMapLayer(ANNOTATION_URL, {
            opacity: 0.7,
          });
          warpedMapLayer.addTo(map);
          warpedLayerRef.current = warpedMapLayer;
        })
        .catch(() => {
          // Allmaps module failed to load — map still usable
        });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      warpedLayerRef.current = null;
    };
  }, []);

  // Add/update GeoJSON layer — recreate only when data changes
  useEffect(() => {
    if (!mapRef.current || !geojson) return;

    if (layerRef.current) {
      layerRef.current.remove();
    }

    const layer = L.geoJSON(geojson as unknown as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const props = feature?.properties;
        const isSelected = props?.plantationUri === selectedUriRef.current;
        const isHighlighted =
          !isSelected &&
          !!highlightedNameRef.current &&
          props?.name
            ?.toLowerCase()
            .includes(highlightedNameRef.current.toLowerCase());
        const isBuilt = props?.status === 'built';
        if (isSelected) {
          return {
            fillColor: '#c0944e',
            fillOpacity: 0.55,
            color: '#8c6228',
            weight: 3,
          };
        }
        if (isHighlighted) {
          return {
            fillColor: '#e07850',
            fillOpacity: 0.45,
            color: '#a04020',
            weight: 2,
            dashArray: '6 3',
          };
        }
        return {
          fillColor: isBuilt ? '#a67830' : '#a39b8e',
          fillOpacity: 0.25,
          color: isBuilt ? '#6e4d20' : '#6e6658',
          weight: 1,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const props = feature.properties;
        featureLayer.bindTooltip(props.name || 'Unknown', {
          sticky: true,
          className: 'plantation-tooltip',
        });

        featureLayer.on('click', () => {
          onSelectRef.current(feature as unknown as GeoJSONFeature);
        });

        featureLayer.on('mouseover', (e) => {
          const target = e.target as L.Path;
          if (props.plantationUri !== selectedUriRef.current) {
            target.setStyle({ fillOpacity: 0.5, weight: 2 });
          }
        });

        featureLayer.on('mouseout', (e) => {
          const target = e.target as L.Path;
          if (props.plantationUri !== selectedUriRef.current) {
            layer.resetStyle(target);
          }
        });
      },
    });

    layer.addTo(mapRef.current);
    layerRef.current = layer;
  }, [geojson]);

  // Restyle features when selection or highlight changes (no layer recreation)
  useEffect(() => {
    selectedUriRef.current = selectedPlantationUri;
    highlightedNameRef.current = highlightedName;
    if (layerRef.current) {
      layerRef.current.eachLayer((l) => {
        layerRef.current!.resetStyle(l as L.Path);
      });
    }
  }, [selectedPlantationUri, highlightedName]);

  // Sync overlay opacity
  useEffect(() => {
    const layer = warpedLayerRef.current;
    if (!layer) return;
    if ('setOpacity' in layer) {
      (layer as unknown as { setOpacity: (o: number) => void }).setOpacity(
        overlayVisible ? opacity : 0,
      );
    }
  }, [opacity, overlayVisible]);

  // Fly to selected plantation — pad right side when panel is open
  useEffect(() => {
    if (!mapRef.current || !layerRef.current || !selectedPlantationUri) return;

    layerRef.current.eachLayer((layer) => {
      const feature = (layer as L.GeoJSON & { feature?: GeoJSONFeature })
        .feature;
      if (feature?.properties?.plantationUri === selectedPlantationUri) {
        const bounds = (layer as L.Polygon).getBounds();
        mapRef.current!.flyToBounds(bounds, {
          padding: [50, 50],
          paddingBottomRight: panelOpen ? [420, 50] : [50, 50],
          maxZoom: 13,
        });
      }
    });
  }, [selectedPlantationUri, panelOpen]);

  // Fly to all highlighted features when name is highlighted without selection
  useEffect(() => {
    if (
      !mapRef.current ||
      !layerRef.current ||
      !highlightedName ||
      selectedPlantationUri
    )
      return;

    let combinedBounds: L.LatLngBounds | null = null;
    layerRef.current.eachLayer((layer) => {
      const feature = (layer as L.GeoJSON & { feature?: GeoJSONFeature })
        .feature;
      if (
        feature?.properties?.name
          ?.toLowerCase()
          .includes(highlightedName.toLowerCase())
      ) {
        const bounds = (layer as L.Polygon).getBounds();
        combinedBounds = combinedBounds
          ? combinedBounds.extend(bounds)
          : bounds;
      }
    });
    if (combinedBounds) {
      mapRef.current.flyToBounds(combinedBounds, {
        padding: [50, 50],
        maxZoom: 13,
      });
    }
  }, [highlightedName, selectedPlantationUri]);

  function handleZoomIn() {
    mapRef.current?.zoomIn();
  }
  function handleZoomOut() {
    mapRef.current?.zoomOut();
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Unified top toolbar */}
      <div className="absolute top-3 left-3 right-3 z-1000 flex items-start gap-2">
        {/* Toolbar toggle (collapsed state) */}
        {!toolbarOpen && (
          <button
            onClick={() => setToolbarOpen(true)}
            className="bg-white/95 backdrop-blur-sm shadow-md p-2 border border-stm-warm-200 hover:bg-stm-warm-50 transition-colors"
            aria-label="Open map toolbar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6h12M4 10h12M4 14h12" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Toolbar panel */}
        {toolbarOpen && (
          <div className="bg-white/95 backdrop-blur-sm shadow-md border border-stm-warm-200 flex items-center gap-3 px-3 py-2 flex-wrap">
            {/* Zoom controls */}
            <div className="flex items-center">
              <button
                onClick={handleZoomIn}
                className="w-7 h-7 flex items-center justify-center text-stm-warm-700 hover:bg-stm-warm-100 transition-colors border-r border-stm-warm-200"
                aria-label="Zoom in"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 2v10M2 7h10" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 flex items-center justify-center text-stm-warm-700 hover:bg-stm-warm-100 transition-colors"
                aria-label="Zoom out"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 7h10" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-stm-warm-200" />

            {/* Search */}
            <SearchInput
              geojson={geojson}
              onSelect={onSelectPlantation}
              onHighlightName={onHighlightName}
            />

            {/* Divider */}
            <div className="w-px h-6 bg-stm-warm-200" />

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2.5 bg-stm-sepia-500 opacity-60 inline-block" />
                <span className="text-stm-warm-600">Built</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2.5 bg-stm-warm-400 opacity-60 inline-block" />
                <span className="text-stm-warm-600">Unknown</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2.5 border-2 border-stm-sepia-600 bg-stm-sepia-300 opacity-80 inline-block" />
                <span className="text-stm-warm-600">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2.5 border border-dashed border-[#a04020] bg-[#e07850] opacity-70 inline-block" />
                <span className="text-stm-warm-600">Highlighted</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-stm-warm-200" />

            {/* Overlay toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={overlayVisible}
                  onChange={(e) => setOverlayVisible(e.target.checked)}
                  className="accent-stm-sepia-600"
                  aria-label="Toggle 1930 map overlay"
                />
                <span className="font-medium text-stm-warm-700">1930 Map</span>
              </label>
              {overlayVisible && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-20 accent-stm-sepia-600"
                  aria-label="Map overlay opacity"
                />
              )}
            </div>

            {/* Collapse button */}
            <button
              onClick={() => setToolbarOpen(false)}
              className="ml-auto text-stm-warm-400 hover:text-stm-warm-600 transition-colors p-0.5"
              aria-label="Collapse toolbar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Inline search input */
function SearchInput({
  geojson,
  onSelect,
  onHighlightName,
}: {
  geojson: GeoJSONCollection | null;
  onSelect: (feature: GeoJSONFeature) => void;
  onHighlightName: (name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = (() => {
    if (!geojson || query.length < 2) return [];
    const q = query.toLowerCase();
    return geojson.features
      .filter((f) => f.properties.name?.toLowerCase().includes(q))
      .slice(0, 20);
  })();

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search plantations..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.length >= 2) {
            onHighlightName(query);
            setOpen(false);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        aria-label="Search plantations by name"
        aria-autocomplete="list"
        role="combobox"
        aria-expanded={open && results.length > 0}
        className="w-48 px-2.5 py-1 border border-stm-warm-300 bg-white text-sm text-stm-warm-900 placeholder:text-stm-warm-400 focus:outline-none focus:ring-2 focus:ring-stm-sepia-400"
      />
      {open && results.length > 0 && (
        <ul
          className="absolute top-full left-0 mt-1 w-64 bg-white border border-stm-warm-200 shadow-lg max-h-64 overflow-y-auto z-10"
          role="listbox"
        >
          {results.map((f) => (
            <li key={f.id} role="option">
              <button
                className="w-full text-left px-3 py-2 text-sm text-stm-warm-800 hover:bg-stm-sepia-50 transition-colors"
                onMouseDown={() => {
                  onSelect(f);
                  setQuery(f.properties.name);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{f.properties.name}</span>
                {f.properties.organizationQid && (
                  <span className="ml-2 text-xs text-stm-warm-400">
                    {f.properties.organizationQid}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
