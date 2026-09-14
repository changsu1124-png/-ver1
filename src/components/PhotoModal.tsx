import React, { useState } from 'react';
import { X, Camera, Download, RotateCcw, Check, Sparkles } from 'lucide-react';
import { ScheduleItem } from '../types';

interface PhotoModalProps {
  schedule: ScheduleItem;
  photoIndex: 0 | 1;
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-amber-50 border-b border-amber-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-jua px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                {schedule.day}일차 · 일정 {schedule.order}
              </span>
              <span className="text-xs text-stone-500 font-dodum">
                사진 {photoIndex + 1} / 2
              </span>
            </div>
            <h3 className="font-jua text-base sm:text-lg text-stone-900 mt-0.5">
              {schedule.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Canvas */}
        <div className="relative bg-stone-950 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={caption}
            referrerPolicy="no-referrer"
            className="max-h-[60vh] w-auto object-contain mx-auto"
          />
          {isCustom && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-jua px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              내가 첨부한 사진
            </span>
          )}
        </div>

        {/* Caption & Controls */}
        <div className="p-4 sm:p-5 bg-[#FFFDF9] space-y-3">
          {/* Caption Input */}
          <div>
            <label className="block text-xs font-jua text-stone-600 mb-1">
              추억 메모 / 사진 캡션
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingCaption}
                onChange={(e) => setEditingCaption(e.target.value)}
                placeholder="이 사진에 담긴 추억을 남겨보세요..."
                className="flex-1 px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-dodum text-stone-800"
              />
              <button
                onClick={handleSaveCaption}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-jua rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                <span>{isSaved ? '저장됨' : '메모 저장'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-jua rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-amber-700" />
                <span>새 사진으로 교체</span>
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
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-dodum rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  기본 사진으로 복원
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-dodum rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                사진 저장
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-jua rounded-xl transition-colors cursor-pointer"
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
