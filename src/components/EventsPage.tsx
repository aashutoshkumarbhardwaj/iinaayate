import { ArrowLeft, Calendar, MapPin, Users, Clock, Mic2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface EventsPageProps {
  onBack: () => void;
}

const pastEvents = [
  {
    id: '1',
    title: '4th Annual Mushaira in Delhi-Shaan E Hindvi',
    date: 'February 15, 2025',
    time: '06:00 PM',
    location: 'Aiwan-e-Ghalib Auditorium, New Delhi',
    poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop',
    gradient: 'from-red-900 to-red-950',
  },
  {
    id: '2',
    title: 'Papa Kahte Hain Bada Naam Karega',
    subtitle: 'The Iconic Poetry Solo Show',
    date: 'February 08, 2025',
    time: '05:00 PM',
    location: 'Nojoto Creator Hub, New Delhi',
    poster: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
    gradient: 'from-red-700 to-red-900',
  },
  {
    id: '3',
    title: 'Shaam-e-Sukoon - An evening of Poetry & Qawwali',
    date: 'January 26, 2025',
    time: '05:30 PM',
    location: 'Mehfil Yaaron Ki, Noida',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop',
    gradient: 'from-gray-900 to-black',
  },
  {
    id: '4',
    title: 'Kuch Suna Do - Open Mic Night',
    date: 'January 25, 2025',
    time: '08:00 PM',
    location: 'Heartbeat Terrace Restaurant Cafe, Gurugram',
    poster: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=500&fit=crop',
    gradient: 'from-purple-900 to-purple-950',
  },
  {
    id: '5',
    title: 'Tumhara Shayar - Poetry Solo',
    date: 'January 19, 2025',
    time: '06:00 PM',
    location: 'The Dark Street Nagar, Indore',
    poster: 'https://images.unsplash.com/photo-1483412468200-72182dbbc544?w=400&h=500&fit=crop',
    gradient: 'from-gray-800 to-gray-950',
  },
  {
    id: '6',
    title: 'Tumhara Shayar - A Poetry Solo',
    subtitle: 'with Satya Vyas',
    date: 'January 18, 2025',
    time: '07:30 PM',
    location: 'Mehfil Creator Hub, Surat',
    poster: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=500&fit=crop',
    gradient: 'from-green-800 to-green-950',
  },
];

export function EventsPage({ onBack }: EventsPageProps) {
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

        {/* Past Events Section */}
        <div className="mb-8">
          <h2 className="text-3xl text-gray-900 mb-8">Past Events</h2>
        </div>

        {/* Events Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <button
              key={event.id}
              className="group text-left hover:scale-[1.02] transition-transform"
            >
              {/* Event Poster */}
              <div
                className={`relative bg-gradient-to-br ${event.gradient} rounded-2xl overflow-hidden h-96 mb-4 flex items-center justify-center p-6`}
              >
                <div className="absolute inset-0 opacity-20">
                  <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
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
                    {event.date} | {event.time}
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

        {/* Upcoming Events CTA */}
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
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                View Upcoming Events
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                Host Your Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
