'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJSONCollection, GeoJSONFeature } from '@/lib/types';

interface MapViewProps {
  geojson: GeoJSONCollection | null;
  selectedPlantationUri: string | null;
  onSelectPlantation: (feature: GeoJSONFeature) => void;
}

export default function MapView({
  geojson,
  selectedPlantationUri,
  onSelectPlantation,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [5.5, -55.2],
      zoom: 8,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add/update GeoJSON layer
  useEffect(() => {
    if (!mapRef.current || !geojson) return;

    if (layerRef.current) {
      layerRef.current.remove();
    }

    const layer = L.geoJSON(geojson as unknown as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const props = feature?.properties;
        const isSelected = props?.plantationUri === selectedPlantationUri;
        const isBuilt = props?.status === 'built';
        return {
          fillColor: isSelected ? '#eab308' : isBuilt ? '#3b82f6' : '#9ca3af',
          fillOpacity: isSelected ? 0.6 : 0.3,
          color: isSelected ? '#eab308' : isBuilt ? '#2563eb' : '#6b7280',
          weight: isSelected ? 3 : 1,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const props = feature.properties;
        featureLayer.bindTooltip(props.name || 'Unknown', {
          sticky: true,
          className: 'plantation-tooltip',
        });

        featureLayer.on('click', () => {
          onSelectPlantation(feature as unknown as GeoJSONFeature);
        });

        featureLayer.on('mouseover', (e) => {
          const target = e.target as L.Path;
          if (props.plantationUri !== selectedPlantationUri) {
            target.setStyle({ fillOpacity: 0.5, weight: 2 });
          }
        });

        featureLayer.on('mouseout', (e) => {
          const target = e.target as L.Path;
          if (props.plantationUri !== selectedPlantationUri) {
            layer.resetStyle(target);
          }
        });
      },
    });

    layer.addTo(mapRef.current);
    layerRef.current = layer;
  }, [geojson, selectedPlantationUri, onSelectPlantation]);

  // Fly to selected plantation
  useEffect(() => {
    if (!mapRef.current || !layerRef.current || !selectedPlantationUri) return;

    layerRef.current.eachLayer((layer) => {
      const feature = (layer as L.GeoJSON & { feature?: GeoJSONFeature })
        .feature;
      if (feature?.properties?.plantationUri === selectedPlantationUri) {
        const bounds = (layer as L.Polygon).getBounds();
        mapRef.current!.flyToBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    });
  }, [selectedPlantationUri]);

  return <div ref={containerRef} className="w-full h-full" />;
}
