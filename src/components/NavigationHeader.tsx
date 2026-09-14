import React, { useState } from 'react';
import { BookOpen, Home, Bookmark, Upload, ChevronLeft, ChevronRight, Music, Volume2, VolumeX, Disc3, Check, Sparkles, Flower2 } from 'lucide-react';
import { TrackId, PianoTrack } from '../utils/pianoBgm';

interface NavigationHeaderProps {
  currentPage: 1 | 2 | 3;
  onPageChange: (page: 1 | 2 | 3) => void;
  onOpenBatchUpload: () => void;
  totalCustomPhotos: number;
  isPlayingBgm: boolean;
  onToggleBgm: () => void;
  bgmVolume: number;
  onChangeVolume: (vol: number) => void;
  currentTrackId: TrackId;
  onSelectTrack: (trackId: TrackId) => void;
  tracks: PianoTrack[];
  scheduleCount?: number;
  petalsEnabled?: boolean;
  onTogglePetals?: () => void;
}

export function NavigationHeader({
  currentPage,
  onPageChange,
  onOpenBatchUpload,
  totalCustomPhotos,
  isPlayingBgm,
  onToggleBgm,
  bgmVolume,
  onChangeVolume,
  currentTrackId,
  onSelectTrack,
  tracks,
  scheduleCount = 10,
  petalsEnabled = true,
  onTogglePetals,
}: NavigationHeaderProps) {
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  return (
    <header className="shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: School Title */}
        <div 
          onClick={() => onPageChange(1)}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-jua text-sm shadow-xs group-hover:scale-103 transition-transform">
            온정
          </div>
          <div>
            <h1 className="font-jua text-sm sm:text-base text-stone-900 leading-tight flex items-center gap-2">
              <span>온정초 도시문화체험</span>
              <span className="hidden md:inline-block text-[11px] font-dodum bg-stone-100 text-stone-700 px-2 py-0.2 rounded-full border border-stone-200">
                추억 앨범
              </span>
            </h1>
            <p className="text-xs text-stone-700 font-dodum font-semibold hidden sm:block">
              <span className="highlighter-pen-yellow">9월 8일(화)~9월 9일(수)</span> · 경주 · 부산 · 울산 1박 2일
            </p>
          </div>
        </div>

        {/* Center: 3 Major Book Sections */}
        <nav className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
          <button
            id="nav-tab-page-1"
            onClick={() => onPageChange(1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              currentPage === 1
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-stone-600" />
            <span>1. 앨범 표지</span>
          </button>

          <button
            id="nav-tab-page-2"
            onClick={() => onPageChange(2)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              currentPage === 2
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-700" />
            <span>2. 추억 앨범</span>
            <span className="text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded font-dodum hidden sm:inline-block">
              {scheduleCount}
            </span>
          </button>

          <button
            id="nav-tab-page-3"
            onClick={() => onPageChange(3)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              currentPage === 3
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-stone-600" />
            <span>3. 앨범 뒷장</span>
          </button>
        </nav>

        {/* Right: Petals Toggle, BGM, Batch Upload, Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Falling Petals Toggle */}
          {onTogglePetals && (
            <button
              onClick={onTogglePetals}
              title={petalsEnabled ? '꽃잎 효과 일시정지' : '꽃잎 효과 켜기'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-jua border transition-all cursor-pointer ${
                petalsEnabled
                  ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-2xs'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-400'
              }`}
            >
              <Flower2 className={`w-3.5 h-3.5 ${petalsEnabled ? 'text-rose-500 animate-spin-slow' : 'text-stone-400'}`} />
              <span className="hidden lg:inline text-[11px]">꽃잎</span>
            </button>
          )}

          {/* Piano BGM Toggle Button & Music Menu */}
          <div className="relative flex items-center">
            <button
              id="btn-toggle-bgm"
              onClick={onToggleBgm}
              title={isPlayingBgm ? '잔잔한 피아노 음악 일시정지' : '잔잔한 피아노 음악 켜기'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-jua border transition-all cursor-pointer ${
                isPlayingBgm
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              <Music className={`w-3.5 h-3.5 ${isPlayingBgm ? 'text-amber-300' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">
                {isPlayingBgm ? currentTrack.title.split('(')[0].trim() : '피아노 BGM'}
              </span>
              {isPlayingBgm && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                </span>
              )}
            </button>

            {/* Music Options & Track Menu Button */}
            <button
              id="btn-music-options"
              onClick={() => setShowMusicMenu(!showMusicMenu)}
              className={`p-1.5 ml-1 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer border ${
                showMusicMenu ? 'bg-stone-100 border-stone-300 text-stone-900' : 'border-stone-200'
              }`}
              title="피아노 곡 변경 및 볼륨 설정"
            >
              <Disc3 className={`w-3.5 h-3.5 ${isPlayingBgm ? 'text-stone-900 animate-spin' : 'text-stone-500'}`} style={{ animationDuration: '6s' }} />
            </button>

            {/* Music Settings Popover */}
            {showMusicMenu && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl shadow-xl border border-stone-200 w-72 sm:w-80 animate-fade-in text-stone-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-stone-700" />
                    <span className="font-jua text-sm text-stone-900">피아노 음악 설정</span>
                  </div>
                  <span className="text-[10px] font-dodum bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-2.5 h-2.5" />
                    저작권 안심
                  </span>
                </div>

                {/* Volume Slider */}
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-jua text-stone-700">
                    <span className="flex items-center gap-1.5">
                      {bgmVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-stone-700" />}
                      <span>음량 조절</span>
                    </span>
                    <span className="text-stone-500 font-dodum text-xs">
                      {Math.round(bgmVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVolume}
                    onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                  />
                </div>

                {/* Playlist Selection */}
                <div className="space-y-1.5">
                  <span className="text-xs font-jua text-stone-600 block">연주곡 선택</span>
                  <div className="space-y-1">
                    {tracks.map((t) => {
                      const isSelected = t.id === currentTrackId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTrack(t.id);
                            if (!isPlayingBgm) onToggleBgm();
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 border cursor-pointer ${
                            isSelected
                              ? 'bg-stone-100 border-stone-400 shadow-2xs font-medium'
                              : 'bg-white hover:bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-jua text-stone-900 text-xs truncate">
                                {t.title}
                              </span>
                              <span className="text-[9px] font-dodum px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 shrink-0 font-medium">
                                {t.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400 font-dodum truncate mt-0.5">
                              {t.composer}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 font-dodum text-center pt-1 border-t border-stone-100">
                  모든 음원은 Musopen 퍼블릭 도메인(CC0)으로, 학교 및 교육용으로 저작권 걱정 없이 자유롭게 감상하실 수 있습니다.
                </p>
              </div>
            )}
          </div>

          <button
            id="btn-batch-upload"
            onClick={onOpenBatchUpload}
            title="사진 일괄 첨부 및 Vercel 배포용 영구 저장"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-jua bg-stone-900 hover:bg-black text-white shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">사진 첨부 · Vercel 영구저장</span>
            <span className="sm:hidden">사진 관리</span>
            {totalCustomPhotos > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {totalCustomPhotos}
              </span>
            )}
          </button>

          {/* Quick Page Prev/Next buttons */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
            <button
              id="btn-prev-page"
              onClick={() => onPageChange(Math.max(1, currentPage - 1) as 1 | 2 | 3)}
              disabled={currentPage === 1}
              className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-600 rounded hover:bg-white transition-all cursor-pointer"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-jua text-stone-600 px-1">
              {currentPage}/3
            </span>
            <button
              id="btn-next-page"
              onClick={() => onPageChange(Math.min(3, currentPage + 1) as 1 | 2 | 3)}
              disabled={currentPage === 3}
              className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-600 rounded hover:bg-white transition-all cursor-pointer"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
