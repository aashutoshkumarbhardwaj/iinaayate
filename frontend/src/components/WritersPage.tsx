import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { userAPI } from '../utils/api';

interface WritersPageProps {
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function WritersPage({ onBack, onUserClick }: WritersPageProps) {
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [writers, setWriters] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState(60);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [autoLoading, setAutoLoading] = useState(false);

  // Initial load and when filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setOffset(0);
        setHasMore(true);
        const resp = await userAPI.listUsers({ limit, offset: 0, sort: sortBy as any, startsWith: selectedLetter || undefined });
        if (!mounted) return;
        const first = Array.isArray(resp?.users) ? resp.users : resp;
        const tot = typeof resp?.total === 'number' ? resp.total : first.length;
        setWriters(first);
        setTotal(tot);
        setHasMore(first.length > 0 && (first.length + 0) < tot);
        setOffset(first.length);
        // Auto-load subsequent pages so all writers are visible
        if (tot > first.length) {
          setAutoLoading(true);
          let acc = first.length;
          let nextOffset = first.length;
          const cap = Math.min(tot, 2000); // safety cap
          while (mounted && acc < cap) {
            try {
              const page = await userAPI.listUsers({ limit, offset: nextOffset, sort: sortBy as any, startsWith: selectedLetter || undefined });
              const rows = Array.isArray(page?.users) ? page.users : page;
              if (!rows || rows.length === 0) break;
              setWriters((prev) => [...prev, ...rows]);
              acc += rows.length;
              nextOffset += rows.length;
              setOffset(nextOffset);
              setHasMore(nextOffset < tot);
              if (nextOffset >= tot) break;
            } catch {
              break;
            }
          }
          setAutoLoading(false);
        }
      } catch {
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sortBy, selectedLetter, limit]);

  const loadMore = async () => {
    if (loading || autoLoading || !hasMore) return;
    setLoading(true);
    try {
      const resp = await userAPI.listUsers({ limit, offset, sort: sortBy as any, startsWith: selectedLetter || undefined });
      const next = Array.isArray(resp?.users) ? resp.users : resp;
      setWriters((prev) => [...prev, ...next]);
      const newTotal = typeof resp?.total === 'number' ? resp.total : total;
      const newOffset = offset + next.length;
      setHasMore(newOffset < newTotal);
      setOffset(newOffset);
      if (typeof resp?.total === 'number') setTotal(resp.total);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Data already comes filtered/sorted from backend
  const sortedWriters = writers;

  // Card background colors - soft pastels
  const cardColors = [
    'bg-rose-50/50',
    'bg-blue-50/50',
    'bg-amber-50/50',
    'bg-purple-50/50',
    'bg-green-50/50',
    'bg-pink-50/50',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 via-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-foreground mb-3">Writers</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} writers</p>
          <p className="text-lg text-muted-foreground">
            Discover talented poets and their beautiful works
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Sort By */}
          <div className="flex items-center gap-3 bg-accent/20 rounded-xl px-4 py-3">
            <span className="text-foreground">Sort By :</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Letter */}
          <Button variant="outline" className="bg-accent/20 border-border rounded-xl">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filter by letter
          </Button>
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !selectedLetter
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent/20 text-foreground hover:bg-accent/30'
            }`}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedLetter === letter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent/20 text-foreground hover:bg-accent/30'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Writers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedWriters.map((writer, index) => (
            <button
              key={writer.id}
              onClick={() => onUserClick(writer.id)}
              className={`${
                cardColors[index % cardColors.length]
              } rounded-2xl p-6 hover:shadow-xl transition-all group text-left`}
            >
              {/* Writer Photo */}
              <div className="mb-4">
                <Avatar className="w-full h-48 rounded-xl ring-2 ring-white group-hover:ring-4 transition-all">
                  <AvatarImage
                    src={writer.avatar || ''}
                    alt={writer.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl">
                    {(writer.name || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Writer Name */}
              <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors">
                {writer.name}
              </h3>

              {/* Followers */}
              <div className="text-sm text-muted-foreground">
                <p className="text-foreground/80">{writer.followersCount ?? 0} followers</p>
              </div>
            </button>
          ))}
        </div>

        {/* Load More */}
        {sortedWriters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No writers found with this filter</p>
          </div>
        )}

        {sortedWriters.length > 0 && (
          <div className="text-center mb-16">
            <Button onClick={loadMore} disabled={loading || autoLoading || !hasMore} variant="outline" className="border-border text-foreground hover:bg-accent/20 min-w-[180px]">
              {autoLoading ? 'Loading all…' : loading ? 'Loading…' : hasMore ? 'Load more writers' : 'No more writers'}
            </Button>
          </div>
        )}

        {/* Become a Writer CTA */}
        <div className="bg-gradient-to-br from-accent/20 via-secondary/20 to-cta/20 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <path d="M200 50 L250 150 L350 150 L270 210 L300 310 L200 250 L100 310 L130 210 L50 150 L150 150 Z" fill="currentColor" className="text-primary" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-serif text-foreground mb-4">
              Share Your Poetry with the World
            </h3>
            <p className="text-foreground/80 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of poets on iinaayate. Share your ghazals, shers, and nazms with 
              a community that appreciates beautiful words.
            </p>
            <Button className="bg-cta text-cta-foreground hover:brightness-95">
              Start Writing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
