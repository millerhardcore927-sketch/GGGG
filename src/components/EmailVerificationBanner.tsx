import React, { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EmailVerificationBannerProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  onSuccess,
  onError,
}) => {
  const { user, resendEmailVerification } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // If user is not logged in or email is already verified, do not render
  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    try {
      setSending(true);
      await resendEmailVerification();
      setSent(true);
      onSuccess('ส่งอีเมลยืนยันตัวตนเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ');
      setTimeout(() => setSent(false), 8000);
    } catch (err: any) {
      onError(err?.message || 'ไม่สามารถส่งอีเมลยืนยันได้ โปรดลองอีกครั้งภายหลัง');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-900 text-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            อีเมลของคุณ (<strong className="font-medium">{user.email}</strong>) ยังไม่ได้รับการยืนยันตัวตน
            โปรดยืนยันเพื่อความปลอดภัยในการเข้าใช้งาน
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResend}
            disabled={sending || sent}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg shadow-sm transition"
          >
            {sent ? (
              <>
                <Check className="w-3.5 h-3.5" />
                ส่งแล้ว!
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                {sending ? 'กำลังส่ง...' : 'ส่งอีเมลยืนยันอีกครั้ง'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
