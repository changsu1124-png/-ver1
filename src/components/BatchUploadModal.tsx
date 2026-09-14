import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  Globe, 
  Sparkles,
  Info,
  Save,
  Loader2,
  HardDrive
} from 'lucide-react';
import { ScheduleItem, GuestbookNote } from '../types';
import { downloadAlbumBundle, importAlbumBundle, saveToSiteFiles, AlbumBundleData } from '../utils/embeddedStorage';
import { optimizeImage } from '../utils/imageOptimizer';

interface BatchUploadModalProps {
  schedules: ScheduleItem[];
  onClose: () => void;
  onSavePhoto: (scheduleId: string, photoIndex: number, imageUrl: string) => Promise<void>;
  coverPhoto: string;
  userPhotos: Record<string, { [index: number]: { imageUrl: string; caption?: string } }>;
  guestNotes: GuestbookNote[];
  onImportSuccess: (bundle: AlbumBundleData) => void;
}

export function BatchUploadModal({
  schedules,
  onClose,
  onSavePhoto,
  coverPhoto,
  userPhotos,
  guestNotes,
  onImportSuccess,
}: BatchUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'embed'>('upload');

  // Tab 1: Upload state
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.id || 'd1-3');
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: Embedded state
  const [hasCopied, setHasCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId) || schedules[0];
  const maxSlots = currentSchedule?.defaultPhotos?.length || 4;

  // Calculate total customized photos
  const totalCustomPhotos = Object.values(userPhotos).reduce(
    (acc, slotMap) => acc + Object.keys(slotMap).length,
    0
  );

  const handleMultipleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setUploadedCount(0);

    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));

    let currentSchedIdx = schedules.findIndex((s) => s.id === selectedScheduleId);
    let currentSlotIdx = selectedSlot;
    let count = 0;

    for (const file of fileList) {
      if (currentSchedIdx >= schedules.length) break;

      const schedule = schedules[currentSchedIdx];

      // Auto-compress and optimize image to ensure fast loading and crisp resolution
      const optimizedBase64 = await optimizeImage(file, 1600, 1200, 0.85);

      await onSavePhoto(schedule.id, currentSlotIdx, optimizedBase64);
      count++;

      // Advance slot
      const slotsInThisSchedule = schedule.defaultPhotos.length;
      if (currentSlotIdx < slotsInThisSchedule - 1) {
        currentSlotIdx++;
      } else {
        currentSlotIdx = 0;
        currentSchedIdx++;
      }
    }

    setUploadedCount(count);
    setIsProcessing(false);
  };

  // Sync directly to the site codebase (public/photos and src/data/embeddedPhotos.json)
  const handleSyncToSite = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    setSyncProgress(null);
    try {
      const res = await saveToSiteFiles(
        coverPhoto,
        userPhotos,
        guestNotes,
        (current, total, stepText) => {
          setSyncProgress({ current, total, message: stepText });
        }
      );
      if (res.bundle) {
        onImportSuccess(res.bundle);
      }
      setSyncStatus({
        success: true,
        message: res.message || '사이트 파일(public/photos 및 embeddedPhotos.json)에 성공적으로 영구 저장되었습니다!',
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: `저장 중 문제가 발생했습니다: ${err.message || '서버 오류'}. 아래 [배포용 파일 다운로드]로 파일을 직접 덮어씌울 수도 있습니다.`,
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleMultipleFiles(e.dataTransfer.files);
  };

  // Download bundle as JSON file
  const handleDownloadBundle = () => {
    downloadAlbumBundle(coverPhoto, userPhotos, guestNotes);
  };

  // Copy bundle JSON to clipboard
  const handleCopyJson = async () => {
    const bundle: AlbumBundleData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      coverPhoto: coverPhoto || null,
      photos: userPhotos || {},
      guestNotes: guestNotes || [],
    };
    await navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  // Import JSON file
  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const bundle = await importAlbumBundle(text);
      onImportSuccess(bundle);
      setImportStatus('✅ 앨범 데이터 파일이 성공적으로 적용되었습니다!');
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      setImportStatus('❌ 올바르지 않은 앨범 데이터 파일입니다.');
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-dodum">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-900 text-white">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-jua text-base sm:text-xl text-stone-900">
                사진 관리 & Vercel 영구 저장
              </h3>
              <p className="text-xs text-stone-500 font-dodum">
                사진을 첨부하고, 다른 컴퓨터에서도 그대로 보이도록 사이트에 영구 탑재합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 shrink-0 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-jua transition-all cursor-pointer border-t border-x ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 border-stone-200 font-bold -mb-px'
                : 'bg-transparent text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-stone-700" />
            <span>1. 사진 일괄 첨부</span>
            {uploadedCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                +{uploadedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-jua transition-all cursor-pointer border-t border-x ${
              activeTab === 'embed'
                ? 'bg-white text-stone-900 border-stone-200 font-bold -mb-px'
                : 'bg-transparent text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-600" />
            <span>2. Vercel 사이트 자체 영구 저장</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.2 rounded-full font-bold">
              모든 기기 공유
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'upload' ? (
            /* TAB 1: BATCH UPLOAD */
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                <p>
                  여러 장의 사진을 한 번에 선택하거나 드래그하면, 선택한 일정부터 순서대로 빈자리를 채워줍니다.
                  (사진 첨부 후 상단의 <strong className="text-amber-800 font-bold">[2. Vercel 사이트 자체 영구 저장]</strong> 탭을 누르면 모든 컴퓨터에 공유할 수 있습니다.)
                </p>
              </div>

              {/* Schedule Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-jua text-stone-700 mb-1.5">
                    시작할 일정 선택
                  </label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => {
                      setSelectedScheduleId(e.target.value);
                      setSelectedSlot(0);
                    }}
                    className="w-full px-3 py-2 text-xs font-dodum bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer"
                  >
                    {schedules.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        {s.day}일차 #{idx + 1}. {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-jua text-stone-700 mb-1.5">
                    시작할 사진 번호
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-dodum bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer"
                  >
                    {Array.from({ length: maxSlots }, (_, i) => (
                      <option key={i} value={i}>
                        사진 {i + 1}번 자리
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50/70 hover:bg-stone-100/70 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
              >
                <div className="p-3 bg-white rounded-full shadow-xs border border-stone-200">
                  <ImageIcon className="w-7 h-7 text-stone-600" />
                </div>
                <div>
                  <p className="font-jua text-sm text-stone-800">
                    여기로 사진 파일들을 끌어다 놓으세요
                  </p>
                  <p className="text-xs text-stone-500 font-dodum mt-1">
                    또는 클릭하여 컴퓨터/스마트폰에서 사진 여러 장 선택
                  </p>
                </div>
                <span className="inline-block mt-1 px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-jua shadow-sm">
                  사진 파일 선택하기
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMultipleFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Feedback */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 p-3 bg-stone-100 text-stone-800 text-xs font-dodum rounded-lg">
                  <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                  <span>사진들을 최적화하여 앨범에 적용하고 있습니다...</span>
                </div>
              )}

              {uploadedCount > 0 && !isProcessing && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-dodum rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>총 {uploadedCount}장의 사진이 현재 브라우저 앨범에 반영되었습니다!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('embed')}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-jua text-xs rounded shadow-xs"
                  >
                    Vercel 영구 저장하기 →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: VERCEL PERMANENT STORAGE & EXPORT */
            <div className="space-y-4">
              {/* How it works banner */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-jua text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>다른 컴퓨터에서도 사진이 바로 뜨게 하는 원리</span>
                </div>
                <p className="text-xs sm:text-[13px] text-amber-950 font-dodum leading-relaxed">
                  Vercel 배포 시 사진이 사이트 자체 파일(<code>embeddedPhotos.json</code> 또는 <code>/public/photos/</code>)에 포함되어 빌드되면,
                  <strong> 외부 데이터베이스나 로그인 없이도 전 세계 어떤 컴퓨터, 다른 와이파이, 스마트폰에서도 사진이 영구적으로 즉시 표시</strong>됩니다!
                </p>
              </div>

              {/* Current status summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-jua text-stone-800 block">현재 저장 준비된 앨범 사진</span>
                  <span className="text-[11px] text-stone-500 font-dodum">
                    표지 사진 1장 + 세부 일정 등록 사진 {totalCustomPhotos}장 + 소감 한마디 {guestNotes.length}개
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-stone-900 text-white font-jua text-xs">
                  {totalCustomPhotos > 0 ? `${totalCustomPhotos}장 준비됨` : '기본 사진 사용 중'}
                </span>
              </div>

              {/* PRIMARY HERO: One-Click Sync to Site Codebase */}
              <div className="bg-linear-to-r from-stone-900 to-stone-850 text-white rounded-xl p-4.5 border border-stone-700 shadow-md space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-jua text-[11px] font-bold">
                        추천 1순위
                      </span>
                      <h4 className="font-jua text-base sm:text-lg text-white flex items-center gap-1.5">
                        <HardDrive className="w-5 h-5 text-amber-400" />
                        <span>사이트 코드에 영구 동기화 (원클릭 저장)</span>
                      </h4>
                    </div>
                    <p className="text-xs text-stone-300 font-dodum leading-relaxed">
                      현재 웹사이트에 등록된 모든 사진과 표지를 <strong>사이트 정적 파일(/public/photos/ 및 embeddedPhotos.json)</strong>에 즉시 영구 저장합니다. 
                      이 버튼을 누른 후 Vercel로 추출하시면, 다른 어떤 컴퓨터나 휴대폰에서도 사진이 바로 열립니다!
                    </p>
                  </div>
                </div>

                <button
                  id="btn-sync-to-site"
                  onClick={handleSyncToSite}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-jua text-sm sm:text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-bold"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>사이트 정적 파일로 변환 및 영구 저장 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-stone-900" />
                      <span>✨ 지금 사이트 파일에 영구 동기화하기</span>
                    </>
                  )}
                </button>

                {isSyncing && syncProgress && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-stone-950/80 border border-amber-400/40 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-dodum">
                      <span className="text-amber-300 font-semibold truncate pr-2">
                        {syncProgress.message}
                      </span>
                      <span className="text-white font-mono shrink-0">
                        {Math.round((syncProgress.current / Math.max(syncProgress.total, 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-850 rounded-full overflow-hidden border border-stone-700">
                      <div
                        className="h-full bg-linear-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round((syncProgress.current / Math.max(syncProgress.total, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 font-dodum">
                      <span>{syncProgress.current} / {syncProgress.total} 항목 처리됨</span>
                      <span className="text-emerald-400">용량 초과 방지 분할 전송 중</span>
                    </div>
                  </div>
                )}

                {syncStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs font-dodum leading-relaxed animate-fade-in ${
                      syncStatus.success
                        ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50'
                        : 'bg-rose-950/80 text-rose-200 border border-rose-500/50'
                    }`}
                  >
                    {syncStatus.message}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadBundle}
                  className="flex items-center justify-center gap-2 p-3.5 bg-stone-900 hover:bg-black text-white rounded-xl shadow-xs transition-all cursor-pointer text-left"
                >
                  <Download className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-jua text-sm block">배포용 파일 다운로드</span>
                    <span className="text-[10px] text-stone-300 font-dodum">
                      embeddedPhotos.json 파일로 저장
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleCopyJson}
                  className="flex items-center justify-center gap-2 p-3.5 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 rounded-xl shadow-xs transition-all cursor-pointer text-left"
                >
                  {hasCopied ? (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 text-stone-700 shrink-0" />
                  )}
                  <div>
                    <span className="font-jua text-sm block">
                      {hasCopied ? '클립보드에 복사 완료!' : 'JSON 코드 복사하기'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-dodum">
                      클립보드에 전체 데이터 복사
                    </span>
                  </div>
                </button>
              </div>

              {/* Import Section */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-jua text-xs text-stone-800 block">
                    다른 컴퓨터에서 데이터 불러오기
                  </span>
                  <p className="text-[11px] text-stone-500 font-dodum truncate">
                    다운로드해 둔 embeddedPhotos.json 파일을 선택하면 즉시 모든 사진이 복원됩니다.
                  </p>
                </div>
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-jua rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>파일 열기</span>
                </button>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </div>

              {importStatus && (
                <div className="p-3 bg-stone-900 text-white rounded-lg text-xs font-dodum text-center animate-fade-in">
                  {importStatus}
                </div>
              )}

              {/* 3-Step Vercel Deploy Guide */}
              <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-4 space-y-2 text-xs font-dodum text-stone-800">
                <p className="font-jua text-sm text-stone-900 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>Vercel 배포 시 사이트 자체에 영구 고정하는 3단계</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-stone-700">
                  <li>
                    이 웹사이트에서 원하는 사진들을 첨부한 후 <strong>[배포용 파일 다운로드]</strong>를 누릅니다.
                  </li>
                  <li>
                    다운로드된 <code>embeddedPhotos.json</code> 파일을 프로젝트의 <code>/src/data/embeddedPhotos.json</code> 위치에 덮어씌웁니다.
                  </li>
                  <li>
                    GitHub 저장소에 Push하고 Vercel에 배포하면, <strong>전 세계 어떤 컴퓨터나 다른 와이파이에서도 똑같이 사진이 열립니다!</strong>
                  </li>
                </ol>
                <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500">
                  💡 <strong>가장 쉬운 꿀팁</strong>: 가지고 계신 사진들을 AI Studio 채팅창에 바로 올려주시면 제가 사이트 코드에 직접 영구 삽입해 드릴 수도 있습니다!
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-jua rounded-lg transition-colors cursor-pointer"
            >
              완료 및 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
