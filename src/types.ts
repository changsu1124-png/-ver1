export interface ScheduleItem {
  id: string;
  day: 1 | 2 | 3; // 1: 1일차, 2: 2일차, 3: 개인 앨범
  order: number;
  time: string;
  title: string;
  location: string;
  category: 'assembly' | 'transport' | 'experience' | 'meal' | 'stay' | 'personal';
  categoryLabel: string;
  description: string;
  highlight?: string;
  tags: string[];
  defaultPhotos: string[];
  defaultCaptions: string[];
  pageCount: number; // 1 page (2 photos) or 2 pages (4 photos)
  grade?: number;
  studentName?: string;
}

export interface UserPhotoEntry {
  scheduleId: string;
  photoIndex: number;
  imageUrl: string;
  customCaption?: string;
  updatedAt: number;
}

export interface GuestbookNote {
  id: string;
  author: string;
  role: '학생' | '학부모' | '선생님';
  message: string;
  date: string;
  color: string;
}
