# Inayate - Poetry Sharing Platform

A beautiful, full-featured poetry sharing platform inspired by Poetistic.com, built with React, TypeScript, Tailwind CSS, and Supabase.

## 🌟 Features

### Core Pages

#### 1. **Authentication**
- Beautiful login and signup pages with Google OAuth support
- Poetry-themed design with inspirational quotes
- Secure authentication powered by Supabase Auth

#### 2. **Home Feed**
- Display all poetry posts sorted by newest
- Interactive post cards with like, comment, and share buttons
- Genre tags and user avatars
- Infinite scroll support
- Clean, readable typography

#### 3. **Explore Page**
- Trending poems section (sorted by likes)
- Top poets leaderboard
- Browse by genre (Ghazal, Shayari, Free Verse, Haiku, etc.)
- Popular tags and hashtags
- Community statistics
- **Featured Daily Poem banner** - Click to see the poem of the day

#### 4. **Post Details**
- Full poem display with large, readable font
- Author information and follow button
- Like, comment, share, and save functionality
- Real-time comment section
- Related poems suggestions based on genre
- Engagement metrics

#### 5. **User Profile**
- Beautiful banner with gradient
- Profile avatar, bio, and stats (followers, following, poems)
- Tabbed interface:
  - **Poems** - All user's published poems
  - **About** - User biography and details
  - **Saved** - Bookmarked poems
- Follow/unfollow functionality

#### 6. **Write/Create**
- Minimal, distraction-free editor
- Title input with AI suggestion feature
- Genre selection dropdown
- Large textarea for poem content
- Live word and line count
- **"Polish My Writing"** AI feature (placeholder)
- **"Suggest a Better Title"** AI feature
- Save as draft or publish
- Writing tips sidebar

#### 7. **Search**
- Global search across poems and poets
- Real-time search results
- Tabbed results (All, Poems, Poets)
- Search by title, content, genre, username, or bio
- Clean result cards with relevant information

#### 8. **Notifications**
- Activity feed showing:
  - Likes on your poems
  - Comments on your poems
  - New followers
  - Mentions and tags
- Unread indicator
- Filter by all or unread
- Mark as read functionality

#### 9. **Collections/Reading Lists**
- Create custom poetry collections
- Public or private collections
- Beautiful cover images
- Organize favorite poems
- Collection management (add/remove poems)
- Share collections with community

#### 10. **Daily/Featured Poem**
- Poem of the day showcase
- Beautiful gradient background
- Large, centered typography for optimal reading
- Author spotlight
- Engagement metrics
- "Why This Poem?" editorial section
- Previous featured poems archive
- Email subscription for daily poems

#### 11. **Settings**
- Tabbed interface:
  - **Profile** - Edit name, username, bio, avatar, password
  - **Notifications** - Customize notification preferences
  - **Appearance** - Theme selection (light/dark/auto), font size
  - **Privacy** - Private account, blocked users, data management
- Account deletion option
- Data export functionality

### Design & UX

- **Color Palette**: Soft pastels (rose, blush pink, soft beige, muted blue)
- **Typography**: 
  - Playfair Display for poetry titles (serif)
  - Inter/Poppins for UI elements (sans-serif)
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper contrast, keyboard navigation
- **Visual Elements**: 
  - Rounded corners throughout
  - Soft shadows
  - Gradient backgrounds
  - Ring effects on avatars

### Technical Features

#### Backend (Supabase Edge Functions + Hono)

**Authentication Routes:**
- `POST /auth/signup` - Create new user account

**User Routes:**
- `GET /users/:userId` - Get user profile
- `PUT /users/:userId` - Update user profile
- `POST /users/:userId/follow` - Follow/unfollow user
- `GET /users/:userId/following` - Check if following

**Post Routes:**
- `GET /posts` - Get all posts (with pagination, filters)
- `GET /posts/:postId` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/:postId` - Update post
- `DELETE /posts/:postId` - Delete post
- `POST /posts/:postId/like` - Like/unlike post
- `GET /posts/:postId/liked` - Check if post is liked
- `POST /posts/:postId/save` - Save/unsave post
- `GET /posts/saved` - Get saved posts

**Comment Routes:**
- `GET /posts/:postId/comments` - Get comments for post
- `POST /posts/:postId/comments` - Create comment

**Search Route:**
- `GET /search?q=query&type=all|posts|users` - Search posts and users

#### Frontend

- **State Management**: React hooks (useState)
- **Routing**: Custom page-based navigation
- **API Layer**: Centralized API utilities (`/utils/api.ts`)
- **Supabase Client**: Singleton pattern with auth persistence
- **UI Components**: Shadcn/ui component library
- **Icons**: Lucide React
- **Form Handling**: Controlled components

### Data Storage

Using Supabase KV Store (key-value table):

- `user:{userId}` - User profiles
- `post:{postId}` - Poetry posts
- `comment:{postId}:{commentId}` - Comments
- `like:{userId}:{postId}` - User likes
- `save:{userId}:{postId}` - Saved posts
- `follow:{userId}:{targetUserId}` - Follow relationships

### Navigation Structure

```
├── Home Feed
├── Explore
│   └── Daily Poem ⭐
├── Search
├── Write/Create
├── Notifications
├── Profile Dropdown
│   ├── My Profile
│   ├── My Collections
│   ├── Settings
│   └── Log Out
```

## 🚀 Getting Started

The application is ready to use with:
- Pre-configured Supabase connection
- Complete backend API
- All frontend pages implemented
- Mock data for development

## 📝 Future Enhancements

Potential features to add:
- Real-time notifications with Supabase Realtime
- Poetry contests and challenges
- Audio recordings of poems
- Multiple language support (Urdu, Hindi, Arabic, etc.)
- Social sharing integrations
- Poetry analytics for authors
- Collaborative poems
- Poetry workshops and events

## 🎨 Inspired By

This project takes inspiration from:
- **Poetistic.com** - Poetry sharing and community
- **Medium** - Reading experience and typography
- **Twitter** - Social interactions and engagement

## 📄 License

Built with ❤️ for poets, writers, and dreamers everywhere.
