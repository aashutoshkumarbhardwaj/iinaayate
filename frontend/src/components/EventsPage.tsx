import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Mic2, Sparkles, Ticket, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authAPI, eventsAPI, getAuthToken } from '../utils/api';

interface EventsPageProps {
  onBack: () => void;
  onView?: (eventId: string) => void;
}

function safeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function initials(name?: string) {
  const parts = (name || 'U').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

function formatDate(date?: Date | null) {
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date?: Date | null) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function EventsPage({ onBack, onView }: EventsPageProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<any[]>([]);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [isGoing, setIsGoing] = useState(false);
  const [rsvping, setRsvping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', startsAt: '', location: '', poster: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    return () => {
      mounted = false;
    };
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

  const now = Date.now();
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const at = safeDate(a.startsAt)?.getTime() || 0;
      const bt = safeDate(b.startsAt)?.getTime() || 0;
      return at - bt;
    });
  }, [events]);
  const upcomingEvents = useMemo(
    () => sortedEvents.filter((event) => (safeDate(event.startsAt)?.getTime() || 0) >= now),
    [sortedEvents, now]
  );
  const visibleEvents = onlyUpcoming ? upcomingEvents : sortedEvents;
  const featuredEvent = upcomingEvents[0] || sortedEvents[0];
  const secondEvent = upcomingEvents[1] || sortedEvents[1] || featuredEvent;
  const bentoEvents = [upcomingEvents[0], upcomingEvents[1], upcomingEvents[2], upcomingEvents[3]];

  const totalRsvps = useMemo(
    () => events.reduce((sum, event) => sum + (event.rsvpsCount || 0), 0),
    [events]
  );
  const uniqueLocations = useMemo(
    () => new Set(events.map((event) => event.location).filter(Boolean)).size,
    [events]
  );

  const openEvent = async (event: any) => {
    if (onView) {
      onView(event.id);
      return;
    }

    setError(null);
    setSuccess(null);
    setSelectedEvent(event);
    setSelectedAttendees([]);
    setIsGoing(false);
    setSelectedLoading(true);

    try {
      const [detail, attendeeRes] = await Promise.all([
        eventsAPI.getEvent(event.id),
        eventsAPI.listAttendees(event.id, { limit: 12, offset: 0 }),
      ]);
      setSelectedEvent(detail);
      setSelectedAttendees(attendeeRes.attendees || []);

      try {
        const me = await authAPI.me();
        const meId = me?.id || me?.user?.id || null;
        setIsGoing(Boolean(meId && (attendeeRes.attendees || []).some((attendee: any) => attendee.id === meId)));
      } catch {
        setIsGoing(false);
      }
    } catch {
      setError('Could not load that event right now.');
    } finally {
      setSelectedLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!selectedEvent) return;
    if (!getAuthToken()) {
      setError('Please log in to RSVP.');
      return;
    }
    setRsvping(true);
    try {
      if (isGoing) {
        const res = await eventsAPI.unrsvp(selectedEvent.id);
        setSelectedEvent((prev: any) => ({ ...(prev || {}), rsvpsCount: typeof res?.rsvpsCount === 'number' ? res.rsvpsCount : Math.max(0, (prev?.rsvpsCount || 0) - 1) }));
        setIsGoing(false);
      } else {
        const res = await eventsAPI.rsvp(selectedEvent.id);
        setSelectedEvent((prev: any) => ({ ...(prev || {}), rsvpsCount: typeof res?.rsvpsCount === 'number' ? res.rsvpsCount : (prev?.rsvpsCount || 0) + 1 }));
        setIsGoing(true);
      }
      await refresh();
    } finally {
      setRsvping(false);
    }
  };

  const createEvent = async () => {
    setError(null);
    setSuccess(null);
    if (!form.title || !form.startsAt || !form.location) return;
    if (!getAuthToken()) {
      setError('Please log in to submit an event.');
      return;
    }
    try {
      await eventsAPI.createEvent({
        title: form.title,
        subtitle: form.subtitle || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        location: form.location,
        poster: form.poster || undefined,
      });
      setShowForm(false);
      setForm({ title: '', subtitle: '', startsAt: '', location: '', poster: '' });
      setSuccess('Event created successfully.');
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create event');
    }
  };

  const loadingState = loading && events.length === 0;
  const featuredDate = safeDate(featuredEvent?.startsAt);
  const secondDate = safeDate(secondEvent?.startsAt);

  return (
    <div className="min-h-screen bg-app text-[#1c1c18]">
      <Helmet>
        <title>Events & Gatherings – iinaayate</title>
        <meta name="description" content="Discover mushairas, poetry slams, and workshops on iinaayate." />
        <link rel="canonical" href="/events" />
      </Helmet>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[-8%] h-80 w-80 rounded-full bg-[#f4a261]/14 blur-3xl" />
          <div className="absolute right-[-8%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-[#1a2e44]/8 blur-3xl" />
          <div className="absolute bottom-[14%] left-[14%] h-96 w-96 rounded-full bg-[#e66f87]/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={onBack} className="-ml-2 rounded-full px-3 text-[#1A2E44] hover:bg-white/70">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => {
                setError(null);
                setSuccess(null);
                if (!getAuthToken()) {
                  setError('Please log in to submit an event.');
                  return;
                }
                setShowForm((s) => !s);
              }}
              className="rounded-full bg-[#1A2E44] text-white hover:bg-[#132235]"
            >
              Submit an Event
            </Button>
          </div>

          {(error || success) && (
            <div className="mb-6 space-y-2">
              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            </div>
          )}

          <header className="relative flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#8e4e14] shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              The Cultural Sanctuary
            </div>
            <h1 className="font-serif text-5xl text-[#1a2e44] md:text-6xl lg:text-[5rem]">
              महफ़िल
            </h1>
            <p className="mt-2 font-serif text-2xl italic text-[#8e4e14] md:text-[2.5rem]">
              The Gathering
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5f6b78] md:text-base md:leading-8">
              “जहाँ शब्द आत्मा से मिलते हैं, वहाँ कविता जन्म लेती है।” A curated sequence of literary evenings, where the ink of tradition meets the rhythm of today.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#1a2e44] shadow-sm">
                {events.length.toLocaleString()} events
              </div>
              <div className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#1a2e44] shadow-sm">
                {upcomingEvents.length.toLocaleString()} upcoming
              </div>
              <button
                type="button"
                onClick={() => setOnlyUpcoming((v) => !v)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] shadow-sm transition-colors ${
                  onlyUpcoming ? 'border-[#8e4e14] bg-[#8e4e14] text-white' : 'border-[#eadfce] bg-white/80 text-[#1a2e44]'
                }`}
              >
                {onlyUpcoming ? 'Showing upcoming' : 'Show upcoming'}
              </button>
            </div>
          </header>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
            <div className="relative overflow-hidden rounded-[32px] border border-[#eadfce] bg-white shadow-[0_20px_50px_rgba(26,46,68,0.08)]">
              <div className="relative h-full min-h-[320px] md:min-h-[440px]">
                {featuredEvent?.poster ? (
                  <img src={featuredEvent.poster} alt={featuredEvent.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#e9e0cf] via-[#fbfaf7] to-[#d9d7cf]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e44]/60 via-[#1a2e44]/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur-sm">
                      Featured Event
                    </span>
                    {featuredDate && (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur-sm">
                        {formatDate(featuredDate)}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-white md:text-5xl">
                    {featuredEvent?.title || 'No events yet'}
                  </h2>
                  {featuredEvent?.subtitle && (
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 md:text-base">
                      {featuredEvent.subtitle}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/85">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {featuredEvent?.location || 'Location TBA'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {featuredEvent?.rsvpsCount ?? 0} RSVPs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#eadfce] bg-white/82 p-6 shadow-[0_16px_36px_rgba(26,46,68,0.07)] backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Featured Gathering</p>
                <h3 className="mt-3 font-serif text-[2.15rem] leading-tight text-[#1a2e44]">
                  {featuredEvent?.title || 'Events will appear here as soon as they are published.'}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#5f6b78]">
                  An intimate evening of voices, rhythm, and community. Reserve your place for the next gathering and step into the archive of living poetry.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="rounded-full bg-[#1A2E44] text-white hover:bg-[#132235]"
                    onClick={() => featuredEvent && openEvent(featuredEvent)}
                    disabled={!featuredEvent}
                  >
                    Reserve a Seat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <span className="inline-flex items-center rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8e4e14]">
                    {totalRsvps.toLocaleString()} total RSVPs
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] bg-[#171717] text-white shadow-[0_18px_42px_rgba(26,46,68,0.18)]">
                <div className="grid gap-4 p-6 md:grid-cols-[0.95fr_1.05fr] md:items-center">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#f6b57c]">Modern Anthology</p>
                    <h3 className="font-serif text-[2rem] leading-tight md:text-[2.5rem]">
                      कलम और काग़ज़
                      <span className="mt-2 block text-[#f6b57c] italic">The Digital Scroll</span>
                    </h3>
                    <p className="max-w-md text-sm leading-7 text-white/72">
                      A multi-sensory exhibition where calligraphy meets code, and the evening becomes a living archive of voices.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOnlyUpcoming(true)}
                      className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#f6b57c]"
                    >
                      Explore the archive
                      <span className="h-px w-8 bg-[#f6b57c]/60" />
                    </button>
                  </div>
                  <div className="relative grid grid-cols-2 gap-3">
                    <div className="aspect-[3/4] overflow-hidden rounded-[18px] bg-white/5">
                      {featuredEvent?.poster ? (
                        <img src={featuredEvent.poster} alt={featuredEvent.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/5" />
                      )}
                    </div>
                    <div className="aspect-[3/4] overflow-hidden rounded-[18px] bg-white/5">
                      {secondEvent?.poster ? (
                        <img src={secondEvent.poster} alt={secondEvent.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#f6b57c]/40 to-white/5" />
                      )}
                    </div>
                    <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a2e44] text-[#f6b57c] shadow-lg">
                      <Mic2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-4xl text-[#1a2e44] md:text-5xl">आगामी कार्यक्रम</h2>
                <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Calendar of Resonances</p>
              </div>
              <div className="hidden gap-3 md:flex">
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#1a2e44] shadow-sm transition-colors hover:bg-[#faf7f2]">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#1a2e44] shadow-sm transition-colors hover:bg-[#faf7f2]">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadingState ? (
              <div className="rounded-[28px] border border-[#eadfce] bg-white/85 p-10 text-center text-[#6b7580] shadow-sm">
                Loading…
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="rounded-[28px] border border-[#eadfce] bg-white/85 p-10 text-center shadow-sm">
                <Calendar className="mx-auto h-12 w-12 text-[#d2a57e]" />
                <h3 className="mt-4 font-serif text-2xl text-[#1a2e44]">No Upcoming Events</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5f6b78]">
                  There are currently no events scheduled. Check back soon or host your own poetry gathering.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:h-[800px]">
                <button
                  type="button"
                  onClick={() => openEvent(bentoEvents[0])}
                  className="group relative overflow-hidden rounded-[28px] border border-[#eadfce] bg-[#f3eee6] p-5 text-left shadow-[0_16px_38px_rgba(26,46,68,0.08)] md:col-span-2 md:row-span-2 md:p-6"
                >
                  {bentoEvents[0]?.poster ? (
                    <img src={bentoEvents[0].poster} alt={bentoEvents[0].title} className="absolute inset-0 h-full w-full object-cover opacity-18 transition-opacity group-hover:opacity-25" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end">
                    <Badge className="mb-4 w-fit bg-[#8e4e14] text-white">
                      Premium Feature
                    </Badge>
                    <h3 className="font-serif text-3xl leading-tight text-[#1a2e44] md:text-4xl">
                      {bentoEvents[0]?.title || 'Annual Mushaira'}
                    </h3>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#5f6b78]">
                      {bentoEvents[0]?.subtitle || 'The flagship gathering of the year, curated with the quiet confidence of a literary evening.'}
                    </p>
                    <div className="mt-6 flex items-center gap-4 text-sm text-[#1a2e44]">
                      <span className="text-2xl font-serif">{featuredDate ? featuredDate.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase() : 'DATE'}</span>
                      <span className="h-6 w-px bg-[#d8cbb6]" />
                      <span className="uppercase tracking-[0.3em] text-[#8e4e14]">{bentoEvents[0]?.location || 'Venue'}</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openEvent(bentoEvents[1])}
                  className="group flex items-center gap-5 rounded-[28px] border border-[#eadfce] bg-white/85 p-5 text-left shadow-[0_14px_32px_rgba(26,46,68,0.06)] md:col-span-2 md:p-6"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f3eee6] md:h-28 md:w-28">
                    {bentoEvents[1]?.poster ? (
                      <img src={bentoEvents[1].poster} alt={bentoEvents[1].title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f3e5ce] to-[#d9d7cf] text-[#8e4e14]">
                        <Ticket className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Workshop</p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight text-[#1a2e44]">
                      {bentoEvents[1]?.title || 'Poetry Workshop'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f6b78]">
                      {bentoEvents[1]?.subtitle || 'A weekend with the city’s most attentive listeners and performers.'}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#8e4e14]">
                      Limited seats available
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openEvent(bentoEvents[2])}
                  className="group flex flex-col justify-between rounded-[28px] border border-[#eadfce] bg-[#081b39] p-5 text-white shadow-[0_14px_32px_rgba(26,46,68,0.14)]"
                >
                  <Mic2 className="h-8 w-8 text-[#f6b57c]" />
                  <div>
                    <h3 className="font-serif text-2xl leading-tight">
                      {bentoEvents[2]?.title || 'Open Mic Night'}
                    </h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/60">
                      {bentoEvents[2]?.subtitle || 'For the emerging voices of the nib.'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openEvent(bentoEvents[3])}
                  className="group flex flex-col justify-between rounded-[28px] border border-[#eadfce] bg-[#f6f1e8] p-5 shadow-[0_14px_32px_rgba(26,46,68,0.06)]"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Upcoming tour</p>
                    <h3 className="mt-3 font-serif text-[1.8rem] text-[#1a2e44]">
                      {bentoEvents[3]?.location || 'City tour'}
                    </h3>
                  </div>
                  <div className="text-sm italic text-[#5f6b78]">
                    {secondDate ? formatDate(secondDate) : 'Soon'}
                  </div>
                </button>
              </div>
            )}
          </section>

          <section className="mt-12 rounded-[28px] border-y border-[#eadfce] bg-[#fbf7f1] px-6 py-14 text-center md:px-10">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Quote</p>
            <blockquote className="mx-auto mt-5 max-w-4xl font-serif text-3xl italic leading-tight text-[#1a2e44] md:text-5xl">
              “सितारों से आगे जहाँ और भी हैं, अभी इश्क़ के इम्तिहाँ और भी हैं।”
            </blockquote>
            <div className="mx-auto mt-5 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-[#d8cbb6]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#8e4e14]">अल्लामा इक़बाल</span>
              <div className="h-px w-12 bg-[#d8cbb6]" />
            </div>
          </section>

          {selectedEvent && !onView && (
            <section className="mt-12 rounded-[30px] border border-[#eadfce] bg-white/88 p-5 shadow-[0_16px_36px_rgba(26,46,68,0.06)] backdrop-blur-sm md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Selected event</p>
                  <h3 className="mt-2 font-serif text-3xl text-[#1a2e44]">{selectedEvent.title}</h3>
                  {selectedEvent.subtitle && <p className="mt-2 text-sm text-[#5f6b78]">{selectedEvent.subtitle}</p>}
                </div>
                <Button variant="outline" onClick={() => setSelectedEvent(null)} className="rounded-full border-[#eadfce] bg-white/80">
                  Close
                </Button>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="overflow-hidden rounded-[24px] bg-[#f3eee6]">
                  {selectedEvent.poster ? (
                    <img src={selectedEvent.poster} alt={selectedEvent.title} className="h-72 w-full object-cover" />
                  ) : (
                    <div className="flex h-72 items-center justify-center bg-gradient-to-br from-[#e9e0cf] to-[#d9d7cf] text-[#8e4e14]">
                      <Calendar className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-[#5f6b78]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#faf7f2] px-3 py-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(safeDate(selectedEvent.startsAt))}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#faf7f2] px-3 py-2">
                      <Clock className="h-4 w-4" />
                      {formatTime(safeDate(selectedEvent.startsAt))}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#faf7f2] px-3 py-2">
                      <MapPin className="h-4 w-4" />
                      {selectedEvent.location}
                    </span>
                  </div>
                  <Button
                    className={`rounded-full ${isGoing ? 'bg-[#1a2e44] text-white hover:bg-[#132235]' : 'bg-[#8e4e14] text-white hover:bg-[#783d01]'}`}
                    onClick={handleRSVP}
                    disabled={rsvping || selectedLoading}
                  >
                    {rsvping ? 'Updating…' : isGoing ? 'Cancel RSVP' : 'Reserve a Seat'}
                  </Button>
                  <div className="rounded-[24px] border border-[#eadfce] bg-[#fbfaf7] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#8e4e14]" />
                      <h4 className="text-sm uppercase tracking-[0.28em] text-[#8e4e14]">Attendees</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedAttendees.length > 0 ? (
                        selectedAttendees.map((attendee) => (
                          <div key={attendee.id} className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-3 py-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={attendee.avatar || ''} alt={attendee.name} />
                              <AvatarFallback>{initials(attendee.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-[#1a2e44]">{attendee.name}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-[#6b7580]">No attendees loaded yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {showForm && (
            <section className="mt-12 rounded-[30px] border border-[#eadfce] bg-white/88 p-5 shadow-[0_16px_36px_rgba(26,46,68,0.06)] backdrop-blur-sm md:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Host an event</p>
                  <h3 className="mt-2 font-serif text-3xl text-[#1a2e44]">Create a gathering</h3>
                </div>
                <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full border-[#eadfce] bg-white/80">
                  Close
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-[#46505d]">Title</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 rounded-2xl border-[#eadfce] bg-white" />
                </div>
                <div>
                  <label className="text-sm text-[#46505d]">Subtitle</label>
                  <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1 rounded-2xl border-[#eadfce] bg-white" />
                </div>
                <div>
                  <label className="text-sm text-[#46505d]">Starts at</label>
                  <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="mt-1 rounded-2xl border-[#eadfce] bg-white" />
                </div>
                <div>
                  <label className="text-sm text-[#46505d]">Location</label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 rounded-2xl border-[#eadfce] bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-[#46505d]">Poster URL</label>
                  <Input value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} className="mt-1 rounded-2xl border-[#eadfce] bg-white" />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-full bg-[#1A2E44] text-white hover:bg-[#132235]"
                  onClick={createEvent}
                  disabled={!form.title || !form.startsAt || !form.location}
                >
                  Create Event
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full border-[#eadfce] bg-white/80">
                  Cancel
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
