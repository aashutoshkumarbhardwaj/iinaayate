// Mock data for Inayate poetry platform

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  genre: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'ayesha_writes',
    name: 'Ayesha Rahman',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    bio: 'Poetry is the echo of the heart | Ghazal & Free Verse',
    followers: 1243,
    following: 432,
  },
  {
    id: '2',
    username: 'faraz_poet',
    name: 'Faraz Ahmed',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bio: 'Words are my refuge | Urdu Poetry Enthusiast',
    followers: 892,
    following: 234,
  },
  {
    id: '3',
    username: 'sara_shayari',
    name: 'Sara Khan',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    bio: 'Lover of words and emotions ✨',
    followers: 2341,
    following: 567,
  },
  {
    id: '4',
    username: 'ali_verses',
    name: 'Ali Hassan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    bio: 'Crafting emotions into verses',
    followers: 654,
    following: 189,
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    title: 'Moonlit Whispers',
    content: `The moon knows all my secrets,
Whispered softly in the night,
Stars bear witness to my longing,
As I pen these words in light.

Each verse a prayer unspoken,
Every line a gentle plea,
That somewhere in this vast cosmos,
You might think of me.`,
    genre: 'Free Verse',
    likes: 234,
    comments: 45,
    shares: 12,
    createdAt: '2 hours ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    userId: '2',
    title: 'Dil Ki Baat',
    content: `Dil ki gehraaiyon mein chhupa hai ek raaz,
Jo lafzon mein bayan na ho paaye,
Khamoshi mein hi hai uska andaaz,
Jo dil se dil tak aa jaaye.`,
    genre: 'Ghazal',
    likes: 456,
    comments: 67,
    shares: 23,
    createdAt: '5 hours ago',
    isLiked: true,
    isSaved: true,
  },
  {
    id: '3',
    userId: '3',
    title: 'Autumn Leaves',
    content: `Like autumn leaves that fall,
My thoughts drift to you,
Golden memories of yesterday,
Forever in my heart they'll stay.`,
    genre: 'Poetry',
    likes: 189,
    comments: 32,
    shares: 8,
    createdAt: '1 day ago',
  },
  {
    id: '4',
    userId: '4',
    title: 'Silent Echoes',
    content: `In the silence between heartbeats,
I hear your name,
A melody that never fades,
An eternal flame.

Time may pass and seasons change,
But this truth remains the same,
Love transcends all boundaries,
Beyond fortune, beyond fame.`,
    genre: 'Free Verse',
    likes: 321,
    comments: 54,
    shares: 19,
    createdAt: '2 days ago',
  },
  {
    id: '5',
    userId: '1',
    title: 'Raat Ka Safar',
    content: `Raat ke is safar mein,
Tera saath hai,
Chaand ki roshni mein,
Teri baat hai.`,
    genre: 'Shayari',
    likes: 567,
    comments: 89,
    shares: 34,
    createdAt: '3 days ago',
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    userId: '2',
    content: 'Beautiful imagery! This really touched my heart.',
    createdAt: '1 hour ago',
  },
  {
    id: '2',
    postId: '1',
    userId: '3',
    content: 'Your words paint such vivid pictures ✨',
    createdAt: '30 minutes ago',
  },
  {
    id: '3',
    postId: '2',
    userId: '1',
    content: 'Bohot khoob! The emotion in this is incredible.',
    createdAt: '4 hours ago',
  },
];

export const genres = [
  'Free Verse',
  'Ghazal',
  'Shayari',
  'Haiku',
  'Sonnet',
  'Quote',
  'Prose Poetry',
  'Urdu Poetry',
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getPostById(id: string): Post | undefined {
  return mockPosts.find(post => post.id === id);
}

export function getCommentsByPostId(postId: string): Comment[] {
  return mockComments.filter(comment => comment.postId === postId);
}
