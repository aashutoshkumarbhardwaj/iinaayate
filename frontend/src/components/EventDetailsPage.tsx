import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { eventsAPI, getAuthToken, authAPI } from '../utils/api';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
  onView?: (eventId: string) => void;
}

export function EventDetailsPage({ eventId, onBack, onView }: EventDetailsPageProps) {
  const [event, setEvent] = useState<any | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isGoing, setIsGoing] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // get me if logged in to check going status
        try {
          const me = await authAPI.me();
          const myId = me?.id || me?.user?.id || null;
          setMeId(myId);
        } catch {
          setMeId(null);
        }
        const data = await eventsAPI.getEvent(eventId);
        if (!mounted) return;
        setEvent(data);
        const res = await eventsAPI.listAttendees(eventId, { limit: 20, offset: 0 });
        if (!mounted) return;
        setAttendees(res.attendees || []);
        setTotalAttendees(typeof res.total === 'number' ? res.total : (data?.rsvpsCount ?? 0));
        setOffset((res.attendees || []).length);
        setHasMore(((res.attendees || []).length) < (res.total || 0));
        // detect if I'm going
        if ((meId)) {
          const amIGoing = (res.attendees || []).some((a: any) => a.id === (meId));
          setIsGoing(amIGoing);
        }
        // related events: fetch and pick by location or upcoming
        try {
          const { events: all } = await eventsAPI.getEvents();
          const rel = (all || [])
            .filter((e: any) => e.id !== data.id)
            .filter((e: any) => (e.location && data.location && e.location === data.location) || new Date(e.startsAt) >= new Date())
            .slice(0, 3);
          if (mounted) setRelated(rel);
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const loadMore = async () => {
    if (!hasMore) return;
    const res = await eventsAPI.listAttendees(eventId, { limit: 20, offset });
    setAttendees(prev => [...prev, ...(res.attendees || [])]);
    const newOffset = offset + (res.attendees?.length || 0);
    setOffset(newOffset);
    setHasMore(newOffset < (res.total || 0));
  };

  const handleRSVP = async () => {
    if (!getAuthToken()) {
      alert('Please log in to RSVP.');
      return;
    }
    setRsvping(true);
    try {
      const res = await eventsAPI.rsvp(eventId);
      setEvent((e: any) => ({ ...(e || {}), rsvpsCount: typeof res?.rsvpsCount === 'number' ? res.rsvpsCount : ((e?.rsvpsCount || 0) + 1) }));
      setIsGoing(true);
    } finally {
      setRsvping(false);
    }
  };

  const handleUnRSVP = async () => {
    if (!getAuthToken()) return;
    setRsvping(true);
    try {
      const res = await eventsAPI.unrsvp(eventId);
      setEvent((e: any) => ({ ...(e || {}), rsvpsCount: typeof res?.rsvpsCount === 'number' ? res.rsvpsCount : Math.max(0, (e?.rsvpsCount || 0) - 1) }));
      setIsGoing(false);
    } finally {
      setRsvping(false);
    }
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
          <div className="mt-6 text-gray-500">Loading event…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
      </div>

      {/* Poster */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-64 rounded-2xl overflow-hidden bg-gray-100">
          {event.poster ? (
            <img src={event.poster} alt={event.title} className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100"/>
          )}
        </div>
      </div>

      {/* Header and RSVP */}
      <div className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <p className="uppercase text-rose-600 text-xs tracking-wide mb-2">Open Mic</p>
          <h1 className="text-4xl font-serif text-gray-900 mb-3">{event.title}</h1>
          {event.subtitle && <p className="text-gray-600 mb-4">{event.subtitle}</p>}
          <div className="flex flex-wrap gap-4 text-gray-700 text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{new Date(event.startsAt).toLocaleString()}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/>{event.location}</span>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-rose-200 p-4">
            {isGoing ? (
              <Button className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300" onClick={handleUnRSVP} disabled={rsvping}>
                {rsvping ? 'Updating…' : 'Cancel RSVP'}
              </Button>
            ) : (
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={handleRSVP} disabled={rsvping}>
                {rsvping ? 'RSVP…' : 'RSVP Now'}
              </Button>
            )}
            <div className="flex items-center gap-2 text-gray-700 mt-3 text-sm">
              <Users className="w-4 h-4"/> <span>{(event.rsvpsCount ?? totalAttendees).toLocaleString()} people are going</span>
            </div>
            {attendees.length > 0 && (
              <div className="flex -space-x-2 mt-2">
                {attendees.slice(0, 5).map(a => (
                  <Avatar key={a.id} className="w-8 h-8 ring-2 ring-white">
                    <AvatarImage src={a.avatar || ''} alt={a.name}/>
                    <AvatarFallback>{(a.name || 'U')[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-xl text-gray-900 mb-3">About this Event</h3>
          <p className="text-gray-700 leading-relaxed">
            {/* Placeholder: using subtitle as description fallback */}
            {event.subtitle || 'Join our community poetry event to share, listen, and connect.'}
          </p>
        </div>
        <div className="md:col-span-1">
          <h3 className="text-xl text-gray-900 mb-3">Location</h3>
          <div className="rounded-xl border border-gray-200 p-4 text-gray-600 text-sm">
            {event.location}
            <p className="mt-2 text-gray-500">This is a virtual or physical event as specified above. Details may be shared after RSVP.</p>
          </div>
        </div>
      </div>

      {/* Related Events */}
      {related.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-10">
          <h3 className="text-xl text-gray-900 mb-4">Related Events</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {related.map((e) => (
              <button key={e.id} onClick={() => onView && onView(e.id)} className="text-left">
                <div className="rounded-2xl overflow-hidden mb-3 h-28 bg-gray-100">
                  {e.poster ? (
                    <img src={e.poster} alt={e.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100" />
                  )}
                </div>
                <div className="text-gray-900">{e.title}</div>
                <div className="text-xs text-gray-600">{new Date(e.startsAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Discussion placeholder */}
      <div className="max-w-5xl mx-auto px-4 mt-10 mb-16">
        <h3 className="text-xl text-gray-900 mb-3">Discussion</h3>
        <div className="rounded-2xl border border-gray-200 p-4 text-gray-500 text-sm">Comments for events can be added. I can wire a backend route /events/:id/comments if you want.</div>
      </div>
    </div>
  );
}
