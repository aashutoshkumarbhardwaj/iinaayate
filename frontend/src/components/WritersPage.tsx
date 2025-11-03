import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { mockUsers } from '../data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface WritersPageProps {
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Extended writer data with poem counts
const writersData = mockUsers.map((user, index) => ({
  ...user,
  sherCount: Math.floor(Math.random() * 100) + 5,
  ghazalCount: Math.floor(Math.random() * 50) + 1,
  nazmCount: Math.floor(Math.random() * 30) + 1,
}));

export function WritersPage({ onBack, onUserClick }: WritersPageProps) {
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Filter writers by selected letter
  const filteredWriters = selectedLetter
    ? writersData.filter((writer) =>
        writer.name.toUpperCase().startsWith(selectedLetter)
      )
    : writersData;

  // Sort writers
  const sortedWriters = [...filteredWriters].sort((a, b) => {
    if (sortBy === 'popularity') {
      return b.followers - a.followers;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl text-gray-900 mb-3">Writers</h1>
          <p className="text-lg text-gray-600">
            Discover talented poets and their beautiful works
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Sort By */}
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
            <span className="text-gray-700">Sort By :</span>
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
          <Button
            variant="outline"
            className="bg-gray-100 border-gray-200 rounded-xl"
          >
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
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    src={writer.avatar}
                    alt={writer.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl">
                    {writer.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Writer Name */}
              <h3 className="text-xl text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                {writer.name}
              </h3>

              {/* Poem Counts */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="text-center">
                  <p className="text-lg text-gray-900">{writer.sherCount}</p>
                  <p>Sher</p>
                </div>
                <div className="text-center">
                  <p className="text-lg text-gray-900">{writer.ghazalCount}</p>
                  <p>Ghazal</p>
                </div>
                <div className="text-center">
                  <p className="text-lg text-gray-900">{writer.nazmCount}</p>
                  <p>Nazm</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Load More */}
        {sortedWriters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No writers found with this filter</p>
          </div>
        )}

        {sortedWriters.length > 0 && (
          <div className="text-center mb-16">
            <Button
              variant="outline"
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Load more writers
            </Button>
          </div>
        )}

        {/* Become a Writer CTA */}
        <div className="bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <path d="M200 50 L250 150 L350 150 L270 210 L300 310 L200 250 L100 310 L130 210 L50 150 L150 150 Z" fill="currentColor" className="text-purple-600" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl text-gray-900 mb-4">
              Share Your Poetry with the World
            </h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of poets on Inayate. Share your ghazals, shers, and nazms with 
              a community that appreciates beautiful words.
            </p>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white">
              Start Writing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
