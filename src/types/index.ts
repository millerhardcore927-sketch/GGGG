export type UserRole = 'member' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export type EducationLevel =
  | 'ประถมศึกษา'
  | 'มัธยมศึกษาตอนต้น'
  | 'มัธยมศึกษาตอนปลาย'
  | 'อุดมศึกษา'
  | 'บุคคลทั่วไป';

export type MediaType =
  | 'pdf'
  | 'video'
  | 'website'
  | 'presentation'
  | 'document'
  | 'other';

export type ResourceStatus = 'active' | 'hidden' | 'deleted';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  educationLevel: EducationLevel;
  mediaType: MediaType;
  resourceUrl: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  tags?: string[];
  status: ResourceStatus;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: string;
  createdAt: string;
}

export type ReportReason =
  | 'broken_link'
  | 'copyright'
  | 'inappropriate'
  | 'spam'
  | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  reporterEmail: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ModerationLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'resource' | 'setting' | 'report';
  targetId: string;
  reason?: string;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName?: string;
  color?: string;
  description?: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  announcement?: string;
  logoText?: string;
  categories: CategoryItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  educationLevel: string;
  mediaType: string;
  sortBy: 'latest' | 'popular' | 'views';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
