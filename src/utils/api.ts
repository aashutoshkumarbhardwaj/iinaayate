import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f68befbc`;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  async signup(email: string, password: string, username: string, name: string) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, name }),
    });
  },
};

// User API
export const userAPI = {
  async getUser(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  async updateUser(userId: string, updates: any) {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async follow(userId: string) {
    return apiRequest(`/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ action: 'follow' }),
    });
  },

  async unfollow(userId: string) {
    return apiRequest(`/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ action: 'unfollow' }),
    });
  },

  async isFollowing(userId: string) {
    return apiRequest(`/users/${userId}/following`);
  },
};

// Post API
export const postAPI = {
  async getPosts(params?: { limit?: number; offset?: number; genre?: string; userId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.genre) queryParams.set('genre', params.genre);
    if (params?.userId) queryParams.set('userId', params.userId);

    const queryString = queryParams.toString();
    return apiRequest(`/posts${queryString ? `?${queryString}` : ''}`);
  },

  async getPost(postId: string) {
    return apiRequest(`/posts/${postId}`);
  },

  async createPost(title: string, content: string, genre: string) {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, genre }),
    });
  },

  async updatePost(postId: string, updates: any) {
    return apiRequest(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deletePost(postId: string) {
    return apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  async likePost(postId: string) {
    return apiRequest(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ action: 'like' }),
    });
  },

  async unlikePost(postId: string) {
    return apiRequest(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ action: 'unlike' }),
    });
  },

  async isLiked(postId: string) {
    return apiRequest(`/posts/${postId}/liked`);
  },

  async savePost(postId: string) {
    return apiRequest(`/posts/${postId}/save`, {
      method: 'POST',
      body: JSON.stringify({ action: 'save' }),
    });
  },

  async unsavePost(postId: string) {
    return apiRequest(`/posts/${postId}/save`, {
      method: 'POST',
      body: JSON.stringify({ action: 'unsave' }),
    });
  },

  async getSavedPosts() {
    return apiRequest('/posts/saved');
  },
};

// Comment API
export const commentAPI = {
  async getComments(postId: string) {
    return apiRequest(`/posts/${postId}/comments`);
  },

  async createComment(postId: string, content: string) {
    return apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// Search API
export const searchAPI = {
  async search(query: string, type: 'all' | 'posts' | 'users' = 'all') {
    const params = new URLSearchParams({ q: query, type });
    return apiRequest(`/search?${params.toString()}`);
  },
};
