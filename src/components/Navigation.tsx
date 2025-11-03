import { Search, PenSquare, User, Heart, Bell, Settings, BookMarked } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            <span className="text-2xl tracking-tight text-gray-900 group-hover:text-rose-500 transition-colors">
              Inayate
            </span>
          </button>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search poems, poets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => onNavigate('search')}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </form>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className={currentPage === 'home' ? 'bg-gray-100' : ''}
            >
              Shayari
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('writers')}
              className={currentPage === 'writers' ? 'bg-gray-100' : ''}
            >
              Writers
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('events')}
              className={`hidden md:inline-flex ${currentPage === 'events' ? 'bg-gray-100' : ''}`}
            >
              Events
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('blog')}
              className={`hidden md:inline-flex ${currentPage === 'blog' ? 'bg-gray-100' : ''}`}
            >
              Blog
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
            >
              Store
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
            >
              Help
            </Button>
            <Button
              onClick={() => onNavigate('write')}
              size="sm"
              className="bg-rose-500 hover:bg-rose-600 text-white ml-2"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Write</span>
            </Button>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('notifications')}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                      alt="User"
                    />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onNavigate('profile')}>
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('collections')}>
                  <BookMarked className="w-4 h-4 mr-2" />
                  My Collections
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-600">
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
