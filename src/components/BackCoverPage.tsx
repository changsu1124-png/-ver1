import React, { useState } from 'react';
import { Heart, Award, MessageCircle, Send, Trash2, ArrowLeft, Home, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GuestbookNote } from '../types';

interface BackCoverPageProps {
  guestNotes: GuestbookNote[];
  onAddNote: (note: Omit<GuestbookNote, 'id' | 'date'>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onNavigateToCover: () => void;
  onNavigateToAlbum: () => void;
}

export function BackCoverPage({
  guestNotes,
  onAddNote,
  onDeleteNote,
  onNavigateToCover,
  onNavigateToAlbum,
}: BackCoverPageProps) {
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState<'학생' | '학부모' | '선생님'>('학생');
  const [noteMessage, setNoteMessage] = useState('');
  const [noteColor, setNoteColor] = useState('yellow');
  const [stampActive, setStampActive] = useState(false);

  const handleConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#34d399', '#a855f7'],
    });
  };

  const handleStampClick = () => {
    setStampActive(true);
    handleConfetti();
    setTimeout(() => setStampActive(false), 1200);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !noteMessage.trim()) return;

    await onAddNote({
      author: authorName.trim(),
      role: authorRole,
      message: noteMessage.trim(),
      color: noteColor,
    });

    setAuthorName('');
    setNoteMessage('');
    handleConfetti();
  };

  return (
    <main className="h-full max-h-full flex flex-col justify-between max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 animate-fade-in overflow-hidden">
      {/* Back Cover Card Container (Fits completely in 1 screen) */}
      <div className="relative flex-1 min-h-0 flex flex-col justify-between bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5EFE1] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 border-3 sm:border-4 border-amber-300/80 shadow-2xl book-shadow overflow-hidden">
        {/* Decorative corner washi tape */}
        <div className="absolute -top-2.5 left-8 w-24 h-5 bg-amber-200/90 rotate-[-5deg] rounded-xs border-t border-b border-amber-300 shadow-2xs pointer-events-none" />
        <div className="absolute -top-2.5 right-8 w-24 h-5 bg-sky-200/90 rotate-[5deg] rounded-xs border-t border-b border-sky-300 shadow-2xs pointer-events-none" />

        {/* Back Cover Top Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-200/80">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-gaegu font-bold px-3 py-0.5 bg-amber-200/80 text-amber-950 rounded-full border border-amber-300 shadow-2xs">
            🌸 온정초 도시문화체험 추억 앨범 · 뒷장
          </span>

          <button
            onClick={handleConfetti}
            className="text-xs font-jua px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
          >
            <PartyPopper className="w-3.5 h-3.5 text-amber-700" />
            <span>꽃가루 날리기 🎉</span>
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Commemorative Essay & Stamp & Back Navigation (md:col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-between h-full min-h-0 space-y-2">
            {/* Heartfelt Commemorative Closing Essay */}
            <div className="relative bg-white/90 rounded-2xl p-3 sm:p-4 border border-amber-200/90 shadow-xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-2xs">
                    <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <h2 className="font-jua text-lg sm:text-xl text-stone-900 leading-snug">
                    &ldquo;너희들이 머문 모든 자리가<br />눈부신 추억이 되었단다&rdquo;
                  </h2>
                </div>

                <div className="text-xs sm:text-[13px] font-dodum text-stone-700 leading-relaxed space-y-1 pt-1">
                  <p>
                    함께 웃고 함께 걸었던 1박 2일의 모든 순간들이 우리 온정초 친구들 마음속에 반짝이는 보물로 남기를 바랍니다.
                  </p>
                  <p className="text-stone-600 hidden sm:block">
                    시속 300km KTX의 설렘, 키자니아에서 미래를 꿈꾸던 호기심, 문수경기장의 열띤 함성과 신라스테이의 포근한 밤까지...
                  </p>
                  <p className="font-gaegu text-sm sm:text-base font-bold text-amber-900 pt-0.5">
                    서로를 배려하며 한 뼘 더 자란 온정초 꿈나무들아, 더 넓은 세상을 향해 자신감 넘치게 날아오르렴! 💛
                  </p>
                </div>
              </div>

              {/* School Stamp Section */}
              <div className="pt-2 border-t border-amber-100 flex items-center justify-between shrink-0">
                <div className="text-[11px] font-gaegu text-stone-500">
                  <span>온정초 도시문화체험</span><br />
                  <span className="text-amber-800 font-bold">참 잘했어요 수료 도장</span>
                </div>

                <button
                  id="btn-stamp-reward"
                  onClick={handleStampClick}
                  title="도장을 콕 누르면 축하 꽃가루가 터져요!"
                  className={`group relative p-1 rounded-xl transition-transform cursor-pointer ${
                    stampActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full border-3 border-dashed border-rose-500/80 bg-rose-50/60 flex flex-col items-center justify-center text-rose-600 rotate-[-6deg] shadow-2xs group-hover:rotate-0 transition-transform">
                    <Award className="w-5 h-5 text-rose-500" />
                    <span className="font-jua text-[10px] leading-none mt-0.5">도시문화체험</span>
                    <span className="font-jua text-xs font-bold leading-none mt-0.5">참 잘했어요!</span>
                    <span className="font-dodum text-[8px] text-rose-400 mt-0.5">온정초등학교</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="shrink-0 flex items-center justify-between gap-2 pt-1">
              <button
                onClick={onNavigateToAlbum}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-800 font-jua text-xs sm:text-sm rounded-xl border border-stone-300 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
                <span>2. 추억 앨범 보기</span>
              </button>

              <button
                onClick={onNavigateToCover}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-jua text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>1. 처음 표지로 🏠</span>
              </button>
            </div>
          </div>

          {/* Right Column: Rolling Paper & Note Submission Form (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col justify-between h-full min-h-0 bg-white/70 p-3 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <div className="shrink-0 flex items-center justify-between">
              <h3 className="font-jua text-sm sm:text-base text-stone-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <span>선생님과 부모님, 친구들의 한마디 💌</span>
              </h3>
              <span className="text-[11px] font-dodum text-stone-500">
                총 {guestNotes.length}개의 응원 메모
              </span>
            </div>

            {/* Sticky Notes Scrollable Container */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guestNotes.map((note) => {
                  const bgClass =
                    note.color === 'pink'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : note.color === 'sky'
                      ? 'bg-sky-50 border-sky-200 text-sky-950'
                      : note.color === 'mint'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950';

                  const roleBadge =
                    note.role === '선생님'
                      ? 'bg-amber-200 text-amber-900'
                      : note.role === '학부모'
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-sky-200 text-sky-900';

                  return (
                    <div
                      key={note.id}
                      className={`relative p-2.5 rounded-xl border shadow-2xs flex flex-col justify-between group hover:shadow-xs transition-all ${bgClass}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-jua px-1.5 py-0.2 rounded-full ${roleBadge}`}>
                            {note.role} · {note.author}
                          </span>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="메모 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-gaegu text-sm sm:text-base font-bold leading-snug whitespace-pre-line">
                          &ldquo;{note.message}&rdquo;
                        </p>
                      </div>
                      <span className="text-[9px] text-stone-400 font-dodum text-right mt-1">
                        {note.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Sticky Note Form (shrink-0) */}
            <form
              onSubmit={handleFormSubmit}
              className="shrink-0 bg-white p-2.5 rounded-xl border border-amber-200/90 shadow-2xs space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="작성자 이름 (예: 김민준, 민준 맘)"
                  className="px-2.5 py-1 text-xs font-dodum bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 text-stone-800"
                  required
                />

                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as '학생' | '학부모' | '선생님')}
                  className="px-2.5 py-1 text-xs font-jua bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 text-stone-800"
                >
                  <option value="학생">🎒 학생</option>
                  <option value="학부모">🌸 학부모</option>
                  <option value="선생님">🏫 선생님</option>
                </select>

                <div className="flex items-center gap-1.5 px-1 justify-end sm:justify-start">
                  <span className="text-[10px] font-dodum text-stone-500">색상:</span>
                  {[
                    { id: 'yellow', color: 'bg-amber-300' },
                    { id: 'pink', color: 'bg-rose-300' },
                    { id: 'sky', color: 'bg-sky-300' },
                    { id: 'mint', color: 'bg-emerald-300' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNoteColor(item.id)}
                      className={`w-5 h-5 rounded-full ${item.color} border-2 transition-all cursor-pointer ${
                        noteColor === item.id ? 'border-stone-800 scale-110 shadow-xs' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="따뜻한 응원이나 기억에 남는 추억 한 줄을 적어주세요..."
                  className="flex-1 px-2.5 py-1 text-xs font-dodum bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 text-stone-800"
                  required
                />
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-jua text-xs rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>남기기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
