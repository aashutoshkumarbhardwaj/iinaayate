import { ArrowLeft, Heart, MessageCircle, UserPlus, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface NotificationsPageProps {
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

// Mock notifications for now
const mockNotifications = [
  {
    id: '1',
    type: 'like',
    user: {
      id: '2',
      name: 'Faraz Ahmed',
      username: 'faraz_poet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    post: {
      id: '1',
      title: 'Moonlit Whispers',
    },
    createdAt: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    user: {
      id: '3',
      name: 'Sara Khan',
      username: 'sara_shayari',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    },
    post: {
      id: '2',
      title: 'Dil Ki Baat',
    },
    comment: 'Beautiful expression of emotions!',
    createdAt: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    user: {
      id: '4',
      name: 'Ali Hassan',
      username: 'ali_verses',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    },
    createdAt: '1 day ago',
    read: true,
  },
  {
    id: '4',
    type: 'like',
    user: {
      id: '3',
      name: 'Sara Khan',
      username: 'sara_shayari',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    },
    post: {
      id: '5',
      title: 'Raat Ka Safar',
    },
    createdAt: '2 days ago',
    read: true,
  },
];

export function NotificationsPage({ onBack, onPostClick, onUserClick }: NotificationsPageProps) {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      default:
        return <Bookmark className="w-5 h-5 text-gray-500" />;
    }
  };

  const NotificationItem = ({ notification }: { notification: typeof mockNotifications[0] }) => {
    return (
      <div
        className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
          notification.read ? 'bg-white' : 'bg-rose-50'
        } hover:bg-gray-50`}
      >
        <button onClick={() => onUserClick(notification.user.id)}>
          <Avatar className="w-12 h-12 ring-2 ring-rose-100">
            <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
            <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <NotificationIcon type={notification.type} />
            <div className="flex-1">
              <p className="text-gray-900">
                <button
                  onClick={() => onUserClick(notification.user.id)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <span>{notification.user.name}</span>
                </button>
                {notification.type === 'like' && ' liked your poem '}
                {notification.type === 'comment' && ' commented on your poem '}
                {notification.type === 'follow' && ' started following you'}
                {notification.post && (
                  <button
                    onClick={() => onPostClick(notification.post.id)}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    "{notification.post.title}"
                  </button>
                )}
              </p>
              {notification.comment && (
                <p className="text-gray-600 mt-1 text-sm">"{notification.comment}"</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{notification.createdAt}</p>
            </div>
          </div>
        </div>

        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-rose-500 mt-2" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-3xl mx-auto px-4 py-8">
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

          <div className="flex items-center justify-between">
            <h1 className="text-3xl text-gray-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-sm">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-white border border-gray-200 rounded-xl p-1 mb-6">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {mockNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            {mockNotifications.filter(n => !n.read).length > 0 ? (
              mockNotifications
                .filter(n => !n.read)
                .map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No unread notifications</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
