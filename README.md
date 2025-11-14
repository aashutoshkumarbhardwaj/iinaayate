🌿 Inayate — A Poetry Sharing Platform
<p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=160&section=header&text=Inayate+🖋️&fontSize=60&fontAlignY=35&desc=Share+Poetry+%7C+Discover+Voices&descAlignY=60&descAlign=50" alt="Inayate Banner" /> </p> <p align="center"> <a href="#"><img src="https://img.shields.io/badge/Frontend-Reflex%2FReact-lightgrey?style=for-the-badge&logo=python" alt="frontend" /></a> <a href="#"><img src="https://img.shields.io/badge/Media-Cloudinary-blueviolet?style=for-the-badge&logo=cloudinary" alt="cloudinary" /></a> <a href="#"><img src="https://img.shields.io/badge/Backend-Render-orange?style=for-the-badge&logo=render" alt="render" /></a> <a href="#"><img src="https://img.shields.io/badge/DB-Neon%20(Postgres)-green?style=for-the-badge&logo=postgresql" alt="neon"/></a> <a href="#"><img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="license" /></a> </p>
✨ What is Inayate?

# 🌿 Inayate — Share Poetry • Discover Voices

<p align="center">
  <img src="assets/logo-inayate.svg" alt="Inayate Logo" width="820" />
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Inayate-Share%20Poetry-ff9a9e?style=for-the-badge" alt="Inayate" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Media-Cloudinary-43e97b?style=for-the-badge&logo=cloudinary" alt="Cloudinary" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Backend-Render-F57C00?style=for-the-badge&logo=render" alt="Render" /></a>
  <a href="#"><img src="https://img.shields.io/badge/DB-Neon(Postgres)-2ECC71?style=for-the-badge&logo=postgresql" alt="Neon" /></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-6C63FF?style=for-the-badge" alt="License" /></a>
</p>

---

🌟 Key Features

✍️ Signup/login and author profiles

📝 Rich text poetry editor (supporting basic formatting)

📸 Upload profile pictures & cover art via Cloudinary

⭐ Score / upvote poems and leave comments

🔎 Browse by tags, trending, newest, or author

🔔 Notifications for new comments & follows (future)

🎥 Demo video & animated GIF preview in README for quick showcase

🎨 Live demo & Media (Add your demo video or GIF)

Recommended: upload a short demo to YouTube and a GIF screenshot for the README.
If you committed a video like demo.mp4 to the repo root, you can embed it directly (GitHub serves raw files via /raw/main/...).

YouTube clickable thumbnail (recommended):

<p align="center">
  <a href="https://youtu.be/YOUR_VIDEO_ID">
    <img src="https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg" width="800" alt="Inayate Demo" />
  </a>
  <br/>
  <em>Click to watch the Inayate demo — signup, write & share poetry ✨</em>
</p>


Inline hosted video (works if file is committed & not too large):

<p align="center">
  <video src="https://github.com/your-username/your-repo/raw/main/rsumechat.mp4" controls width="800" poster="https://img.shields.io/badge/▶️%20Watch%20Demo-Video-blueviolet?style=for-the-badge">
    Your browser does not support the video tag.
  </video>
</p>


Animated GIF preview placeholder (great for quick visual):

<p align="center">
  <img src="assets/demo-preview.gif" alt="Inayate demo" width="800" />
  <br/>
  <em>A 10–20s GIF showing user signup, writing, and scoring a poem.</em>
</p>

🧩 Tech Stack
Layer	Technology
Frontend	Reflex / React / HTML / CSS / EJS (choose what you used)
Backend	Node / Express or Reflex server (your backend)
Media	Cloudinary (image uploads & transforms)
Hosting (Frontend)	Vercel (or your chosen host)
Hosting (Backend)	Render
Database	Neon (Postgres)
Auth	JWT or OAuth (GitHub/Google optional)
📂 Project Structure (example)
Inayate/
├─ public/                # Static assets (images, css, js)
├─ src/
│  ├─ frontend/           # Reflex/React app
│  └─ backend/            # API (Express/Reflex)
├─ server/                # render.toml / server files
├─ scripts/               # deployment scripts
├─ README.md
└─ package.json / pyproject.toml

⚙️ Quickstart — Local Development

Make sure you have Node (or Python for Reflex), npm/pip, and git installed.

Clone

git clone https://github.com/YOUR_USERNAME/INAYATE_REPO.git
cd INAYATE_REPO


Environment variables

Create a .env file in the backend root:

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

DATABASE_URL=postgres://user:pass@host:port/dbname   # Neon Postgres URL
JWT_SECRET=your_jwt_secret
NEXTAUTH_URL=http://localhost:3000   # if using NextAuth / OAuth


Install & run

For Node/Express backend:

cd backend
npm install
npm run dev    # or npm start


For Reflex / Python frontend:

cd frontend
pip install -r requirements.txt
reflex run


Open http://localhost:3000 (or whatever port shown).

☁️ Cloudinary — Uploads & Transformations

Configure your Cloudinary account and copy the cloud_name, api_key, and api_secret to .env.

Upload from frontend via signed uploads (recommended) or backend proxy.

Use Cloudinary transformations to optimize images (resize, format=auto, quality=auto) for fast load and beautiful previews:

// Example image URL pattern
https://res.cloudinary.com/<cloud_name>/image/upload/q_auto,f_auto,w_800/<public_id>.jpg

🚀 Deploying to Production
Frontend (Vercel)

Connect your GitHub repo to Vercel.

Add environment variables in Vercel dashboard (same keys as .env).

Deploy — Vercel creates preview & production URLs automatically.

Backend (Render)

Create a new Web Service on Render and link to the repo’s backend folder.

Add environment variables in Render’s dashboard.

Set start command (e.g. npm start or python main.py).

Deploy — note the service URL for the frontend API endpoint.

Database (Neon / Postgres)

Create a Neon project and a database.

Get the connection string and set DATABASE_URL in Render and Vercel envs.

Run migrations:

# Example: using knex or prisma
npx prisma migrate deploy
# or
npx sequelize db:migrate

🔒 Auth & Security Tips

Never commit .env files. Use secrets in Vercel/Render.

Use signed Cloudinary uploads (server creates upload signature).

Validate & sanitize user input to prevent XSS in poem content.

Rate-limit write endpoints if needed (to avoid spam).

🧠 Design & UX Notes (Make it feel nice)

Use a minimal, airy layout with lots of whitespace — let poetry breathe.

Use a soft gradient palette for headers (soft lilac → peach → teal).

Use Cloudinary to auto-generate story-like thumbnails for poems.

Provide an inline poem editor with live preview and simple markdown support.

Include poet profile cards with avatar, bio, follower numbers & top poems.

🗺 Architecture Overview
[User Browser] <---> [Vercel Frontend] <---> [Render Backend API] <---> [Neon Postgres]
                                       \
                                        --> [Cloudinary] (images)

📸 Screenshots & Media (suggestion)

Add a /assets folder with:

screenshot-home.png — homepage

screenshot-editor.png — editor UI

demo-preview.gif — 10–20s GIF of flow

Then reference them in README:

![Home screenshot](assets/screenshot-home.png)
![Editor](assets/screenshot-editor.png)

🧪 Tests (optional)

Add unit & integration tests for:

Auth flows

Poem CRUD operations (create/read/update/delete)

Image upload flow (Cloudinary signed uploads)

Score/upvote logic (no multiple votes from same user)

🤝 Contributing

Contributions are welcome!

Fork → Create a new branch → Submit PR

Please open issues for feature requests or bugs.

Suggested labels:

good first issue for newcomers

feature for new ideas

bug for reproducible problems

🧾 License & Credits

MIT License © 2025 Your Name

Special thanks to:

Cloudinary (media), Neon (Postgres), Render (backend hosting), Vercel (frontend hosting)

📬 Contact / Social

If you want to reach out:

Email: youremail@example.com

Twitter: @yourhandle

GitHub: https://github.com/yourusername

🔮 Final Touch — Fancy README snippet to paste right near top
<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Inayate-Share%20Poetry-ff7eb3?style=for-the-badge&logo=poetry" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Media-Cloudinary-43e97b?style=for-the-badge&logo=cloudinary" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Host-Vercel-00c9ff?style=for-the-badge&logo=vercel" /></a>
</p>

