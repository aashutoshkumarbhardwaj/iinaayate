import { Search, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { PostCard } from './PostCard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { searchAPI } from '../utils/api';

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

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            Search Inayate
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
                          <p className="text-sm text-gray-500 mt-1">{user.followers} followers</p>
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
                        <p className="text-sm text-gray-500 mt-1">{user.followers} followers</p>
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
