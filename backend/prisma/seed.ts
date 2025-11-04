import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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
      { title: 'Inayate Notebook', description: 'Hardbound notebook for poetry', price: 49900, image: null },
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
