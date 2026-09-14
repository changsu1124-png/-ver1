export interface ScheduleItem {
  id: string;
  day: 1 | 2;
  order: number;
  time: string;
  title: string;
  location: string;
  category: 'assembly' | 'transport' | 'experience' | 'meal' | 'stay';
  categoryLabel: string;
  description: string;
  highlight?: string;
  tags: string[];
  defaultPhotos: string[];
  defaultCaptions: string[];
  pageCount: number; // 2 pages (4 photos) or 4 pages (8 photos for K-League)
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
