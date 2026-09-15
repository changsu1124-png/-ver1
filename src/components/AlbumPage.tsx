import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Upload, 
  Maximize2, 
  RotateCcw, 
  Check, 
  Edit3, 
  BookOpen, 
  Grid, 
  Sparkles,
  Layers,
  MapPin,
  Clock
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { PhotoModal } from './PhotoModal';
import { EditorialPhotoCard } from './EditorialPhotoCard';
import { optimizeImage } from '../utils/imageOptimizer';

interface AlbumPageProps {
  schedules: ScheduleItem[];
  userPhotos: Record<string, { [index: number]: { imageUrl: string; caption?: string } }>;
  onSavePhoto: (scheduleId: string, photoIndex: number, imageUrl: string, caption?: string) => Promise<void>;
  onRemovePhoto: (scheduleId: string, photoIndex: number) => Promise<void>;
  onNavigateToCover: () => void;
  onNavigateToBackCover: () => void;
  onOpenBatchUpload: () => void;
}

export function AlbumPage({
  schedules,
  userPhotos,
  onSavePhoto,
  onRemovePhoto,
  onNavigateToCover,
  onNavigateToBackCover,
  onOpenBatchUpload,
}: AlbumPageProps) {
  // Current active schedule index (0 to 9)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Current sub-page inside the active schedule (0 to pageCount - 1)
  const [currentPageInSchedule, setCurrentPageInSchedule] = useState(0);
  const [selectedDayFilter, setSelectedDayFilter] = useState<0 | 1 | 2 | 3>(0);
  const [viewMode, setViewMode] = useState<'book' | 'grid'>('book');

  // Active modal for enlarging photo
  const [modalData, setModalData] = useState<{
    schedule: ScheduleItem;
    photoIndex: number;
  } | null>(null);

  // Quick caption editing inline
  const [editingCaptionSlot, setEditingCaptionSlot] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState('');

  const currentSchedule = schedules[currentIndex] || schedules[0];
  const pageCount = currentSchedule.pageCount || 2;

  // Filtered schedules for grid view
  const filteredSchedules = schedules.filter((s) => {
    if (selectedDayFilter === 0) return true;
    return s.day === selectedDayFilter;
  });

  // Calculate global page number (for editorial elegance)
  let totalPrecedingPages = 0;
  for (let i = 0; i < currentIndex; i++) {
    totalPrecedingPages += schedules[i].pageCount || 2;
  }
  const currentGlobalPage = totalPrecedingPages + currentPageInSchedule + 1;
  const totalGlobalPages = schedules.reduce((acc, s) => acc + (s.pageCount || 2), 0);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPageInSchedule > 0) {
      setCurrentPageInSchedule(currentPageInSchedule - 1);
    } else if (currentIndex > 0) {
      const prevSched = schedules[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setCurrentPageInSchedule((prevSched.pageCount || 2) - 1);
    } else {
      onNavigateToCover();
    }
  };

  const handleNextPage = () => {
    if (currentPageInSchedule < pageCount - 1) {
      setCurrentPageInSchedule(currentPageInSchedule + 1);
    } else if (currentIndex < schedules.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentPageInSchedule(0);
    } else {
      onNavigateToBackCover();
    }
  };

  // Upload handler for single photo slot
  const handleSinglePhotoUpload = async (
    scheduleId: string,
    photoIndex: number,
    file: File
  ) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const optimized = await optimizeImage(file, 1600, 1200, 0.85);
      await onSavePhoto(scheduleId, photoIndex, optimized);
    } catch (err) {
      console.error('Failed to process image:', err);
    }
  };

  const getPhotoData = (schedule: ScheduleItem, photoIndex: number) => {
    const custom = userPhotos[schedule.id]?.[photoIndex];
    if (custom) {
      return {
        url: custom.imageUrl,
        caption: custom.caption || schedule.defaultCaptions[photoIndex] || '소중한 추억의 한 장면',
        isCustom: true,
      };
    }
    return {
      url: schedule.defaultPhotos[photoIndex] || schedule.defaultPhotos[0],
      caption: schedule.defaultCaptions[photoIndex] || '소중한 추억의 한 장면',
      isCustom: false,
    };
  };

  // Photo indices for the current sub-page
  const slotIndex1 = currentPageInSchedule * 2;
  const slotIndex2 = currentPageInSchedule * 2 + 1;

  return (
    <main className="h-full max-h-full flex flex-col justify-between max-w-[98vw] w-full mx-auto px-2 sm:px-4 py-1 sm:py-2 animate-fade-in overflow-hidden">
      {/* Top Editorial Bar: Filter, Global Page, Batch Upload & View Toggle */}
      <header className="shrink-0 bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 border border-stone-200 shadow-xs mb-1.5 flex items-center justify-between gap-3">
        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-serif-kr text-stone-500 uppercase tracking-widest hidden sm:inline mr-1">
            Section
          </span>
          <button
            onClick={() => {
              setSelectedDayFilter(0);
              setCurrentIndex(0);
              setCurrentPageInSchedule(0);
            }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-serif-kr transition-all cursor-pointer ${
              selectedDayFilter === 0
                ? 'bg-stone-900 text-white font-medium shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 ({schedules.length})
          </button>
          <button
            onClick={() => {
              setSelectedDayFilter(1);
              setCurrentIndex(0);
              setCurrentPageInSchedule(0);
            }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-serif-kr transition-all cursor-pointer ${
              selectedDayFilter === 1
                ? 'bg-stone-900 text-white font-medium shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            1일차 ({schedules.filter((s) => s.day === 1).length})
          </button>
          <button
            onClick={() => {
              setSelectedDayFilter(2);
              const firstDay2Index = schedules.findIndex((s) => s.day === 2);
              if (firstDay2Index !== -1) setCurrentIndex(firstDay2Index);
              setCurrentPageInSchedule(0);
            }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-serif-kr transition-all cursor-pointer ${
              selectedDayFilter === 2
                ? 'bg-stone-900 text-white font-medium shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            2일차 ({schedules.filter((s) => s.day === 2).length})
          </button>
          <button
            onClick={() => {
              setSelectedDayFilter(3);
              const firstDay3Index = schedules.findIndex((s) => s.day === 3);
              if (firstDay3Index !== -1) setCurrentIndex(firstDay3Index);
              setCurrentPageInSchedule(0);
            }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-serif-kr transition-all cursor-pointer ${
              selectedDayFilter === 3
                ? 'bg-stone-900 text-white font-medium shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            개인 앨범 ({schedules.filter((s) => s.day === 3).length})
          </button>
        </div>

        {/* Global Page Indicator (Editorial Magazine Style) */}
        <div className="flex items-center gap-2 text-stone-700">
          <span className="font-serif-en text-sm tracking-widest uppercase text-stone-400 hidden md:inline">
            Edition 2026
          </span>
          <span className="hidden md:inline text-stone-300">|</span>
          <span className="font-serif-en text-xs tracking-wider text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">
            Page <strong className="text-stone-900 font-semibold">{currentGlobalPage}</strong> of {totalGlobalPages}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBatchUpload}
            className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-serif-kr transition-colors border border-stone-200 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">사진 첨부</span>
          </button>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode('book')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-serif-kr transition-all cursor-pointer ${
                viewMode === 'book'
                  ? 'bg-white text-stone-900 shadow-2xs font-medium'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="앨범 넘겨보기"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">에디토리얼 북</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-serif-kr transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs font-medium'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="전체 사진 모아보기"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">모아보기</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW MODE 1: WHITE EDITORIAL BOOK SPREAD */}
      {viewMode === 'book' ? (
        <div className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-stone-200/90 shadow-xl editorial-shadow overflow-hidden">
          {/* Schedule Title & Sub-Page Selector Header */}
          <div className="shrink-0 flex items-center justify-between gap-3 pb-2.5 border-b border-stone-200">
            <div className="min-w-0 flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className="text-xs font-jua px-2.5 py-1 rounded-md bg-stone-900 text-white shadow-2xs shrink-0">
                {currentSchedule.day === 3 ? '개인 앨범' : `${currentSchedule.day}일차 #${currentSchedule.order}`}
              </span>
              <h2 className="font-jua text-lg sm:text-2xl text-stone-900 tracking-tight truncate">
                {currentSchedule.title}
              </h2>

              <div className="flex items-center gap-1.5 flex-wrap">
                {currentSchedule.grade && (
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-dodum font-bold text-stone-900 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                    <span className="highlighter-pen-yellow">온정초 {currentSchedule.grade}학년</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-dodum font-bold text-stone-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="highlighter-pen-yellow">{currentSchedule.time}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-dodum font-bold text-stone-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="highlighter-pen-mint">{currentSchedule.location}</span>
                </span>
              </div>
            </div>

            {/* Sub-page Selector Pills */}
            <div className="shrink-0 flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-300">
              <span className="text-xs font-dodum font-bold text-stone-700 px-1.5 hidden md:inline">
                {currentSchedule.day === 3 ? '개인 사진 2컷' : `총 ${pageCount}페이지 (사진 ${currentSchedule.defaultPhotos.length}장)`}
              </span>
              {Array.from({ length: pageCount }, (_, pIdx) => {
                const isCurrent = pIdx === currentPageInSchedule;
                const photoA = pIdx * 2;
                const photoB = pIdx * 2 + 1;
                return (
                  <button
                    key={pIdx}
                    onClick={() => setCurrentPageInSchedule(pIdx)}
                    className={`px-2.5 py-1 rounded-md text-xs font-jua transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-stone-900 text-white font-bold shadow-xs'
                        : 'text-stone-700 hover:text-black hover:bg-stone-200'
                    }`}
                  >
                    {pageCount === 1 ? '사진 1 · 2' : `${pIdx + 1}장 (${photoA + 1}·${photoB + 1})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Student Selector Bar for 개인 앨범 */}
          {(currentSchedule.day === 3 || selectedDayFilter === 3) && (
            <div className="shrink-0 py-1.5 px-2.5 bg-stone-50/90 rounded-xl border border-stone-200 my-1 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-jua text-stone-600 shrink-0 flex items-center gap-1">
                <span>학생 선택</span>
                <span className="text-[10px] text-stone-400">({schedules.filter((s) => s.day === 3).length}명)</span>:
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {schedules
                  .filter((s) => s.day === 3)
                  .map((student) => {
                    const isSelected = student.id === currentSchedule.id;
                    return (
                      <button
                        key={student.id}
                        onClick={() => {
                          const idx = schedules.findIndex((s) => s.id === student.id);
                          if (idx !== -1) {
                            setCurrentIndex(idx);
                            setCurrentPageInSchedule(0);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-xs font-serif-kr transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          isSelected
                            ? 'bg-stone-900 text-white font-bold shadow-xs scale-105'
                            : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                        }`}
                      >
                        <span className="text-[10px] text-stone-400 font-normal">{student.grade}학년</span>
                        <span>{student.studentName || student.title}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 2 Big Editorial Photos of the current page */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-2 items-stretch">
            {[slotIndex1, slotIndex2].map((slotIdx) => {
              const { url, caption, isCustom } = getPhotoData(currentSchedule, slotIdx);
              const isEditingCaption = editingCaptionSlot === `${currentSchedule.id}_${slotIdx}`;

              return (
                <EditorialPhotoCard
                  key={`${currentSchedule.id}_${slotIdx}`}
                  slotIdx={slotIdx}
                  scheduleId={currentSchedule.id}
                  url={url}
                  caption={caption}
                  isCustom={isCustom}
                  isEditingCaption={isEditingCaption}
                  tempCaption={tempCaption}
                  onSetTempCaption={setTempCaption}
                  onStartEditCaption={() => {
                    setTempCaption(caption);
                    setEditingCaptionSlot(`${currentSchedule.id}_${slotIdx}`);
                  }}
                  onSaveCaption={(newCaption) => {
                    onSavePhoto(currentSchedule.id, slotIdx, url, newCaption);
                    setEditingCaptionSlot(null);
                  }}
                  onSinglePhotoUpload={(file) => handleSinglePhotoUpload(currentSchedule.id, slotIdx, file)}
                  onRemovePhoto={() => onRemovePhoto(currentSchedule.id, slotIdx)}
                  onEnlarge={() => setModalData({ schedule: currentSchedule, photoIndex: slotIdx })}
                />
              );
            })}
          </div>

          {/* Bottom Editorial Navigation & Schedule Timeline Bar */}
          <footer className="shrink-0 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
            <button
              id="btn-prev-page"
              onClick={handlePrevPage}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 font-serif-kr text-xs sm:text-sm rounded-lg border border-stone-300 shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600" />
              <span>
                {currentIndex === 0 && currentPageInSchedule === 0 
                  ? '◀ 1페이지 표지' 
                  : '이전 페이지'}
              </span>
            </button>

            {/* Schedules Timeline */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-lg px-2.5 py-1 bg-stone-50 rounded-xl border border-stone-200">
              {schedules.map((s, idx) => {
                const isCurrent = idx === currentIndex;
                const hasCustom = Object.keys(userPhotos[s.id] || {}).length > 0;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setCurrentPageInSchedule(0);
                    }}
                    title={`${s.day === 3 ? '개인 앨범' : `${s.day}일차`} ${s.title} (${s.pageCount}페이지)`}
                    className={`h-5 min-w-[20px] px-1.5 rounded-md text-[10px] font-serif-kr flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-stone-900 text-white font-semibold shadow-xs scale-105'
                        : hasCustom
                        ? 'bg-stone-300 text-stone-900 font-medium'
                        : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    <span>{s.day === 3 ? (s.studentName || s.title) : idx + 1}</span>
                    {s.day !== 3 && s.pageCount !== 2 && (
                      <span className="text-[8px] opacity-75">({s.defaultPhotos.length})</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-next-page"
              onClick={handleNextPage}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white font-serif-kr text-xs sm:text-sm rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer shrink-0"
            >
              <span>
                {currentIndex === schedules.length - 1 && currentPageInSchedule === pageCount - 1
                  ? '뒷표지 방명록 ▶' 
                  : '다음 페이지'}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-200" />
            </button>
          </footer>
        </div>
      ) : (
        /* VIEW MODE 2: COMPLETE GALLERY GRID (White Editorial) */
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSchedules.map((schedule) => {
              const photosToRender = schedule.defaultPhotos.map((_, i) => getPhotoData(schedule, i));

              return (
                <div
                  key={schedule.id}
                  className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-jua px-2 py-0.5 rounded-md bg-stone-900 text-white">
                        {schedule.day === 3 ? '개인 앨범' : `${schedule.day}일차 #${schedule.order}`}
                      </span>
                      <span className="text-[11px] font-dodum font-bold text-stone-600">
                        {schedule.day === 3 ? `${schedule.grade}학년 · 사진 2장` : `${schedule.pageCount}페이지 (${schedule.defaultPhotos.length}장)`}
                      </span>
                    </div>
                    <h3 className="font-jua text-base text-stone-900 leading-snug">
                      {schedule.title}
                    </h3>
                    <p className="text-xs text-stone-800 font-dodum font-semibold truncate mt-1">
                      <span className="highlighter-pen-mint">{schedule.location}</span> · <span className="highlighter-pen-yellow">{schedule.time}</span>
                    </p>
                  </div>

                  {/* Photo Grid preview */}
                  <div
                    className={`grid ${
                      schedule.defaultPhotos.length > 6
                        ? 'grid-cols-4 sm:grid-cols-6'
                        : schedule.defaultPhotos.length > 2
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                        : 'grid-cols-2'
                    } gap-1.5`}
                  >
                    {photosToRender.map((p, pIdx) => (
                      <div 
                        key={pIdx}
                        onClick={() => {
                          const idx = schedules.findIndex((s) => s.id === schedule.id);
                          if (idx !== -1) {
                            setCurrentIndex(idx);
                            setCurrentPageInSchedule(Math.floor(pIdx / 2));
                            setViewMode('book');
                          }
                        }}
                        className="relative aspect-square rounded-md overflow-hidden bg-stone-50 border border-stone-200 cursor-pointer group"
                      >
                        <img
                          src={p.url}
                          alt={p.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-serif-kr">
                          사진 {pIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const idx = schedules.findIndex((s) => s.id === schedule.id);
                      if (idx !== -1) {
                        setCurrentIndex(idx);
                        setCurrentPageInSchedule(0);
                        setViewMode('book');
                      }
                    }}
                    className="w-full py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-serif-kr rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    {schedule.day === 3 ? '개인 앨범 펼치기' : '이 일정 에디토리얼 펼치기'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {modalData && (
        <PhotoModal
          schedule={modalData.schedule}
          photoIndex={modalData.photoIndex}
          imageUrl={getPhotoData(modalData.schedule, modalData.photoIndex).url}
          caption={getPhotoData(modalData.schedule, modalData.photoIndex).caption}
          isCustom={getPhotoData(modalData.schedule, modalData.photoIndex).isCustom}
          onClose={() => setModalData(null)}
          onUpdatePhoto={(newUrl, newCap) => {
            onSavePhoto(modalData.schedule.id, modalData.photoIndex, newUrl, newCap);
          }}
          onResetPhoto={() => {
            onRemovePhoto(modalData.schedule.id, modalData.photoIndex);
            setModalData(null);
          }}
        />
      )}
    </main>
  );
}
