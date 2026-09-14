import React, { useRef } from 'react';
import { Camera, ArrowRight, Sparkles, MapPin, Award, Train, Utensils, Heart, Music } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoverPageProps {
  coverImage: string;
  onCoverImageChange: (dataUrl: string) => void;
  onNavigateToAlbum: () => void;
  onStartBgmIfNeeded?: () => void;
}

export function CoverPage({
  coverImage,
  onCoverImageChange,
  onNavigateToAlbum,
  onStartBgmIfNeeded,
}: CoverPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCoverImageChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCoverImageChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAlbum = () => {
    if (onStartBgmIfNeeded) {
      onStartBgmIfNeeded();
    }
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.75 },
      colors: ['#f59e0b', '#38bdf8', '#fb7185', '#34d399', '#a855f7'],
    });
    onNavigateToAlbum();
  };

  return (
    <main className="h-full max-h-full flex flex-col justify-center max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3 animate-fade-in overflow-hidden">
      {/* Book Cover Card Container (Fits completely in 1 screen) */}
      <div className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5EFE1] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-3 sm:border-4 border-amber-300/80 shadow-xl book-shadow flex flex-col justify-between max-h-full overflow-hidden">
        {/* Decorative corner washi tape */}
        <div className="absolute top-2 left-6 w-20 h-5 bg-rose-200/80 -rotate-12 rounded-xs border-t border-b border-rose-300 shadow-2xs pointer-events-none opacity-80" />
        <div className="absolute top-2 right-6 w-20 h-5 bg-amber-200/80 rotate-12 rounded-xs border-t border-b border-amber-300 shadow-2xs pointer-events-none opacity-80" />

        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-gaegu font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-2xs rotate-[-1deg]">
              ✨ 2026학년도 온정초등학교
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-gaegu font-bold px-2.5 py-0.5 bg-sky-100 text-sky-900 rounded-full border border-sky-300 shadow-2xs rotate-[1deg]">
              🎒 1박 2일 도시문화체험학습
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-dodum text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full border border-amber-300">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>함께 웃고 배우며 성장한 1박 2일</span>
          </div>
        </div>

        {/* 2-Column Responsive Center Content (Fits in 1 Screen without scrolling) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center flex-1 min-h-0 overflow-hidden py-1">
          {/* Left Column: Title, Subtitle, Highlights & Action (7 cols on md) */}
          <div className="md:col-span-7 flex flex-col justify-between h-full min-h-0 space-y-2.5 sm:space-y-3">
            <div>
              <h2
                id="cover-title"
                className="font-jua text-2xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight leading-tight drop-shadow-xs"
              >
                온정초 도시문화체험<br />
                <span className="text-amber-700">추억 앨범</span> 🌸
              </h2>

              <p className="font-dodum text-xs sm:text-sm text-stone-600 leading-relaxed mt-1.5 line-clamp-2 sm:line-clamp-none">
                경주 KTX 탑승부터 부산 키자니아 직업체험, 울산 문수축구경기장 관람과 태화강 동굴피아까지!
                온정초 친구들의 빛나는 첫 발걸음과 소중한 추억을 한 권에 담았습니다.
              </p>
            </div>

            {/* 6 Journey Highlights in Compact 2x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-white/85 border border-amber-200/90 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Train className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-800 font-jua truncate">시속 300km KTX</p>
                  <p className="text-[9px] text-stone-500 font-dodum truncate">경주역 → 부산역</p>
                </div>
              </div>

              <div className="bg-white/85 border border-amber-200/90 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-800 font-jua truncate">키자니아 체험</p>
                  <p className="text-[9px] text-stone-500 font-dodum truncate">부산 센텀시티</p>
                </div>
              </div>

              <div className="bg-white/85 border border-amber-200/90 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-800 font-jua truncate">문수경기장 축구</p>
                  <p className="text-[9px] text-stone-500 font-dodum truncate">K리그 직관 응원</p>
                </div>
              </div>

              <div className="bg-white/85 border border-amber-200/90 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-800 font-jua truncate">신라스테이 울산</p>
                  <p className="text-[9px] text-stone-500 font-dodum truncate">호텔 숙박 & 조식</p>
                </div>
              </div>

              <div className="bg-white/85 border border-amber-200/90 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-800 font-jua truncate">태화강 동굴피아</p>
                  <p className="text-[9px] text-stone-500 font-dodum truncate">역사 & 은하수 빛</p>
                </div>
              </div>

              <div className="bg-white/85 border border-amber-200/90 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-800 font-jua truncate">애슐리퀸즈 식사</p>
                  <p className="text-[9px] text-stone-500 font-dodum truncate">양식 에티켓 체험</p>
                </div>
              </div>
            </div>

            {/* Action Buttons & Audio Note */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button
                id="btn-open-album-page2"
                onClick={handleOpenAlbum}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-jua text-base sm:text-lg rounded-2xl shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <span>추억 앨범 펼치기 📖</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-[11px] font-dodum text-stone-500 flex items-center gap-1.5">
                <Music className="w-3 h-3 text-amber-600 shrink-0" />
                <span>잔잔한 피아노 음악과 함께 넘겨보세요</span>
              </div>
            </div>
          </div>

          {/* Right Column: Polaroid Group Photo Scrap (5 cols on md) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center h-full min-h-0">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative w-full max-w-sm bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-stone-200/90 rotate-[-1deg] hover:rotate-0 transition-transform duration-300 group flex flex-col"
            >
              {/* Top Washi Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-amber-300/90 rounded-xs -rotate-2 border border-amber-400/80 shadow-2xs flex items-center justify-center text-[10px] font-gaegu font-bold text-amber-950 pointer-events-none z-10">
                우리들의 소중한 순간 📷
              </div>

              {/* Photo Box with Max Height fit */}
              <div className="relative aspect-[4/3] max-h-[38vh] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={coverImage}
                  alt="온정초 도시문화체험 단체 사진"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />

                {/* Hover Overlay to Change Cover Photo */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-3">
                  <button
                    id="btn-change-cover-photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-jua rounded-xl shadow-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    표지 사진 내 파일로 바꾸기
                  </button>
                  <p className="text-[10px] text-amber-100 font-dodum">
                    또는 사진을 여기에 드래그 앤 드롭
                  </p>
                </div>

                {/* Cute Bottom Overlay Badge */}
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-dodum text-stone-800 shadow-2xs border border-white/60 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>온정초등학교 전교생 & 선생님</span>
                </div>
              </div>

              {/* Polaroid Bottom Handwritten Caption */}
              <div className="pt-2 flex items-center justify-between gap-1 px-1">
                <span className="font-gaegu text-base sm:text-lg font-bold text-stone-700">
                  &ldquo;더 넓은 세상을 향해 씩씩하게 출발!&rdquo;
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-dodum text-amber-700 hover:text-amber-900 underline flex items-center gap-0.5 cursor-pointer shrink-0"
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

        {/* Footer Quick Shortcuts Hint Bar */}
        <div className="shrink-0 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] font-gaegu text-stone-600">
          <span>📅 2026.09.04 ~ 09.05 · 경주 / 부산 / 울산 1박 2일</span>
          <span className="hidden sm:inline">
            💡 키보드 <kbd className="px-1.5 py-0.2 bg-stone-200 text-stone-800 rounded font-mono font-bold text-[10px] border border-stone-300">Space</kbd> 또는 <kbd className="px-1.5 py-0.2 bg-stone-200 text-stone-800 rounded font-mono font-bold text-[10px] border border-stone-300">→</kbd> 키로 바로 다음 페이지로 이동합니다.
          </span>
        </div>
      </div>
    </main>
  );
}
