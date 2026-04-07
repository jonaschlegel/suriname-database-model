'use client';

import { useEffect, useState } from 'react';

interface ThesaurusConcept {
  '@id': string;
  '@type': string | string[];
  prefLabel: string;
  definition?: string;
  broader?: string;
  narrower?: string | string[];
  topConceptOf?: string;
  inScheme?: string;
  hasTopConcept?: string | string[];
  'dcterms:description'?: string;
}

interface ThesaurusData {
  '@graph': ThesaurusConcept[];
}

export default function VocabularyPage() {
  const [data, setData] = useState<ThesaurusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/thesaurus.jsonld')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-stm-warm-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stm-sepia-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-stm-warm-500 text-sm">Loading thesaurus...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center bg-stm-warm-50">
        <p className="text-stm-warm-500">Failed to load thesaurus data.</p>
      </div>
    );
  }

  const graph = data['@graph'];
  const scheme = graph.find((n) => {
    const types = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
    return types.includes('ConceptScheme');
  });
  const concepts = graph.filter((n) => {
    const types = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
    return types.includes('Concept');
  });

  const topConcepts = concepts.filter((c) => c.topConceptOf);
  const selected = selectedConcept
    ? concepts.find((c) => c['@id'] === selectedConcept)
    : null;

  function getChildren(parentId: string): ThesaurusConcept[] {
    return concepts.filter((c) => c.broader === parentId);
  }

  function shortUri(uri: string): string {
    return uri.replace('https://data.suriname-timemachine.org/', 'stm:');
  }

  function crmType(concept: ThesaurusConcept): string | null {
    const types = Array.isArray(concept['@type'])
      ? concept['@type']
      : [concept['@type']];
    if (types.includes('E55_Type')) return 'E55 Type';
    return null;
  }

  return (
    <div className="h-full overflow-y-auto bg-stm-warm-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-stm-warm-900 mb-2">
            Vocabulary
          </h1>
          <p className="text-stm-warm-600 text-sm">
            SKOS thesaurus for controlled vocabulary terms used in the Suriname
            Time Machine. Concepts are dual-typed as both{' '}
            <code className="text-xs bg-stm-warm-100 px-1 py-0.5 rounded">
              skos:Concept
            </code>{' '}
            and{' '}
            <code className="text-xs bg-stm-warm-100 px-1 py-0.5 rounded">
              crm:E55_Type
            </code>{' '}
            for CIDOC-CRM compatibility.
          </p>
        </div>

        {/* Concept Scheme */}
        {scheme && (
          <div className="bg-white border border-stm-warm-200 rounded-lg p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-stm-sepia-100 text-stm-sepia-700 rounded">
                ConceptScheme
              </span>
              <h2 className="text-lg font-serif font-semibold text-stm-warm-900">
                {scheme.prefLabel}
              </h2>
            </div>
            {scheme['dcterms:description'] && (
              <p className="text-sm text-stm-warm-600 mb-3">
                {scheme['dcterms:description']}
              </p>
            )}
            <div className="text-xs text-stm-warm-400 font-mono break-all">
              {shortUri(scheme['@id'])}
            </div>
          </div>
        )}

        {/* Concept Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree panel */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-stm-warm-500 uppercase tracking-wider mb-3">
              Hierarchy
            </h3>
            <div className="bg-white border border-stm-warm-200 rounded-lg shadow-sm">
              {topConcepts.map((top) => (
                <div key={top['@id']}>
                  <button
                    type="button"
                    onClick={() => setSelectedConcept(top['@id'])}
                    className={`w-full text-left px-4 py-3 border-b border-stm-warm-100 hover:bg-stm-warm-50 transition-colors ${
                      selectedConcept === top['@id']
                        ? 'bg-stm-sepia-50 border-l-2 border-l-stm-sepia-500'
                        : ''
                    }`}
                  >
                    <span className="font-medium text-stm-warm-800 text-sm">
                      {top.prefLabel}
                    </span>
                  </button>
                  {getChildren(top['@id']).map((child) => (
                    <button
                      key={child['@id']}
                      type="button"
                      onClick={() => setSelectedConcept(child['@id'])}
                      className={`w-full text-left pl-8 pr-4 py-2 border-b border-stm-warm-100 hover:bg-stm-warm-50 transition-colors ${
                        selectedConcept === child['@id']
                          ? 'bg-stm-sepia-50 border-l-2 border-l-stm-sepia-500'
                          : ''
                      }`}
                    >
                      <span className="text-stm-warm-700 text-sm">
                        {child.prefLabel}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-stm-warm-500 uppercase tracking-wider mb-3">
              {selected ? 'Concept Details' : 'Select a concept'}
            </h3>
            {selected ? (
              <div className="bg-white border border-stm-warm-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-stm-sepia-100 text-stm-sepia-700 rounded">
                    Concept
                  </span>
                  {crmType(selected) && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                      {crmType(selected)}
                    </span>
                  )}
                  <h2 className="text-xl font-serif font-semibold text-stm-warm-900">
                    {selected.prefLabel}
                  </h2>
                </div>

                {selected.definition && (
                  <p className="text-sm text-stm-warm-600 mb-4">
                    {selected.definition}
                  </p>
                )}

                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-stm-warm-500 font-medium">URI</dt>
                    <dd className="text-stm-warm-700 font-mono text-xs break-all">
                      {selected['@id']}
                    </dd>
                  </div>

                  {selected.broader && (
                    <div>
                      <dt className="text-stm-warm-500 font-medium">Broader</dt>
                      <dd>
                        <button
                          type="button"
                          onClick={() => setSelectedConcept(selected.broader!)}
                          className="text-stm-sepia-600 hover:text-stm-sepia-800 underline text-xs font-mono"
                        >
                          {shortUri(selected.broader)}
                        </button>
                      </dd>
                    </div>
                  )}

                  {selected.narrower && (
                    <div>
                      <dt className="text-stm-warm-500 font-medium">
                        Narrower
                      </dt>
                      <dd className="space-y-1">
                        {(Array.isArray(selected.narrower)
                          ? selected.narrower
                          : [selected.narrower]
                        ).map((uri) => {
                          const child = concepts.find((c) => c['@id'] === uri);
                          return (
                            <button
                              key={uri}
                              type="button"
                              onClick={() => setSelectedConcept(uri)}
                              className="block text-stm-sepia-600 hover:text-stm-sepia-800 underline text-xs font-mono"
                            >
                              {child?.prefLabel ?? shortUri(uri)}
                            </button>
                          );
                        })}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-stm-warm-500 font-medium">In Scheme</dt>
                    <dd className="text-stm-warm-700 font-mono text-xs">
                      {shortUri(selected.inScheme ?? scheme?.['@id'] ?? '')}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-stm-warm-500 font-medium">Types</dt>
                    <dd className="flex gap-1 flex-wrap">
                      {(Array.isArray(selected['@type'])
                        ? selected['@type']
                        : [selected['@type']]
                      ).map((t) => (
                        <span
                          key={t}
                          className="inline-block px-2 py-0.5 text-xs bg-stm-warm-100 text-stm-warm-600 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="bg-white border border-stm-warm-200 rounded-lg p-8 shadow-sm text-center">
                <p className="text-stm-warm-400 text-sm">
                  Click a concept in the hierarchy to view its details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
