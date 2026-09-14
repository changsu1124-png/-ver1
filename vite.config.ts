import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function saveEmbeddedPhotosPlugin(): Plugin {
  return {
    name: 'save-embedded-photos-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Single photo upload endpoint (avoids 413 Payload Too Large)
        if (req.url === '/api/save-photo-file' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const photosDir = path.resolve(__dirname, 'public/photos');
                if (!fs.existsSync(photosDir)) {
                  fs.mkdirSync(photosDir, { recursive: true });
                }

                let targetUrl = '';
                const base64Data = payload.base64 || '';
                const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

                if (payload.target === 'cover') {
                  const ext = matches ? (matches[1] === 'jpeg' ? 'jpg' : matches[1]) : 'jpg';
                  const filename = `cover.${ext}`;
                  if (matches) {
                    fs.writeFileSync(path.join(photosDir, filename), Buffer.from(matches[2], 'base64'));
                  }
                  targetUrl = `/photos/${filename}`;
                } else if (payload.target === 'slot') {
                  const ext = matches ? (matches[1] === 'jpeg' ? 'jpg' : matches[1]) : 'jpg';
                  const filename = `${payload.scheduleId}_${payload.photoIndex}.${ext}`;
                  if (matches) {
                    fs.writeFileSync(path.join(photosDir, filename), Buffer.from(matches[2], 'base64'));
                  }
                  targetUrl = `/photos/${filename}`;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, url: targetUrl }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 2. Finalize Manifest endpoint (only metadata & notes, tiny payload)
        if (req.url === '/api/save-manifest' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const embeddedJsonPath = path.resolve(__dirname, 'src/data/embeddedPhotos.json');
                const bundleData = {
                  version: '1.0',
                  exportDate: new Date().toISOString(),
                  coverPhoto: payload.coverPhoto || null,
                  photos: payload.photos || {},
                  guestNotes: payload.guestNotes || [],
                };

                fs.writeFileSync(embeddedJsonPath, JSON.stringify(bundleData, null, 2), 'utf-8');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  bundle: bundleData,
                  message: '사이트 파일에 성공적으로 저장되었습니다.',
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 3. Legacy batch endpoint
        if (req.url === '/api/save-embedded-photos' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const photosDir = path.resolve(__dirname, 'public/photos');
                if (!fs.existsSync(photosDir)) {
                  fs.mkdirSync(photosDir, { recursive: true });
                }

                const embeddedJsonPath = path.resolve(__dirname, 'src/data/embeddedPhotos.json');
                const sanitizedPhotos: Record<string, Record<string, { imageUrl: string; caption?: string }>> = {};
                let savedFileCount = 0;

                // 1. Process cover photo
                let coverPath: string | null = null;
                if (payload.coverPhoto) {
                  if (typeof payload.coverPhoto === 'string' && payload.coverPhoto.startsWith('data:image/')) {
                    const matches = payload.coverPhoto.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                    if (matches) {
                      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                      const buffer = Buffer.from(matches[2], 'base64');
                      const filename = `cover.${ext}`;
                      fs.writeFileSync(path.join(photosDir, filename), buffer);
                      coverPath = `/photos/${filename}`;
                      savedFileCount++;
                    } else {
                      coverPath = payload.coverPhoto;
                    }
                  } else {
                    coverPath = payload.coverPhoto;
                  }
                }

                // 2. Process schedule photos
                if (payload.photos && typeof payload.photos === 'object') {
                  for (const [schedId, slotMap] of Object.entries(payload.photos)) {
                    sanitizedPhotos[schedId] = {};
                    for (const [slotIdx, photoObj] of Object.entries(slotMap as Record<string, any>)) {
                      if (!photoObj || !photoObj.imageUrl) continue;
                      let finalUrl = photoObj.imageUrl;
                      if (typeof photoObj.imageUrl === 'string' && photoObj.imageUrl.startsWith('data:image/')) {
                        const matches = photoObj.imageUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                        if (matches) {
                          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                          const buffer = Buffer.from(matches[2], 'base64');
                          const filename = `${schedId}_${slotIdx}.${ext}`;
                          fs.writeFileSync(path.join(photosDir, filename), buffer);
                          finalUrl = `/photos/${filename}`;
                          savedFileCount++;
                        }
                      }
                      sanitizedPhotos[schedId][slotIdx] = {
                        imageUrl: finalUrl,
                        caption: photoObj.caption,
                      };
                    }
                  }
                }

                const bundleData = {
                  version: '1.0',
                  exportDate: new Date().toISOString(),
                  coverPhoto: coverPath,
                  photos: sanitizedPhotos,
                  guestNotes: payload.guestNotes || [],
                };

                fs.writeFileSync(embeddedJsonPath, JSON.stringify(bundleData, null, 2), 'utf-8');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  savedFileCount,
                  bundle: bundleData,
                  message: `사진 ${savedFileCount}장이 사이트 파일(public/photos/ 및 embeddedPhotos.json)에 성공적으로 영구 저장되었습니다!`,
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), saveEmbeddedPhotosPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
