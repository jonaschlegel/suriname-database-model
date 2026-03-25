'use client';

import { entityTypeColor } from '@/lib/data';
import type {
  E22Source,
  E24Plantation,
  E41Appellation,
  E53Place,
  E74Organization,
  OrganizationObservation,
} from '@/lib/types';
import { useMemo } from 'react';

interface EntityGraphProps {
  plantation: E24Plantation | null;
  organization: E74Organization | null;
  place: E53Place | null;
  appellations: E41Appellation[];
  sources: E22Source[];
  observationCount: number;
  onNodeClick: (section: string) => void;
}

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
  section: string;
}

interface Edge {
  from: string;
  to: string;
  label: string;
}

export default function EntityGraph({
  plantation,
  organization,
  place,
  appellations,
  sources,
  observationCount,
  onNodeClick,
}: EntityGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!plantation) return { nodes, edges };

    const cx = 250;
    const cy = 160;

    // E24 center
    nodes.push({
      id: 'e24',
      label: plantation.prefLabel,
      type: 'E24',
      x: cx,
      y: cy,
      color: entityTypeColor('E24'),
      section: 'plantation',
    });

    // E74 right
    if (organization) {
      nodes.push({
        id: 'e74',
        label: organization.prefLabel,
        type: 'E74',
        x: cx + 180,
        y: cy,
        color: entityTypeColor('E74'),
        section: 'organization',
      });
      edges.push({ from: 'e24', to: 'e74', label: 'P52' });
    }

    // E53 below
    if (place) {
      nodes.push({
        id: 'e53',
        label: `fid-${place.fid}`,
        type: 'E53',
        x: cx,
        y: cy + 110,
        color: entityTypeColor('E53'),
        section: 'place',
      });
      edges.push({ from: 'e24', to: 'e53', label: 'P53' });
    }

    // E41s above
    const maxApps = Math.min(appellations.length, 4);
    for (let i = 0; i < maxApps; i++) {
      const app = appellations[i];
      const spread = 100;
      const offsetX = (i - (maxApps - 1) / 2) * spread;
      nodes.push({
        id: `e41-${i}`,
        label: app.P190_has_symbolic_content || '(unnamed)',
        type: 'E41',
        x: cx + offsetX,
        y: cy - 100,
        color: entityTypeColor('E41'),
        section: 'appellations',
      });
      // Name identifies plantation or org
      const identifiesOrg = app.P1i_identifies?.includes('wikidata');
      edges.push({
        from: identifiesOrg ? 'e74' : 'e24',
        to: `e41-${i}`,
        label: 'P1',
      });
    }

    // E22 sources - top right
    const uniqueSources = sources.slice(0, 3);
    for (let i = 0; i < uniqueSources.length; i++) {
      const src = uniqueSources[i];
      nodes.push({
        id: `e22-${i}`,
        label: src.mapId || src.prefLabel?.slice(0, 15) || '(source)',
        type: 'E22',
        x: cx + 180,
        y: cy - 80 + i * 50,
        color: entityTypeColor('E22'),
        section: 'sources',
      });
    }

    // Observation count - bottom right
    if (observationCount > 0) {
      nodes.push({
        id: 'obs',
        label: `${observationCount} obs`,
        type: 'OBS',
        x: cx + 180,
        y: cy + 110,
        color: entityTypeColor('Observation'),
        section: 'observations',
      });
      if (organization) {
        edges.push({ from: 'obs', to: 'e74', label: 'observationOf' });
      }
    }

    return { nodes, edges };
  }, [
    plantation,
    organization,
    place,
    appellations,
    sources,
    observationCount,
  ]);

  if (!plantation) return null;

  const width = 500;
  const height = 320;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full border border-gray-200 rounded-lg bg-gray-50"
    >
      {/* Edges */}
      {edges.map((edge, i) => {
        const from = nodes.find((n) => n.id === edge.from);
        const to = nodes.find((n) => n.id === edge.to);
        if (!from || !to) return null;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#d1d5db"
              strokeWidth={1.5}
            />
            <text
              x={mx}
              y={my - 4}
              textAnchor="middle"
              className="text-[9px] fill-gray-400"
            >
              {edge.label}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <g
          key={node.id}
          className="cursor-pointer"
          onClick={() => onNodeClick(node.section)}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={24}
            fill={node.color}
            fillOpacity={0.15}
            stroke={node.color}
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y - 6}
            textAnchor="middle"
            className="text-[9px] font-bold"
            fill={node.color}
          >
            {node.type}
          </text>
          <text
            x={node.x}
            y={node.y + 8}
            textAnchor="middle"
            className="text-[8px] fill-gray-600"
            style={{ maxWidth: 60 }}
          >
            {(node.label || '').length > 12
              ? (node.label || '').slice(0, 12) + '...'
              : node.label || ''}
          </text>
        </g>
      ))}
    </svg>
  );
}
