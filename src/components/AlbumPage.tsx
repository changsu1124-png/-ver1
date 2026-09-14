import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Upload, 
  Maximize2, 
  RotateCcw, 
  Clock, 
  MapPin, 
  Sparkles, 
  Check, 
  Edit3, 
  BookOpen, 
  Grid, 
  ArrowLeft, 
  Bookmark,
  Calendar
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { PhotoModal } from './PhotoModal';

interface AlbumPageProps {
  schedules: ScheduleItem[];
  userPhotos: Record<string, { [index: number]: { imageUrl: string; caption?: string } }>;
  onSavePhoto: (scheduleId: string, photoIndex: 0 | 1, imageUrl: string, caption?: string) => Promise<void>;
  onRemovePhoto: (scheduleId: string, photoIndex: 0 | 1) => Promise<void>;
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
  // Current active schedule index (0 to 20)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDayFilter, setSelectedDayFilter] = useState<0 | 1 | 2>(0); // 0 = all, 1 = day1, 2 = day2
  const [viewMode, setViewMode] = useState<'book' | 'grid'>('book');

  // Active modal for enlarging photo
  const [modalData, setModalData] = useState<{
    schedule: ScheduleItem;
    photoIndex: 0 | 1;
  } | null>(null);

  // Quick caption editing inline
  const [editingCaptionSlot, setEditingCaptionSlot] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState('');

  const currentSchedule = schedules[currentIndex] || schedules[0];

  // Filtered schedules for grid view
  const filteredSchedules = schedules.filter((s) => {
    if (selectedDayFilter === 0) return true;
    return s.day === selectedDayFilter;
  });

  // Navigation handlers
  const handlePrevSchedule = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onNavigateToCover();
    }
  };

  const handleNextSchedule = () => {
    if (currentIndex < schedules.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onNavigateToBackCover();
    }
  };

  // Upload handler for single photo slot
  const handleSinglePhotoUpload = (
    scheduleId: string,
    photoIndex: 0 | 1,
    file: File
  ) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSavePhoto(scheduleId, photoIndex, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const getPhotoData = (schedule: ScheduleItem, photoIndex: 0 | 1) => {
    const custom = userPhotos[schedule.id]?.[photoIndex];
    if (custom) {
      return {
        url: custom.imageUrl,
        caption: custom.caption || schedule.defaultCaptions[photoIndex],
        isCustom: true,
      };
    }
    return {
      url: schedule.defaultPhotos[photoIndex],
      caption: schedule.defaultCaptions[photoIndex],
      isCustom: false,
    };
  };

  return (
    <main className="h-full max-h-full flex flex-col justify-between max-w-[98vw] w-full mx-auto px-2 sm:px-4 py-1 sm:py-2 animate-fade-in overflow-hidden">
      {/* Top Compact Controls & Status Bar */}
      <div className="shrink-0 bg-[#FFFDF9] rounded-xl p-1.5 sm:p-2 border border-amber-200/90 shadow-2xs mb-1.5 flex items-center justify-between gap-2">
        {/* Day Filters */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-jua text-stone-600 hidden sm:inline">일정:</span>
          <button
            onClick={() => setSelectedDayFilter(0)}
            className={`px-2 py-0.5 rounded-lg text-xs font-jua transition-all cursor-pointer ${
              selectedDayFilter === 0
                ? 'bg-amber-500 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            전체 (21)
          </button>
          <button
            onClick={() => {
              setSelectedDayFilter(1);
              const firstDay1 = schedules.findIndex((s) => s.day === 1);
              if (firstDay1 !== -1 && viewMode === 'book') setCurrentIndex(firstDay1);
            }}
            className={`px-2 py-0.5 rounded-lg text-xs font-jua transition-all cursor-pointer ${
              selectedDayFilter === 1
                ? 'bg-sky-500 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            1일차 (12)
          </button>
          <button
            onClick={() => {
              setSelectedDayFilter(2);
              const firstDay2 = schedules.findIndex((s) => s.day === 2);
              if (firstDay2 !== -1 && viewMode === 'book') setCurrentIndex(firstDay2);
            }}
            className={`px-2 py-0.5 rounded-lg text-xs font-jua transition-all cursor-pointer ${
              selectedDayFilter === 2
                ? 'bg-emerald-500 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            2일차 (9)
          </button>
        </div>

        {/* Schedule title teaser in header on small screens */}
        <div className="hidden md:flex items-center gap-2 text-xs font-dodum text-stone-600">
          <span className="font-jua text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
            {currentIndex + 1} / {schedules.length}
          </span>
          <span className="truncate max-w-sm font-semibold">{currentSchedule.title}</span>
        </div>

        {/* View Mode & Batch Upload */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenBatchUpload}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-jua transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">사진 첨부</span>
          </button>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode('book')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-jua transition-all cursor-pointer ${
                viewMode === 'book'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="앨범 넘겨보기"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">앨범 넘기기</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-jua transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="전체 모아보기"
            >
              <Grid className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">모아보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SINGLE-SCREEN BOOK SPREAD (Fits completely without scrolling) */}
      {viewMode === 'book' ? (
        <div className="flex-1 min-h-0 flex flex-col justify-between bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F7F0E3] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border-3 sm:border-4 border-amber-300/80 shadow-xl book-spine-shadow overflow-hidden">
          {/* Simple Clean Schedule Header */}
          <div className="shrink-0 flex items-center justify-between gap-2 pb-1.5 border-b border-amber-200/80">
            <div className="min-w-0 flex items-center gap-2">
              <span className={`text-xs sm:text-sm font-jua px-2.5 py-0.5 rounded-lg shadow-2xs font-bold shrink-0 ${
                currentSchedule.day === 1 
                  ? 'bg-sky-100 text-sky-900 border border-sky-300' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {currentSchedule.day}일차
              </span>
              <h2 className="font-jua text-base sm:text-2xl text-stone-900 tracking-tight truncate">
                {currentSchedule.title}
              </h2>
              <span className="text-xs text-stone-500 font-dodum bg-white/80 px-2 py-0.5 rounded-md border border-stone-200 shrink-0 hidden sm:inline">
                {currentSchedule.time}
              </span>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="font-jua text-xs sm:text-sm text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                {currentIndex + 1} / {schedules.length}
              </span>
            </div>
          </div>

          {/* Main 2 Photos Stage: Maximized to fill all remaining vertical and horizontal space */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 py-1 items-stretch">
            {[0, 1].map((slot) => {
              const photoIndex = slot as 0 | 1;
              const { url, caption, isCustom } = getPhotoData(currentSchedule, photoIndex);
              const isEditingCaption = editingCaptionSlot === `${currentSchedule.id}_${photoIndex}`;

              return (
                <div
                  key={slot}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleSinglePhotoUpload(currentSchedule.id, photoIndex, file);
                  }}
                  className="relative h-full max-h-full bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-stone-200/80 flex flex-col justify-between group hover:shadow-lg transition-all min-h-0 overflow-hidden"
                >
                  {/* Tape Label */}
                  <div className="absolute top-1.5 left-4 z-10 px-2 py-0.5 bg-amber-200/90 -rotate-2 rounded-xs border border-amber-300 shadow-2xs flex items-center justify-center text-[10px] font-gaegu font-bold text-amber-900 pointer-events-none">
                    사진 {slot + 1}
                  </div>

                  {/* Custom Image Badge */}
                  {isCustom && (
                    <div className="absolute top-1.5 right-4 z-10 bg-amber-500 text-white text-[10px] font-jua px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      내 사진
                    </div>
                  )}

                  {/* Photo Frame Container - Maximized Height & Fill */}
                  <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group/img my-1">
                    <img
                      src={url}
                      alt={caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300"
                    />

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => setModalData({ schedule: currentSchedule, photoIndex })}
                        className="px-3 py-1.5 bg-white/95 hover:bg-white text-stone-800 rounded-xl shadow text-xs font-jua flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="크게 보기"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>확대해서 보기</span>
                      </button>

                      <label className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow text-xs font-jua flex items-center gap-1.5 transition-colors cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                        <span>사진 바꾸기</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSinglePhotoUpload(currentSchedule.id, photoIndex, file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Compact Single-Line Caption & Actions Area */}
                  <div className="shrink-0 pt-1 flex items-center justify-between gap-2 text-xs">
                    {isEditingCaption ? (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <input
                          type="text"
                          value={tempCaption}
                          onChange={(e) => setTempCaption(e.target.value)}
                          placeholder="사진 메모 입력"
                          className="flex-1 px-2 py-0.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-dodum text-stone-800"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            onSavePhoto(currentSchedule.id, photoIndex, url, tempCaption);
                            setEditingCaptionSlot(null);
                          }}
                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-jua rounded-lg cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <p className="font-gaegu text-sm sm:text-base font-bold text-stone-800 leading-tight truncate">
                          &ldquo;{caption}&rdquo;
                        </p>
                        <button
                          onClick={() => {
                            setTempCaption(caption);
                            setEditingCaptionSlot(`${currentSchedule.id}_${photoIndex}`);
                          }}
                          className="text-stone-400 hover:text-amber-700 p-0.5 transition-colors shrink-0 cursor-pointer"
                          title="캡션 수정"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Right: Quick Photo actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="text-amber-800 hover:text-amber-950 cursor-pointer flex items-center gap-1 font-jua bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors text-xs">
                        <Camera className="w-3 h-3 text-amber-600" />
                        <span>사진 변경</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSinglePhotoUpload(currentSchedule.id, photoIndex, file);
                          }}
                          className="hidden"
                        />
                      </label>

                      {isCustom && (
                        <button
                          onClick={() => onRemovePhoto(currentSchedule.id, photoIndex)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="기본 사진으로 복원"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation & Compact 21 Timeline Bar (shrink-0) */}
          <div className="shrink-0 pt-1.5 mt-1 border-t border-amber-200/80 flex items-center justify-between gap-2">
            <button
              id="btn-prev-schedule"
              onClick={handlePrevSchedule}
              className="px-3 py-1 bg-white hover:bg-stone-50 text-stone-800 font-jua text-xs sm:text-sm rounded-xl border border-stone-300 shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentIndex === 0 ? '◀ 1페이지 표지' : '이전 일정'}</span>
            </button>

            {/* Mini Timeline Dots for 21 schedules */}
            <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-md px-2 py-0.5 bg-white/60 rounded-xl border border-amber-200/60">
              {schedules.map((s, idx) => {
                const isCurrent = idx === currentIndex;
                const hasCustom = !!userPhotos[s.id]?.[0] || !!userPhotos[s.id]?.[1];

                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    title={`${s.day}일차: ${s.title}`}
                    className={`w-4 h-4 rounded-full text-[9px] font-jua flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-white scale-110 shadow-xs font-bold'
                        : hasCustom
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-next-schedule"
              onClick={handleNextSchedule}
              className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-jua text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1 transition-all cursor-pointer shrink-0"
            >
              <span>{currentIndex === schedules.length - 1 ? '3페이지 뒷장 ▶' : '다음 일정'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: COMPLETE GALLERY GRID (Contained within viewport scroll) */
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSchedules.map((schedule) => {
              const p1 = getPhotoData(schedule, 0);
              const p2 = getPhotoData(schedule, 1);

              return (
                <div
                  key={schedule.id}
                  className="bg-[#FFFDF9] rounded-2xl p-3 border border-amber-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-jua px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {schedule.day}일차 #{schedule.order}
                      </span>
                      <span className="text-[10px] font-dodum text-stone-500">
                        {schedule.time}
                      </span>
                    </div>
                    <h3 className="font-jua text-sm text-stone-900 leading-snug">
                      {schedule.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-dodum truncate">
                      {schedule.location}
                    </p>
                  </div>

                  {/* 2 Photos Mini Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      onClick={() => {
                        const idx = schedules.findIndex((s) => s.id === schedule.id);
                        if (idx !== -1) {
                          setCurrentIndex(idx);
                          setViewMode('book');
                        }
                      }}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer group"
                    >
                      <img
                        src={p1.url}
                        alt={p1.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-jua">
                        앨범 보기
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        const idx = schedules.findIndex((s) => s.id === schedule.id);
                        if (idx !== -1) {
                          setCurrentIndex(idx);
                          setViewMode('book');
                        }
                      }}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer group"
                    >
                      <img
                        src={p2.url}
                        alt={p2.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-jua">
                        앨범 보기
                      </div>
                    </div>
                  </div>
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
            setModalData(null);
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
