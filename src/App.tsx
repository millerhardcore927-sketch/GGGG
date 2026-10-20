import React, { useState, useEffect } from 'react';
import {
  testConnection,
} from './firebase/config';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  CategoryItem,
  Favorite,
  ReportReason,
  Resource,
  SearchFilters,
  SiteSettings,
  ToastMessage,
} from './types';
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  incrementViews,
  toggleFavorite,
  fetchUserFavorites,
  submitReport,
  seedResourcesIfEmpty,
} from './services/resourceService';
import {
  fetchSiteSettings,
  DEFAULT_SETTINGS,
} from './services/adminService';

import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { Breadcrumb } from './components/Breadcrumb';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { ResourceFormModal } from './components/ResourceFormModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ToastContainer } from './components/ToastContainer';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { AboutModal } from './components/AboutModal';

import {
  BookOpen,
  Sparkles,
  Inbox,
  PlusCircle,
  RotateCcw,
  GraduationCap,
  Heart,
  Loader2,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

const INITIAL_FILTERS: SearchFilters = {
  query: '',
  category: 'all',
  educationLevel: 'all',
  mediaType: 'all',
  sortBy: 'latest',
};

function MainApp() {
  const { user, userProfile, isAdmin, isModerator, isSuspended } = useAuth();

  // Global settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Resources and filters state
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);

  // Favorites state
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Modals state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [reportingResource, setReportingResource] = useState<Resource | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message?: string
  ) => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Connection Test and Load Site Settings
  useEffect(() => {
    const initApp = async () => {
      await testConnection();
      try {
        const settings = await fetchSiteSettings();
        setSiteSettings(settings);
      } catch (err) {
        console.warn('Settings load fallback:', err);
      }

      // Seed resources on boot if empty
      await seedResourcesIfEmpty();
      loadResourcesList(INITIAL_FILTERS);
    };

    initApp();
  }, []);

  // 2. Load Resources when filters change
  const loadResourcesList = async (currentFilters: SearchFilters) => {
    setLoadingResources(true);
    try {
      const data = await fetchResources(currentFilters);
      setResources(data);
    } catch (err: any) {
      console.error('Error loading resources:', err);
      addToast('error', 'ไม่สามารถโหลดข้อมูลคลังความรู้ได้', err?.message);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    loadResourcesList(filters);
  }, [filters]);

  // 3. Sync User Favorites when user signs in or changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const userFavs = await fetchUserFavorites(user.uid);
          setFavorites(userFavs);
        } catch (err) {
          console.warn('Favorites load note:', err);
        }
      } else {
        setFavorites([]);
      }
    };
    loadFavorites();
  }, [user]);

  // Handle Resource Selection & Views Increment
  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource);
    incrementViews(resource.id);
    // Locally increment view count for instantaneous feedback
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, viewsCount: (r.viewsCount || 0) + 1 } : r))
    );
  };

  // Toggle Favorite
  const handleToggleFavorite = async (resource: Resource) => {
    if (!user) {
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      addToast('info', 'โปรดเข้าสู่ระบบก่อน', 'เข้าสู่ระบบเพื่อบันทึกรายการโปรดและซิงค์ข้อมูล');
      return;
    }

    const isFav = favorites.some((f) => f.resourceId === resource.id);
    try {
      const nowFavorited = await toggleFavorite(resource, user.uid, isFav);
      if (nowFavorited) {
        const newFav: Favorite = {
          id: `${user.uid}_${resource.id}`,
          userId: user.uid,
          resourceId: resource.id,
          resourceTitle: resource.title,
          resourceCategory: resource.category,
          createdAt: new Date().toISOString(),
        };
        setFavorites((prev) => [...prev, newFav]);
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, favoritesCount: (r.favoritesCount || 0) + 1 } : r
          )
        );
        addToast('success', 'บันทึกเป็นรายการโปรดแล้ว');
      } else {
        setFavorites((prev) => prev.filter((f) => f.resourceId !== resource.id));
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id
              ? { ...r, favoritesCount: Math.max(0, (r.favoritesCount || 0) - 1) }
              : r
          )
        );
        addToast('info', 'นำออกจากรายการโปรดแล้ว');
      }
    } catch (err: any) {
      addToast('error', 'ไม่สามารถบันทึกรายการโปรดได้', err?.message);
    }
  };

  // Open Create Resource Modal
  const handleOpenCreate = () => {
    if (!user) {
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      addToast('info', 'โปรดเข้าสู่ระบบเพื่อแบ่งปันความรู้', 'สมัครสมาชิกหรือเข้าสู่ระบบฟรีได้ทันที');
      return;
    }
    if (isSuspended) {
      addToast('error', 'บัญชีของคุณถูกระงับการใช้งาน', 'ไม่สามารถโพสต์สื่อความรู้ได้ในขณะนี้');
      return;
    }
    setEditingResource(null);
    setIsFormOpen(true);
  };

  // Open Edit Resource Modal
  const handleOpenEdit = (resource: Resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  // Delete Resource Handler
  const handleDeleteResource = async (resource: Resource) => {
    if (!confirm(`คุณต้องการลบสื่อเรื่อง "${resource.title}" ใช่หรือไม่?`)) {
      return;
    }
    try {
      await deleteResource(resource.id);
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      if (selectedResource?.id === resource.id) {
        setSelectedResource(null);
      }
      addToast('success', 'ลบสื่อการเรียนรู้สำเร็จ');
    } catch (err: any) {
      addToast('error', 'ไม่สามารถลบสื่อได้', err?.message);
    }
  };

  // Save (Create or Update) Resource
  const handleSaveResource = async (formData: any) => {
    if (!user) return;
    if (editingResource) {
      await updateResource(editingResource.id, formData);
      setResources((prev) =>
        prev.map((r) => (r.id === editingResource.id ? { ...r, ...formData } : r))
      );
      if (selectedResource?.id === editingResource.id) {
        setSelectedResource({ ...selectedResource, ...formData });
      }
      addToast('success', 'อัปเดตสื่อการเรียนรู้เรียบร้อยแล้ว');
    } else {
      const authorName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'ผู้แบ่งปัน';
      const authorEmail = user.email || '';
      await createResource({
        ...formData,
        authorId: user.uid,
        authorName,
        authorEmail,
      });
      loadResourcesList(filters);
      addToast('success', 'แบ่งปันสื่อการเรียนรู้สำเร็จ ขอบคุณที่ร่วมสร้างสรรค์การศึกษาไทย!');
    }
  };

  // Open Report Modal
  const handleOpenReport = (resource: Resource) => {
    if (!user) {
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      addToast('info', 'โปรดเข้าสู่ระบบก่อนรายงานเนื้อหา');
      return;
    }
    setReportingResource(resource);
    setIsReportOpen(true);
  };

  // Submit Report
  const handleSubmitReport = async (
    resourceId: string,
    resourceTitle: string,
    reason: ReportReason,
    details: string
  ) => {
    if (!user) return;
    await submitReport(
      resourceId,
      resourceTitle,
      user.uid,
      user.email || 'unknown',
      reason,
      details
    );
    addToast('success', 'ส่งรายงานเรียบร้อยแล้ว ขอบคุณที่ช่วยดูแลความปลอดภัยของเนื้อหาครับ');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-200">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Unverified Email Alert Banner */}
      <EmailVerificationBanner
        onSuccess={(msg) => addToast('success', msg)}
        onError={(msg) => addToast('error', msg)}
      />

      {/* Top Navbar */}
      <Navbar
        settings={siteSettings}
        favoritesCount={favorites.length}
        onOpenFavorites={() => {
          if (!user) {
            setAuthInitialTab('login');
            setIsAuthOpen(true);
          } else {
            setIsFavoritesOpen(true);
          }
        }}
        onOpenCreate={handleOpenCreate}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setIsAuthOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Hero Header with Search & Filters */}
      <HeroSearch
        categories={siteSettings.categories}
        filters={filters}
        onFilterChange={(newF) => setFilters({ ...filters, ...newF })}
        onResetFilters={() => setFilters(INITIAL_FILTERS)}
        announcement={siteSettings.announcement}
        totalResultsCount={resources.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          currentCategory={filters.category}
          educationLevel={filters.educationLevel}
          onResetCategory={() => setFilters({ ...filters, category: 'all' })}
          onResetEducationLevel={() => setFilters({ ...filters, educationLevel: 'all' })}
          onResetAll={() => setFilters(INITIAL_FILTERS)}
        />

        {/* Resources Grid / State Displays */}
        {loadingResources ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <h3 className="font-bold text-slate-800 text-base">กำลังโหลดสื่อการเรียนรู้...</h3>
            <p className="text-xs text-slate-500 mt-1">
              กำลังเชื่อมต่อฐานข้อมูล Cloud Firestore แบบเรียลไทม์
            </p>
          </div>
        ) : resources.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 bg-white rounded-3xl border border-slate-200/80 text-center max-w-2xl mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">ไม่พบสื่อการเรียนรู้ที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              ลองเปลี่ยนคำค้นหา ปรับเปลี่ยนระดับการศึกษา หรือเป็นคนแรกที่ร่วมแบ่งปันสื่อความรู้ในหัวข้อนี้
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ล้างการค้นหาและตัวกรอง</span>
              </button>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ร่วมแบ่งปันสื่อความรู้</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isFavorited={favorites.some((f) => f.resourceId === resource.id)}
                currentUserId={user?.uid}
                isAdminOrMod={isAdmin || isModerator}
                onSelect={handleSelectResource}
                onToggleFavorite={handleToggleFavorite}
                onReport={handleOpenReport}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteResource}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-center gap-2 font-semibold text-slate-700">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>{siteSettings.siteName}</span>
          </div>
          <p className="max-w-xl mx-auto text-slate-500 leading-relaxed">
            {siteSettings.siteDescription}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 pt-2">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-blue-600 transition flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>คู่มือและวิธีใช้งาน</span>
            </button>
            <span>•</span>
            <span className="text-slate-400">เชื่อมต่อ Firebase Firestore จริง 100%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} EduShare TH. All rights reserved. เพื่อการศึกษาไทยที่ไม่หยุดนิ่ง
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ResourceDetailModal
        resource={selectedResource}
        isFavorited={favorites.some((f) => f.resourceId === selectedResource?.id)}
        currentUserId={user?.uid}
        isAdminOrMod={isAdmin || isModerator}
        onClose={() => setSelectedResource(null)}
        onToggleFavorite={handleToggleFavorite}
        onReport={handleOpenReport}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteResource}
        onSuccessToast={(msg) => addToast('success', msg)}
      />

      <ResourceFormModal
        isOpen={isFormOpen}
        initialResource={editingResource}
        categories={siteSettings.categories}
        onClose={() => {
          setIsFormOpen(false);
          setEditingResource(null);
        }}
        onSubmit={handleSaveResource}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(msg) => addToast('success', msg)}
      />

      <ReportModal
        isOpen={isReportOpen}
        resource={reportingResource}
        onClose={() => {
          setIsReportOpen(false);
          setReportingResource(null);
        }}
        onSubmitReport={handleSubmitReport}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        favorites={favorites}
        resources={resources}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectResource={handleSelectResource}
        onRemoveFavorite={handleToggleFavorite}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        siteSettings={siteSettings}
        onSettingsUpdated={(newSettings) => setSiteSettings(newSettings)}
        resources={resources}
        onResourcesChanged={() => loadResourcesList(filters)}
        onToast={addToast}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
