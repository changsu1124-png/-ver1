import { GuestbookNote } from '../types';

const DB_NAME = 'OnjeongAlbumDB';
const DB_VERSION = 1;
const STORE_PHOTOS = 'photos';
const STORE_META = 'metadata';
const STORE_GUESTBOOK = 'guestbook';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_GUESTBOOK)) {
        db.createObjectStore(STORE_GUESTBOOK, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredPhoto {
  key: string; // `${scheduleId}_${photoIndex}`
  scheduleId: string;
  photoIndex: number;
  imageUrl: string;
  caption?: string;
  updatedAt: number;
}

export async function saveUserPhoto(
  scheduleId: string,
  photoIndex: 0 | 1,
  imageUrl: string,
  caption?: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    const key = `${scheduleId}_${photoIndex}`;
    store.put({
      key,
      scheduleId,
      photoIndex,
      imageUrl,
      caption,
      updatedAt: Date.now(),
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save photo to IndexedDB:', err);
  }
}

export async function getAllUserPhotos(): Promise<
  Record<string, { [index: number]: { imageUrl: string; caption?: string } }>
> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PHOTOS, 'readonly');
    const store = tx.objectStore(STORE_PHOTOS);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result: Record<
          string,
          { [index: number]: { imageUrl: string; caption?: string } }
        > = {};
        const items = request.result as StoredPhoto[];
        for (const item of items) {
          if (!result[item.scheduleId]) {
            result[item.scheduleId] = {};
          }
          result[item.scheduleId][item.photoIndex] = {
            imageUrl: item.imageUrl,
            caption: item.caption,
          };
        }
        resolve(result);
      };
      request.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('Failed to load photos from IndexedDB:', err);
    return {};
  }
}

export async function removeUserPhoto(
  scheduleId: string,
  photoIndex: 0 | 1
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    const key = `${scheduleId}_${photoIndex}`;
    store.delete(key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete photo from IndexedDB:', err);
  }
}

export async function saveCoverPhoto(imageUrl: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_META, 'readwrite');
    const store = tx.objectStore(STORE_META);
    store.put({ key: 'coverPhoto', imageUrl });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save cover photo:', err);
  }
}

export async function getCoverPhoto(): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_META, 'readonly');
    const store = tx.objectStore(STORE_META);
    const request = store.get('coverPhoto');
    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result?.imageUrl || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function resetAllCustomPhotos(): Promise<void> {
  try {
    const db = await openDB();
    const tx1 = db.transaction(STORE_PHOTOS, 'readwrite');
    tx1.objectStore(STORE_PHOTOS).clear();
    const tx2 = db.transaction(STORE_META, 'readwrite');
    tx2.objectStore(STORE_META).clear();
  } catch (err) {
    console.error('Failed to reset photos:', err);
  }
}

export async function getSavedGuestbookNotes(): Promise<GuestbookNote[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_GUESTBOOK, 'readonly');
    const store = tx.objectStore(STORE_GUESTBOOK);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function addGuestbookNote(note: GuestbookNote): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_GUESTBOOK, 'readwrite');
    const store = tx.objectStore(STORE_GUESTBOOK);
    store.put(note);
  } catch (err) {
    console.error('Failed to add note:', err);
  }
}

export async function deleteGuestbookNote(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_GUESTBOOK, 'readwrite');
    const store = tx.objectStore(STORE_GUESTBOOK);
    store.delete(id);
  } catch (err) {
    console.error('Failed to delete note:', err);
  }
}
