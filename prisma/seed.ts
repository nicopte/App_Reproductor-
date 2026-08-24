import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.podcastComment.deleteMany();
  await prisma.podcastRating.deleteMany();
  await prisma.reproduction.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.episodeCategory.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.podcast.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Tecnología' } }),
    prisma.category.create({ data: { name: 'Cultura' } }),
    prisma.category.create({ data: { name: 'Entrevistas' } }),
    prisma.category.create({ data: { name: 'Educación' } }),
  ]);

  // Create User
  const demoPasswordHash = await bcrypt.hash('demo123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@mp3db.com',
      password: demoPasswordHash,
    },
  });

  const audioUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  ];

  // Create Podcasts
  const podcasts = await Promise.all([
    prisma.podcast.create({
      data: {
        title: 'Sonidos del Mundo',
        description: 'Exploramos cultura y actualidad de diferentes rincones del planeta.',
        userId: user.id,
      },
    }),
    prisma.podcast.create({
      data: {
        title: 'Detrás del Escenario',
        description: 'Entrevistas con creadores e invitados interesantes.',
        userId: user.id,
      },
    }),
    prisma.podcast.create({
      data: {
        title: 'Ritmo y Tecnología',
        description: 'Cómo la tecnología transforma el día a día.',
        userId: user.id,
      },
    }),
  ]);

  // Create Episodes
  const episodeData = [
    { podcastIdx: 0, title: 'El Tango en Buenos Aires', description: 'Un viaje por los barrios porteños.', duration: 1842 },
    { podcastIdx: 0, title: 'Historias de Panamá al Mundo', description: 'Historias que conquistaron el planeta.', duration: 2234 },
    { podcastIdx: 0, title: 'Un Fenómeno Global', description: 'Cómo algo local se convierte en fenómeno mundial.', duration: 1956 },
    { podcastIdx: 1, title: 'Entrevista con una creadora', description: 'Nos cuenta sobre su nuevo proyecto.', duration: 3421 },
    { podcastIdx: 1, title: 'La vida detrás de cámara', description: 'Un productor habla sobre su carrera.', duration: 2890 },
    { podcastIdx: 2, title: 'IA en el día a día', description: 'Cómo la inteligencia artificial cambia todo.', duration: 2100 },
    { podcastIdx: 2, title: 'El futuro del Streaming', description: 'Tendencias y predicciones para la industria.', duration: 1876 },
    { podcastIdx: 2, title: 'Producción en Casa', description: 'Equipamiento y software para producir contenido.', duration: 2456 },
  ];

  const episodes: Awaited<ReturnType<typeof prisma.episode.create>>[] = [];
  for (const ep of episodeData) {
    const episode = await prisma.episode.create({
      data: {
        title: ep.title,
        description: ep.description,
        duration: ep.duration,
        url: audioUrls[episodes.length % audioUrls.length],
        podcastId: podcasts[ep.podcastIdx].id,
      },
    });
    episodes.push(episode);
  }

  // Create Favorites
  await prisma.favorite.createMany({
    data: [
      { userId: user.id, episodeId: episodes[0].id },
      { userId: user.id, episodeId: episodes[2].id },
      { userId: user.id, episodeId: episodes[5].id },
    ],
  });

  // Create Reproductions (history)
  await prisma.reproduction.createMany({
    data: [
      { userId: user.id, episodeId: episodes[0].id, progress: 234, completed: true },
      { userId: user.id, episodeId: episodes[4].id, progress: 312, completed: true },
      { userId: user.id, episodeId: episodes[6].id, progress: 156, completed: false },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   - ${podcasts.length} podcasts`);
  console.log(`   - ${episodeData.length} episodes`);
  console.log(`   - ${categories.length} categories`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
