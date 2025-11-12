import { Search, PenSquare, User, Heart, Bell, Settings, BookMarked } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export function Navigation({ currentPage, onNavigate, onLogout, isAuthenticated }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    typeof window !== 'undefined'
      ? localStorage.getItem('currentUserAvatar') || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  );

  useEffect(() => {
    const handler = () => {
      const url = localStorage.getItem('currentUserAvatar');
      if (url) setAvatarUrl(url);
    };
    window.addEventListener('avatar-changed', handler);
    return () => window.removeEventListener('avatar-changed', handler);
  }, []);

  // Reflect auth changes in avatar and controls
  useEffect(() => {
    if (isAuthenticated) {
      const url = localStorage.getItem('currentUserAvatar');
      if (url) setAvatarUrl(url);
    } else {
      setAvatarUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop');
    }
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <Heart className="w-6 h-6 text-accent fill-accent" />
            <span className="text-2xl tracking-tight text-foreground font-serif group-hover:text-primary transition-colors">
              iinaayate
            </span>
          </button>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search poems, poets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => onNavigate('search')}
                className="pl-10 bg-input-background border-border focus:bg-background"
              />
            </form>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className={currentPage === 'home' ? 'bg-accent/20 text-foreground' : ''}
            >
              Shayari
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('writers')}
              className={currentPage === 'writers' ? 'bg-accent/20 text-foreground' : ''}
            >
              Writers
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('events')}
              className={`hidden md:inline-flex ${currentPage === 'events' ? 'bg-accent/20 text-foreground' : ''}`}
            >
              Events
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('blog')}
              className={`hidden md:inline-flex ${currentPage === 'blog' ? 'bg-accent/20 text-foreground' : ''}`}
            >
              Blog
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('store')}
              className={`hidden lg:inline-flex ${currentPage === 'store' ? 'bg-accent/20 text-foreground' : ''}`}
            >
              Store
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('help')}
              className={`hidden lg:inline-flex ${currentPage === 'help' ? 'bg-accent/20 text-foreground' : ''}`}
            >
              Help
            </Button>
            <Button
              onClick={() => onNavigate('write')}
              size="sm"
              className="bg-cta text-cta-foreground hover:brightness-95 ml-2 focus:ring-2 focus:ring-primary"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Write</span>
            </Button>
            
            {/* Notifications */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('notifications')}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            )}

            {/* Profile/Login */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={avatarUrl} alt="User" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </button>
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
                  <DropdownMenuItem className="text-rose-600" onClick={() => onLogout?.()}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('settings')}
                className="ml-2"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
