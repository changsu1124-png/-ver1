import React, { useState, useEffect, useCallback } from 'react';
import { SCHEDULES } from './data/schedules';
import { GuestbookNote } from './types';
import { 
  getAllUserPhotos, 
  saveUserPhoto, 
  removeUserPhoto, 
  getCoverPhoto, 
  saveCoverPhoto,
  getSavedGuestbookNotes,
  addGuestbookNote,
  deleteGuestbookNote
} from './utils/storage';
import { pianoBgm, TrackId, PIANO_TRACKS } from './utils/pianoBgm';
import { NavigationHeader } from './components/NavigationHeader';
import { CoverPage } from './components/CoverPage';
import { AlbumPage } from './components/AlbumPage';
import { BackCoverPage } from './components/BackCoverPage';
import { BatchUploadModal } from './components/BatchUploadModal';
import { FallingPetals } from './components/FallingPetals';
import embeddedData from './data/embeddedPhotos.json';

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80';

const INITIAL_GUESTBOOK_NOTES: GuestbookNote[] = [
  {
    id: 'note-teacher',
    author: '담임선생님',
    role: '선생님',
    message: '1박 2일 동안 서로 손잡고 배려하며 안전하게 일정을 잘 마쳐준 온정초 친구들! 선생님은 너희가 정말 자랑스럽단다 ❤️',
    date: '9월 9일(수)',
    color: 'yellow',
  },
  {
    id: 'note-parent',
    author: '민우 어머니',
    role: '학부모',
    message: '아이들이 환하게 웃는 사진들을 보니 마음이 뭉클하네요. 정성껏 보살펴주신 선생님들께 깊이 감사드립니다!',
    date: '9월 9일(수)',
    color: 'pink',
  },
  {
    id: 'note-student',
    author: '서연',
    role: '학생',
    message: 'KTX 진짜 시원하게 빨랐고, 키자니아에서 직접 번 키조로 저축했던 게 평생 기억에 남을 것 같아요! 온정초 친구들 최고~',
    date: '9월 9일(수)',
    color: 'sky',
  },
];

export default function App() {
  // 3-page state (1: 앨범 표지, 2: 추억 앨범 본문, 3: 앨범 뒷장)
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);

  // Cover image (fallback to embeddedPhotos.json, then DEFAULT_COVER_IMAGE)
  const [coverImage, setCoverImage] = useState<string>(
    (embeddedData as any).coverPhoto || DEFAULT_COVER_IMAGE
  );

  // User attached photos: baseline from embeddedPhotos.json for permanent bundle
  const [userPhotos, setUserPhotos] = useState<
    Record<string, { [index: number]: { imageUrl: string; caption?: string } }>
  >(((embeddedData as any).photos as any) || {});

  // Guestbook notes for page 3
  const [guestNotes, setGuestNotes] = useState<GuestbookNote[]>(
    ((embeddedData as any).guestNotes as any) || INITIAL_GUESTBOOK_NOTES
  );

  // Falling Petals effect state (defaults to true)
  const [petalsEnabled, setPetalsEnabled] = useState(true);

  // Piano background music state
  const [isPlayingBgm, setIsPlayingBgm] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<TrackId>(pianoBgm.getCurrentTrackId());
  const [bgmVolume, setBgmVolume] = useState(pianoBgm.getVolume());

  // Batch upload modal state
  const [showBatchUpload, setShowBatchUpload] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Subscribe to BGM engine state
  useEffect(() => {
    const unsubscribe = pianoBgm.subscribe((playing, trackId) => {
      setIsPlayingBgm(playing);
      setCurrentTrackId(trackId);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleBgm = useCallback(() => {
    const isNowPlaying = pianoBgm.toggle();
    const track = pianoBgm.getCurrentTrack();
    if (isNowPlaying) {
      showToast(`🎵 피아노 연주 중: ${track.title}`);
    } else {
      showToast('🔇 피아노 음악이 일시정지되었습니다.');
    }
  }, [showToast]);

  const handleSelectTrack = useCallback((trackId: TrackId) => {
    pianoBgm.setTrack(trackId);
    const track = pianoBgm.getCurrentTrack();
    showToast(`🎵 '${track.title}' 연주곡으로 변경되었습니다.`);
  }, [showToast]);

  const handleChangeVolume = useCallback((val: number) => {
    setBgmVolume(val);
    pianoBgm.setVolume(val);
  }, []);

  // Load persistent data from IndexedDB on startup and merge with embeddedPhotos
  useEffect(() => {
    async function loadData() {
      try {
        const storedCover = await getCoverPhoto();
        if (storedCover) {
          setCoverImage(storedCover);
        } else if ((embeddedData as any).coverPhoto) {
          setCoverImage((embeddedData as any).coverPhoto);
        }

        const storedPhotos = await getAllUserPhotos();
        const embedded = (((embeddedData as any).photos as any) || {}) as Record<
          string,
          { [index: number]: { imageUrl: string; caption?: string } }
        >;

        const merged: Record<
          string,
          { [index: number]: { imageUrl: string; caption?: string } }
        > = { ...embedded };

        for (const [schedId, slots] of Object.entries(storedPhotos)) {
          merged[schedId] = {
            ...(merged[schedId] || {}),
            ...slots,
          };
        }
        setUserPhotos(merged);

        const savedNotes = await getSavedGuestbookNotes();
        if (savedNotes && savedNotes.length > 0) {
          setGuestNotes(savedNotes);
        } else if (
          (embeddedData as any).guestNotes &&
          (embeddedData as any).guestNotes.length > 0
        ) {
          setGuestNotes((embeddedData as any).guestNotes);
        }
      } catch (err) {
        console.warn('Could not read from IndexedDB, using defaults:', err);
      }
    }
    loadData();
  }, []);

  // Keyboard navigation listener (Space, 1, 2, 3, Arrows, PageUp/PageDown, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '1') {
        setCurrentPage(1);
        showToast('📖 1페이지: 앨범 표지로 이동했습니다.');
      } else if (e.key === '2') {
        setCurrentPage(2);
        showToast('📷 2페이지: 추억 앨범으로 이동했습니다.');
      } else if (e.key === '3') {
        setCurrentPage(3);
        showToast('🌸 3페이지: 앨범 뒷장으로 이동했습니다.');
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleBgm();
      } else if (e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 1));
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 3));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast, handleToggleBgm]);

  // Handlers for photos
  const handleSavePhoto = async (
    scheduleId: string,
    photoIndex: number,
    imageUrl: string,
    caption?: string
  ) => {
    await saveUserPhoto(scheduleId, photoIndex, imageUrl, caption);
    setUserPhotos((prev) => ({
      ...prev,
      [scheduleId]: {
        ...(prev[scheduleId] || {}),
        [photoIndex]: {
          imageUrl,
          caption: caption ?? prev[scheduleId]?.[photoIndex]?.caption,
        },
      },
    }));
    showToast('✨ 사진이 앨범에 저장되었습니다!');
  };

  const handleRemovePhoto = async (scheduleId: string, photoIndex: number) => {
    await removeUserPhoto(scheduleId, photoIndex);
    setUserPhotos((prev) => {
      const copy = { ...prev };
      if (copy[scheduleId]) {
        delete copy[scheduleId][photoIndex];
      }
      return copy;
    });
    showToast('기본 사진으로 복원되었습니다.');
  };

  const handleCoverImageChange = async (dataUrl: string) => {
    setCoverImage(dataUrl);
    await saveCoverPhoto(dataUrl);
    showToast('✨ 표지 사진이 멋지게 변경되었습니다!');
  };

  const handleAddGuestNote = async (noteData: Omit<GuestbookNote, 'id' | 'date'>) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const newNote: GuestbookNote = {
      id: `note-${Date.now()}`,
      ...noteData,
      date: dateStr,
    };
    await addGuestbookNote(newNote);
    setGuestNotes((prev) => [newNote, ...prev]);
    showToast('💌 응원 메모가 앨범 뒷장에 남겨졌습니다!');
  };

  const handleDeleteGuestNote = async (id: string) => {
    await deleteGuestbookNote(id);
    setGuestNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Count total custom photos attached
  let totalCustomPhotos = 0;
  for (const obj of Object.values(userPhotos)) {
    if (obj) {
      totalCustomPhotos += Object.keys(obj).length;
    }
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FAF9F6] text-stone-900 flex flex-col font-dodum selection:bg-stone-200 relative">
      {/* Background Falling Petals Effect */}
      <FallingPetals enabled={petalsEnabled} />

      {/* Top Editorial Navigation Bar */}
      <NavigationHeader
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
        onOpenBatchUpload={() => setShowBatchUpload(true)}
        totalCustomPhotos={totalCustomPhotos}
        isPlayingBgm={isPlayingBgm}
        onToggleBgm={handleToggleBgm}
        bgmVolume={bgmVolume}
        onChangeVolume={handleChangeVolume}
        currentTrackId={currentTrackId}
        onSelectTrack={handleSelectTrack}
        tracks={PIANO_TRACKS}
        scheduleCount={SCHEDULES.length}
        petalsEnabled={petalsEnabled}
        onTogglePetals={() => setPetalsEnabled((prev) => !prev)}
      />

      {/* Main Content (Pages 1, 2, or 3) - Single Screen Fit */}
      <div className="flex-1 min-h-0 overflow-hidden relative z-20">
        {currentPage === 1 && (
          <CoverPage
            coverImage={coverImage}
            onCoverImageChange={handleCoverImageChange}
            onOpenAlbum={() => setCurrentPage(2)}
            audioPlaying={isPlayingBgm}
            onToggleAudio={handleToggleBgm}
          />
        )}

        {currentPage === 2 && (
          <AlbumPage
            schedules={SCHEDULES}
            userPhotos={userPhotos}
            onSavePhoto={handleSavePhoto}
            onRemovePhoto={handleRemovePhoto}
            onNavigateToCover={() => setCurrentPage(1)}
            onNavigateToBackCover={() => setCurrentPage(3)}
            onOpenBatchUpload={() => setShowBatchUpload(true)}
          />
        )}

        {currentPage === 3 && (
          <BackCoverPage
            guestNotes={guestNotes}
            onAddNote={handleAddGuestNote}
            onDeleteNote={handleDeleteGuestNote}
            onNavigateToCover={() => setCurrentPage(1)}
            onNavigateToAlbum={() => setCurrentPage(2)}
          />
        )}
      </div>

      {/* Batch Upload & Vercel Bundle Modal */}
      {showBatchUpload && (
        <BatchUploadModal
          schedules={SCHEDULES}
          onClose={() => setShowBatchUpload(false)}
          onSavePhoto={handleSavePhoto}
          coverPhoto={coverImage}
          userPhotos={userPhotos}
          guestNotes={guestNotes}
          onImportSuccess={(bundle) => {
            if (bundle.coverPhoto) setCoverImage(bundle.coverPhoto);
            if (bundle.photos) setUserPhotos(bundle.photos);
            if (bundle.guestNotes) setGuestNotes(bundle.guestNotes);
            showToast('✨ 앨범 데이터가 성공적으로 불러와졌습니다!');
          }}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 bg-stone-900 text-white font-serif-kr text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xl border border-stone-700 animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
