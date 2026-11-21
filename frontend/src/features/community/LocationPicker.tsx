import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Fix leaflet default marker icon issue with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const KERALA_DISTRICTS = [
  { en: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം', lat: 8.5241, lng: 76.9366 },
  { en: 'Kollam', ml: 'കൊല്ലം', lat: 8.8932, lng: 76.6141 },
  { en: 'Pathanamthitta', ml: 'പത്തനംതിട്ട', lat: 9.2648, lng: 76.7870 },
  { en: 'Alappuzha', ml: 'ആലപ്പുഴ', lat: 9.4981, lng: 76.3388 },
  { en: 'Kottayam', ml: 'കോട്ടയം', lat: 9.5916, lng: 76.5222 },
  { en: 'Idukki', ml: 'ഇടുക്കി', lat: 9.8500, lng: 76.9700 },
  { en: 'Ernakulam', ml: 'എറണാകുളം', lat: 9.9816, lng: 76.2999 },
  { en: 'Thrissur', ml: 'തൃശ്ശൂർ', lat: 10.5276, lng: 76.2144 },
  { en: 'Palakkad', ml: 'പാലക്കാട്', lat: 10.7867, lng: 76.6548 },
  { en: 'Malappuram', ml: 'മലപ്പുറം', lat: 11.0510, lng: 76.0711 },
  { en: 'Kozhikode', ml: 'കോഴിക്കോട്', lat: 11.2588, lng: 75.7804 },
  { en: 'Wayanad', ml: 'വയനാട്', lat: 11.6854, lng: 76.1320 },
  { en: 'Kannur', ml: 'കണ്ണൂർ', lat: 11.8745, lng: 75.3704 },
  { en: 'Kasaragod', ml: 'കാസർഗോഡ്', lat: 12.5102, lng: 74.9852 },
];

const KERALA_BOUNDS = {
  minLat: 8.0,
  maxLat: 13.0,
  minLng: 74.5,
  maxLng: 77.8,
};

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  onDistrictSelect?: (districtEn: string) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  onDistrictSelect,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const isInsideKerala =
    latitude >= KERALA_BOUNDS.minLat &&
    latitude <= KERALA_BOUNDS.maxLat &&
    longitude >= KERALA_BOUNDS.minLng &&
    longitude <= KERALA_BOUNDS.maxLng;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('നിങ്ങളുടെ ബ്രൗസറിൽ ലൊക്കേഷൻ സേവനം ലഭ്യമല്ല (Geolocation not supported).');
      return;
    }

    setGpsLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsLoading(false);

        if (
          lat < KERALA_BOUNDS.minLat ||
          lat > KERALA_BOUNDS.maxLat ||
          lng < KERALA_BOUNDS.minLng ||
          lng > KERALA_BOUNDS.maxLng
        ) {
          setGeoError('നിങ്ങളുടെ നിലവിലെ സ്ഥലം കേരളത്തിന് പുറത്താണ്. മാപ്പിൽ ക്ലിക്ക് ചെയ്ത് കേരളത്തിനകത്തുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക.');
          return;
        }

        onChange(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        setGeoError(`ലൊക്കേഷൻ കണ്ടെത്താനായില്ല (${err.message}). ദയവായി മാപ്പിൽ നേരിട്ട് ക്ലിക്ക് ചെയ്യുക.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectDistrictPreset = (d: typeof KERALA_DISTRICTS[0]) => {
    onChange(d.lat, d.lng);
    if (onDistrictSelect) {
      onDistrictSelect(d.en);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs text-slate-700 font-semibold">
          <MapPin className="w-4 h-4 text-[#087C63]" />
          <span>മാപ്പിൽ കൃത്യമായ സ്ഥലം ക്ലിക്ക് ചെയ്ത് അടയാളപ്പെടുത്തുക</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={gpsLoading}
          className="text-xs text-[#087C63] border-[#087C63]/30 hover:bg-[#E8F5EE]"
        >
          <Navigation className={`w-3.5 h-3.5 mr-1.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'തിരയുന്നു...' : 'എന്റെ GPS ലൊക്കേഷൻ എടുക്കുക'}
        </Button>
      </div>

      {geoError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {!isInsideKerala && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>തിരഞ്ഞെടുത്ത സ്ഥലം കേരളത്തിന്റെ പരിധിക്ക് പുറത്താണ്. ദയവായി കേരളത്തിനകത്തുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക.</span>
        </div>
      )}

      {/* Map Container */}
      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={[latitude, longitude]}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={defaultIcon} />
          <MapClickHandler onSelect={onChange} />
          <MapUpdater center={[latitude, longitude]} />
        </MapContainer>
      </div>

      {/* Coordinates readout and quick district picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-3 text-slate-600 font-mono text-[11px]">
          <span>അക്ഷാംശം (Lat): <strong>{latitude.toFixed(5)}</strong></span>
          <span>രേഖാംശം (Lon): <strong>{longitude.toFixed(5)}</strong></span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <span className="text-slate-500 text-[11px] flex-shrink-0">പെട്ടെന്നുള്ള ലൊക്കേഷൻ:</span>
          {KERALA_DISTRICTS.slice(0, 5).map((d) => (
            <button
              key={d.en}
              type="button"
              onClick={() => handleSelectDistrictPreset(d)}
              className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 hover:border-[#087C63] hover:text-[#087C63] text-slate-700 whitespace-nowrap transition"
            >
              {d.ml}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
