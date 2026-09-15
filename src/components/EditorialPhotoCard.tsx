import React, { useState, useEffect } from 'react';
import { Sparkles, Maximize2, Camera, Edit3, Check, RotateCcw } from 'lucide-react';

interface EditorialPhotoCardProps {
  key?: React.Key;
  slotIdx: number;
  scheduleId: string;
  url: string;
  caption: string;
  isCustom: boolean;
  isEditingCaption: boolean;
  tempCaption: string;
  onSetTempCaption: (caption: string) => void;
  onStartEditCaption: () => void;
  onSaveCaption: (caption: string) => void;
  onCancelEditCaption?: () => void;
  onSinglePhotoUpload: (file: File) => void;
  onRemovePhoto: () => void;
  onEnlarge: () => void;
}

export function EditorialPhotoCard({
  slotIdx,
  scheduleId,
  url,
  caption,
  isCustom,
  isEditingCaption,
  tempCaption,
  onSetTempCaption,
  onStartEditCaption,
  onSaveCaption,
  onSinglePhotoUpload,
  onRemovePhoto,
  onEnlarge,
}: EditorialPhotoCardProps) {
  // Automatically detects whether the image is vertically long (portrait: height > width)
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  // Allows user to manually override fit mode:
  // 'half' (default for vertical): cuts left/right black margins in half (~1.45x balanced zoom)
  // 'contain': 100% full height contain without any cropping
  // 'cover': full crop cover
  const [userFitOverride, setUserFitOverride] = useState<'half' | 'contain' | 'cover' | null>(null);

  // When url changes, reset manual override and check aspect ratio
  useEffect(() => {
    setUserFitOverride(null);
    if (!url) {
      setIsPortrait(false);
      return;
    }

    const img = new Image();
    img.src = url;
    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    } else {
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setIsPortrait(img.naturalHeight > img.naturalWidth);
        }
      };
    }
  }, [url]);

  // Effective fit mode:
  // For vertically long photos, default to 'contain' with soft ambient side margins so faces are never cropped.
  // For landscape photos, default to 'cover' (full-frame).
  const fitMode: 'contain' | 'half' | 'cover' = userFitOverride ?? (isPortrait ? 'contain' : 'cover');
  const isLetterbox = fitMode === 'half' || fitMode === 'contain';

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onSinglePhotoUpload(file);
      }}
      className="relative h-full max-h-full bg-white p-2.5 sm:p-3 rounded-xl border border-stone-200 editorial-photo-card flex flex-col justify-between group hover:border-stone-400 transition-all min-h-0 overflow-hidden"
    >
      {/* Editorial Corner Number Tag */}
      <div className="absolute top-2.5 left-3.5 z-10 px-2 py-0.5 bg-stone-900/80 text-white rounded-md text-[10px] font-serif-en tracking-widest uppercase pointer-events-none">
        NO. 0{slotIdx + 1}
      </div>

      {/* Top Right Badges (Portrait fit badge + Custom upload badge) */}
      <div className="absolute top-2.5 right-3.5 z-10 flex items-center gap-1.5">
        {isPortrait && (
          <button
            type="button"
            onClick={() => {
              if (fitMode === 'contain') setUserFitOverride('half');
              else if (fitMode === 'half') setUserFitOverride('cover');
              else setUserFitOverride('contain');
            }}
            className="bg-stone-900/90 hover:bg-black text-stone-200 text-[10px] font-dodum px-2 py-0.5 rounded-md shadow-xs border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="클릭하여 화면 맞춤 방식 변경 (여백 맞춤 / 여백 슬림 / 꽉 채움)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${
                fitMode === 'contain'
                  ? 'bg-emerald-400'
                  : fitMode === 'half'
                  ? 'bg-amber-400'
                  : 'bg-blue-400'
              }`}
            />
            <span>
              {fitMode === 'contain'
                ? '여백 맞춤 (얼굴 보호)'
                : fitMode === 'half'
                ? '여백 슬림 (약간 확대)'
                : '화면 꽉 채움'}
            </span>
          </button>
        )}
        {isCustom && (
          <div className="bg-white/95 text-stone-800 text-[10px] font-serif-kr px-2 py-0.5 rounded-md shadow-xs border border-stone-200 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            직접 등록
          </div>
        )}
      </div>

      {/* Photo Container: For vertical photos, black background with centered photo and black margins on left/right */}
      <div
        className={`relative flex-1 min-h-0 rounded-lg overflow-hidden transition-colors duration-300 group/img my-1 ${
          isLetterbox
            ? 'bg-stone-950 border border-stone-900 flex items-center justify-center'
            : 'bg-stone-50 border border-stone-100'
        }`}
      >
        {/* Soft Ambient Backdrop for portrait photos so side margins feel gentle and narrow */}
        {isLetterbox && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover blur-xl opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-stone-950/70" />
          </div>
        )}

        <img
          src={url}
          alt={caption}
          referrerPolicy="no-referrer"
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth && naturalHeight) {
              setIsPortrait(naturalHeight > naturalWidth);
            }
          }}
          className={
            fitMode === 'contain'
              ? 'relative z-10 h-full w-auto max-w-full max-h-full object-contain mx-auto shadow-2xl rounded-xs group-hover/img:scale-[1.01] transition-transform duration-500'
              : fitMode === 'half'
              ? 'relative z-10 h-full w-auto max-w-none object-contain mx-auto shadow-2xl scale-[1.18] origin-bottom group-hover/img:scale-[1.2] transition-transform duration-500 rounded-xs'
              : isPortrait
              ? 'relative z-10 w-full h-full object-cover object-[center_85%] group-hover/img:scale-102 transition-transform duration-500'
              : 'relative z-10 w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-500'
          }
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 pointer-events-none group-hover/img:pointer-events-auto">
          <button
            onClick={onEnlarge}
            className="px-3.5 py-1.5 bg-white/95 hover:bg-white text-stone-900 rounded-lg shadow text-xs font-serif-kr flex items-center gap-1.5 transition-colors cursor-pointer"
            title="크게 보기"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>확대 보기</span>
          </button>

          <label className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg shadow text-xs font-serif-kr flex items-center gap-1.5 transition-colors cursor-pointer">
            <Camera className="w-3.5 h-3.5" />
            <span>사진 교체</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onSinglePhotoUpload(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Editorial Caption Bar */}
      <div className="shrink-0 pt-1.5 flex items-center justify-between gap-2 text-xs border-t border-stone-100">
        {isEditingCaption ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              type="text"
              value={tempCaption}
              onChange={(e) => onSetTempCaption(e.target.value)}
              placeholder="사진 캡션 입력"
              className="flex-1 px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 font-serif-kr text-stone-900"
              autoFocus
            />
            <button
              onClick={() => onSaveCaption(tempCaption)}
              className="px-2.5 py-1 bg-stone-900 hover:bg-black text-white text-xs font-serif-kr rounded-md cursor-pointer"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <p className="font-gaegu text-base sm:text-lg font-bold text-stone-900 leading-snug truncate">
              <span className="highlighter-pen-yellow">&ldquo;{caption}&rdquo;</span>
            </p>
            <button
              onClick={onStartEditCaption}
              className="text-stone-400 hover:text-stone-900 p-0.5 transition-colors shrink-0 cursor-pointer"
              title="캡션 수정"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <label className="text-stone-600 hover:text-stone-900 cursor-pointer flex items-center gap-1 font-serif-kr bg-stone-50 hover:bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 transition-colors text-xs">
            <Camera className="w-3 h-3 text-stone-500" />
            <span className="hidden sm:inline">교체</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onSinglePhotoUpload(file);
              }}
              className="hidden"
            />
          </label>

          {isCustom && (
            <button
              onClick={onRemovePhoto}
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
}
