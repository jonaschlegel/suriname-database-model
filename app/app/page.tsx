'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { loadAllData } from '@/lib/data';
import type { AllData } from '@/lib/data';
import type { GeoJSONFeature } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import PlantationPanel from '@/components/PlantationPanel';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function HomePage() {
  const [data, setData] = useState<AllData | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlantation = useCallback((feature: GeoJSONFeature) => {
    setSelectedFeature(feature);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading plantation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      <MapView
        geojson={data?.geojson || null}
        selectedPlantationUri={
          selectedFeature?.properties.plantationUri || null
        }
        onSelectPlantation={handleSelectPlantation}
      />
      <SearchBar
        geojson={data?.geojson || null}
        onSelect={handleSelectPlantation}
      />
      <PlantationPanel
        feature={selectedFeature}
        data={data}
        onClose={handleClose}
      />
    </div>
  );
}
