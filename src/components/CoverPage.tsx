import React, { useRef } from 'react';
import { Sparkles, ArrowRight, Camera, Music, Train, Award, MapPin, Utensils, Heart } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

interface CoverPageProps {
  coverImage: string;
  onCoverImageChange: (imageUrl: string) => void;
  onOpenAlbum: () => void;
  audioPlaying: boolean;
  onToggleAudio: () => void;
}

export function CoverPage({
  coverImage,
  onCoverImageChange,
  onOpenAlbum,
  audioPlaying,
  onToggleAudio,
}: CoverPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const optimized = await optimizeImage(file, 1920, 1280, 0.88);
    onCoverImageChange(optimized);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const optimized = await optimizeImage(file, 1920, 1280, 0.88);
      onCoverImageChange(optimized);
    }
  };

  const handleOpenAlbum = () => {
    if (!audioPlaying) {
      onToggleAudio();
    }
    onOpenAlbum();
  };

  return (
    <main className="h-full max-h-full flex flex-col justify-center max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3 animate-fade-in overflow-hidden">
      {/* Editorial Book Cover Card (Fits completely in 1 screen) */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-9 border border-stone-200/90 shadow-xl editorial-shadow flex flex-col justify-between max-h-full overflow-hidden">
        
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-jua px-3 py-1 bg-stone-100 text-stone-800 rounded-md border border-stone-200">
              2026학년도 온정초등학교
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-dodum tracking-wider px-2.5 py-1 text-stone-600 border border-stone-200 rounded-md">
              도시문화체험 앨범
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-dodum text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-stone-400" />
            <span>1박 2일 도시문화체험학습 아카이브</span>
          </div>
        </div>

        {/* 2-Column Responsive Center Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center flex-1 min-h-0 overflow-hidden py-1">
          {/* Left Column: Title, Subtitle, Highlights & Action */}
          <div className="md:col-span-7 flex flex-col justify-between h-full min-h-0 space-y-3">
            <div>
              <p className="font-gaegu text-stone-800 text-lg sm:text-xl font-bold mb-1 flex items-center gap-1.5">
                <span>✨</span>
                <span className="highlighter-pen-peach">우리들의 소중한 순간들 · 경주 · 부산 · 울산</span>
              </p>
              <h1
                id="cover-title"
                className="font-jua text-3xl sm:text-5xl md:text-6xl text-stone-900 tracking-tight leading-tight"
              >
                온정초 도시문화체험<br />
                <span className="text-stone-800">추억 포토 앨범</span>
              </h1>

              <p className="font-dodum text-sm sm:text-base text-stone-800 font-medium leading-relaxed mt-2.5">
                <span className="highlighter-pen-yellow">경주 KTX 초고속 열차</span>부터{' '}
                <span className="highlighter-pen-mint">부산 키자니아 직업체험</span>,{' '}
                <span className="highlighter-pen-peach">울산 문수경기장 K리그 직관</span>과{' '}
                <span className="highlighter-pen-yellow">태화강 동굴피아</span>까지!<br className="hidden sm:inline" />
                온정초등학교 아이들의{' '}
                <span className="highlighter-pen-mint">생생한 웃음과 따뜻한 성장</span>을 화보로 엮었습니다.
              </p>
            </div>

            {/* 6 Journey Highlights in Compact 2x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="bg-stone-50 border border-stone-300 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors hover:bg-stone-100 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <Train className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-jua text-stone-900 truncate">경주 KTX 탑승</p>
                  <p className="text-[11px] text-stone-700 font-dodum font-semibold truncate">시속 300km 질주</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-300 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors hover:bg-stone-100 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-jua text-stone-900 truncate">부산 키자니아</p>
                  <p className="text-[11px] text-stone-700 font-dodum font-semibold truncate">진로 직업 & 키조</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-300 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors hover:bg-stone-100 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-jua text-stone-900 truncate">K리그 직관 응원</p>
                  <p className="text-[11px] text-stone-700 font-dodum font-semibold truncate">문수아레나 경기장</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-300 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors hover:bg-stone-100 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-jua text-stone-900 truncate">신라스테이 울산</p>
                  <p className="text-[11px] text-stone-700 font-dodum font-semibold truncate">호텔 뷔페 조식</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-300 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors hover:bg-stone-100 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-jua text-stone-900 truncate">태화강 동굴피아</p>
                  <p className="text-[11px] text-stone-700 font-dodum font-semibold truncate">빛과 역사 탐구</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-300 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors hover:bg-stone-100 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-jua text-stone-900 truncate">애슐리퀸즈 만찬</p>
                  <p className="text-[11px] text-stone-700 font-dodum font-semibold truncate">양식 식사 에티켓</p>
                </div>
              </div>
            </div>

            {/* Action Button & Audio note */}
            <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                id="btn-open-album-page2"
                onClick={handleOpenAlbum}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 bg-stone-900 hover:bg-black text-white font-jua text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>추억 앨범 펼쳐보기 📖</span>
                <ArrowRight className="w-5 h-5 text-stone-300" />
              </button>

              <div className="text-xs font-dodum text-stone-500 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>잔잔한 피아노 음악과 꽃잎이 함께합니다</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Photo Frame */}
          <div className="md:col-span-5 flex flex-col items-center justify-center h-full min-h-0">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative w-full max-w-sm bg-white p-3.5 rounded-xl shadow-lg border border-stone-200 group flex flex-col"
            >
              {/* Photo Box */}
              <div className="relative aspect-[4/3] max-h-[38vh] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={coverImage}
                  alt="온정초 도시문화체험 단체 사진"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-3">
                  <button
                    id="btn-change-cover-photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-stone-900 font-jua rounded-lg shadow-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-stone-100"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    표지 사진 변경하기
                  </button>
                  <p className="text-[10px] text-stone-200 font-dodum">
                    사진 파일을 드래그하여 바로 변경할 수도 있습니다
                  </p>
                </div>

                <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-dodum text-white border border-stone-700 flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  <span>온정초등학교 추억 기록</span>
                </div>
              </div>

              {/* Bottom Caption */}
              <div className="pt-2.5 flex items-center justify-between gap-1 px-1">
                <span className="font-gaegu text-base sm:text-lg text-stone-700 font-bold">
                  &ldquo;더 넓은 세상을 향해 씩씩하게 걸어간 시간&rdquo;
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-dodum text-stone-500 hover:text-stone-900 underline flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <Camera className="w-3 h-3" />
                  <span>교체</span>
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Footer Editorial Info */}
        <div className="shrink-0 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs font-dodum text-stone-500">
          <span>📅 9월 8일(화)~9월 9일(수) · 경주 · 부산 · 울산 1박 2일</span>
          <span className="hidden sm:inline">
            💡 키보드 <kbd className="px-1.5 py-0.5 bg-stone-100 text-stone-800 rounded font-mono text-[10px] border border-stone-300">Space</kbd> 또는 <kbd className="px-1.5 py-0.5 bg-stone-100 text-stone-800 rounded font-mono text-[10px] border border-stone-300">→</kbd> 키로 페이지를 넘길 수 있습니다.
          </span>
        </div>
      </div>
    </main>
  );
}
