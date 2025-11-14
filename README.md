🎙️ Inayate — Poetry Sharing Platform (Beautiful, Light, & Social)

Inayate — where words meet people. A warm, minimalist social platform for poets to write, share, score, and celebrate poetry. Built with modern serverless tools, media handled by Cloudinary, a Postgres DB on Neon, backend deployed on Render, and the frontend hosted on Vercel (I interpreted “Varsal” as Vercel — if that’s different for you I can swap names everywhere).

<p align="center"> <!-- Banner (place this file at assets/banner.svg in your repo) --> <img src="./assets/banner.svg" alt="Inayate — Banner" width="900" style="max-width:100%; border-radius:12px; box-shadow:0 12px 40px rgba(12,20,50,0.12)"/> </p> <div align="center"> <img src="https://img.shields.io/badge/Platform-Inayate-ff6b6b?style=for-the-badge" alt="Inayate"/> <img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge" alt="Vercel"/> <img src="https://img.shields.io/badge/Backend-Render-00C2FF?style=for-the-badge" alt="Render"/> <img src="https://img.shields.io/badge/DB-Neon%20(Postgres)-3DDC84?style=for-the-badge" alt="Neon"/> <img src="https://img.shields.io/badge/Media-Cloudinary-2A73CC?style=for-the-badge" alt="Cloudinary"/> </div>
✨ Elevator pitch

Inayate is a calm, beautiful, and social-first poetry platform where users can:

Sign up quickly and create a profile (photo, bio, links)

Write, save, and publish poems (with optional privacy/drafts)

Upload a cover image for poems (Cloudinary)

Score and comment on poems (community rating + reactions)

Follow other poets, collect favorites, and view curated feeds

It’s built with modern, cost-efficient hosting and serverless tooling so you can scale without drama.

🎯 Core features (highlight)

✍️ Create & Publish Poems — rich-text markdown support + optional cover photo

❤️ React / Score — hearts, clap, numeric rating (1–5) plus short reviews

🧑‍🤝‍🧑 Social — follow/unfollow, personal timeline, trending poems

🗄️ Drafts & Collections — save drafts, create collections/anthologies

🔒 Privacy controls — private poems, followers-only posts, public posts

🖼️ Media uploads — Cloudinary for responsive images, auto-optimization, and transformations

⚡ Fast, mobile-first UI — lightweight, accessible, and delightful on phones

📈 Analytics — per-poem views, likes, and score trends (admin dashboard later)

🏗️ Tech stack & architecture (high level)
[User device]  <--HTTPS-->  [Vercel Frontend (Next.js / React)]
                                    |
                                    |  REST / GraphQL API
                                    |
                                [Render Backend (FastAPI / Node / Django)]
                                    |
                +-------------------+-------------------+
                |                                       |
        [Neon — Serverless Postgres]               [Cloudinary — media storage]
                |
            (SQL / Prisma / Hasura)


Key notes:

Frontend: Hosted on Vercel (fast global CDN + previews)

Backend: APIs, auth, and worker tasks on Render (web services & background jobs)

Database: Neon (serverless Postgres) — branches for safe staging + dev

Media: Cloudinary — serves images, transformations, responsive images, and CDN caching

Optional: Use Redis for caching (sessions, rate-limits) if needed; background tasks via Render workers or serverless functions.

🧩 Data model (concise)

Here’s a minimal schema to get started — PostgreSQL / Prisma / SQL style:

Users

id UUID PRIMARY KEY
username TEXT UNIQUE
email TEXT UNIQUE
password_hash TEXT
display_name TEXT
bio TEXT
avatar_url TEXT (Cloudinary)
created_at TIMESTAMP


Poems

id UUID PRIMARY KEY
author_id UUID REFERENCES users(id)
title TEXT
slug TEXT UNIQUE
body TEXT  -- markdown
cover_image_url TEXT (Cloudinary)
is_draft BOOLEAN
is_private BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP


Reactions / Scores

id UUID PRIMARY KEY
poem_id UUID REFERENCES poems(id)
user_id UUID REFERENCES users(id)
rating INTEGER  -- 1..5
reaction_type TEXT -- 'clap','heart','bookmark'
comment TEXT
created_at TIMESTAMP


Follows

follower_id UUID REFERENCES users(id)
followee_id UUID REFERENCES users(id)
created_at TIMESTAMP
PRIMARY KEY (follower_id, followee_id)

🔐 Auth & Security

Use JWT or a secure session store (Rotate refresh tokens, HTTP-only cookies).

Store secrets in environment variables (Vercel/Render/Neon dashboards).

Validate/limit media uploads (type, size) and use Cloudinary upload presets.

Rate-limit comment/post endpoints and sanitize markdown (prevent XSS).

Use HTTPS and enforce HSTS for all domains.

📦 Repo layout (suggested)
inayate/
├─ assets/
│  ├─ banner.svg
│  └─ ui-icons/ (svg/png)
├─ frontend/            # Next.js (Vercel)
│  ├─ public/
│  └─ src/
├─ backend/             # FastAPI / Node / Django (Render)
│  ├─ app/
│  └─ workers/
├─ infra/               # terraform / pulumi / deployment scripts
├─ scripts/             # migration / seed / gif generation
├─ examples/            # sample poems, demo screenshots/gif
├─ README.md
└─ requirements.txt / package.json

🚀 Quickstart — run locally (developer)

Clone:

git clone https://github.com/yourusername/inayate.git
cd inayate


Create .env files (frontend & backend). Sample .env.example:

# Backend
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=yyyyy
JWT_SECRET=super_secret_here
SENTRY_DSN= (optional)


Backend (example with Python):

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# run migrations, seed data
alembic upgrade head
uvicorn app.main:app --reload


Frontend:

cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev


Cloudinary:

Create a Cloudinary account and set CLOUDINARY_ env vars in Render/Vercel.

Use upload presets to allow unsigned uploads from the client (if you prefer) or route uploads through a signed backend endpoint.

📸 Images, SVGs & UI polish (what I’ll add for you)

You asked for a light, elegant look with PNGs/SVGs/animations. I’ll include:

A light SVG banner (assets/banner.svg) — subtle gradients and a poetic motif.

UI icons (SVGs) for reactions, score badges, and profile placeholders.

A demo GIF showing creating + scoring a poem (examples/demo_publish.gif).

Two meme-style PNGs for README flavor (optional): assets/memes/celebrate.png & assets/memes/relatable.png.

(If you want, I can generate these assets now and put them into a downloadable ZIP.)

🧪 Monitoring & analytics

Use Cloudinary analytics for image performance and caching.

Simple request logs + Sentry for error monitoring.

Optional: integrate Plausible / Fathom or Google Analytics for visit tracking (respect privacy — give users opt-out).

📈 Roadmap (nice-to-have)

🔍 Full-text search & poem tagging (Elasticsearch or Postgres full-text)

🤖 AI-powered suggestions (title suggestions, tone analysis) — optional feature later

🏆 Weekly featured poet & curated collections

🎨 Theming + reader modes (light/dim/sepia)

🔁 Cross-posting / export to PDF / printable anthology

♻️ Scaling & costs (practical notes)

Neon (serverless Postgres) auto-scales and has a friendly free tier — good for early growth.

Cloudinary costs grow with bandwidth & transformations — use caching and size transforms wisely.

Render for backend hosting is predictable; use autoscale carefully to avoid surprises.

Vercel handles global CDN and previews — great for frontend.

🤝 Contributors — how to help

Fork the repo

Create a feature branch feature/your-idea

Add tests (unit tests for backend; Cypress/Playwright for frontend flows)

Open a PR with a clear description + screenshots/gif demo

🧾 Legal & privacy

Add a clean Privacy Policy explaining how images are stored (Cloudinary), how user data is used, and opt-out paths.

Add a Terms of Service with content moderation policies and DMCA takedown process.

Consider automated content moderation (rate-limits, human flagging, offensive content reports).

❤️ Readable README snippet (copy-paste)
# Inayate — Poetry for People

Inayate is a lightweight social platform for poets — write, share, score, and collect. Built with Next.js on Vercel, a Render backend, Neon Postgres, and Cloudinary for media.

## Quickstart
1. Clone repo
2. Fill .env from .env.example
3. `cd backend && pip install -r requirements.txt && alembic upgrade head`
4. `cd frontend && npm install && npm run dev`
