import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ScheduleItem } from '../types';

interface BatchUploadModalProps {
  schedules: ScheduleItem[];
  onClose: () => void;
  onSavePhoto: (scheduleId: string, photoIndex: 0 | 1, imageUrl: string) => Promise<void>;
}

export function BatchUploadModal({
  schedules,
  onClose,
  onSavePhoto,
}: BatchUploadModalProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(schedules[0].id);
  const [selectedSlot, setSelectedSlot] = useState<0 | 1>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMultipleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    let currentSchedIdx = schedules.findIndex((s) => s.id === selectedScheduleId);
    if (currentSchedIdx === -1) currentSchedIdx = 0;
    let currentSlotIdx = selectedSlot;
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const schedule = schedules[currentSchedIdx];
      if (!schedule) break;

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      await onSavePhoto(schedule.id, currentSlotIdx as 0 | 1, base64);
      count++;

      // Advance slot: 0 -> 1 -> next schedule 0
      if (currentSlotIdx === 0) {
        currentSlotIdx = 1;
      } else {
        currentSlotIdx = 0;
        currentSchedIdx++;
      }
    }

    setUploadedCount(count);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleMultipleFiles(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-200 text-amber-900">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-jua text-lg text-stone-900">사진 일괄 첨부</h3>
              <p className="text-xs text-stone-600 font-dodum">
                내 컴퓨터의 여러 장 사진을 순서대로 일정에 쏙쏙 넣어보세요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Starting Position Selection */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <label className="block text-xs font-jua text-amber-900">
              📌 몇 번째 일정부터 채워 넣을까요?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] font-dodum text-stone-500 block mb-1">시작 일정 선택</span>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full text-xs font-dodum bg-white border border-stone-300 rounded-xl p-2 text-stone-800 focus:ring-2 focus:ring-amber-400"
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.day}일차 #{s.order}] {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-dodum text-stone-500 block mb-1">시작 사진 위치</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(0)}
                    className={`flex-1 py-1.5 text-xs font-jua rounded-xl border transition-all ${
                      selectedSlot === 0
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    첫 번째 사진 (1번)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(1)}
                    className={`flex-1 py-1.5 text-xs font-jua rounded-xl border transition-all ${
                      selectedSlot === 1
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    두 번째 사진 (2번)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50/70 transition-all rounded-2xl p-8 text-center cursor-pointer group"
          >
            <div className="w-14 h-14 bg-amber-100 group-hover:bg-amber-200 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors shadow-2xs">
              <ImageIcon className="w-7 h-7" />
            </div>
            <p className="font-jua text-base text-stone-800 mb-1">
              클릭하여 사진 파일들을 선택하세요
            </p>
            <p className="text-xs text-stone-500 font-dodum mb-3">
              또는 이미지 파일 여러 개를 여기에 끌어다 놓으세요 (JPG, PNG, WebP)
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-jua text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              선택한 장수만큼 일정 1개당 2장씩 자동 배치됩니다
            </span>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={(e) => handleMultipleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Status Message */}
          {isProcessing && (
            <div className="p-3 bg-amber-100 text-amber-900 rounded-xl text-xs font-jua text-center animate-pulse">
              사진을 최적화하여 앨범에 저장하는 중입니다... 잠시만 기다려주세요!
            </div>
          )}

          {uploadedCount > 0 && !isProcessing && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-jua flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>총 {uploadedCount}장의 사진이 성공적으로 앨범에 등록되었습니다!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-jua text-xs rounded-xl transition-colors cursor-pointer"
          >
            확인 / 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
