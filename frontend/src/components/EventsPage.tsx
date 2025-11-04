import { ArrowLeft, Calendar, MapPin, Users, Clock, Mic2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { eventsAPI } from '../utils/api';
import { Input } from './ui/input';

interface EventsPageProps {
  onBack: () => void;
}

export function EventsPage({ onBack }: EventsPageProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', startsAt: '', location: '', poster: '' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await eventsAPI.getEvents();
        if (mounted) setEvents(res.events || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getEvents();
      setEvents(res.events || []);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-12">
          <h1 className="text-5xl text-gray-900 mb-3 text-center">
            Poetry events around you
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Find poetry events for live shows, performances, and poetry meetups. Connect
            with poets and enthusiasts in your community!
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (onlyUpcoming ? events.filter(e => new Date(e.startsAt).getTime() > Date.now()) : events).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No events yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(onlyUpcoming ? events.filter(e => new Date(e.startsAt).getTime() > Date.now()) : events).map((event) => (
              <button
                key={event.id}
                onClick={() => setSelected(event)}
                className="group text-left hover:scale-[1.02] transition-transform"
              >
                {/* Event Poster */}
                <div className={`relative rounded-2xl overflow-hidden h-80 mb-4 flex items-center justify-center p-6 bg-gray-900`}>
                  <div className="absolute inset-0 opacity-40">
                    {event.poster && (
                      <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="relative z-10 text-center text-white">
                    <h3 className="text-2xl mb-2" style={{ fontFamily: 'serif' }}>
                      {event.title}
                    </h3>
                    {event.subtitle && (
                      <p className="text-white/90 text-sm mb-4">{event.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Event Info */}
                <div className="space-y-1">
                  <h4 className="text-lg text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(event.startsAt).toLocaleDateString()} | {new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Details Panel */}
        {selected && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl text-gray-900 mb-1">{selected.title}</h3>
                {selected.subtitle && <p className="text-gray-600 mb-2">{selected.subtitle}</p>}
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selected.startsAt).toLocaleString()}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{selected.location}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </div>
            {selected.poster && (
              <div className="mt-4 rounded-xl overflow-hidden">
                <img src={selected.poster} alt={selected.title} className="w-full h-64 object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Upcoming / Host CTA */}
        <div className="mt-16 bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full translate-y-32 -translate-x-32" />
          
          <div className="relative z-10">
            <Mic2 className="w-16 h-16 mx-auto mb-6 text-purple-600" />
            <h3 className="text-3xl text-gray-900 mb-4">
              Don't Miss Upcoming Events
            </h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-lg">
              Stay updated with mushairas, poetry slams, and workshops happening near you. 
              Join our community of poetry lovers!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setOnlyUpcoming(true)}>
                View Upcoming Events
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => setCreating(true)}>
                Host Your Event
              </Button>
            </div>
          </div>
        </div>

        {/* Host Event Form */}
        {creating && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl text-gray-900">Host Your Event</h3>
              <Button variant="outline" onClick={() => setCreating(false)}>Close</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-gray-700">Subtitle (optional)</label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-gray-700">Starts At</label>
                <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-gray-700">Location</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-700">Poster URL (optional)</label>
                <Input value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-rose-500 hover:bg-rose-600 text-white"
                onClick={async () => {
                  if (!form.title || !form.startsAt || !form.location) return;
                  await eventsAPI.createEvent({
                    title: form.title,
                    subtitle: form.subtitle || undefined,
                    startsAt: new Date(form.startsAt).toISOString(),
                    location: form.location,
                    poster: form.poster || undefined,
                  });
                  setCreating(false);
                  setForm({ title: '', subtitle: '', startsAt: '', location: '', poster: '' });
                  await refresh();
                }}
                disabled={!form.title || !form.startsAt || !form.location}
              >
                Create Event
              </Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
