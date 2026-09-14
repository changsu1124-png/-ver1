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
      colors: ['#e7e5e4', '#d6d3d1', '#fbbf24', '#f43f5e', '#a8a29e'],
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
    <main className="h-full max-h-full flex flex-col justify-between max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 animate-fade-in overflow-hidden font-dodum">
      {/* Back Cover Card Container - White Editorial Tone */}
      <div className="relative flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-stone-200 shadow-2xl editorial-shadow overflow-hidden">
        
        {/* Back Cover Top Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 pb-3 mb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-jua px-3 py-1 bg-stone-100 text-stone-800 rounded-md border border-stone-200">
              온정초 도시문화체험 앨범 · 아카이브 맺음말
            </span>
            <span className="text-xs font-dodum text-stone-400 hidden sm:inline">
              수고 많았어요, 온정초 친구들!
            </span>
          </div>

          <button
            onClick={handleConfetti}
            className="text-xs font-jua px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
          >
            <PartyPopper className="w-3.5 h-3.5 text-stone-600" />
            <span>축하 꽃가루 날리기 🎉</span>
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Commemorative Essay & Stamp & Navigation */}
          <div className="md:col-span-5 flex flex-col justify-between h-full min-h-0 space-y-3">
            {/* Essay Card */}
            <div className="relative bg-stone-50/70 rounded-xl p-4 sm:p-5 border border-stone-200 flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white text-stone-800 rounded-full flex items-center justify-center shrink-0 border border-stone-200 shadow-2xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  <h2 className="font-jua text-base sm:text-lg text-stone-900 leading-snug">
                    &ldquo;우리가 함께 걸었던 모든 길은<br />눈부신 성장의 추억이 되었습니다&rdquo;
                  </h2>
                </div>

                <div className="text-sm sm:text-[14px] font-dodum text-stone-800 font-medium leading-relaxed space-y-2 pt-1">
                  <p>
                    친구들과 손을 잡고{' '}
                    <span className="highlighter-pen-yellow">시속 300km KTX를 탔던 두근거림</span>,{' '}
                    <span className="highlighter-pen-mint">키자니아에서 발견한 미래의 꿈</span>,{' '}
                    <span className="highlighter-pen-peach">울산 문수경기장의 뜨거웠던 함성</span>과{' '}
                    <span className="highlighter-pen-yellow">태화강 동굴피아의 신비로운 불빛</span>까지...
                  </p>
                  <p>
                    서로를 따뜻하게 배려하며 한 뼘 더 의젓하게 자라난 온정초등학교 어린이들,{' '}
                    <span className="highlighter-pen-mint">세상이라는 더 넓은 바다를 향해 활짝 날개를 펼치길</span> 응원합니다!
                  </p>
                </div>
              </div>

              {/* Commemorative Stamp */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between shrink-0">
                <div className="text-xs font-dodum text-stone-500">
                  <span className="font-bold text-stone-800 font-jua">도시문화체험학습 수료</span><br />
                  <span className="text-[11px] text-stone-400">온정초등학교 공식 인증</span>
                </div>

                <button
                  id="btn-stamp-reward"
                  onClick={handleStampClick}
                  title="인증 도장을 누르면 축하 꽃가루가 피어납니다"
                  className={`group relative p-1 rounded-xl transition-transform cursor-pointer ${
                    stampActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-stone-700 bg-white flex flex-col items-center justify-center text-stone-800 rotate-[-3deg] shadow-xs group-hover:rotate-0 transition-transform">
                    <Award className="w-4 h-4 text-stone-700" />
                    <span className="font-jua text-[10px] leading-none mt-1">도시문화체험</span>
                    <span className="font-jua text-xs leading-none mt-0.5 text-stone-900">참 잘했어요</span>
                    <span className="font-dodum text-[8px] text-stone-400 mt-1">온정초등학교</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="shrink-0 flex items-center justify-between gap-2 pt-1">
              <button
                onClick={onNavigateToAlbum}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-800 font-jua text-xs sm:text-sm rounded-lg border border-stone-300 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
                <span>추억 앨범 펼쳐보기</span>
              </button>

              <button
                onClick={onNavigateToCover}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-black text-white font-jua text-xs sm:text-sm rounded-lg shadow-sm transition-all hover:scale-101 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>표지로 돌아가기</span>
              </button>
            </div>
          </div>

          {/* Right Column: Guestbook & Messages */}
          <div className="md:col-span-7 flex flex-col justify-between h-full min-h-0 bg-stone-50/60 p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-xs space-y-2.5">
            <div className="shrink-0 flex items-center justify-between">
              <h3 className="font-jua text-sm sm:text-base text-stone-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-stone-600" />
                <span>소감 한마디</span>
              </h3>
              <span className="text-xs font-dodum text-stone-500">
                총 {guestNotes.length}개의 기록
              </span>
            </div>

            {/* Notes List */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {guestNotes.map((note) => (
                  <div
                    key={note.id}
                    className="relative p-3 rounded-lg border border-stone-200 bg-white shadow-2xs flex flex-col justify-between group hover:border-stone-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-jua px-2 py-0.5 rounded-md bg-stone-900 text-white font-bold">
                          {note.role} · {note.author}
                        </span>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="text-stone-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                          title="메모 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-gaegu text-base sm:text-lg font-bold text-stone-900 leading-snug whitespace-pre-line">
                        <span className="highlighter-pen-yellow">&ldquo;{note.message}&rdquo;</span>
                      </p>
                    </div>
                    <span className="text-xs text-stone-600 font-dodum font-bold text-right mt-1.5">
                      {note.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Note Form */}
            <form
              onSubmit={handleFormSubmit}
              className="shrink-0 bg-white p-3 rounded-lg border border-stone-200 shadow-2xs space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="작성자 성명 (예: 김민준, 담임선생님)"
                  className="px-3 py-1.5 text-xs font-dodum bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900"
                  required
                />

                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as '학생' | '학부모' | '선생님')}
                  className="px-3 py-1.5 text-xs font-jua bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 cursor-pointer"
                >
                  <option value="학생">🎒 학생</option>
                  <option value="학부모">🌸 학부모</option>
                  <option value="선생님">🏫 선생님</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="따뜻한 응원이나 기억에 남는 추억을 남겨주세요..."
                  className="flex-1 px-3 py-1.5 text-xs font-dodum bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-black text-white font-jua text-xs rounded-md flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>등록</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
