import { Search, PenSquare, User, Heart, Bell, Settings, BookMarked, Sparkles, Compass, Menu, LibraryBig, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string, options?: { searchQuery?: string }) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export function Navigation({ currentPage, onNavigate, onLogout, isAuthenticated }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoSrc = '/brand/iinaayate-logo-transparent.png';
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
    if (searchQuery.trim()) onNavigate('search', { searchQuery: searchQuery.trim() });
  };

  const navItems = [
    { key: 'home', label: 'Feed', icon: Sparkles },
    { key: 'explore', label: 'Explore', icon: Compass },
    { key: 'writers', label: 'Writers' },
    { key: 'events', label: 'Events' },
    { key: 'blog', label: 'Journal' },
    // { key: 'store', label: 'Store' },
  ];

  const mobileTabs = [
    { key: 'home', label: 'SANCHAY', icon: BookMarked },
    { key: 'explore', label: 'KHOJ', icon: Search },
    { key: 'write', label: 'LEKHAN', icon: PenSquare },
    // { key: 'store', label: 'PUSTAKALAY', icon: LibraryBig },
  ] as const;

  const mobileDrawerLinks = [
    { key: 'home', label: 'Sanchay', icon: Sparkles },
    { key: 'explore', label: 'Khoj', icon: Compass },
    { key: 'writers', label: 'Writers', icon: User },
    { key: 'events', label: 'Events', icon: BookMarked },
    { key: 'blog', label: 'Journal', icon: PenSquare },
    // { key: 'store', label: 'Pustakalay', icon: LibraryBig },
    { key: 'help', label: 'Help', icon: Heart },
  ] as const;

  const goMobilePage = (page: string, options?: { searchQuery?: string }) => {
    setMobileMenuOpen(false);
    onNavigate(page, options);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-nowrap items-center justify-between gap-2 md:hidden">
            <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DrawerTrigger>
              <DrawerContent
                direction="top"
                className="rounded-b-[28px] border-slate-200 bg-[#fffaf2] px-4 pb-6 pt-2 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
              >
                <DrawerHeader className="px-2 pt-2">
                  <DrawerTitle className="font-serif text-[1.35rem] text-[#1A2E44]">Menu</DrawerTitle>
                  <DrawerDescription className="text-sm text-slate-500">Navigate the app from here.</DrawerDescription>
                </DrawerHeader>

                <div className="grid gap-2 px-2 pt-2">
                  {mobileDrawerLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.key;

                    return (
                      <DrawerClose asChild key={item.key}>
                        <button
                          type="button"
                          onClick={() => goMobilePage(item.key)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                            isActive
                              ? 'border-[#F4A261]/40 bg-[#F4A261]/10 text-[#e07a1f]'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{item.label}</span>
                          </span>
                          <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#F4A261]' : 'bg-transparent'}`} />
                        </button>
                      </DrawerClose>
                    );
                  })}

                  {isAuthenticated && (
                    <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
                      <DrawerClose asChild>
                        <button
                          type="button"
                          onClick={() => goMobilePage('profile')}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-3">
                            <User className="h-4 w-4" />
                            <span className="font-medium">My Profile</span>
                          </span>
                        </button>
                      </DrawerClose>

                      <DrawerClose asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onLogout?.();
                          }}
                          className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          <span className="flex items-center gap-3">
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium">Log Out</span>
                          </span>
                        </button>
                      </DrawerClose>
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>

            <button
              onClick={() => goMobilePage('home')}
              className="inline-flex flex-none items-center"
              aria-label="Go to home"
            >
              <img src={logoSrc} alt="iinaayate" className="h-16 w-auto object-contain sm:h-18" />
            </button>

            <div className="flex flex-none items-center gap-1">
              <button
                type="button"
                onClick={() => goMobilePage('search')}
                aria-label="Search"
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <Search className="h-3 w-3" />
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => goMobilePage('profile')}
                  className="rounded-2xl ring-offset-white transition focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:ring-offset-2"
                  aria-label="Profile"
                >
                  <Avatar className="h-8 w-8 border border-slate-200 shadow-sm">
                    <AvatarImage src={avatarUrl} alt="User" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goMobilePage('settings')}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex md:flex-nowrap">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center"
            >
              <img src={logoSrc} alt="iinaayate" className="h-20 w-auto object-contain" />
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-hidden">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                {navItems.map((item) => {
                  const isActive = currentPage === item.key;
                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={item.key}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onNavigate(item.key)}
                      className={`relative flex items-center gap-2 rounded-[20px] px-3 py-2 text-sm font-medium transition-all duration-300 ${
                        isActive ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[20px] border border-slate-950 bg-slate-950" />}
                      <span className="relative z-10 flex items-center gap-2">
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('help')}
                  className="rounded-[20px] bg-white px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                >
                  Help
                </Button>
              </div>

              <form onSubmit={handleSearch} className="glass-panel flex w-[210px] items-center gap-2 rounded-[18px] px-3 py-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search poems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => onNavigate('search')}
                  className="h-auto border-0 bg-transparent px-0 py-0 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                />
              </form>

              <Button
                onClick={() => onNavigate('write')}
                size="sm"
                className="h-10 rounded-[20px] border border-slate-950 bg-slate-950 px-3 text-white transition-all duration-300 hover:bg-slate-800"
              >
                <PenSquare className="mr-1.5 h-4 w-4" />
                <span>Write</span>
              </Button>

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('notifications')}
                  className="glass-panel relative h-10 w-10 rounded-[20px] border border-slate-200 text-slate-700 transition-all duration-300 hover:bg-slate-50"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-sky-500" />
                </Button>
              )}

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:ring-offset-2 focus:ring-offset-white">
                      <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                        <AvatarImage src={avatarUrl} alt="User" />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-[20px] border border-slate-200 bg-white text-slate-900">
                    <DropdownMenuItem onClick={() => onNavigate('profile')} className="focus:bg-slate-100 focus:text-slate-900">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('collections')} className="focus:bg-slate-100 focus:text-slate-900">
                      <BookMarked className="mr-2 h-4 w-4" />
                      My Collections
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('settings')} className="focus:bg-slate-100 focus:text-slate-900">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 focus:text-rose-700" onClick={() => onLogout?.()}>
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('settings')}
                  className="glass-panel h-10 rounded-[20px] border border-slate-200 bg-white px-4 text-slate-900 transition-all duration-300 hover:bg-slate-50"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden">
        <div className="mx-auto max-w-md rounded-[28px] border border-white/70 bg-white/90 px-2 py-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1">
            {mobileTabs.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goMobilePage(item.key)}
                  className={`flex flex-col items-center gap-1 rounded-[22px] px-2 py-2 transition-colors ${
                    isActive ? 'text-[#E67E22]' : 'text-slate-500'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${isActive ? 'bg-[#F4A261]/15' : 'bg-transparent'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[#E67E22]' : 'text-slate-500'}`} />
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.12em]">{item.label}</span>
                  <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-[#E67E22]' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
