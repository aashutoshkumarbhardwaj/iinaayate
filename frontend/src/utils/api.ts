const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

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
    ...options.headers,
  };
  if (authToken) {
    (headers as any)['Authorization'] = `Bearer ${authToken}`;
  }

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

  async login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async me() {
    return apiRequest('/auth/me');
  },
};

// User API
export const userAPI = {
  async getUser(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  async getTopUsers() {
    return apiRequest(`/users/top`);
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
  async getPosts(params?: { limit?: number; offset?: number; genre?: string; userId?: string; mood?: string; hasAudio?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.genre) queryParams.set('genre', params.genre);
    if (params?.userId) queryParams.set('userId', params.userId);
    if (params?.mood) queryParams.set('mood', params.mood);
    if (params?.hasAudio) queryParams.set('hasAudio', 'true');

    const queryString = queryParams.toString();
    return apiRequest(`/posts${queryString ? `?${queryString}` : ''}`);
  },

  async getTopPosts() {
    return apiRequest(`/posts/top`);
  },

  async getPost(postId: string) {
    return apiRequest(`/posts/${postId}`);
  },

  async createPost(title: string, content: string, genre: string, extras?: { mood?: string; audioUrl?: string }) {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, genre, ...(extras || {}) }),
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

// Notifications API
export const notificationsAPI = {
  async get() {
    return apiRequest(`/notifications`);
  },
};

// Stats API
export const statsAPI = {
  async getCommunity() {
    return apiRequest(`/stats/community`);
  },
};

export const moodsAPI = {
  async get() {
    return apiRequest('/posts/moods');
  },
};

// Help API
export const helpAPI = {
  async getTickets() {
    return apiRequest(`/help/tickets`);
  },
  async createTicket(subject: string, message: string) {
    return apiRequest(`/help/tickets`, {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
  },
};

// Store API
export const storeAPI = {
  async getProducts() {
    return apiRequest(`/store/products`);
  },
  async createProduct(input: { title: string; description: string; price: number; image?: string; active?: boolean }) {
    return apiRequest(`/store/products`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

// Events API
export const eventsAPI = {
  async getEvents() {
    const data = await apiRequest(`/events`);
    const events = Array.isArray(data) ? data : (data?.events ?? []);
    return { events };
  },
  async getEvent(id: string) {
    return apiRequest(`/events/${id}`);
  },
  async createEvent(input: { title: string; subtitle?: string; startsAt: string; location: string; poster?: string }) {
    return apiRequest(`/events`, { method: 'POST', body: JSON.stringify(input) });
  },
};

// Collections API
export const collectionsAPI = {
  async getCollections() {
    return apiRequest(`/collections`);
  },
  async createCollection(input: { title: string; description?: string; isPublic?: boolean | 'public' | 'private' }) {
    return apiRequest(`/collections`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
