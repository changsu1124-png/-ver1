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
  defaultPhotos: [string, string];
  defaultCaptions: [string, string];
}

export interface UserPhotoEntry {
  scheduleId: string;
  photoIndex: 0 | 1;
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
