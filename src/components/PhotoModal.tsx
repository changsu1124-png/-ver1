import React, { useState } from 'react';
import { X, Camera, Download, RotateCcw, Check, Sparkles } from 'lucide-react';
import { ScheduleItem } from '../types';

interface PhotoModalProps {
  schedule: ScheduleItem;
  photoIndex: number;
  imageUrl: string;
  caption: string;
  isCustom: boolean;
  onClose: () => void;
  onUpdatePhoto: (newImageUrl: string, newCaption?: string) => void;
  onResetPhoto: () => void;
}

export function PhotoModal({
  schedule,
  photoIndex,
  imageUrl,
  caption,
  isCustom,
  onClose,
  onUpdatePhoto,
  onResetPhoto,
}: PhotoModalProps) {
  const [editingCaption, setEditingCaption] = useState(caption);
  const [isSaved, setIsSaved] = useState(false);

  const totalPhotosInSchedule = schedule.defaultPhotos.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdatePhoto(reader.result, editingCaption);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCaption = () => {
    onUpdatePhoto(imageUrl, editingCaption);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `온정초_추억_${schedule.id}_사진${photoIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in font-dodum">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-jua px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                {schedule.day === 3 ? '개인 앨범' : `${schedule.day}일차 · #${schedule.order}`}
              </span>
              <span className="text-xs text-stone-500 font-dodum">
                {schedule.day === 3 ? `${schedule.title} (${photoIndex + 1}/${totalPhotosInSchedule})` : `사진 ${photoIndex + 1} / ${totalPhotosInSchedule}`}
              </span>
            </div>
            <h3 className="font-jua text-base sm:text-xl text-stone-900 mt-1">
              {schedule.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo View */}
        <div className="relative bg-stone-950 flex items-center justify-center min-h-[320px] max-h-[60vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={caption}
            referrerPolicy="no-referrer"
            className="max-h-[60vh] w-auto object-contain mx-auto"
          />
          {isCustom && (
            <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-xs font-jua px-2.5 py-1 rounded-md shadow-md border border-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              직접 첨부한 사진
            </span>
          )}
        </div>

        {/* Caption & Controls */}
        <div className="p-5 bg-white space-y-3.5">
          {/* Caption Input */}
          <div>
            <label className="block text-xs font-jua text-stone-600 mb-1.5">
              사진 메모 및 기록
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingCaption}
                onChange={(e) => setEditingCaption(e.target.value)}
                placeholder="이 장면에 담긴 따뜻한 추억을 적어보세요..."
                className="flex-1 px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 font-dodum text-stone-900"
              />
              <button
                onClick={handleSaveCaption}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-jua rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{isSaved ? '저장 완료' : '메모 저장'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <label className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-jua rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-200">
                <Camera className="w-3.5 h-3.5 text-stone-600" />
                <span>사진 변경하기</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {isCustom && (
                <button
                  onClick={onResetPhoto}
                  className="px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-600 text-xs font-jua rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-stone-200"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                  기본 사진으로 복원
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-jua rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                사진 내려받기
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-jua rounded-lg transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
