import { GuestbookNote } from '../types';
import { saveUserPhoto, saveCoverPhoto, addGuestbookNote } from './storage';
import { optimizeImage } from './imageOptimizer';

export interface AlbumBundleData {
  version?: string;
  exportDate?: string;
  coverPhoto?: string | null;
  photos: Record<string, { [index: number]: { imageUrl: string; caption?: string } }>;
  guestNotes?: GuestbookNote[];
}

/**
 * Sends current photos one-by-one to avoid 413 Request Entity Too Large,
 * saving them directly to /public/photos/ and /src/data/embeddedPhotos.json.
 * This ensures they are baked directly into the repository and show up on ANY computer
 * when exported to Vercel!
 */
export async function saveToSiteFiles(
  coverPhoto: string | null,
  photos: Record<string, { [index: number]: { imageUrl: string; caption?: string } }>,
  guestNotes: GuestbookNote[],
  onProgress?: (current: number, total: number, stepText: string) => void
): Promise<{ success: boolean; message: string; savedFileCount: number; bundle?: AlbumBundleData }> {
  try {
    // 1. Gather items that need saving
    type TaskItem =
      | { target: 'cover'; rawUrl: string }
      | { target: 'slot'; scheduleId: string; photoIndex: number; rawUrl: string; caption?: string };

    const tasks: TaskItem[] = [];

    if (coverPhoto && coverPhoto.startsWith('data:image/')) {
      tasks.push({ target: 'cover', rawUrl: coverPhoto });
    }

    for (const [schedId, slotMap] of Object.entries(photos)) {
      for (const [slotIdx, photoObj] of Object.entries(slotMap || {})) {
        if (photoObj && photoObj.imageUrl && photoObj.imageUrl.startsWith('data:image/')) {
          tasks.push({
            target: 'slot',
            scheduleId: schedId,
            photoIndex: Number(slotIdx),
            rawUrl: photoObj.imageUrl,
            caption: photoObj.caption,
          });
        }
      }
    }

    const totalTasks = tasks.length + 1; // photos + manifest
    let completed = 0;

    let updatedCoverPhoto = coverPhoto;
    const updatedPhotos: Record<string, Record<string, { imageUrl: string; caption?: string }>> = {};

    // Copy existing non-data photos first
    for (const [schedId, slotMap] of Object.entries(photos)) {
      updatedPhotos[schedId] = {};
      for (const [slotIdx, photoObj] of Object.entries(slotMap || {})) {
        if (photoObj && photoObj.imageUrl) {
          updatedPhotos[schedId][slotIdx] = {
            imageUrl: photoObj.imageUrl,
            caption: photoObj.caption,
          };
        }
      }
    }

    // 2. Upload images one by one
    let savedCount = 0;
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const itemName = task.target === 'cover' ? '표지 대표 사진' : `${task.scheduleId} 일정 ${task.photoIndex + 1}번 사진`;
      onProgress?.(completed, totalTasks, `사진 최적화 및 저장 중: ${itemName} (${i + 1}/${tasks.length})`);

      // Optimize image before sending to ensure compact payload (e.g. 100-200KB)
      const compressedBase64 = await optimizeImage(task.rawUrl, 1600, 1200, 0.84);

      const res = await fetch('/api/save-photo-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: task.target,
          scheduleId: task.target === 'slot' ? task.scheduleId : undefined,
          photoIndex: task.target === 'slot' ? task.photoIndex : undefined,
          base64: compressedBase64,
        }),
      });

      if (!res.ok) {
        throw new Error(`${itemName} 저장 실패 (상태코드: ${res.status})`);
      }

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(`${itemName} 저장 오류: ${resData.error || '알 수 없음'}`);
      }

      const savedUrl = resData.url;
      if (task.target === 'cover') {
        updatedCoverPhoto = savedUrl;
      } else {
        if (!updatedPhotos[task.scheduleId]) {
          updatedPhotos[task.scheduleId] = {};
        }
        updatedPhotos[task.scheduleId][task.photoIndex] = {
          imageUrl: savedUrl,
          caption: task.caption,
        };
      }

      savedCount++;
      completed++;
      onProgress?.(completed, totalTasks, `저장 완료: ${itemName} (${completed}/${totalTasks})`);
    }

    // 3. Finalize manifest JSON
    onProgress?.(completed, totalTasks, '앨범 정보(embeddedPhotos.json) 사이트 파일에 영구 기록 중...');
    const manifestRes = await fetch('/api/save-manifest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverPhoto: updatedCoverPhoto,
        photos: updatedPhotos,
        guestNotes: guestNotes || [],
      }),
    });

    if (!manifestRes.ok) {
      throw new Error(`앨범 메타데이터 저장 실패 (상태코드: ${manifestRes.status})`);
    }

    const manifestData = await manifestRes.json();
    completed++;
    onProgress?.(completed, totalTasks, '모든 사진과 데이터가 사이트에 영구 저장되었습니다!');

    return {
      success: true,
      savedFileCount: savedCount,
      bundle: manifestData.bundle,
      message: `사진 ${savedCount}장이 사이트 정적 파일(/public/photos/ 및 embeddedPhotos.json)에 성공적으로 영구 저장되었습니다!`,
    };
  } catch (err: any) {
    console.error('Failed to save to site files:', err);
    throw err;
  }
}

/**
 * Downloads the current photos, cover image, and notes as embeddedPhotos.json

 * so it can be committed to src/data/embeddedPhotos.json before deploying to Vercel.
 */
export function downloadAlbumBundle(
  coverPhoto: string | null,
  photos: Record<string, { [index: number]: { imageUrl: string; caption?: string } }>,
  guestNotes: GuestbookNote[]
) {
  const bundle: AlbumBundleData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    coverPhoto: coverPhoto || null,
    photos: photos || {},
    guestNotes: guestNotes || [],
  };

  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'embeddedPhotos.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses and imports an AlbumBundleData JSON into the local browser storage
 */
export async function importAlbumBundle(
  jsonText: string
): Promise<AlbumBundleData> {
  const parsed = JSON.parse(jsonText) as AlbumBundleData;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('올바른 JSON 형식의 앨범 데이터가 아닙니다.');
  }

  // Save cover if present
  if (parsed.coverPhoto) {
    await saveCoverPhoto(parsed.coverPhoto);
  }

  // Save photos
  if (parsed.photos) {
    for (const [scheduleId, slotMap] of Object.entries(parsed.photos)) {
      for (const [slotIdx, photoData] of Object.entries(slotMap)) {
        if (photoData && photoData.imageUrl) {
          await saveUserPhoto(
            scheduleId,
            Number(slotIdx),
            photoData.imageUrl,
            photoData.caption
          );
        }
      }
    }
  }

  // Save notes
  if (parsed.guestNotes && Array.isArray(parsed.guestNotes)) {
    for (const note of parsed.guestNotes) {
      await addGuestbookNote(note);
    }
  }

  return parsed;
}
