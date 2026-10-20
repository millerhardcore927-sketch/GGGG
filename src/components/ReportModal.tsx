import React, { useState } from 'react';
import { X, Flag, AlertCircle, Send, Check } from 'lucide-react';
import { ReportReason, Resource } from '../types';

interface ReportModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (
    resourceId: string,
    resourceTitle: string,
    reason: ReportReason,
    details: string
  ) => Promise<void>;
}

const REPORT_REASONS: { label: string; value: ReportReason; desc: string }[] = [
  {
    value: 'broken_link',
    label: 'ลิงก์เสีย / เข้าถึงสื่อไม่ได้',
    desc: 'ลิงก์ปลายทางใช้งานไม่ได้ ไฟล์ถูกลบ หรือเว็บไซต์ไม่เปิดให้เข้าถึง',
  },
  {
    value: 'inappropriate',
    label: 'เนื้อหาไม่เหมาะสม / หยาบคาย',
    desc: 'มีเนื้อหาที่ละเมิดจริยธรรม ภาพหรือข้อความที่ไม่เหมาะสมสำหรับเยาวชน',
  },
  {
    value: 'copyright',
    label: 'ละเมิดลิขสิทธิ์ / สิทธิบัตร',
    desc: 'นำผลงานของผู้อื่นมาเผยแพร่โดยไม่ได้รับอนุญาตหรือไม่มีการอ้างอิง',
  },
  {
    value: 'spam',
    label: 'โฆษณา / สแปม / ข้อมูลเท็จ',
    desc: 'เนื้อหาเน้นขายของ หรือข้อความความรู้ที่บิดเบือนไม่เป็นความจริง',
  },
  {
    value: 'other',
    label: 'ปัญหาอื่นๆ',
    desc: 'ปัญหาอื่นๆ นอกเหนือจากที่ระบุข้างต้น',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>('broken_link');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      await onSubmitReport(resource.id, resource.title, reason, details.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถส่งรายงานได้ โปรดลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">รายงานสื่อการเรียนรู้นี้</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[260px] sm:max-w-xs">
                {resource.title}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              เหตุผลในการรายงาน <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    reason === r.value
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{r.label}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ระบุจุดที่พบปัญหา เช่น ลิงก์ Drive ขึ้น 404, นาทีที่เท่าไหร่ของวิดีโอมีปัญหา..."
              maxLength={1000}
              className="w-full text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'กำลังส่งรายงาน...' : 'ส่งรายงานให้ผู้ดูแลตรวจสอบ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
