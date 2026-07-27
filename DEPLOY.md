# Guía de despliegue — Neon + Cloudinary + Vercel

## 1. Base de datos (Neon)

1. Creá un proyecto en https://neon.tech y copiá el connection string (usá el de "pooled connection" para Vercel).
2. Poné ese string en `DATABASE_URL` (en Vercel: Project Settings → Environment Variables; en local: `.env`).
3. Creá el schema en Neon:
   ```
   npx prisma db push
   ```
4. **Recuperar tus datos actuales**: se exportaron a `prisma/data-export.json` (8 artistas, 25 canciones, 6 álbumes, 4 playlists, 3 podcasts, etc. de tu base SQLite original). Para cargarlos en Neon:
   ```
   npm run db:import
   ```
   Las contraseñas de usuarios que estaban en texto plano se re-hashean automáticamente durante la importación.

   Si preferís arrancar de cero con datos de ejemplo en vez de importar los tuyos, usá `npx prisma db seed` en su lugar (usuario demo: `demo@mp3db.com` / `demo123`).

## 2. Cloudinary (imágenes: portadas de playlists/podcasts)

1. Creá una cuenta en https://cloudinary.com y sacá `Cloud name`, `API key`, `API secret` del dashboard.
2. Cargalos como `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Ya está integrado: `/api/upload` (subida con validación de tipo/tamaño) y el componente `ImageUploader`, conectado a portadas de playlists y podcasts.

## 3. Vercel Blob (audio de episodios de podcast)

1. En tu proyecto de Vercel: pestaña **Storage** → **Create Database** → **Blob**. Conectalo al proyecto.
2. Vercel completa `BLOB_READ_WRITE_TOKEN` automáticamente en producción. Para desarrollo local, copiá el token desde Storage → tu Blob store → pestaña `.env.local`.
3. Cómo funciona: los episodios (.mp3, hasta 40MB recomendado, 45MB máximo duro) se suben **directo desde el navegador** a Blob, sin pasar por una función serverless — esto evita el límite de ~4.5MB que Vercel impone al body de las funciones. El componente `AudioUploader` valida tipo/tamaño en el cliente y el endpoint `/api/podcasts/upload` valida de nuevo en el servidor antes de emitir el token de subida.
4. Con 22 podcasts de hasta 40MB cada uno (~880MB) entrás cómodo en el 1GB gratis del plan Hobby. Si escalás más, Blob cobra por GB de almacenamiento/transferencia adicional — ver https://vercel.com/pricing.
5. Nota sobre compresión: no implementé compresión automática en el navegador (requeriría ffmpeg.wasm, ~30MB de descarga extra y bastante fragilidad). En su lugar, la app valida tamaño y avisa si conviene comprimir. Para exportar en 128kbps mp3 antes de subir, cualquier editor de audio (Audacity, etc.) sirve.

## 4. Sesiones

Generá un secreto random y cargalo como `SESSION_SECRET`:
```
openssl rand -base64 32
```

## 5. Vercel

El proyecto ya está limpio para deploy estándar de Next.js (nada de scripts de `bun`, sin `output: standalone`). Solo:
1. Importá el repo en Vercel.
2. Cargá las variables de entorno de arriba (incluido `BLOB_READ_WRITE_TOKEN` si no lo autocompletó el paso 3).
3. Deploy. `postinstall` corre `prisma generate` automáticamente.

## Cambios de seguridad importantes que se hicieron

- Las contraseñas ahora se guardan con `bcrypt` (antes texto plano).
- El login/registro ahora usa cookies de sesión firmadas (`httpOnly`, JWT) en vez de un usuario demo hardcodeado que quedaba "logueado" siempre.
- Los endpoints de playlists/favoritos/reproducciones/podcasts ya no confían en un `userId` mandado por el cliente — se lee de la sesión firmada del servidor.
- Se agregó verificación de dueño antes de editar/borrar playlists o podcasts, agregar/quitar canciones, o publicar/borrar episodios.
- `GET /api/favorites` y `GET /api/reproductions` ahora devuelven solo los datos del usuario logueado (antes devolvían los de todos los usuarios).

## Pendiente / fuera de este alcance

- No hay pantallas de administración para crear/editar canciones, álbumes o artistas (hoy se cargan solo por seed).
- No hay página de perfil de usuario para cambiar el avatar después de registrarse.
- La funcionalidad de "seguir artistas" (`Follow`) existe en la base de datos pero no tiene endpoints ni UI todavía.
- No hay compresión automática de audio antes de subir (ver nota en la sección de Vercel Blob).
