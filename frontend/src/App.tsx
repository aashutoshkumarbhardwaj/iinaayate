import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { PostDetailsPage } from './components/PostDetailsPage';
import { UserProfilePage } from './components/UserProfilePage';
import { WritePage } from './components/WritePage';
import { ExplorePage } from './components/ExplorePage';
import { AuthPage } from './components/AuthPage';
import { SearchPage } from './components/SearchPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SettingsPage } from './components/SettingsPage';
import { CollectionsPage } from './components/CollectionsPage';
import { DailyPoemPage } from './components/DailyPoemPage';
import { EventsPage } from './components/EventsPage';
import { EventDetailsPage } from './components/EventDetailsPage';
import { WritersPage } from './components/WritersPage';
import { BlogPage } from './components/BlogPage';
import { BlogDetailsPage } from './components/BlogDetailsPage';
import { setAuthToken, authAPI } from './utils/api';
import { HelpPage } from './components/HelpPage';
import { StorePage } from './components/StorePage';

type Page = 'auth' | 'home' | 'explore' | 'write' | 'profile' | 'post' | 'search' | 'notifications' | 'settings' | 'collections' | 'daily' | 'events' | 'event' | 'writers' | 'blog' | 'blogpost' | 'help' | 'store';

interface NavigationState {
  page: Page;
  postId?: string;
  userId?: string;
  eventId?: string;
  blogPostId?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [navState, setNavState] = useState<NavigationState>({
    page: 'home',
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      (async () => {
        try {
          const me = await authAPI.me();
          if (me?.user?.id) localStorage.setItem('currentUserId', me.user.id);
          if (me?.user?.avatar) localStorage.setItem('currentUserAvatar', me.user.avatar);
          setIsAuthenticated(true);
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('avatar-changed'));
        } catch {
          // Bad token: clear and mark unauthenticated
          setIsAuthenticated(false);
          setAuthToken(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUserId');
          localStorage.removeItem('currentUserAvatar');
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('avatar-changed'));
        }
      })();
    }
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setNavState({ page: 'home' });
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserAvatar');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('avatar-changed'));
  };

  const handleNavigate = (page: string) => {
    if (page === 'profile') {
      const id = localStorage.getItem('currentUserId');
      if (id) {
        setNavState({ page: 'profile', userId: id });
        return;
      }
    }
    setNavState({ page: page as Page });
  };

  const handlePostClick = (postId: string) => {
    setNavState({ page: 'post', postId });
  };

  const handleUserClick = (userId: string) => {
    setNavState({ page: 'profile', userId });
  };

  const handleBack = () => {
    setNavState({ page: 'home' });
  };

  // Only gate specific pages behind auth; allow public browsing by default.
  // Profile: gate only when user is trying to access their own profile (or no userId provided).
  const protectedPages: Page[] = ['write', 'notifications', 'settings', 'collections'];
  const currentUserIdLS = typeof window !== 'undefined' ? localStorage.getItem('currentUserId') : null;
  const isSelfProfileIntent = navState.page === 'profile' && (!navState.userId || (currentUserIdLS && navState.userId === currentUserIdLS));
  const mustAuth = !isAuthenticated && (protectedPages.includes(navState.page) || isSelfProfileIntent);

  // After auth, if user intended to view their profile but userId wasn't set yet, fix it
  useEffect(() => {
    if (isAuthenticated && navState.page === 'profile' && !navState.userId) {
      const id = localStorage.getItem('currentUserId');
      if (id) setNavState({ page: 'profile', userId: id });
      else setNavState({ page: 'home' });
    }
  }, [isAuthenticated, navState.page, navState.userId]);

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />
      <Navigation currentPage={navState.page} onNavigate={handleNavigate} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
      {mustAuth && <AuthPage onAuth={handleAuth} />}
      
      {!mustAuth && navState.page === 'home' && (
        <HomePage
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
          onNavigate={handleNavigate}
        />
      )}

      {!mustAuth && navState.page === 'explore' && (
        <ExplorePage
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
          onDailyPoemClick={() => handleNavigate('daily')}
          onNavigate={handleNavigate}
        />
      )}

      {!mustAuth && navState.page === 'daily' && (
        <DailyPoemPage
          onBack={handleBack}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}

      {!mustAuth && navState.page === 'events' && (
        <EventsPage onBack={handleBack} onView={(id) => setNavState({ page: 'event', eventId: id })} />
      )}

      {!mustAuth && navState.page === 'event' && navState.eventId && (
        <EventDetailsPage
          eventId={navState.eventId}
          onBack={() => setNavState({ page: 'events' })}
          onView={(id) => setNavState({ page: 'event', eventId: id })}
        />
      )}

      {!mustAuth && navState.page === 'writers' && (
        <WritersPage onBack={handleBack} onUserClick={handleUserClick} />
      )}

      {!mustAuth && navState.page === 'blog' && (
        <BlogPage onBack={handleBack} onBlogClick={(id) => setNavState({ page: 'blogpost', blogPostId: id })} />
      )}

      {navState.page === 'write' && !mustAuth && (
        <WritePage onBack={handleBack} />
      )}

      {!mustAuth && navState.page === 'search' && (
        <SearchPage
          onBack={handleBack}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}

      {navState.page === 'notifications' && !mustAuth && (
        <NotificationsPage
          onBack={() => setNavState({ page: 'home' })}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}

      {navState.page === 'settings' && !mustAuth && (
        <SettingsPage onBack={() => setNavState({ page: 'home' })} onLogout={handleLogout} />
      )}

      {!mustAuth && navState.page === 'help' && (
        <HelpPage onBack={() => setNavState({ page: 'home' })} />
      )}

      {!mustAuth && navState.page === 'store' && (
        <StorePage onBack={() => setNavState({ page: 'home' })} />
      )}

      {navState.page === 'collections' && !mustAuth && (
        <CollectionsPage
          onBack={handleBack}
          onCollectionClick={(id) => console.log('Collection clicked:', id)}
        />
      )}

      {!mustAuth && navState.page === 'profile' && navState.userId && (
        <UserProfilePage
          userId={navState.userId}
          onBack={handleBack}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}

      {!mustAuth && navState.page === 'post' && navState.postId && (
        <PostDetailsPage
          postId={navState.postId}
          onBack={handleBack}
          onUserClick={handleUserClick}
          onPostClick={handlePostClick}
        />
      )}

      {!mustAuth && navState.page === 'blogpost' && navState.blogPostId && (
        <BlogDetailsPage
          postId={navState.blogPostId}
          onBack={() => setNavState({ page: 'blog' })}
          onPostClick={(id) => setNavState({ page: 'blogpost', blogPostId: id })}
        />
      )}
    </div>
  );
}
