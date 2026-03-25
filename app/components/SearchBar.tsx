'use client';

import type { GeoJSONCollection, GeoJSONFeature } from '@/lib/types';
import { useMemo, useState } from 'react';

interface SearchBarProps {
  geojson: GeoJSONCollection | null;
  onSelect: (feature: GeoJSONFeature) => void;
}

export default function SearchBar({ geojson, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!geojson || query.length < 2) return [];
    const q = query.toLowerCase();
    return geojson.features
      .filter((f) => f.properties.name?.toLowerCase().includes(q))
      .slice(0, 20);
  }, [geojson, query]);

  return (
    <div className="absolute top-4 left-14 z-1000 w-72">
      <input
        type="text"
        placeholder="Search plantations..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && results.length > 0 && (
        <ul className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((f) => (
            <li key={f.id}>
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 transition-colors"
                onClick={() => {
                  onSelect(f);
                  setQuery(f.properties.name);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{f.properties.name}</span>
                {f.properties.organizationQid && (
                  <span className="ml-2 text-xs text-gray-400">
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
