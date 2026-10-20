import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { CategoryItem, ModerationLog, Report, ReportStatus, SiteSettings, UserProfile, UserRole, UserStatus } from '../types';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cs', name: 'คอมพิวเตอร์และเทคโนโลยี', color: 'blue', description: 'การเขียนโปรแกรม, AI, วิทยาการคำนวณ' },
  { id: 'math', name: 'คณิตศาสตร์', color: 'indigo', description: 'พีชคณิต, เรขาคณิต, สถิติ, แคลคูลัส' },
  { id: 'sci', name: 'วิทยาศาสตร์', color: 'emerald', description: 'ฟิสิกส์, เคมี, ชีววิทยา, ดาราศาสตร์' },
  { id: 'lang', name: 'ภาษาต่างประเทศ', color: 'amber', description: 'ภาษาอังกฤษ, ภาษาจีน, ภาษาญี่ปุ่น' },
  { id: 'soc', name: 'สังคมและประวัติศาสตร์', color: 'rose', description: 'ประวัติศาสตร์, ภูมิศาสตร์, หน้าที่พลเมือง' },
  { id: 'art', name: 'ศิลปะและการออกแบบ', color: 'purple', description: 'ทัศนศิลป์, ดนตรี, การออกแบบกราฟิก' },
  { id: 'general', name: 'การพัฒนาตนเองและทั่วไป', color: 'teal', description: 'เทคนิคการเรียนรู้, สุขภาพจิต, ทักษะชีวิต' },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'EduShare TH คลังปัญญาเพื่อการเรียนรู้',
  siteDescription: 'ศูนย์กลางรวบรวมและแบ่งปันสื่อการสอน ใบความรู้ และคลิปการเรียนสำหรับนักเรียน นิสิต และครูไทย',
  logoText: 'EduShare TH',
  announcement: 'ยินดีต้อนรับสู่ EduShare TH คลังความรู้ออนไลน์ที่ทุกคนสามารถร่วมแบ่งปันสื่อการเรียนรู้ได้ฟรี!',
  categories: DEFAULT_CATEGORIES,
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const path = 'settings/general';
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    } else {
      // Initialize with defaults if not exists
      try {
        await setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS);
      } catch {
        // read-only fallback if unauthenticated
      }
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.warn('Using default settings fallback:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(settings: SiteSettings, adminUid: string): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchReports(): Promise<Report[]> {
  const path = 'reports';
  try {
    const q = query(collection(db, path), limit(50));
    const snap = await getDocs(q);
    const reports: Report[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Report, 'id'>),
    }));
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      status: newStatus,
      resolvedBy: adminEmail,
      resolvedAt: new Date().toISOString(),
    });

    // Write audit log
    await logModerationAction({
      adminId: adminUid,
      adminEmail,
      action: `update_report_${newStatus}`,
      targetType: 'report',
      targetId: reportId,
      reason: `เปลี่ยนสถานะรายงานเป็น ${newStatus}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchUsersList(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = query(collection(db, path), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<UserProfile, 'uid'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateUserRole(
  targetUid: string,
  newRole: UserRole,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    if (newRole === 'admin') {
      try {
        await setDoc(doc(db, 'admins', targetUid), {
          email: adminEmail,
          grantedBy: adminUid,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // ignore if not permitted
      }
    } else {
      try {
        await deleteDoc(doc(db, 'admins', targetUid));
      } catch {
        // ignore
      }
    }

    await logModerationAction({
      adminId: adminUid,
      adminEmail,
      action: `change_role_${newRole}`,
      targetType: 'user',
      targetId: targetUid,
      reason: `ปรับเปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleUserSuspension(
  targetUid: string,
  currentStatus: UserStatus,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const newStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    await logModerationAction({
      adminId: adminUid,
      adminEmail,
      action: newStatus === 'suspended' ? 'suspend_user' : 'activate_user',
      targetType: 'user',
      targetId: targetUid,
      reason: newStatus === 'suspended' ? 'ระงับบัญชีผู้ใช้งานชั่วคราว' : 'ปลดการระงับบัญชี',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function logModerationAction(
  log: Omit<ModerationLog, 'id' | 'createdAt'>
): Promise<void> {
  const path = 'moderationLogs';
  try {
    const logRef = doc(collection(db, path));
    await setDoc(logRef, {
      ...log,
      id: logRef.id,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
}
