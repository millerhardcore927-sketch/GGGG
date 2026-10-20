import React, { useState } from 'react';
import {
  GraduationCap,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../types';

interface NavbarProps {
  settings: SiteSettings;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenCreate: () => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  favoritesCount,
  onOpenFavorites,
  onOpenCreate,
  onOpenAuth,
  onOpenAdmin,
  onOpenAbout,
}) => {
  const { user, userProfile, isAdmin, isModerator, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                {settings.logoText || 'EduShare TH'}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                คลังปัญญา
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              เพื่อครู นักเรียน และนักศึกษาไทย
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Post Resource Button */}
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แบ่งปันความรู้</span>
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-sky-50 rounded-xl transition"
            title="รายการที่บันทึกไว้"
          >
            <Bookmark className="w-4 h-4 text-sky-600" />
            <span>บันทึกไว้</span>
            {favoritesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Admin / Moderator Dashboard */}
          {(isAdmin || isModerator) && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{isAdmin ? 'ระบบจัดการ (Admin)' : 'ผู้ดูแล (Moderator)'}</span>
            </button>
          )}

          {/* About / Guide Button */}
          <button
            onClick={onOpenAbout}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="เกี่ยวกับโครงการและวิธีใช้งาน"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userProfile?.displayName?.slice(0, 2) || <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {userProfile?.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {userProfile?.role || 'member'}
                  </p>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {userProfile?.displayName || user.email}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {userProfile?.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                        ผู้ดูแลระบบสูงสุด (Admin)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenFavorites();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center gap-2"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                    <span>คลังรายการโปรดของฉัน</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenCreate();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center gap-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>แบ่งปันสื่อใหม่</span>
                  </button>
                  {(isAdmin || isModerator) && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>แผงควบคุมระบบ (Admin)</span>
                    </button>
                  )}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-sky-50 rounded-xl transition"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenFavorites}
            className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            aria-label="รายการบันทึก"
          >
            <Bookmark className="w-5 h-5 text-sky-600" />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="เมนู"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCreate();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แบ่งปันสื่อการสอน / ความรู้</span>
          </button>

          {(isAdmin || isModerator) && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdmin ? 'แผงควบคุมระบบ (Admin)' : 'แผงควบคุมผู้ดูแล (Moderator)'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAbout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-xl"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span>เกี่ยวกับโครงการและวิธีใช้งาน</span>
          </button>

          {user ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="px-1">
                <p className="text-xs font-semibold text-slate-800">
                  {userProfile?.displayName || user.email}
                </p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-rose-600 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl text-center"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl text-center"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
