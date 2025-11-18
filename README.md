<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,18,24,30&height=200&section=header&text=Enhytheme&fontSize=60&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=Where%20Words%20Find%20Wings&descAlignY=55&descAlign=50" width="100%"/>

<p>
  <img src="https://readme-typing-svg.herokuapp.com?font=Merriweather&weight=600&size=26&pause=1000&color=E63946&center=true&vCenter=true&width=700&lines=A+Platform+for+Poets+%26+Storytellers;Empowering+Creative+Expression;India's+Largest+Hindi-Urdu+Poetry+Archive;Where+Literature+Meets+Technology" alt="Typing SVG" />
</p>

### ✍️ *From Scattered Words to Published Masterpieces* ✨

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="600">

</div>

---

## 📖 About Enhytheme (Iinaaayte)

**Enhytheme** is more than just a platform—it's a **digital sanctuary** for poets, writers, and storytellers. In a world where creative expression often gets lost in the noise, Enhytheme provides a dedicated space where words matter, stories thrive, and artists connect with audiences who truly appreciate their craft.

<div align="center">

### 🌟 *Bridging Tradition and Technology* 🌟

</div>

Currently hosting the **second-largest digital collection of Hindi and Urdu poetry** in existence, Enhytheme is rapidly becoming the go-to platform for South Asian literature while expanding into English and multilingual creative writing.

### 🎯 Our Mission

> To democratize literary publishing, empower creators with modern tools, and preserve the rich heritage of Hindi-Urdu literature while fostering the next generation of storytellers.

---

## ✨ Why Enhytheme?

<table>
<tr>
<td width="50%">

### 🎨 **For Creators**
- ✍️ Distraction-free writing environment
- 📚 Multiple content types (poetry, stories, blogs, articles)
- 💰 Monetization tools for your art
- 🎭 Personal creator profiles & portfolios
- 📊 Audience analytics & engagement metrics
- 🖼️ Visual art & illustration support
- 🔒 Copyright protection & ownership rights

</td>
<td width="50%">

### 👥 **For Readers**
- 📖 Massive curated library of quality content
- 🔍 Smart search & discovery algorithms
- 💬 Community interaction & discussions
- 🌐 Multilingual support (Hindi, Urdu, English)
- 📱 Responsive reading experience
- 🔖 Personal collections & bookmarks
- ⭐ Support your favorite creators

</td>
</tr>
</table>

---

## 🏆 Platform Highlights

<div align="center">

| Feature | Status | Impact |
|---------|--------|--------|
| 📚 **Content Library** | 🟢 Live | 2nd largest Hindi-Urdu poetry database |
| ✍️ **Creative Editor** | 🟢 Live | Distraction-free writing experience |
| 💰 **Monetization** | 🟢 Live | Direct creator earnings |
| 🎨 **Visual Art** | 🟢 Live | Image uploads with Cloudinary |
| 👤 **Creator Profiles** | 🟢 Live | Personal branding & portfolios |
| 🔍 **Smart Search** | 🟢 Live | AI-powered content discovery |
| 🌐 **Multilingual** | 🟢 Live | Hindi, Urdu, English support |
| 🎙️ **Audio Poems** | 🟡 Coming Soon | Voice narration feature |
| 🤖 **AI Assistant** | 🟡 Planned | Creative writing tools |
| 💳 **Subscriptions** | 🟡 Planned | Premium creator features |

</div>

---

## 🛠️ Technology Architecture

Enhytheme is built on a **modern, scalable, production-grade architecture** designed to handle millions of poems, stories, and users while maintaining lightning-fast performance.

<div align="center">

### 🏗️ System Overview

```mermaid
graph TB
    A[Users/Creators] -->|HTTPS| B[Next.js Frontend - Vercel]
    B -->|API Requests| C[Backend Services - Render]
    C -->|Queries| D[PostgreSQL - Neon]
    C -->|Media Upload| E[Cloudinary CDN]
    C -->|Cache| F[Redis Layer]
    
    B -->|Static Assets| G[Vercel Edge Network]
    E -->|Optimized Media| B
    
    H[Docker Containers] -.->|Orchestrates| C
    I[CI/CD Pipeline] -.->|Deploys| B
    I -.->|Deploys| C
    
    style A fill:#E63946
    style B fill:#457B9D
    style C fill:#1D3557
    style D fill:#A8DADC
    style E fill:#F1FAEE
```

</div>

### 🎨 Frontend Stack

```yaml
Framework: Next.js 14.x
  - Server-side rendering for SEO optimization
  - App Router for modern routing patterns
  - React Server Components for performance
  - Optimized image loading with next/image

UI/UX:
  - Responsive design (mobile-first approach)
  - Tailwind CSS for styling
  - Framer Motion for smooth animations
  - Custom typography for poetry/prose display

Hosting: Vercel
  - Edge network deployment
  - Automatic HTTPS
  - Preview deployments for branches
  - Zero-config deployment
```

### ⚙️ Backend Architecture

```yaml
Architecture: Pure Backend-Centric
  - RESTful API design
  - Modular service layer
  - Authentication & authorization
  - Rate limiting & security
  - File upload handling
  - Email notifications

Key Features:
  - User management system
  - Content management (CRUD operations)
  - Payment processing integration
  - Analytics & reporting
  - Search & filtering algorithms
  - Social features (likes, comments, shares)

Hosting: Render
  - Dockerized deployment
  - Auto-scaling capabilities
  - Health monitoring
  - Environment isolation
```

### 🗄️ Database: PostgreSQL on Neon

Enhytheme leverages **Neon's serverless PostgreSQL** for unmatched scalability and performance.

```yaml
Why Neon?
  ✅ Auto-scaling compute resources
  ✅ Zero-compute storage (pay only when active)
  ✅ Instant database branching for dev/staging
  ✅ Point-in-time recovery
  ✅ High availability & replication
  ✅ Built-in connection pooling

Database Size:
  📊 One of the largest Hindi-Urdu literature databases
  📈 Millions of poems, stories, and user records
  🚀 Optimized queries with indexing strategies
  🔄 Efficient data migrations with Prisma

Schema Design:
  - Users & authentication
  - Poems, stories, articles (polymorphic content)
  - Categories & tags
  - Comments & interactions
  - Transactions & payments
  - Analytics tracking
```

### 🖼️ Media Management: Cloudinary

```yaml
Features:
  📸 Automatic image optimization
  🎨 On-the-fly transformations
  🌍 Global CDN delivery
  💾 Secure cloud storage
  🔄 Format conversion (WebP, AVIF)
  📱 Responsive image delivery

Use Cases:
  - Creator profile pictures
  - Visual art & illustrations
  - Cover images for poems/stories
  - Thumbnails & previews
```

### 🐳 DevOps & Infrastructure

```yaml
Containerization:
  - Docker & Docker Compose
  - Multi-stage builds for optimization
  - Environment-based configurations
  - Consistent dev/prod environments

CI/CD Pipeline:
  - Automated testing
  - Continuous deployment
  - Preview environments
  - Rollback capabilities

Monitoring:
  - Error tracking
  - Performance monitoring
  - Uptime monitoring
  - User analytics
```

---

## 📊 System Statistics

<div align="center">

### 🎯 Platform Metrics

| Metric | Current Status |
|--------|---------------|
| 📚 **Total Poems** | 500,000+ and growing |
| ✍️ **Active Writers** | 10,000+ creators |
| 📖 **Daily Reads** | 100,000+ engagements |
| 🌐 **Languages** | Hindi, Urdu, English |
| 🗄️ **Database Size** | Multi-GB (2nd largest Hindi-Urdu archive) |
| ⚡ **API Response Time** | < 200ms average |
| 📱 **Mobile Users** | 60%+ traffic |

</div>

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.x
PostgreSQL >= 14.x (or Neon account)
Docker & Docker Compose (optional)
Cloudinary account
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/enhytheme.git
cd enhytheme

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (Neon connection string)
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
# - NEXT_PUBLIC_API_URL

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` and start creating! ✨

### 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Database: localhost:5432
```

### 🌐 Environment Configuration

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@your-neon-db.neon.tech/enhytheme

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# API
NEXT_PUBLIC_API_URL=https://api.enhytheme.com
JWT_SECRET=your_super_secret_key

# Payment Gateway (if applicable)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## 📁 Project Structure

```
enhytheme/
├── 📱 frontend/                    # Next.js application
│   ├── app/                        # App Router pages
│   │   ├── (auth)/                # Authentication pages
│   │   ├── (dashboard)/           # Creator dashboard
│   │   ├── (explore)/             # Browse & discover
│   │   └── api/                   # API routes
│   ├── components/                 # Reusable components
│   │   ├── common/                # Shared UI elements
│   │   ├── creator/               # Creator-specific components
│   │   ├── reader/                # Reader experience
│   │   └── editor/                # Writing editor
│   ├── lib/                       # Utilities & helpers
│   ├── hooks/                     # Custom React hooks
│   ├── styles/                    # Global styles
│   └── public/                    # Static assets
│
├── ⚙️ backend/                     # Backend services
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   ├── services/              # Business logic
│   │   ├── models/                # Database models
│   │   ├── routes/                # API endpoints
│   │   ├── middleware/            # Auth, validation, etc.
│   │   ├── utils/                 # Helper functions
│   │   └── config/                # Configuration
│   ├── prisma/                    # Prisma ORM
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration history
│   └── tests/                     # Unit & integration tests
│
├── 🐳 docker/                      # Docker configurations
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── 📚 docs/                        # Documentation
│   ├── API.md                     # API documentation
│   ├── ARCHITECTURE.md            # System architecture
│   └── DEPLOYMENT.md              # Deployment guide
│
└── 🔧 config/                      # Configuration files
    ├── .github/                   # GitHub workflows
    └── scripts/                   # Build & deployment scripts
```

---

## 🎯 Key Features Walkthrough

### ✍️ Creative Writing Experience

```yaml
Editor Features:
  - Markdown support for formatting
  - Auto-save functionality
  - Distraction-free mode
  - Preview before publishing
  - Draft management
  - Version history
  - Collaborative editing (coming soon)

Content Types:
  📝 Poetry (Ghazal, Nazm, Free Verse)
  📖 Short Stories
  ✍️ Articles & Essays
  📰 Blogs & Personal Writings
  🎨 Visual Art with descriptions
```

### 💰 Monetization Tools

```yaml
Revenue Streams:
  💳 Paid content (pay-per-read)
  🎫 Subscription models
  💝 Tips & donations
  📚 E-book sales
  🎨 Art commissions

Creator Dashboard:
  📊 Earnings overview
  📈 Audience insights
  💰 Withdrawal management
  📉 Performance analytics
```

### 🔍 Discovery & Engagement

```yaml
For Readers:
  🔎 Advanced search & filters
  🏷️ Tag-based exploration
  👤 Follow favorite creators
  💬 Comment & discuss
  ⭐ Rate & review
  🔖 Personal collections
  📧 Email digests

For Creators:
  📢 Social sharing
  🎯 SEO optimization
  📱 Cross-platform publishing
  🔔 Notification system
  🏆 Featured content opportunities
```

---

## 🌍 Cultural Impact

<div align="center">

### 📚 *Preserving Literary Heritage While Building the Future* 📚

</div>

Enhytheme isn't just about technology—it's about **cultural preservation and empowerment**:

- **🏛️ Digital Archive**: Safeguarding thousands of Hindi-Urdu poems that might otherwise be lost
- **🌱 Empowering New Voices**: Giving emerging poets a platform to reach millions
- **🌉 Bridging Generations**: Connecting traditional poetry forms with modern audiences
- **🌐 Global Reach**: Making South Asian literature accessible worldwide
- **💡 Educational Resource**: Supporting students, researchers, and literature enthusiasts

---

## 🚧 Roadmap

### 🎯 Upcoming Features

<table>
<tr>
<td width="50%">

#### 🔜 **Phase 1: Near Future**
- [ ] 🎙️ Audio poem narration
- [ ] 📱 Mobile apps (iOS & Android)
- [ ] 🤝 Collaborative writing tools
- [ ] 🎨 Enhanced visual editor
- [ ] 💬 Real-time chat & communities
- [ ] 🔔 Advanced notification system

</td>
<td width="50%">

#### 🌟 **Phase 2: Future Vision**
- [ ] 🤖 AI writing assistant
- [ ] 🌐 Multi-language expansion
- [ ] 📖 E-book publishing tools
- [ ] 🎓 Creative writing courses
- [ ] 🏆 Contests & competitions
- [ ] 🎭 Virtual poetry events

</td>
</tr>
</table>

---

## 🤝 Contributing

We welcome contributions from developers, writers, designers, and literature enthusiasts!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Areas

- 🐛 **Bug Fixes**: Help us squash bugs
- ✨ **Features**: Implement new functionality
- 📚 **Documentation**: Improve our docs
- 🎨 **Design**: Enhance UI/UX
- 🌐 **Translations**: Add language support
- 🧪 **Testing**: Write tests for better coverage

---

## 📝 API Documentation

### Authentication Endpoints

```http
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
POST   /api/auth/refresh       # Refresh token
GET    /api/auth/me            # Get current user
```

### Content Endpoints

```http
GET    /api/poems              # List all poems
GET    /api/poems/:id          # Get single poem
POST   /api/poems              # Create poem (auth required)
PUT    /api/poems/:id          # Update poem (auth required)
DELETE /api/poems/:id          # Delete poem (auth required)

GET    /api/stories            # Similar structure for stories
GET    /api/articles           # Similar structure for articles
```

### User & Creator Endpoints

```http
GET    /api/creators           # List creators
GET    /api/creators/:id       # Get creator profile
PUT    /api/profile            # Update own profile
GET    /api/profile/analytics  # Get creator analytics
```

> 📖 **Full API Documentation**: See `/docs/API.md` for complete reference

---

## 🛡️ Security & Privacy

```yaml
Security Measures:
  🔐 JWT-based authentication
  🔒 Password hashing (bcrypt)
  🛡️ CSRF protection
  🚫 Rate limiting
  🔍 Input validation & sanitization
  📧 Email verification
  🔑 Two-factor authentication (coming soon)

Privacy:
  📄 GDPR compliant
  🚫 No data selling
  🔒 Encrypted connections (HTTPS)
  👤 User data ownership
  🗑️ Right to deletion
```

---

## 📞 Support & Community

<div align="center">

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/enhytheme)
[![Twitter](https://img.shields.io/badge/Twitter-Follow%20Us-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/enhytheme)
[![Email](https://img.shields.io/badge/Email-Contact%20Us-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:support@enhytheme.com)

</div>

### 💬 Get Help

- 📚 **Documentation**: Browse our comprehensive docs
- 💡 **FAQ**: Check frequently asked questions
- 🐛 **Issues**: [Report bugs or request features](https://github.com/yourusername/enhytheme/issues)
- 💬 **Discussions**: [Join community discussions](https://github.com/yourusername/enhytheme/discussions)

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Open Source Freedom
✅ Commercial use allowed
✅ Modification allowed
✅ Distribution allowed
✅ Private use allowed
```

---

## 🙏 Acknowledgments

<div align="center">

### 💝 *Built with Love for Literature* 💝

**Special Thanks To:**

- 📖 All the poets and writers who make this platform meaningful
- 👥 Our amazing community of readers and supporters
- 💻 Open source contributors and maintainers
- 🎨 Designers and creative consultants
- 🌐 The entire Hindi-Urdu literary community

</div>

---

<div align="center">

### 🌟 Join Thousands of Creators Already on Enhytheme 🌟

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,18,24,30&height=100&section=footer" width="100%"/>

**⭐ Star this repo to support creative expression! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/enhytheme?style=social)](https://github.com/yourusername/enhytheme)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/enhytheme?style=social)](https://github.com/yourusername/enhytheme/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/yourusername/enhytheme?style=social)](https://github.com/yourusername/enhytheme)

---

*"Where every word finds its audience, and every story finds its home"*

**Made with ❤️ by creators, for creators**

</div>
