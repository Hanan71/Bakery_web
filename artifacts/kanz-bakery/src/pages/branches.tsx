import { useEffect, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MapPin, Clock, Phone } from 'lucide-react';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  tag?: string;
}

const BRANCHES: Branch[] = [
  {
    id: 1,
    name: 'Kanz Bakery 2',
    address: 'Street 2',
    phone: '+9787665332',
    hours: 'Sunday',
    lat: 25.2048,
    lng: 55.2708,
    tag: 'Branch 1',
  },
  {
    id: 2,
    name: 'Kanz Bakery 1',
    address: 'Street 1',
    phone: '+9712345678890',
    hours: 'Monday',
    lat: 25.1720,
    lng: 55.2400,
  },
];

function BranchCard({ branch, onClick, active }: { branch: Branch; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
        active
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-serif font-semibold text-base leading-snug">{branch.name}</h3>
        {branch.tag && (
          <span className="flex-shrink-0 px-2 py-0.5 bg-primary text-white text-[10px] font-medium rounded-full">
            {branch.tag}
          </span>
        )}
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex gap-2">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <span>{branch.address}</span>
        </div>
        <div className="flex gap-2">
          <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <span>{branch.phone}</span>
        </div>
        <div className="flex gap-2">
          <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <span>{branch.hours}</span>
        </div>
      </div>
    </button>
  );
}

export default function Branches() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const activeBranchRef = useRef<number>(1);

  const flyTo = (branch: Branch) => {
    if (!mapInstanceRef.current) return;
    activeBranchRef.current = branch.id;
    mapInstanceRef.current.flyTo([branch.lat, branch.lng], 14, { duration: 0.8 });
    const marker = markersRef.current[branch.id - 1];
    if (marker) marker.openPopup();
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (keeps bundle cleaner, avoids SSR issues)
    import('leaflet').then((L) => {
      // Fix the broken default icon path issue in bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [25.1720, 55.2000],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:#D97706;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });

      BRANCHES.forEach((branch) => {
        const marker = L.marker([branch.lat, branch.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:180px;font-family:sans-serif;">
              <strong style="font-size:14px;display:block;margin-bottom:6px;">${branch.name}</strong>
              <div style="font-size:12px;color:#666;line-height:1.5;">
                <div>${branch.address}</div>
                <div style="margin-top:4px;">${branch.phone}</div>
                <div style="margin-top:4px;color:#888;">${branch.hours}</div>
              </div>
            </div>`,
            { maxWidth: 260 }
          );
        markersRef.current.push(marker);
      });

      mapInstanceRef.current = map;

      // Open first marker popup on load
      setTimeout(() => {
        markersRef.current[0]?.openPopup();
      }, 300);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      {/* Hero */}
      <section className="py-12 md:py-16 bg-background border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            2 Locations
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Find Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visit any of our branches to pick up a fresh order, or just stop by for a bite.
            Each bakery is open daily and staffed by our artisan team.
          </p>
        </div>
      </section>

      {/* Map + cards */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: '520px' }}>
              <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
              />
              <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </div>

            {/* Branch cards */}
            <div className="space-y-3 lg:sticky lg:top-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1 mb-4">
                Our Branches
              </p>
              {BRANCHES.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  active={activeBranchRef.current === branch.id}
                  onClick={() => flyTo(branch)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaflet CSS fix (inject globally) */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .leaflet-popup-tip { display: none; }
      `}</style>

      <Footer />
    </div>
  );
}
