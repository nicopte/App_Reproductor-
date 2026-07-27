import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.reproduction.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.episodeCategory.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.song.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.podcast.deleteMany();
  await prisma.category.deleteMany();
  await prisma.genre?.deleteMany?.();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Música' } }),
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
      avatar: '/images/artists/artist-1.png',
    },
  });

  // Create Artists
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        name: 'Luna Stellar',
        image: '/images/artists/artist-1.png',
        bio: 'Cantante pop con influencias electrónicas',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Neon Pulse',
        image: '/images/artists/artist-2.png',
        bio: 'DJ y productor de música electrónica',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'The Wanderers',
        image: '/images/artists/artist-3.png',
        bio: 'Banda de indie rock con raíces folk',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Marcus Jazz',
        image: '/images/artists/artist-4.png',
        bio: 'Saxofonista de jazz con 20 años de experiencia',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'MC Flow',
        image: '/images/artists/artist-5.png',
        bio: 'Rapper con flow versátil y letras profundas',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Clara Nocturna',
        image: '/images/artists/artist-6.png',
        bio: 'Pianista clásica contemporánea',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Aria Soul',
        image: '/images/artists/artist-7.png',
        bio: 'Cantante de R&B y neo-soul',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Roots Reggae',
        image: '/images/artists/artist-8.png',
        bio: 'Banda de reggae con mensaje positivo',
      },
    }),
  ]);

  // Create Albums
  const albums = await Promise.all([
    prisma.album.create({
      data: {
        title: 'Stellar Dreams',
        image: '/images/albums/album-1.png',
        year: 2024,
        artistId: artists[0].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Digital Waves',
        image: '/images/albums/album-2.png',
        year: 2024,
        artistId: artists[1].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Road Stories',
        image: '/images/albums/album-3.png',
        year: 2023,
        artistId: artists[2].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Midnight Sessions',
        image: '/images/albums/album-4.png',
        year: 2023,
        artistId: artists[3].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Urban Poetry',
        image: '/images/albums/album-5.png',
        year: 2024,
        artistId: artists[4].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Moonlight Sonata',
        image: '/images/albums/album-6.png',
        year: 2023,
        artistId: artists[5].id,
      },
    }),
  ]);

  // Create Songs
  const audioUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  ];

  const songData = [
    // Luna Stellar - Stellar Dreams
    { title: 'Cosmic Love', artistIdx: 0, albumIdx: 0, genre: 'Pop', duration: 234, urlIdx: 0 },
    { title: 'Starlight', artistIdx: 0, albumIdx: 0, genre: 'Pop', duration: 198, urlIdx: 1 },
    { title: 'Nebula', artistIdx: 0, albumIdx: 0, genre: 'Pop', duration: 256, urlIdx: 2 },
    { title: 'Gravity', artistIdx: 0, albumIdx: 0, genre: 'Pop', duration: 211, urlIdx: 3 },
    // Neon Pulse - Digital Waves
    { title: 'Pulse', artistIdx: 1, albumIdx: 1, genre: 'Electronic', duration: 312, urlIdx: 4 },
    { title: 'Synthwave', artistIdx: 1, albumIdx: 1, genre: 'Electronic', duration: 287, urlIdx: 5 },
    { title: 'Binary Code', artistIdx: 1, albumIdx: 1, genre: 'Electronic', duration: 245, urlIdx: 6 },
    { title: 'Neon Nights', artistIdx: 1, albumIdx: 1, genre: 'Electronic', duration: 298, urlIdx: 7 },
    // The Wanderers - Road Stories
    { title: 'Wanderer', artistIdx: 2, albumIdx: 2, genre: 'Indie', duration: 224, urlIdx: 8 },
    { title: 'Horizon', artistIdx: 2, albumIdx: 2, genre: 'Indie', duration: 256, urlIdx: 9 },
    { title: 'Dusty Road', artistIdx: 2, albumIdx: 2, genre: 'Indie', duration: 198, urlIdx: 10 },
    { title: 'Campfire Stories', artistIdx: 2, albumIdx: 2, genre: 'Indie', duration: 312, urlIdx: 11 },
    // Marcus Jazz - Midnight Sessions
    { title: 'Blue Note', artistIdx: 3, albumIdx: 3, genre: 'Jazz', duration: 345, urlIdx: 0 },
    { title: 'Saxophone Dreams', artistIdx: 3, albumIdx: 3, genre: 'Jazz', duration: 278, urlIdx: 1 },
    { title: 'Smooth Operator', artistIdx: 3, albumIdx: 3, genre: 'Jazz', duration: 267, urlIdx: 2 },
    // MC Flow - Urban Poetry
    { title: 'Flow State', artistIdx: 4, albumIdx: 4, genre: 'Hip Hop', duration: 198, urlIdx: 3 },
    { title: 'City Lights', artistIdx: 4, albumIdx: 4, genre: 'Hip Hop', duration: 224, urlIdx: 4 },
    { title: 'Rhyme Scheme', artistIdx: 4, albumIdx: 4, genre: 'Hip Hop', duration: 187, urlIdx: 5 },
    // Clara Nocturna - Moonlight Sonata
    { title: 'Nocturne', artistIdx: 5, albumIdx: 5, genre: 'Classical', duration: 412, urlIdx: 6 },
    { title: 'Moonlight', artistIdx: 5, albumIdx: 5, genre: 'Classical', duration: 356, urlIdx: 7 },
    { title: 'Prelude', artistIdx: 5, albumIdx: 5, genre: 'Classical', duration: 289, urlIdx: 8 },
    // Aria Soul (no album)
    { title: 'Soulful Night', artistIdx: 6, genre: 'R&B', duration: 234, urlIdx: 9 },
    { title: 'Velvet Voice', artistIdx: 6, genre: 'R&B', duration: 267, urlIdx: 10 },
    // Roots Reggae (no album)
    { title: 'Island Vibes', artistIdx: 7, genre: 'Reggae', duration: 245, urlIdx: 11 },
    { title: 'One Love', artistIdx: 7, genre: 'Reggae', duration: 212, urlIdx: 0 },
  ];

  const songs: Awaited<ReturnType<typeof prisma.song.create>>[] = [];
  for (const s of songData) {
    const album = s.albumIdx !== undefined ? albums[s.albumIdx] : undefined;
    const song = await prisma.song.create({
      data: {
        title: s.title,
        duration: s.duration,
        url: audioUrls[s.urlIdx],
        image: album?.image || artists[s.artistIdx].image,
        artistId: artists[s.artistIdx].id,
        albumId: album ? album.id : null,
        genre: s.genre,
      },
    });
    songs.push(song);
  }

  // Create Playlists
  const playlists = await Promise.all([
    prisma.playlist.create({
      data: {
        title: 'Mis Favoritos',
        description: 'Las canciones que más me gustan',
        image: '/images/albums/album-1.png',
        userId: user.id,
      },
    }),
    prisma.playlist.create({
      data: {
        title: 'Chill Vibes',
        description: 'Música relajante para cualquier momento',
        image: '/images/albums/album-4.png',
        userId: user.id,
      },
    }),
    prisma.playlist.create({
      data: {
        title: 'Workout Mix',
        description: 'Energía para entrenar',
        image: '/images/albums/album-2.png',
        userId: user.id,
      },
    }),
    prisma.playlist.create({
      data: {
        title: 'Noche de Jazz',
        description: 'Jazz para las noches tranquilas',
        image: '/images/albums/album-4.png',
        userId: user.id,
      },
    }),
  ]);

  // Add songs to playlists
  await prisma.playlistSong.createMany({
    data: [
      { playlistId: playlists[0].id, songId: songs[0].id, position: 1 },
      { playlistId: playlists[0].id, songId: songs[1].id, position: 2 },
      { playlistId: playlists[0].id, songId: songs[4].id, position: 3 },
      { playlistId: playlists[0].id, songId: songs[13].id, position: 4 },
      { playlistId: playlists[1].id, songId: songs[1].id, position: 1 },
      { playlistId: playlists[1].id, songId: songs[13].id, position: 2 },
      { playlistId: playlists[1].id, songId: songs[14].id, position: 3 },
      { playlistId: playlists[1].id, songId: songs[22].id, position: 4 },
      { playlistId: playlists[2].id, songId: songs[4].id, position: 1 },
      { playlistId: playlists[2].id, songId: songs[5].id, position: 2 },
      { playlistId: playlists[2].id, songId: songs[15].id, position: 3 },
      { playlistId: playlists[2].id, songId: songs[16].id, position: 4 },
      { playlistId: playlists[3].id, songId: songs[12].id, position: 1 },
      { playlistId: playlists[3].id, songId: songs[13].id, position: 2 },
      { playlistId: playlists[3].id, songId: songs[14].id, position: 3 },
      { playlistId: playlists[3].id, songId: songs[15].id, position: 4 },
    ],
  });

  // Create Favorites
  await prisma.favorite.createMany({
    data: [
      { userId: user.id, songId: songs[0].id },
      { userId: user.id, songId: songs[2].id },
      { userId: user.id, songId: songs[5].id },
      { userId: user.id, songId: songs[8].id },
      { userId: user.id, songId: songs[12].id },
      { userId: user.id, songId: songs[17].id },
      { userId: user.id, songId: songs[21].id },
    ],
  });

  // Create Follows
  await prisma.follow.createMany({
    data: [
      { userId: user.id, artistId: artists[0].id },
      { userId: user.id, artistId: artists[3].id },
      { userId: user.id, artistId: artists[4].id },
      { userId: user.id, artistId: artists[6].id },
    ],
  });

  // Create Reproductions (history)
  await prisma.reproduction.createMany({
    data: [
      { userId: user.id, songId: songs[0].id, progress: 234, completed: true },
      { userId: user.id, songId: songs[4].id, progress: 312, completed: true },
      { userId: user.id, songId: songs[8].id, progress: 156, completed: false },
      { userId: user.id, songId: songs[12].id, progress: 345, completed: true },
      { userId: user.id, songId: songs[15].id, progress: 134, completed: false },
      { userId: user.id, songId: songs[1].id, progress: 198, completed: true },
      { userId: user.id, songId: songs[5].id, progress: 267, completed: true },
      { userId: user.id, songId: songs[13].id, progress: 200, completed: false },
    ],
  });

  // Create Podcasts
  const podcasts = await Promise.all([
    prisma.podcast.create({
      data: {
        title: 'Sonidos del Mundo',
        description: 'Exploramos la música y cultura de diferentes rincones del planeta.',
        image: '/images/podcasts/podcast-1.png',
        userId: user.id,
      },
    }),
    prisma.podcast.create({
      data: {
        title: 'Detrás del Escenario',
        description: 'Entrevistas con artistas y productores de la industria musical.',
        image: '/images/podcasts/podcast-2.png',
        userId: user.id,
      },
    }),
    prisma.podcast.create({
      data: {
        title: 'Ritmo y Tecnología',
        description: 'Cómo la tecnología está transformando la forma de hacer y escuchar música.',
        image: '/images/podcasts/podcast-3.png',
        userId: user.id,
      },
    }),
  ]);

  // Create Episodes
  const episodeData = [
    { podcastIdx: 0, title: 'El Tango en Buenos Aires', description: 'Un viaje por los barrios porteños y su música.', duration: 1842 },
    { podcastIdx: 0, title: 'Reggaetón: De Panamá al Mundo', description: 'La historia del género que conquistó el planeta.', duration: 2234 },
    { podcastIdx: 0, title: 'K-Pop: El Fenómeno Global', description: 'Cómo la música coreana se convirtió en un fenómeno mundial.', duration: 1956 },
    { podcastIdx: 1, title: 'Entrevista con Luna Stellar', description: 'La cantante pop nos cuenta sobre su nuevo álbum.', duration: 3421 },
    { podcastIdx: 1, title: 'Neon Pulse: La vida del DJ', description: 'El productor electrónico habla sobre su carrera.', duration: 2890 },
    { podcastIdx: 1, title: 'MC Flow: El poder de las palabras', description: 'El rapper comparte su visión del hip hop actual.', duration: 3156 },
    { podcastIdx: 2, title: 'IA y la Música', description: 'Cómo la inteligencia artificial está cambiando la producción musical.', duration: 2100 },
    { podcastIdx: 2, title: 'El futuro del Streaming', description: 'Tendencias y predicciones para la industria musical.', duration: 1876 },
    { podcastIdx: 2, title: 'Producción en Casa', description: 'Equipamiento y software para producir música profesional.', duration: 2456 },
  ];

  for (const ep of episodeData) {
    await prisma.episode.create({
      data: {
        title: ep.title,
        description: ep.description,
        duration: ep.duration,
        url: audioUrls[ep.podcastIdx % audioUrls.length],
        image: podcasts[ep.podcastIdx].image,
        podcastId: podcasts[ep.podcastIdx].id,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`   - ${artists.length} artists`);
  console.log(`   - ${albums.length} albums`);
  console.log(`   - ${songs.length} songs`);
  console.log(`   - ${playlists.length} playlists`);
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
