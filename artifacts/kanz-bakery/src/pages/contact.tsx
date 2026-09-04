import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';

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

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Branch 1',
    lines: ['Street 2'],
  },
  {
    icon: Phone,
    label: 'Phone',
    lines: ['+9787665332', '+9712345678890'],
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['hello@kanzbakery.ae'],
  },
  {
    icon: Clock,
    label: 'Hours',
    lines: ['Kanz Bakery 2: Sunday', 'Kanz Bakery 1: Monday'],
  },
];

export default function Contact() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [activeBranch, setActiveBranch] = useState(1);
  const [sending, setSending] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const flyTo = (branch: Branch) => {
    setActiveBranch(branch.id);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([branch.lat, branch.lng], 14, { duration: 0.8 });
    const marker = markersRef.current[branch.id - 1];
    if (marker) marker.openPopup();
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
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
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:#D97706;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
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
              <div style="font-size:12px;color:#666;line-height:1.6;">
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
      setTimeout(() => markersRef.current[0]?.openPopup(), 400);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    setSending(true);
    // Simulate submission — replace with real email API when ready
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    toast({ title: 'Message sent!', description: "We'll get back to you within 24 hours." });
    setName(''); setEmail(''); setSubject(''); setMessage('');
  };

  return (
    <div className="min-h-screen grain-texture">
      <Navbar />

      {/* Hero */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Mail className="h-4 w-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, a special request, or just want to say hello? We'd love to hear from you.
            Our team responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact info row */}
      <section className="py-10 border-b border-border/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_INFO.map(({ icon: Icon, label, lines }) => (
              <div key={label} className="flex flex-col items-center text-center p-5 rounded-xl bg-card border border-card-border hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
                {lines.map((l, i) => (
                  <div key={i} className="text-sm font-medium leading-snug">{l}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map + branches */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-1">Our Branches</h2>
            <p className="text-muted-foreground text-sm">Click a branch card to zoom into its location on the map.</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 480 }}>
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
              <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </div>

            {/* Branch cards */}
            <div className="space-y-3">
              {BRANCHES.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => flyTo(branch)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    activeBranch === branch.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-semibold text-sm leading-snug">{branch.name}</h3>
                    {branch.tag && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-primary text-white text-[10px] font-medium rounded-full">
                        {branch.tag}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex gap-1.5 items-start">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{branch.hours}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="py-12 bg-card/40 border-t border-border/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Send Us a Message</h2>
            <p className="text-muted-foreground text-sm">For bulk order enquiries, catering questions, or general feedback.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-card-border p-6 md:p-8 shadow-sm space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Full Name <span className="text-destructive">*</span></Label>
                <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmad Al-Rashid" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmad@example.com" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-subject">Subject</Label>
              <Input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Bulk order enquiry, catering question…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-message">Message <span className="text-destructive">*</span></Label>
              <Textarea id="c-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Tell us what you need…" required />
            </div>
            <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="h-4 w-4" /> Send Message</>
              )}
            </Button>
          </form>
        </div>
      </section>

      <style>{`
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .leaflet-popup-tip { display: none; }
      `}</style>

      <Footer />
    </div>
  );
}
