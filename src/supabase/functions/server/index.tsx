import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to get authenticated user
async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Health check endpoint
app.get("/make-server-f68befbc/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ROUTES ============

// Sign up
app.post("/make-server-f68befbc/auth/signup", async (c) => {
  try {
    const { email, password, username, name } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username, name },
      email_confirm: true,
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Create user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      username,
      name,
      bio: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      followers: 0,
      following: 0,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to sign up' }, 500);
  }
});

// ============ USER ROUTES ============

// Get user profile
app.get("/make-server-f68befbc/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// Update user profile
app.put("/make-server-f68befbc/users/:userId", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userId = c.req.param('userId');
    if (authUser.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const updates = await c.req.json();
    const currentUser = await kv.get(`user:${userId}`);
    
    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const updatedUser = { ...currentUser, ...updates };
    await kv.set(`user:${userId}`, updatedUser);
    
    return c.json({ user: updatedUser });
  } catch (error) {
    console.log('Update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Follow/Unfollow user
app.post("/make-server-f68befbc/users/:userId/follow", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const targetUserId = c.req.param('userId');
    const { action } = await c.req.json(); // 'follow' or 'unfollow'
    
    const followKey = `follow:${authUser.id}:${targetUserId}`;
    
    if (action === 'follow') {
      await kv.set(followKey, { followedAt: new Date().toISOString() });
      
      // Update follower counts
      const targetUser = await kv.get(`user:${targetUserId}`);
      const currentUser = await kv.get(`user:${authUser.id}`);
      
      if (targetUser) {
        await kv.set(`user:${targetUserId}`, { ...targetUser, followers: (targetUser.followers || 0) + 1 });
      }
      if (currentUser) {
        await kv.set(`user:${authUser.id}`, { ...currentUser, following: (currentUser.following || 0) + 1 });
      }
    } else {
      await kv.del(followKey);
      
      // Update follower counts
      const targetUser = await kv.get(`user:${targetUserId}`);
      const currentUser = await kv.get(`user:${authUser.id}`);
      
      if (targetUser) {
        await kv.set(`user:${targetUserId}`, { ...targetUser, followers: Math.max(0, (targetUser.followers || 0) - 1) });
      }
      if (currentUser) {
        await kv.set(`user:${authUser.id}`, { ...currentUser, following: Math.max(0, (currentUser.following || 0) - 1) });
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Follow/unfollow error:', error);
    return c.json({ error: 'Failed to follow/unfollow user' }, 500);
  }
});

// Check if following
app.get("/make-server-f68befbc/users/:userId/following", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ isFollowing: false });
    }
    
    const targetUserId = c.req.param('userId');
    const followKey = `follow:${authUser.id}:${targetUserId}`;
    const isFollowing = await kv.get(followKey);
    
    return c.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.log('Check following error:', error);
    return c.json({ isFollowing: false });
  }
});

// ============ POST ROUTES ============

// Get all posts (with pagination)
app.get("/make-server-f68befbc/posts", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const genre = c.req.query('genre');
    const userId = c.req.query('userId');
    
    const allPosts = await kv.getByPrefix('post:');
    let posts = allPosts.map(p => p.value).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (genre) {
      posts = posts.filter(p => p.genre === genre);
    }
    
    if (userId) {
      posts = posts.filter(p => p.userId === userId);
    }
    
    const paginatedPosts = posts.slice(offset, offset + limit);
    
    return c.json({ posts: paginatedPosts, total: posts.length });
  } catch (error) {
    console.log('Get posts error:', error);
    return c.json({ error: 'Failed to get posts' }, 500);
  }
});

// Get single post
app.get("/make-server-f68befbc/posts/:postId", async (c) => {
  try {
    const postId = c.req.param('postId');
    const post = await kv.get(`post:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json({ post });
  } catch (error) {
    console.log('Get post error:', error);
    return c.json({ error: 'Failed to get post' }, 500);
  }
});

// Create post
app.post("/make-server-f68befbc/posts", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { title, content, genre } = await c.req.json();
    const postId = crypto.randomUUID();
    
    const post = {
      id: postId,
      userId: authUser.id,
      title,
      content,
      genre,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`post:${postId}`, post);
    
    return c.json({ post });
  } catch (error) {
    console.log('Create post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Update post
app.put("/make-server-f68befbc/posts/:postId", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const postId = c.req.param('postId');
    const post = await kv.get(`post:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    if (post.userId !== authUser.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const updates = await c.req.json();
    const updatedPost = { ...post, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`post:${postId}`, updatedPost);
    
    return c.json({ post: updatedPost });
  } catch (error) {
    console.log('Update post error:', error);
    return c.json({ error: 'Failed to update post' }, 500);
  }
});

// Delete post
app.delete("/make-server-f68befbc/posts/:postId", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const postId = c.req.param('postId');
    const post = await kv.get(`post:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    if (post.userId !== authUser.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    await kv.del(`post:${postId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

// Like/Unlike post
app.post("/make-server-f68befbc/posts/:postId/like", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const postId = c.req.param('postId');
    const { action } = await c.req.json(); // 'like' or 'unlike'
    
    const likeKey = `like:${authUser.id}:${postId}`;
    const post = await kv.get(`post:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    if (action === 'like') {
      await kv.set(likeKey, { likedAt: new Date().toISOString() });
      await kv.set(`post:${postId}`, { ...post, likes: (post.likes || 0) + 1 });
    } else {
      await kv.del(likeKey);
      await kv.set(`post:${postId}`, { ...post, likes: Math.max(0, (post.likes || 0) - 1) });
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Like/unlike error:', error);
    return c.json({ error: 'Failed to like/unlike post' }, 500);
  }
});

// Check if post is liked
app.get("/make-server-f68befbc/posts/:postId/liked", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ isLiked: false });
    }
    
    const postId = c.req.param('postId');
    const likeKey = `like:${authUser.id}:${postId}`;
    const isLiked = await kv.get(likeKey);
    
    return c.json({ isLiked: !!isLiked });
  } catch (error) {
    console.log('Check liked error:', error);
    return c.json({ isLiked: false });
  }
});

// Save/Unsave post
app.post("/make-server-f68befbc/posts/:postId/save", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const postId = c.req.param('postId');
    const { action } = await c.req.json(); // 'save' or 'unsave'
    
    const saveKey = `save:${authUser.id}:${postId}`;
    
    if (action === 'save') {
      await kv.set(saveKey, { savedAt: new Date().toISOString() });
    } else {
      await kv.del(saveKey);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Save/unsave error:', error);
    return c.json({ error: 'Failed to save/unsave post' }, 500);
  }
});

// Get saved posts
app.get("/make-server-f68befbc/posts/saved", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const saves = await kv.getByPrefix(`save:${authUser.id}:`);
    const postIds = saves.map(s => s.key.split(':')[2]);
    
    const posts = await Promise.all(
      postIds.map(id => kv.get(`post:${id}`))
    );
    
    return c.json({ posts: posts.filter(p => p !== null) });
  } catch (error) {
    console.log('Get saved posts error:', error);
    return c.json({ error: 'Failed to get saved posts' }, 500);
  }
});

// ============ COMMENT ROUTES ============

// Get comments for a post
app.get("/make-server-f68befbc/posts/:postId/comments", async (c) => {
  try {
    const postId = c.req.param('postId');
    const comments = await kv.getByPrefix(`comment:${postId}:`);
    
    const sortedComments = comments
      .map(c => c.value)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ comments: sortedComments });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: 'Failed to get comments' }, 500);
  }
});

// Create comment
app.post("/make-server-f68befbc/posts/:postId/comments", async (c) => {
  try {
    const authUser = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const postId = c.req.param('postId');
    const { content } = await c.req.json();
    const commentId = crypto.randomUUID();
    
    const comment = {
      id: commentId,
      postId,
      userId: authUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`comment:${postId}:${commentId}`, comment);
    
    // Update post comment count
    const post = await kv.get(`post:${postId}`);
    if (post) {
      await kv.set(`post:${postId}`, { ...post, comments: (post.comments || 0) + 1 });
    }
    
    return c.json({ comment });
  } catch (error) {
    console.log('Create comment error:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// ============ SEARCH ROUTE ============

app.get("/make-server-f68befbc/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    const type = c.req.query('type') || 'all'; // 'posts', 'users', or 'all'
    
    let results = { posts: [], users: [] };
    
    if (type === 'posts' || type === 'all') {
      const allPosts = await kv.getByPrefix('post:');
      results.posts = allPosts
        .map(p => p.value)
        .filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.genre.toLowerCase().includes(query)
        );
    }
    
    if (type === 'users' || type === 'all') {
      const allUsers = await kv.getByPrefix('user:');
      results.users = allUsers
        .map(u => u.value)
        .filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.bio && user.bio.toLowerCase().includes(query))
        );
    }
    
    return c.json(results);
  } catch (error) {
    console.log('Search error:', error);
    return c.json({ error: 'Failed to search' }, 500);
  }
});

Deno.serve(app.fetch);