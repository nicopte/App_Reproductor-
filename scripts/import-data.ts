/**
 * One-time import of the data exported from the original SQLite database
 * (prisma/data-export.json) into whatever DATABASE_URL is currently
 * configured (i.e. your new Neon Postgres database).
 *
 * Usage:
 *   1. Set DATABASE_URL in .env to your Neon connection string.
 *   2. npx prisma db push          (creates the schema in Neon)
 *   3. npx tsx scripts/import-data.ts
 *
 * Safe to run only once against an empty database — it does not upsert.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'prisma', 'data-export.json');
  if (!fs.existsSync(filePath)) {
    console.log('No prisma/data-export.json found — nothing to import.');
    return;
  }

  const dump = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Order matters: parents before children (foreign keys).
  if (dump.User?.length) {
    for (const u of dump.User) {
      const isAlreadyHashed = typeof u.password === 'string' && u.password.startsWith('$2');
      await prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          password: isAlreadyHashed ? u.password : await bcrypt.hash(u.password, 12),
          avatar: u.avatar,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
    }
    console.log(`Imported ${dump.User.length} users (passwords hashed if needed)`);
  }

  if (dump.Category?.length) {
    for (const c of dump.Category) {
      await prisma.category.create({ data: { id: c.id, name: c.name, createdAt: new Date(c.createdAt) } });
    }
    console.log(`Imported ${dump.Category.length} categories`);
  }

  if (dump.Artist?.length) {
    for (const a of dump.Artist) {
      await prisma.artist.create({
        data: { id: a.id, name: a.name, bio: a.bio, image: a.image, createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt) },
      });
    }
    console.log(`Imported ${dump.Artist.length} artists`);
  }

  if (dump.Album?.length) {
    for (const al of dump.Album) {
      await prisma.album.create({
        data: {
          id: al.id, title: al.title, image: al.image, year: al.year,
          artistId: al.artistId, createdAt: new Date(al.createdAt), updatedAt: new Date(al.updatedAt),
        },
      });
    }
    console.log(`Imported ${dump.Album.length} albums`);
  }

  if (dump.Song?.length) {
    for (const s of dump.Song) {
      await prisma.song.create({
        data: {
          id: s.id, title: s.title, duration: s.duration, url: s.url, image: s.image,
          genre: s.genre, artistId: s.artistId, albumId: s.albumId,
          createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt),
        },
      });
    }
    console.log(`Imported ${dump.Song.length} songs`);
  }

  if (dump.Playlist?.length) {
    for (const p of dump.Playlist) {
      await prisma.playlist.create({
        data: {
          id: p.id, title: p.title, description: p.description, image: p.image,
          isPublic: !!p.isPublic, userId: p.userId,
          createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt),
        },
      });
    }
    console.log(`Imported ${dump.Playlist.length} playlists`);
  }

  if (dump.PlaylistSong?.length) {
    for (const ps of dump.PlaylistSong) {
      await prisma.playlistSong.create({
        data: { id: ps.id, playlistId: ps.playlistId, songId: ps.songId, position: ps.position, addedAt: new Date(ps.addedAt) },
      });
    }
    console.log(`Imported ${dump.PlaylistSong.length} playlist songs`);
  }

  if (dump.Favorite?.length) {
    for (const f of dump.Favorite) {
      await prisma.favorite.create({
        data: { id: f.id, userId: f.userId, songId: f.songId, createdAt: new Date(f.createdAt) },
      });
    }
    console.log(`Imported ${dump.Favorite.length} favorites`);
  }

  if (dump.Reproduction?.length) {
    for (const r of dump.Reproduction) {
      await prisma.reproduction.create({
        data: {
          id: r.id, userId: r.userId, songId: r.songId, episodeId: r.episodeId,
          progress: r.progress, completed: !!r.completed, createdAt: new Date(r.createdAt),
        },
      });
    }
    console.log(`Imported ${dump.Reproduction.length} reproductions`);
  }

  if (dump.Podcast?.length) {
    for (const p of dump.Podcast) {
      await prisma.podcast.create({
        data: {
          id: p.id, title: p.title, description: p.description, image: p.image,
          userId: p.userId, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt),
        },
      });
    }
    console.log(`Imported ${dump.Podcast.length} podcasts`);
  }

  if (dump.Episode?.length) {
    for (const e of dump.Episode) {
      await prisma.episode.create({
        data: {
          id: e.id, title: e.title, description: e.description, duration: e.duration,
          url: e.url, image: e.image, podcastId: e.podcastId,
          createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt),
        },
      });
    }
    console.log(`Imported ${dump.Episode.length} episodes`);
  }

  if (dump.Follow?.length) {
    for (const f of dump.Follow) {
      await prisma.follow.create({
        data: { id: f.id, userId: f.userId, artistId: f.artistId, createdAt: new Date(f.createdAt) },
      });
    }
    console.log(`Imported ${dump.Follow.length} follows`);
  }

  console.log('Import complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
