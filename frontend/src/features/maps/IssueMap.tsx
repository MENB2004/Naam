import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  AlertCircle,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MapFilterBar } from './MapFilterBar';
import { mapService } from '../../services/mapService';
import { MapPoint, MapFilters } from '../../types/map';

const KERALA_CENTER: [number, number] = [10.25, 76.3];
const KERALA_BOUNDS: [[number, number], [number, number]] = [
  [8.0, 74.5],
  [13.0, 77.8],
];

// Helper to generate dynamic colored SVG pin markers
function createCustomPin(severity: string, status: string) {
  let color = '#EA580C'; // Default orange

  if (status === 'RESOLVED') {
    color = '#10B981'; // Green
  } else if (severity === 'EMERGENCY') {
    color = '#DC2626'; // Bright Red
  } else if (severity === 'HIGH') {
    color = '#EA580C'; // Amber-Red
  } else if (severity === 'MEDIUM') {
    color = '#D97706'; // Amber
  } else if (severity === 'LOW') {
    color = '#059669'; // Emerald
  }

  const isEmergency = severity === 'EMERGENCY' && status !== 'RESOLVED';

  const svgHtml = `
    <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        isEmergency
          ? `<span style="position: absolute; top: 2px; width: 32px; height: 32px; border-radius: 50%; background: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
          : ''
      }
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 14.5 40.5 16.1 41.8C16.6 42.1 17.4 42.1 17.9 41.8C19.5 40.5 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
        <circle cx="17" cy="17" r="8" fill="white"/>
        <circle cx="17" cy="17" r="4.5" fill="${color}"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-pin',
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

function FlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 14, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

export const IssueMap: React.FC = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [filters, setFilters] = useState<MapFilters>({
    category: 'ALL',
    status: 'ACTIVE',
    district: 'ALL',
    search: '',
  });

  const fetchPoints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mapService.getClusters({
        category: filters.category,
        status: filters.status,
        district: filters.district,
        limit: 400,
      });
      setPoints(data.points || []);
    } catch (err: any) {
      console.error('Failed to load map data:', err);
      setError('മാപ്പ് വിവരങ്ങൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.category, filters.status, filters.district]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const filteredPoints = useMemo(() => {
    if (!filters.search.trim()) return points;
    const s = filters.search.toLowerCase().trim();
    return points.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.tracking_code.toLowerCase().includes(s) ||
        p.lsgd_name.toLowerCase().includes(s) ||
        p.district.toLowerCase().includes(s)
    );
  }, [points, filters.search]);

  // Handle Geolocation to find issues near citizen
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('ഈ ബ്രൗസറിൽ GPS സൗകര്യം ലഭ്യമല്ല.');
      return;
    }

    setLocationStatus('താങ്കളുടെ ലൊക്കേഷൻ കണ്ടെത്തുന്നു...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (
          latitude < KERALA_BOUNDS[0][0] ||
          latitude > KERALA_BOUNDS[1][0] ||
          longitude < KERALA_BOUNDS[0][1] ||
          longitude > KERALA_BOUNDS[1][1]
        ) {
          setLocationStatus('താങ്കളുടെ നിലവിലെ ലൊക്കേഷൻ കേരളത്തിന് പുറത്താണ്.');
          return;
        }

        setFlyTarget([latitude, longitude]);
        setLocationStatus('സമീപത്തെ പരാതികൾ ലഭ്യമാക്കുന്നു...');

        try {
          const nearby = await mapService.getNearby(latitude, longitude, 15);
          if (nearby.length > 0) {
            setPoints(nearby);
            setLocationStatus(`${nearby.length} പരാതികൾ കണ്ടെത്തി.`);
          } else {
            setLocationStatus('സമീപത്ത് പരാതികൾ ഒന്നും റിപ്പോർട്ട് ചെയ്തിട്ടില്ല.');
          }
        } catch {
          setLocationStatus('സമീപത്തെ പരാതികൾ കണ്ടെത്താൻ കഴിഞ്ഞില്ല.');
        }

        setTimeout(() => setLocationStatus(null), 4000);
      },
      () => {
        setLocationStatus('ലൊക്കേഷൻ അനുമതി നൽകിയിട്ടില്ല.');
        setTimeout(() => setLocationStatus(null), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 z-20 px-4 sm:px-6 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <Logo height={38} />
          </Link>
          <div className="border-l border-slate-200 pl-3 hidden sm:block">
            <span className="font-bold text-sm text-slate-900 tracking-tight block">
              ലൈവ് പരിസ്ഥിതി മാപ്പ് (Live Environmental Map)
            </span>
            <span className="text-[10px] text-slate-500 block">
              കേരളത്തിലെ പരിസ്ഥിതി പരാതികളുടെ സമഗ്ര ജിയോ-മാപ്പിംഗ്
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            className="text-xs text-slate-700 hover:text-emerald-700 border-slate-300"
          >
            <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span className="hidden sm:inline">എന്റെ അടുത്ത് (Near Me)</span>
            <span className="sm:hidden">GPS</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterBar(!showFilterBar)}
            className="text-xs text-slate-700 border-slate-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">ഫിൽട്ടറുകൾ</span>
            {showFilterBar ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>

          <Link to="/community/report">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">പരാതി സമർപ്പിക്കുക</span>
              <span className="sm:hidden">റിപ്പോർട്ട്</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Map Content Area */}
      <div className="relative flex-1 w-full h-full">
        {/* Floating Filter Bar */}
        {showFilterBar && (
          <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-3xl z-[1000]">
            <MapFilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({
                  category: 'ALL',
                  status: 'ACTIVE',
                  district: 'ALL',
                  search: '',
                })
              }
              totalPoints={filteredPoints.length}
              isLoading={isLoading}
              onRefresh={fetchPoints}
            />
          </div>
        )}

        {/* Floating Toast Notification */}
        {locationStatus && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 backdrop-blur-sm animate-fade-in">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>{locationStatus}</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/90 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 backdrop-blur-sm">
            <AlertCircle className="w-3.5 h-3.5 text-white" />
            <span>{error}</span>
          </div>
        )}

        {/* Map Container */}
        <MapContainer
          center={KERALA_CENTER}
          zoom={8}
          minZoom={7}
          maxZoom={18}
          maxBounds={KERALA_BOUNDS}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyToController target={flyTarget} />

          {/* Render markers */}
          {filteredPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={createCustomPin(point.severity, point.current_status)}
            >
              <Popup className="naam-popup" maxWidth={320} minWidth={260}>
                <div className="p-1 space-y-2">
                  {/* Thumbnail if present */}
                  {point.thumbnail_url && (
                    <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={point.thumbnail_url}
                        alt={point.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Header badges */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {point.tracking_code}
                    </span>
                    <StatusBadge status={point.current_status as any} size="sm" />
                  </div>

                  {/* Title in Malayalam */}
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{point.title}</h4>

                  {/* Category and Location meta */}
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-emerald-800">വിഭാഗം:</span>
                      <span>{point.category_display_ml}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-slate-700">തദ്ദേശ സ്ഥാപനം:</span>
                      <span>{point.lsgd_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-slate-700">ജില്ല:</span>
                      <span>{point.district}</span>
                      {point.ward_number && <span>(വാർഡ് {point.ward_number})</span>}
                    </div>
                    {point.distance_km !== undefined && point.distance_km !== null && (
                      <div className="text-[10px] font-bold text-blue-700">
                        ദൂരം: {point.distance_km} കി.മീ (km)
                      </div>
                    )}
                  </div>

                  {/* Severity indicator */}
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-500">
                      തീവ്രത:{' '}
                      <span
                        className={
                          point.severity === 'EMERGENCY'
                            ? 'text-red-600 font-bold'
                            : point.severity === 'HIGH'
                            ? 'text-orange-600 font-bold'
                            : 'text-slate-700'
                        }
                      >
                        {point.severity}
                      </span>
                    </span>

                    <button
                      onClick={() => navigate(`/track/${point.tracking_code}`)}
                      className="inline-flex items-center text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      വിശദാംശങ്ങൾ <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200 shadow-md text-[10px] space-y-1 text-slate-700 hidden sm:block">
          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">തീവ്രതാ സൂചിക (Legend)</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
            <span>അടിയന്തിരം (Emergency)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>ഉയർന്നത് (High)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>സാധാരണം (Medium)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>പരിഹരിച്ചത് (Resolved)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
