import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Helper to slugify usernames
  const toUsername = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 30) || 'poet';

  // Import CSV helper (expects headers: misra1,misra2,poet)
  const importCsvPoetry = async (csvPath: string, genre: string) => {
    if (!fs.existsSync(csvPath)) return;
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split(/\r?\n/).filter((l: string) => l !== undefined && l !== null && l.length > 0);
    if (!lines || lines.length <= 1) return;
    const headerLine = lines[0] ?? '';
    if (!headerLine) return;
    const cleanHeaderLine = headerLine.replace(/^\uFEFF/, '');
    const header = cleanHeaderLine.split(',').map((h: string) => h.trim().toLowerCase());
    const i1 = header.indexOf('misra1');
    const i2 = header.indexOf('misra2');
    const ip = header.indexOf('poet');
    if (i1 === -1 || i2 === -1 || ip === -1) return;

    // Process rows
    const rows = lines.slice(1);
    let created = 0;
    for (const line of rows) {
      // Split into exactly three columns: misra1, misra2, poet
      const c1 = line.indexOf(',');
      if (c1 === -1) continue;
      const c2 = line.indexOf(',', c1 + 1);
      if (c2 === -1) continue;
      const cols = [
        line.slice(0, c1),
        line.slice(c1 + 1, c2),
        line.slice(c2 + 1),
      ];
      const misra1 = (cols[i1] || '').trim();
      const misra2 = (cols[i2] || '').trim();
      const poet = (cols[ip] || '').trim() || 'Unknown Poet';
      if (!misra1 && !misra2) continue;

      // Upsert poet user (by synthetic email)
      const username = toUsername(poet);
      const email = `${username || 'poet'}@poets.local`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { name: poet, username },
        create: {
          email,
          passwordHash: await bcrypt.hash('password123', 10),
          username,
          name: poet,
        },
      });

      const title = misra1.slice(0, 80) || `${genre} by ${poet}`;
      const content = [misra1, misra2].filter(Boolean).join('\n');
      try {
        await prisma.post.create({
          data: {
            userId: user.id,
            title,
            content,
            genre,
          },
        });
        created += 1;
      } catch {}
    }
    console.log(`Imported ${created} ${genre} rows from ${path.basename(csvPath)}`);
  };

  // Import folder dataset: dataset/<poet>/<lang>/* (files contain poem text)
  const importFolderDataset = async (rootDir: string) => {
    if (!fs.existsSync(rootDir)) return;
    const poets = fs.readdirSync(rootDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    let created = 0;
    const batchSize = 500;
    let buffer: Array<{ userId: string; title: string; content: string; genre: string }> = [];
    const userIdCache = new Map<string, string>();
    for (const poetFolder of poets) {
      const poetName = poetFolder.replace(/-/g, ' ').replace(/\s+/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
      const poetDir = path.join(rootDir, poetFolder);
      const langs = ['ur', 'hi', 'en'].filter(l => fs.existsSync(path.join(poetDir, l)) && fs.statSync(path.join(poetDir, l)).isDirectory());
      // Upsert poet once
      const username = toUsername(poetName);
      const email = `${username || 'poet'}@poets.local`;
      let userId = userIdCache.get(email) || '';
      if (!userId) {
        const user = await prisma.user.upsert({
          where: { email },
          update: { name: poetName, username },
          create: { email, passwordHash: await bcrypt.hash('password123', 10), username, name: poetName },
        });
        userId = user.id;
        userIdCache.set(email, userId);
      }
      for (const lang of langs) {
        const langDir = path.join(poetDir, lang);
        const files = fs.readdirSync(langDir, { withFileTypes: true }).filter(f => f.isFile()).map(f => f.name);
        for (const fname of files) {
          try {
            const fpath = path.join(langDir, fname);
            const raw = fs.readFileSync(fpath, 'utf8');
            const content = raw.trim();
            if (!content) continue;
            const firstLine = content.split(/\r?\n/, 1)[0] || '';
            const title = (firstLine || fname.replace(/\.[^.]+$/, '')).slice(0, 100);
            buffer.push({ userId, title, content, genre: lang.toUpperCase() });
            if (buffer.length >= batchSize) {
              try { await prisma.post.createMany({ data: buffer }); created += buffer.length; } catch {}
              buffer = [];
            }
          } catch {}
        }
      }
    }
    if (buffer.length) {
      try { await prisma.post.createMany({ data: buffer }); created += buffer.length; } catch {}
    }
    console.log(`Imported ${created} posts from dataset at ${rootDir}`);
  };

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  const u1 = await prisma.user.upsert({
    where: { email: 'poet1@example.com' },
    update: {},
    create: {
      email: 'poet1@example.com',
      passwordHash,
      username: 'poet1',
      name: 'Poet One',
      avatar: null,
      bio: 'Lover of ghazals and nazms.'
    },
    
  });
  const u2 = await prisma.user.upsert({
    where: { email: 'poet2@example.com' },
    update: {},
    create: {
      email: 'poet2@example.com',
      passwordHash,
      username: 'poet2',
      name: 'Poet Two',
      avatar: null,
      bio: 'Verses under the moonlight.'
    },
  });

  // Import CSV poetry datasets once
  try {
    const dbDir = path.resolve(__dirname, '../src/database');
    await importCsvPoetry(path.join(dbDir, 'Ghazal_ur.csv'), 'Ghazal');
    await importCsvPoetry(path.join(dbDir, 'Sher_ur.csv'), 'Sher');
    await importFolderDataset(path.join(dbDir, 'dataset'));
  } catch {}

  // Create posts
  const p1 = await prisma.post.create({
    data: {
      userId: u1.id,
      title: 'Whispers of the Heart',
      content: 'In silent rooms where shadows play...',
      genre: 'Ghazal',
    },
  });
  const p2 = await prisma.post.create({
    data: {
      userId: u2.id,
      title: 'Moonlit Dreams',
      content: 'Silver threads across the lake...',
      genre: 'Nazm',
    },
  });
  const p3 = await prisma.post.create({
    data: {
      userId: u1.id,
      title: 'Echoes of Tomorrow',
      content: 'Footsteps fade into dawn...',
      genre: 'Free Verse',
    },
  });

  // Likes to influence top sorting
  await prisma.like.create({ data: { userId: u1.id, postId: p2.id } });
  await prisma.like.create({ data: { userId: u2.id, postId: p1.id } });
  await prisma.like.create({ data: { userId: u2.id, postId: p3.id } });

  // Store products
  await prisma.product.createMany({
    data: [
      { title: 'iinaayate Notebook', description: 'Hardbound notebook for poetry', price: 49900, image: null },
      { title: 'Calligraphy Pen', description: 'Elegant pen for flowing verses', price: 24900, image: null },
    ],
    skipDuplicates: true,
  });

  // Events
  await prisma.event.createMany({
    data: [
      { title: 'Open Mic Night', subtitle: 'Share your verses', startsAt: new Date(Date.now() + 86400000), location: 'Cafe Sufi', poster: null },
      { title: 'Poetry Workshop', subtitle: 'Craft your lines', startsAt: new Date(Date.now() + 172800000), location: 'Literary Hub', poster: null },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
