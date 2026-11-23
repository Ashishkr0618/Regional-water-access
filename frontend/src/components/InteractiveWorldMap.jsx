import React, { useState, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  MapPin,
  X,
  Droplets,
  Layers,
  Scale
} from 'lucide-react';
import worldGeo from '../data/world-countries.json';

// Country name normalization dictionary for 100% survey dataset matching
const COUNTRY_ALIASES = {
  'united states of america': 'united states',
  'usa': 'united states',
  'central african rep.': 'central african republic',
  'dem. rep. congo': 'democratic republic of congo',
  'congo, dem. rep.': 'democratic republic of congo',
  'dr congo': 'democratic republic of congo',
  'solomon is.': 'solomon islands',
  's. sudan': 'south sudan',
  'russian federation': 'russia',
  'korea, rep.': 'south korea',
  'united republic of tanzania': 'tanzania',
  'viet nam': 'vietnam',
  'lao pdr': 'laos',
  'cote d\'ivoire': 'ivory coast',
  'côte d\'ivoire': 'ivory coast',
  'eswatini': 'swaziland',
};

export const INDICATOR_CONFIGS = [
  {
    key: 'basic_water_access_pct',
    label: 'Basic Drinking Water Access',
    shortLabel: 'Basic Water Access',
    description: 'Population using drinking water from an improved source with collection time ≤ 30 minutes roundtrip.',
    isNegative: false,
    unit: '%',
  },
  {
    key: 'safely_managed_water_pct',
    label: 'Safely Managed Drinking Water',
    shortLabel: 'Safely Managed Water',
    description: 'Drinking water from an improved source located on premises, available when needed, and free from fecal contamination.',
    isNegative: false,
    unit: '%',
  },
  {
    key: 'rural_water_access_pct',
    label: 'Rural Water Access',
    shortLabel: 'Rural Water Access',
    description: 'Population with access to basic drinking water services residing in designated rural areas.',
    isNegative: false,
    unit: '%',
  },
  {
    key: 'urban_water_access_pct',
    label: 'Urban Water Access',
    shortLabel: 'Urban Water Access',
    description: 'Population with access to basic drinking water services residing in urban municipalities.',
    isNegative: false,
    unit: '%',
  },
  {
    key: 'sanitation_access_pct',
    label: 'Basic Sanitation Access',
    shortLabel: 'Sanitation Access',
    description: 'Population using improved sanitation facilities not shared with other households.',
    isNegative: false,
    unit: '%',
  },
  {
    key: 'hygiene_availability_pct',
    label: 'Basic Hygiene Availability',
    shortLabel: 'Hygiene Facilities',
    description: 'Population with a handwashing facility with soap and clean water on household premises.',
    isNegative: false,
    unit: '%',
  },
  {
    key: 'unimproved_water_pct',
    label: 'Unimproved Water Reliance',
    shortLabel: 'Unimproved Water',
    description: 'Population relying on unprotected dug wells or unprotected springs (Hazard indicator: lower is better).',
    isNegative: true,
    unit: '%',
  },
  {
    key: 'surface_water_pct',
    label: 'Direct Surface Water Reliance',
    shortLabel: 'Surface Water Reliance',
    description: 'Population drinking untreated water collected directly from rivers, lakes, or canals (Hazard indicator: lower is better).',
    isNegative: true,
    unit: '%',
  },
];

/**
 * Standard 5-tier color scale requested:
 * - 0–20%:   #D73027 (Red)
 * - 20–40%:  #FC8D59 (Orange)
 * - 40–60%:  #FEE08B (Yellow)
 * - 60–80%:  #91CF60 (Light Green)
 * - 80–100%: #1A9850 (Green)
 * - Missing: #E5E7EB (Light Grey)
 */
export function getPositiveColor(val) {
  if (val == null || isNaN(val)) return '#E5E7EB';
  const num = Number(val);
  if (num >= 80) return '#1A9850'; // Green
  if (num >= 60) return '#91CF60'; // Light Green
  if (num >= 40) return '#FEE08B'; // Yellow
  if (num >= 20) return '#FC8D59'; // Orange
  return '#D73027';                // Red
}

/**
 * For negative / hazard metrics (unimproved & surface water), lower values are better:
 */
export function getNegativeColor(val) {
  if (val == null || isNaN(val)) return '#E5E7EB';
  const num = Number(val);
  if (num <= 5) return '#1A9850';  // Green (minimal hazard)
  if (num <= 15) return '#91CF60'; // Light Green (low hazard)
  if (num <= 25) return '#FEE08B'; // Yellow (moderate hazard)
  if (num <= 35) return '#FC8D59'; // Orange (high hazard)
  return '#D73027';                // Red (critical hazard)
}

export function getIndicatorColor(val, isNegative) {
  return isNegative ? getNegativeColor(val) : getPositiveColor(val);
}

function InteractiveWorldMapComponent({
  records = [],
  activeIndicator = 'basic_water_access_pct',
  onSelectCountry,
  selectedCountry,
  onAddToComparison,
}) {
  const [position, setPosition] = useState({ coordinates: [10, 8], zoom: 1 });
  const [hoveredKey, setHoveredKey] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Active indicator configuration
  const currentIndicator = useMemo(() => {
    return (
      INDICATOR_CONFIGS.find((i) => i.key === activeIndicator) ||
      INDICATOR_CONFIGS[0]
    );
  }, [activeIndicator]);

  // Index dataset records by lowercase normalized name
  const countryDataMap = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      if (!r.country) return;
      const rawName = r.country.trim().toLowerCase();
      map.set(rawName, r);
    });
    return map;
  }, [records]);

  // Resolve matching record for TopoJSON geography feature
  const resolveCountryRecord = (geo) => {
    const geoName = geo.properties?.name || '';
    const lowerGeo = geoName.trim().toLowerCase();

    // 1. Direct match
    if (countryDataMap.has(lowerGeo)) {
      return countryDataMap.get(lowerGeo);
    }
    // 2. Alias match
    if (COUNTRY_ALIASES[lowerGeo] && countryDataMap.has(COUNTRY_ALIASES[lowerGeo])) {
      return countryDataMap.get(COUNTRY_ALIASES[lowerGeo]);
    }
    // 3. Substring match fallback (for compound official names)
    for (const [key, record] of countryDataMap.entries()) {
      if ((lowerGeo.length > 3 && key.includes(lowerGeo)) || (key.length > 3 && lowerGeo.includes(key))) {
        return record;
      }
    }
    return null;
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 0.8) }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [10, 8], zoom: 1 });
  };

  // Filtered search list for quick jump
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return records
      .filter((r) => r.country?.toLowerCase().includes(q) || r.region?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, records]);

  // Legend labels and colors based on indicator direction
  const legendBrackets = useMemo(() => {
    if (currentIndicator.isNegative) {
      return [
        { label: '0 – 5%', desc: 'Minimal', color: '#1A9850' },
        { label: '5 – 15%', desc: 'Low', color: '#91CF60' },
        { label: '15 – 25%', desc: 'Medium', color: '#FEE08B' },
        { label: '25 – 35%', desc: 'High', color: '#FC8D59' },
        { label: '> 35%', desc: 'Critical', color: '#D73027' },
        { label: 'No Data', desc: 'Missing', color: '#E5E7EB' },
      ];
    }
    return [
      { label: '80 – 100%', desc: 'High', color: '#1A9850' },
      { label: '60 – 80%', desc: 'Good', color: '#91CF60' },
      { label: '40 – 60%', desc: 'Moderate', color: '#FEE08B' },
      { label: '20 – 40%', desc: 'Low', color: '#FC8D59' },
      { label: '0 – 20%', desc: 'Critical', color: '#D73027' },
      { label: 'No Data', desc: 'Missing', color: '#E5E7EB' },
    ];
  }, [currentIndicator]);

  return (
    <div className="relative w-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Map Header Toolbar (Light Theme) */}
      <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 z-20">
        {/* Left: Active Indicator Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-bold text-sm tracking-wide">
                {currentIndicator.label}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                {currentIndicator.unit}
              </span>
              {currentIndicator.isNegative && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Hazard Metric
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xl">
              {currentIndicator.description}
            </p>
          </div>
        </div>

        {/* Right: Quick Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search country on map…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
              {searchResults.map((r) => {
                const val = r[activeIndicator];
                const color = getIndicatorColor(val, currentIndicator.isNegative);
                return (
                  <button
                    key={r.country}
                    onClick={() => {
                      onSelectCountry?.(r);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition border-b border-slate-100 last:border-b-0"
                  >
                    <div>
                      <span className="text-slate-900 font-semibold">{r.country}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({r.region})</span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        backgroundColor: `${color}25`,
                        color: color === '#FEE08B' ? '#92400E' : color,
                      }}
                    >
                      {val != null ? `${Number(val).toFixed(1)}%` : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map Canvas Container (Off-White Background) */}
      <div
        className="relative w-full h-[520px] sm:h-[620px] bg-[#f8fafc] overflow-hidden select-none cursor-grab active:cursor-grabbing border-b border-slate-200"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => {
          setHoveredKey(null);
          setTooltipData(null);
        }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 175, center: [10, 8] }}
          width={960}
          height={540}
          className="w-full h-full"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={setPosition}
            maxZoom={8}
            minZoom={0.8}
          >
            <Geographies geography={worldGeo}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => geo.properties?.name !== 'Antarctica')
                  .map((geo) => {
                    const countryRecord = resolveCountryRecord(geo);
                    const geoName = geo.properties?.name || 'Unknown';
                    const indicatorVal = countryRecord ? countryRecord[activeIndicator] : null;
                    const geoKey = geo.rsmKey || geo.id || geoName;

                    const isHovered = hoveredKey === geoKey;
                    const isSelected =
                      selectedCountry &&
                      countryRecord &&
                      selectedCountry.country?.toLowerCase() === countryRecord.country?.toLowerCase();

                    // Calculate fill color directly
                    const fillColor = countryRecord
                      ? getIndicatorColor(indicatorVal, currentIndicator.isNegative)
                      : '#E5E7EB'; // Light Grey for missing data

                    // Country border: default 0.7px white; on hover blue outline; on select deep blue
                    const strokeColor = isSelected
                      ? '#2563EB'
                      : isHovered
                      ? '#2563EB'
                      : '#FFFFFF';

                    const strokeWidth = isSelected ? 2.2 : isHovered ? 1.8 : 0.7;

                    return (
                      <Geography
                        key={geoKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        style={{
                          fill: fillColor,
                          stroke: strokeColor,
                          strokeWidth: strokeWidth,
                          outline: 'none',
                          cursor: countryRecord ? 'pointer' : 'default',
                          transition: 'stroke 120ms ease, stroke-width 120ms ease',
                        }}
                        onMouseEnter={() => {
                          setHoveredKey(geoKey);
                          setTooltipData({
                            name: countryRecord ? countryRecord.country : geoName,
                            region: countryRecord?.region || 'Not in JMP Survey',
                            value: indicatorVal,
                            cluster: countryRecord?.cluster,
                            clusterName: countryRecord?.cluster_name,
                            hasData: !!countryRecord,
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredKey(null);
                          setTooltipData(null);
                        }}
                        onClick={() => {
                          if (countryRecord) {
                            onSelectCountry?.(countryRecord);
                          }
                        }}
                      />
                    );
                  })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Floating Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20 bg-white/95 border border-slate-200 rounded-xl p-1 shadow-md backdrop-blur-sm">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Tooltip (Crisp Light Theme, Non-Clipping) */}
        {tooltipData && (
          <div
            className="absolute z-40 pointer-events-none bg-white/95 border border-slate-300 rounded-xl px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-all duration-75 text-xs text-slate-800 min-w-[210px]"
            style={{
              left: `${Math.min(Math.max(mousePos.x + 15, 12), 720)}px`,
              top: `${Math.min(Math.max(mousePos.y - 45, 12), 520)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                {tooltipData.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {tooltipData.region}
              </span>
            </div>

            {tooltipData.hasData ? (
              <>
                <div className="flex items-center justify-between gap-4 text-xs mt-1.5 py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">{currentIndicator.shortLabel}:</span>
                  <span
                    className="font-extrabold text-sm px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${getIndicatorColor(tooltipData.value, currentIndicator.isNegative)}25`,
                      color:
                        getIndicatorColor(tooltipData.value, currentIndicator.isNegative) === '#FEE08B'
                          ? '#92400E'
                          : getIndicatorColor(tooltipData.value, currentIndicator.isNegative),
                    }}
                  >
                    {tooltipData.value != null ? `${Number(tooltipData.value).toFixed(1)}%` : '—'}
                  </span>
                </div>
                {tooltipData.clusterName && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Profile Cluster:</span>
                    <span className="text-cyan-700 font-semibold">{tooltipData.clusterName}</span>
                  </div>
                )}
                <p className="text-[10px] text-cyan-600 font-medium mt-1 text-right">Click country to inspect full metrics →</p>
              </>
            ) : (
              <p className="text-[11px] text-slate-400 italic mt-1">
                No WHO/UNICEF Survey Data
              </p>
            )}
          </div>
        )}
      </div>

      {/* Map Footer & Visual Color Legend (0-20% Red to 80-100% Green) */}
      <div className="p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Dynamic Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-600" />
            Legend:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {legendBrackets.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-slate-300"
                  style={{ backgroundColor: b.color }}
                />
                <div className="flex flex-col">
                  <span className="text-slate-800 text-[11px] font-bold leading-tight">{b.label}</span>
                  <span className="text-slate-400 text-[9px] leading-tight">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Guidance Hint */}
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span>Click any country on the map to open full profile & comparison</span>
        </div>
      </div>
    </div>
  );
}

export default memo(InteractiveWorldMapComponent);
