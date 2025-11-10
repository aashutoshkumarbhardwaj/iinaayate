import { ArrowLeft, MapPin, Calendar, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { postAPI, userAPI } from '../utils/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostCard } from './PostCard';

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function UserProfilePage({ userId, onBack, onPostClick, onUserClick }: UserProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isSelf = currentUserId === userId;

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('currentUserId'));
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [userData, userPostsData, savedPostsData] = await Promise.all([
          userAPI.getUser(userId),
          postAPI.getPosts({ userId }),
          postAPI.getSavedPosts(),
        ]);
        let following: any = null;
        if (!isSelf) {
          try { following = await userAPI.isFollowing(userId); } catch {}
        }
        if (!userData) {
          setError('User not found');
        } else {
          setUser(userData);
          setUserPosts(userPostsData);
          setSavedPosts(savedPostsData);
          setIsFollowing(isSelf ? null : !!following?.following);
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, isSelf]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Banner Image */}
        <div className="bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 h-48 rounded-2xl mb-6" />

        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 -mt-20 relative shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <button onClick={() => onUserClick(user.id)} className="group">
              <Avatar className="w-32 h-32 ring-4 ring-white -mt-16 group-hover:ring-rose-200 transition-all">
                <AvatarImage src={user.avatar || ''} alt={user.name || ''} />
                <AvatarFallback>{user.name ? user.name[0] : '?'}</AvatarFallback>
              </Avatar>
            </button>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl text-gray-900 mb-1">
                    {user.name}
                  </h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                {!isSelf && (
                  <Button
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                    onClick={async () => {
                      try {
                        if (isFollowing) {
                          await userAPI.unfollow(userId);
                          setIsFollowing(false);
                        } else {
                          await userAPI.follow(userId);
                          setIsFollowing(true);
                        }
                      } catch (e) {
                        // ignore
                      }
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-4">{user.bio}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined November 2025</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Somewhere on Earth</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div>
                  <span className="text-gray-900 mr-1">{userPosts.length}</span>
                  <span className="text-gray-600">Poems</span>
                </div>
                <div>
                  <span className="text-gray-900 mr-1">{user._count?.followers ?? 0}</span>
                  <span className="text-gray-600">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="poems" className="w-full">
            <TabsList className="w-full justify-start bg-white border border-gray-200 rounded-xl p-1">
              <TabsTrigger value="poems" className="flex-1 md:flex-initial">
                Poems
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-1 md:flex-initial">
                About
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex-1 md:flex-initial">
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="poems" className="mt-6">
              <div className="space-y-6">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostClick={onPostClick}
                      onUserClick={onUserClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No poems yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-xl text-gray-900 mb-4">
                  About {user.name}
                </h3>
                <p className="text-gray-700 mb-4">{user.bio}</p>
                <div className="space-y-3 text-gray-700">
                  <p>A passionate writer who believes in the power of words to heal, inspire, and connect souls.</p>
                  <p>Writing has been my companion through life's ups and downs, and I'm grateful to share this journey with you.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <div className="space-y-6">
                {savedPosts.length > 0 ? (
                  savedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostClick={onPostClick}
                      onUserClick={onUserClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No saved poems yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
