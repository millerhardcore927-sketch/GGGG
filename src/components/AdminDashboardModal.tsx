import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Flag,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  EyeOff,
  Trash2,
  Search,
  Plus,
  Save,
  Ban,
  Check,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  CategoryItem,
  Report,
  ReportStatus,
  Resource,
  SiteSettings,
  UserProfile,
  UserRole,
} from '../types';
import {
  fetchReports,
  updateReportStatus,
  fetchUsersList,
  updateUserRole,
  toggleUserSuspension,
  updateSiteSettings,
} from '../services/adminService';
import { updateResource, deleteResource } from '../services/resourceService';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  resources: Resource[];
  onResourcesChanged: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
  onSettingsUpdated,
  resources,
  onResourcesChanged,
  onToast,
}) => {
  const { user, userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'settings'>('reports');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Confirmation modal state for critical operations
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (isOpen) {
      loadReportsData();
      loadUsersData();
    }
  }, [isOpen]);

  const loadReportsData = async () => {
    try {
      setLoadingReports(true);
      const data = await fetchReports();
      setReports(data);
    } catch (err: any) {
      console.warn('Load reports error:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadUsersData = async () => {
    try {
      setLoadingUsers(true);
      const data = await fetchUsersList();
      setUsers(data);
    } catch (err: any) {
      console.warn('Load users error:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  // Handle report resolution
  const handleResolveReport = async (reportId: string, status: ReportStatus) => {
    if (!user) return;
    try {
      await updateReportStatus(
        reportId,
        status,
        user.uid,
        userProfile?.displayName || user.email || 'Admin'
      );
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status, resolvedBy: user.email || '' } : r))
      );
      onToast('success', 'อัปเดตสถานะรายงานสำเร็จ');
    } catch (err: any) {
      onToast('error', 'ไม่สามารถอัปเดตสถานะรายงานได้', err?.message);
    }
  };

  // Hide resource from report
  const handleHideResource = async (resourceId: string, reportId: string) => {
    try {
      await updateResource(resourceId, { status: 'hidden' });
      await handleResolveReport(reportId, 'resolved');
      onResourcesChanged();
      onToast('success', 'ซ่อนสื่อการเรียนรู้นี้เรียบร้อยแล้ว');
    } catch (err: any) {
      onToast('error', 'ไม่สามารถซ่อนสื่อได้', err?.message);
    }
  };

  // Delete resource with confirmation
  const triggerDeleteResource = (resourceId: string, reportId?: string) => {
    const res = resources.find((r) => r.id === resourceId);
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบสื่อการเรียนรู้นี้ถาวร?',
      description: `สื่อเรื่อง "${res?.title || resourceId}" จะถูกลบออกจากฐานข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้`,
      confirmLabel: 'ยืนยันการลบ',
      onConfirm: async () => {
        try {
          await deleteResource(resourceId);
          if (reportId) {
            await handleResolveReport(reportId, 'resolved');
          }
          onResourcesChanged();
          onToast('success', 'ลบสื่อการเรียนรู้สำเร็จ');
        } catch (err: any) {
          onToast('error', 'ไม่สามารถลบสื่อได้', err?.message);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // User role change
  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    if (!user) return;
    try {
      await updateUserRole(
        targetUid,
        newRole,
        user.uid,
        userProfile?.displayName || user.email || 'Admin'
      );
      setUsers((prev) => prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u)));
      onToast('success', `เปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole} สำเร็จ`);
    } catch (err: any) {
      onToast('error', 'ไม่สามารถเปลี่ยนสิทธิ์ได้', err?.message);
    }
  };

  // User suspension toggle
  const handleToggleSuspend = (targetUser: UserProfile) => {
    if (!user) return;
    const isSuspending = targetUser.status === 'active';
    setConfirmDialog({
      isOpen: true,
      title: isSuspending ? 'ยืนยันการระงับบัญชีผู้ใช้?' : 'ยืนยันการปลดการระงับบัญชี?',
      description: isSuspending
        ? `ผู้ใช้ "${targetUser.displayName} (${targetUser.email})" จะไม่สามารถโพสต์ แก้ไข หรือรายงานเนื้อหาได้ชั่วคราว`
        : `ผู้ใช้ "${targetUser.displayName}" จะสามารถกลับมาใช้งานระบบได้ตามปกติ`,
      confirmLabel: isSuspending ? 'ระงับบัญชี' : 'ปลดการระงับ',
      onConfirm: async () => {
        try {
          await toggleUserSuspension(
            targetUser.uid,
            targetUser.status,
            user.uid,
            userProfile?.displayName || user.email || 'Admin'
          );
          setUsers((prev) =>
            prev.map((u) =>
              u.uid === targetUser.uid
                ? { ...u, status: isSuspending ? 'suspended' : 'active' }
                : u
            )
          );
          onToast('success', isSuspending ? 'ระงับบัญชีผู้ใช้แล้ว' : 'ปลดการระงับบัญชีแล้ว');
        } catch (err: any) {
          onToast('error', 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะบัญชี', err?.message);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // Add Dynamic Category
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const trimmed = newCatName.trim();
    if (settingsForm.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      onToast('error', 'มีหมวดหมู่นี้อยู่ในระบบแล้ว');
      return;
    }
    const newCat: CategoryItem = {
      id: 'cat_' + Date.now(),
      name: trimmed,
      color: 'blue',
      description: 'หมวดหมู่เพิ่มเติม',
    };
    setSettingsForm({
      ...settingsForm,
      categories: [...settingsForm.categories, newCat],
    });
    setNewCatName('');
  };

  // Remove Dynamic Category
  const handleRemoveCategory = (catId: string) => {
    setSettingsForm({
      ...settingsForm,
      categories: settingsForm.categories.filter((c) => c.id !== catId),
    });
  };

  // Save Settings to Firestore
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingSettings(true);
      await updateSiteSettings(settingsForm, user.uid);
      onSettingsUpdated(settingsForm);
      onToast('success', 'บันทึกการตั้งค่าเว็บไซต์และหมวดหมู่เรียบร้อยแล้ว');
    } catch (err: any) {
      onToast('error', 'ไม่สามารถบันทึกการตั้งค่าได้', err?.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">แผงควบคุมระบบ (Admin Dashboard)</h3>
              <p className="text-xs text-slate-500">
                จัดการรายงานผู้ใช้ สมาชิก และการตั้งค่าเว็บไซต์ เชื่อมต่อ Firestore จริง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/50 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>รายงานเนื้อหา ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการสมาชิก ({users.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>ตั้งค่าเว็บไซต์ & หมวดหมู่</span>
            </button>
          )}
        </div>

        {/* Tab 1: Moderation / Reports */}
        {activeTab === 'reports' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">กรองสถานะ:</span>
                <button
                  onClick={() => setReportFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    reportFilter === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รอดำเนินการ
                </button>
                <button
                  onClick={() => setReportFilter('resolved')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    reportFilter === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  จัดการแล้ว
                </button>
                <button
                  onClick={() => setReportFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    reportFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ทั้งหมด
                </button>
              </div>

              <button
                onClick={loadReportsData}
                disabled={loadingReports}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเฟรช</span>
              </button>
            </div>

            {loadingReports ? (
              <div className="py-12 text-center text-slate-400 text-xs">กำลังโหลดรายงาน...</div>
            ) : filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                ไม่มีรายงานเนื้อหาในหมวดหมู่นี้ สะอาด ปลอดภัยดีครับ!
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => {
                  const targetRes = resources.find((r) => r.id === report.resourceId);
                  return (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                report.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : report.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {report.status === 'pending'
                                ? 'รอดำเนินการ'
                                : report.status === 'resolved'
                                ? 'จัดการแล้ว'
                                : 'เพิกถอน'}
                            </span>
                            <span className="text-xs font-semibold text-rose-600">
                              เหตุผล: {report.reason}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {report.resourceTitle}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong>รายละเอียดจากผู้รายงาน:</strong> {report.details || '- ไม่ระบุ -'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            รายงานโดย: {report.reporterEmail} เมื่อ{' '}
                            {new Date(report.createdAt).toLocaleString('th-TH')}
                          </p>
                        </div>
                      </div>

                      {/* Actions on this report */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {targetRes && (
                          <span className="text-[11px] text-slate-500">
                            สถานะปัจจุบันของสื่อ: <strong>{targetRes.status}</strong>
                          </span>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleHideResource(report.resourceId, report.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                                title="ซ่อนสื่อนี้ไม่ให้คนทั่วไปเห็น"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>ซ่อนสื่อ</span>
                              </button>

                              <button
                                onClick={() => triggerDeleteResource(report.resourceId, report.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                title="ลบสื่อนี้ออกจากฐานข้อมูลถาวร"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>ลบสื่อถาวร</span>
                              </button>

                              <button
                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              >
                                ไม่พบปัญหา (เพิกถอน)
                              </button>
                            </>
                          )}
                          {report.status !== 'pending' && (
                            <span className="text-xs text-slate-400">
                              จัดการเรียบร้อยแล้วโดย {report.resolvedBy || 'Admin'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ค้นหาสมาชิกด้วยชื่อ หรืออีเมล..."
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white focus:border-indigo-500"
                />
              </div>
              <button
                onClick={loadUsersData}
                disabled={loadingUsers}
                className="px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเฟรช</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-slate-400 text-xs">กำลังโหลดรายชื่อสมาชิก...</div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {filteredUsers.map((u) => {
                  const isCurrent = u.uid === user?.uid;
                  return (
                    <div
                      key={u.uid}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {u.displayName.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {u.displayName}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                                บัญชีคุณ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>

                      {/* Controls: Role & Suspension */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.status === 'active' ? 'ปกติ (Active)' : 'ถูกระงับ (Suspended)'}
                        </span>

                        {/* Role selector */}
                        <select
                          value={u.role}
                          disabled={!isAdmin || isCurrent}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-indigo-500"
                        >
                          <option value="member">สมาชิกทั่วไป (Member)</option>
                          <option value="moderator">ผู้ดูแล (Moderator)</option>
                          <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        </select>

                        {/* Ban / Suspend button */}
                        {!isCurrent && isAdmin && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`p-1.5 rounded-lg text-xs transition ${
                              u.status === 'active'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'active' ? 'ระงับการใช้งานบัญชีนี้' : 'ปลดการระงับบัญชี'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Site Settings & Dynamic Categories */}
        {activeTab === 'settings' && isAdmin && (
          <form onSubmit={handleSaveSettings} className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">ข้อมูลทั่วไปของเว็บไซต์</h4>
              <p className="text-xs text-slate-500 mb-3">
                แก้ไขชื่อ คำอธิบาย และข้อความแถบประกาศด้านบนได้ทันทีโดยไม่ต้องแก้ไขโค้ด
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อเว็บไซต์ (Site Name)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.siteName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, siteName: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ข้อความโลโก้ (Brand Logo)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logoText}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, logoText: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำอธิบายเว็บไซต์ / สโลแกน (Tagline)
              </label>
              <textarea
                rows={2}
                value={settingsForm.siteDescription}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, siteDescription: e.target.value })
                }
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ข้อความประกาศบนแถบหัวเว็บ (Announcement Banner)
              </label>
              <textarea
                rows={2}
                value={settingsForm.announcement || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, announcement: e.target.value })
                }
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3"
              />
            </div>

            {/* Dynamic Categories Manager */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                จัดการหมวดหมู่ความรู้ (Dynamic Categories)
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                เพิ่มหรือลบหมวดหมู่วิชาความรู้ ระบบจะซิงค์กับแถบค้นหาและการโพสต์เนื้อหาทันที
              </p>

              {/* Add category row */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="พิมพ์ชื่อหมวดหมู่ใหม่ เช่น ดาราศาสตร์, หุ่นยนต์, ดนตรีสากล..."
                  className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มหมวดหมู่</span>
                </button>
              </div>

              {/* Categories list */}
              <div className="flex flex-wrap gap-2">
                {settingsForm.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="ลบหมวดหมู่นี้"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'กำลังบันทึกลง Firestore...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Generic Confirmation Modal */}
        {confirmDialog && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-base">
                {confirmDialog.title}
              </h4>
              <p className="text-center text-xs text-slate-600 leading-relaxed">
                {confirmDialog.description}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="w-1/2 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
