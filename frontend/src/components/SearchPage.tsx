import { Search, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { PostCard } from './PostCard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { postAPI, searchAPI, userAPI } from '../utils/api';

interface SearchPageProps {
  initialQuery?: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function SearchPage({ initialQuery = '', onBack, onPostClick, onUserClick }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{ posts: any[]; users: any[] }>({ posts: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [topHover, setTopHover] = useState(false);
  const [featuredPoets, setFeaturedPoets] = useState<any[]>([]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [top, poets] = await Promise.all([
          postAPI.getTopPosts(),
          userAPI.getTopUsers(),
        ]);
        if (mounted) {
          setTopPosts(top || []);
          setFeaturedPoets(poets || []);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!topPosts.length) return;
    if (topHover) return;
    const id = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % topPosts.length);
    }, 5000);
    return () => clearInterval(id);
  }, [topPosts.length, topHover]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchAPI.search(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl text-gray-900 mb-6">
            Search iinaayate
          </h1>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for poems, poets, or topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-4 h-14 text-lg border-gray-300 focus:ring-rose-500"
              autoFocus
            />
          </div>
        </div>

        {/* Explore-like header content */}
        {(topPosts.length > 0 || featuredPoets.length > 0) && (
          <div className="mb-10">
            {topPosts.length > 0 && (
              <div className="mb-8" onMouseEnter={() => setTopHover(true)} onMouseLeave={() => setTopHover(false)}>
                <div className="text-center mb-4">
                  <p className="uppercase tracking-[0.3em] text-xs text-gray-500">Today’s Top Shayari</p>
                </div>
                {(() => {
                  const p = topPosts[topIndex];
                  return (
                    <button
                      key={p.id}
                      onClick={() => onPostClick(p.id)}
                      className="block w-full text-center group"
                    >
                      <div className="text-2xl text-gray-900 leading-relaxed whitespace-pre-wrap group-hover:text-rose-600 transition-colors" style={{ fontFamily: 'serif' }}>
                        {(p.content || '').split('\n').slice(0, 2).join('\n')}
                      </div>
                      <div className="mt-3 text-gray-500 text-sm tracking-wide">{p.user?.name}</div>
                    </button>
                  );
                })()}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {topPosts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTopIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${i === topIndex ? 'w-6 bg-rose-500' : 'w-2.5 bg-gray-300'}`}
                      aria-label={`Go to shayari ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {featuredPoets.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-gray-900">Featured Poets</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {featuredPoets.slice(0, 12).map((poet: any) => (
                    <button
                      key={poet.id}
                      onClick={() => onUserClick(poet.id)}
                      className="flex flex-col items-center group"
                    >
                      <Avatar className="w-16 h-16 mb-2 ring-2 ring-rose-100 group-hover:ring-rose-300 transition-all">
                        <AvatarImage src={poet.avatar || ''} alt={poet.name} />
                        <AvatarFallback>{(poet.name || 'U')[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-gray-900 text-center truncate w-full group-hover:text-rose-600 transition-colors">
                        {(poet.name || '').split(' ')[0]}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {isSearching ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : hasSearched ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-white border border-gray-200 rounded-xl p-1 mb-6">
              <TabsTrigger value="all" className="flex-1">
                All ({results.posts.length + results.users.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1">
                Poems ({results.posts.length})
              </TabsTrigger>
              <TabsTrigger value="users" className="flex-1">
                Poets ({results.users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  <h2 className="text-xl text-gray-900 mb-4">
                    Poets
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => onUserClick(user.id)}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all text-left flex items-center gap-4"
                      >
                        <Avatar className="w-14 h-14 ring-2 ring-rose-100">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          <p className="text-sm text-gray-500 mt-1">{user._count?.followers ?? 0} followers</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div>
                  <h2 className="text-xl text-gray-900 mb-4">
                    Poems
                  </h2>
                  <div className="space-y-6">
                    {results.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPostClick={onPostClick}
                        onUserClick={onUserClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.posts.length === 0 && results.users.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500 mb-2">No results found for "{query}"</p>
                  <p className="text-sm text-gray-400">Try different keywords or browse our explore page</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts">
              <div className="space-y-6">
                {results.posts.length > 0 ? (
                  results.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostClick={onPostClick}
                      onUserClick={onUserClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No poems found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid md:grid-cols-2 gap-4">
                {results.users.length > 0 ? (
                  results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onUserClick(user.id)}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all text-left flex items-center gap-4"
                    >
                      <Avatar className="w-14 h-14 ring-2 ring-rose-100">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        <p className="text-sm text-gray-500 mt-1">{user._count?.followers ?? 0} followers</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No poets found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Start typing to search</p>
            <p className="text-sm text-gray-400">Find poems, poets, and topics that inspire you</p>
          </div>
        )}
      </div>
    </div>
  );
}
