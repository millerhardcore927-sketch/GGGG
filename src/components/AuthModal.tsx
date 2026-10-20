import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  UserPlus,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, sendPasswordReset } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);
      await loginWithEmail(email, password);
      onSuccess('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับมาครับ!');
      onClose();
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง');
      } else if (code === 'auth/too-many-requests') {
        setError('มีการพยายามเข้าสู่ระบบผิดหลายครั้ง โปรดรอสักครู่แล้วลองใหม่');
      } else {
        setError(err?.message || 'ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!name.trim()) {
      setError('กรุณากรอกชื่อหรือชื่อที่ต้องการให้แสดง');
      return;
    }
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setSubmitting(true);
      await registerWithEmail(name, email, password);
      onSuccess(
        'สมัครสมาชิกสำเร็จ! ระบบได้ส่งอีเมลยืนยันตัวตนไปยัง ' +
          email +
          ' เรียบร้อยแล้ว โปรดตรวจสอบกล่องข้อความ'
      );
      onClose();
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานแล้ว โปรดเข้าสู่ระบบหรือใช้ระบบลืมรหัสผ่าน');
      } else if (code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else if (code === 'auth/weak-password') {
        setError('รหัสผ่านคาดเดาง่ายเกินไป โปรดเพิ่มความยาวหรือผสมตัวเลข');
      } else {
        setError(err?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setSubmitting(true);
      await loginWithGoogle();
      onSuccess('เข้าสู่ระบบด้วย Google สำเร็จเรียบร้อย!');
      onClose();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน');
      return;
    }

    try {
      setSubmitting(true);
      await sendPasswordReset(email);
      setInfo('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง ' + email + ' สำเร็จแล้ว โปรดตรวจสอบกล่องข้อความ');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        setError('ไม่พบบัญชีผู้ใช้งานที่ใช้อีเมลนี้ในระบบ');
      } else {
        setError(err?.message || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'login' && 'เข้าสู่ระบบ'}
                {activeTab === 'register' && 'สมัครสมาชิกใหม่'}
                {activeTab === 'forgot' && 'รีเซ็ตรหัสผ่าน'}
              </h3>
              <p className="text-[11px] text-slate-500">EduShare TH คลังความรู้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 m-4 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setInfo(null);
            }}
            className={`py-2 rounded-lg transition ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setInfo(null);
            }}
            className={`py-2 rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {/* Tab 1: Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">รหัสผ่าน (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setError(null);
                      setInfo(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 transition"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-10 py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                    aria-label="แสดง/ซ่อนรหัสผ่าน"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              </button>
            </form>
          )}

          {/* Tab 2: Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล หรือชื่อที่ใช้แสดง
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น ครูสมคิด หรือ น้องน้ำใส"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (จะใช้ส่งลิงก์ยืนยันตัวตนจริง)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-10 py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                    aria-label="แสดง/ซ่อนรหัสผ่าน"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านอีกครั้ง
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิกและส่งอีเมลยืนยัน'}</span>
              </button>
            </form>
          )}

          {/* Tab 3: Forgot Password Form */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                กรอกอีเมลที่คุณใช้สมัครสมาชิก ระบบ Firebase จะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังกล่องข้อความของคุณทันที
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">อีเมลของคุณ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                >
                  {submitting ? 'กำลังส่งลิงก์...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                </button>
              </div>
            </form>
          )}

          {/* Social Sign-In Divider */}
          {activeTab !== 'forgot' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-white px-2 text-slate-400">หรือ</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-xs transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วยบัญชี Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
