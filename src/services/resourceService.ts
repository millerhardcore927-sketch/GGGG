import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Favorite, Report, ReportReason, Resource, SearchFilters } from '../types';

const INITIAL_RESOURCES: Omit<Resource, 'id'>[] = [
  {
    title: 'สรุปสูตรฟิสิกส์ ม.ปลาย เตรียมสอบเข้ามหาวิทยาลัย (A-Level / TPAT3)',
    description: 'รวบรวมสูตรฟิสิกส์ ม.4-ม.6 ครบทุกบท พร้อมแนวโจทย์คัดสรร กลศาสตร์ ไฟฟ้า คลื่น แสง เสียง และฟิสิกส์ยุคใหม่ เหมาะสำหรับทบทวนสอบ',
    category: 'วิทยาศาสตร์',
    educationLevel: 'มัธยมศึกษาตอนปลาย',
    mediaType: 'pdf',
    resourceUrl: 'https://www.scimath.org/lesson-physics',
    authorId: 'system_curator',
    authorName: 'อ.ดร.วิทยากร เกียรติวิทยา',
    authorEmail: 'curator@edushare.th',
    tags: ['ฟิสิกส์', 'มัธยมปลาย', 'TCAS', 'สูตรลัด'],
    status: 'active',
    viewsCount: 342,
    favoritesCount: 28,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    title: 'คอร์สเรียนพื้นฐานการเขียนโปรแกรม Python สำหรับผู้เริ่มต้นและนักเรียน',
    description: 'วิดีโอสอนไวยากรณ์ Python ตั้งแต่ติดตั้งโปรแกรม ตัวแปร ลูป ฟังก์ชัน ลิสต์ ไปจนถึงการเขียนโปรแกรมคำนวณและสร้างมินิโปรเจกต์',
    category: 'คอมพิวเตอร์และเทคโนโลยี',
    educationLevel: 'มัธยมศึกษาตอนต้น',
    mediaType: 'video',
    resourceUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    authorId: 'system_curator',
    authorName: 'ครูไอที ปัญญาสร้างสรรค์',
    authorEmail: 'curator@edushare.th',
    tags: ['Python', 'โค้ดดิ้ง', 'วิทยาการคำนวณ', 'โปรแกรมมิ่ง'],
    status: 'active',
    viewsCount: 512,
    favoritesCount: 45,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    title: 'คู่มือไวยากรณ์ภาษาอังกฤษ 12 Tenses ฉบับเข้าใจง่าย พร้อมตัวอย่างประโยค',
    description: 'สไลด์และบทความสรุปโครงสร้าง Tense ทั้ง 12 กาล เทคนิคการจำ และวิธีนำไปใช้ในการสนทนาและการเขียนสอบ IELTS / TOEIC / TGAT',
    category: 'ภาษาต่างประเทศ',
    educationLevel: 'บุคคลทั่วไป',
    mediaType: 'presentation',
    resourceUrl: 'https://www.britishcouncil.or.th/english/grammar',
    authorId: 'system_curator',
    authorName: 'ครูสมศรี ภาษาอังกฤษสากล',
    authorEmail: 'curator@edushare.th',
    tags: ['English', 'Tenses', 'Grammar', 'สอบภาษาอังกฤษ'],
    status: 'active',
    viewsCount: 289,
    favoritesCount: 31,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    title: 'แคลคูลัส 1 ระดับมหาวิทยาลัย: ลิมิต อนุพันธ์ และการประยุกต์',
    description: 'เอกสารประกอบการสอนวิชาคณิตศาสตร์พื้นฐานคณะวิศวกรรมศาสตร์และวิทยาศาสตร์ อธิบายที่มา ทฤษฎีบท และวิธีแก้สมการอย่างละเอียด',
    category: 'คณิตศาสตร์',
    educationLevel: 'อุดมศึกษา',
    mediaType: 'pdf',
    resourceUrl: 'https://math.chula.ac.th/materials',
    authorId: 'system_curator',
    authorName: 'รศ.ดร.คณิต คิดคำนวณ',
    authorEmail: 'curator@edushare.th',
    tags: ['แคลคูลัส', 'มหาวิทยาลัย', 'อนุพันธ์', 'คณิตศาสตร์'],
    status: 'active',
    viewsCount: 198,
    favoritesCount: 19,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    title: 'ประวัติศาสตร์เอเชียตะวันออกเฉียงใต้และการเปลี่ยนแปลงทางสังคม',
    description: 'แหล่งข้อมูลและบทความวิชาการเกี่ยวกับพัฒนาการทางการเมือง วัฒนธรรม และเศรษฐกิจของกลุ่มประเทศอาเซียนตั้งแต่อดีตถึงปัจจุบัน',
    category: 'สังคมและประวัติศาสตร์',
    educationLevel: 'มัธยมศึกษาตอนปลาย',
    mediaType: 'website',
    resourceUrl: 'https://www.sac.or.th/portal/th/article',
    authorId: 'system_curator',
    authorName: 'อาจารย์พิพิธภัณฑ์ ประวัติศาสตร์ไทย',
    authorEmail: 'curator@edushare.th',
    tags: ['ประวัติศาสตร์', 'สังคมศึกษา', 'อาเซียน'],
    status: 'active',
    viewsCount: 145,
    favoritesCount: 12,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export async function seedResourcesIfEmpty(): Promise<void> {
  const path = 'resources';
  try {
    const snap = await getDocs(query(collection(db, path), limit(1)));
    if (snap.empty) {
      for (const item of INITIAL_RESOURCES) {
        const newDocRef = doc(collection(db, path));
        await setDoc(newDocRef, {
          ...item,
          id: newDocRef.id,
        });
      }
    }
  } catch (err) {
    console.warn('Initial seeding note (will use empty or wait for auth):', err);
  }
}

export async function fetchResources(filters?: Partial<SearchFilters>): Promise<Resource[]> {
  const path = 'resources';
  try {
    const resourcesRef = collection(db, path);
    // Fetch resources
    const q = query(resourcesRef, limit(60));
    const snapshot = await getDocs(q);

    let list: Resource[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Resource, 'id'>),
    }));

    // Client-side filtering & sorting for flexible Thai search
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        list = list.filter((r) => r.category === filters.category);
      }
      if (filters.educationLevel && filters.educationLevel !== 'all') {
        list = list.filter((r) => r.educationLevel === filters.educationLevel);
      }
      if (filters.mediaType && filters.mediaType !== 'all') {
        list = list.filter((r) => r.mediaType === filters.mediaType);
      }
      if (filters.query && filters.query.trim()) {
        const qLower = filters.query.toLowerCase().trim();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(qLower) ||
            r.description.toLowerCase().includes(qLower) ||
            r.category.toLowerCase().includes(qLower) ||
            r.tags?.some((t) => t.toLowerCase().includes(qLower))
        );
      }
      if (filters.sortBy === 'popular') {
        list.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0));
      } else if (filters.sortBy === 'views') {
        list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createResource(
  data: Omit<Resource, 'id' | 'viewsCount' | 'favoritesCount' | 'createdAt'>
): Promise<string> {
  const path = 'resources';
  try {
    const newDocRef = doc(collection(db, path));
    const newResource: Resource = {
      ...data,
      id: newDocRef.id,
      viewsCount: 0,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, newResource);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateResource(id: string, data: Partial<Resource>): Promise<void> {
  const path = `resources/${id}`;
  try {
    await updateDoc(doc(db, 'resources', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteResource(id: string): Promise<void> {
  const path = `resources/${id}`;
  try {
    await deleteDoc(doc(db, 'resources', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function incrementViews(id: string): Promise<void> {
  const path = `resources/${id}`;
  try {
    await updateDoc(doc(db, 'resources', id), {
      viewsCount: increment(1),
    });
  } catch {
    // Non-fatal view counter increment
  }
}

export async function toggleFavorite(
  resource: Resource,
  userId: string,
  currentlyFavorited: boolean
): Promise<boolean> {
  const favoriteDocId = `${userId}_${resource.id}`;
  const path = `favorites/${favoriteDocId}`;
  try {
    const favRef = doc(db, 'favorites', favoriteDocId);
    const resRef = doc(db, 'resources', resource.id);

    if (currentlyFavorited) {
      await deleteDoc(favRef);
      try {
        await updateDoc(resRef, { favoritesCount: increment(-1) });
      } catch {
        // ignore counter error if non-critical
      }
      return false;
    } else {
      const favData: Favorite = {
        id: favoriteDocId,
        userId,
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceCategory: resource.category,
        createdAt: new Date().toISOString(),
      };
      await setDoc(favRef, favData);
      try {
        await updateDoc(resRef, { favoritesCount: increment(1) });
      } catch {
        // ignore counter error if non-critical
      }
      return true;
    }
  } catch (error) {
    handleFirestoreError(
      error,
      currentlyFavorited ? OperationType.DELETE : OperationType.CREATE,
      path
    );
  }
}

export async function fetchUserFavorites(userId: string): Promise<Favorite[]> {
  const path = 'favorites';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Favorite, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitReport(
  resourceId: string,
  resourceTitle: string,
  reporterId: string,
  reporterEmail: string,
  reason: ReportReason,
  details: string
): Promise<string> {
  const path = 'reports';
  try {
    const reportRef = doc(collection(db, path));
    const newReport: Report = {
      id: reportRef.id,
      resourceId,
      resourceTitle,
      reporterId,
      reporterEmail,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(reportRef, newReport);
    return reportRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
