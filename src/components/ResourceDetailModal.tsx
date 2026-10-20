import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  Share2,
  Flag,
  Calendar,
  GraduationCap,
  Eye,
  FileText,
  Video,
  Globe,
  Presentation,
  Check,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Resource } from '../types';

interface ResourceDetailModalProps {
  resource: Resource | null;
  isFavorited: boolean;
  currentUserId?: string;
  isAdminOrMod: boolean;
  onClose: () => void;
  onToggleFavorite: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onSuccessToast: (msg: string) => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    } else if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isFavorited,
  currentUserId,
  isAdminOrMod,
  onClose,
  onToggleFavorite,
  onReport,
  onEdit,
  onDelete,
  onSuccessToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!resource) return null;

  const isAuthor = currentUserId && resource.authorId === currentUserId;
  const canModify = isAuthor || isAdminOrMod;

  const youtubeEmbed = getYouTubeEmbedUrl(resource.resourceUrl);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      onSuccessToast('คัดลอกลิงก์สื่อการเรียนรู้นี้เรียบร้อยแล้ว');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const dateFormatted = new Date(resource.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {resource.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
              {resource.educationLevel}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 uppercase">
              {resource.mediaType}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {resource.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                เผยแพร่เมื่อ: {dateFormatted}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                เข้าชม {resource.viewsCount || 0} ครั้ง
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                บันทึกโปรด {resource.favoritesCount || 0} คน
              </span>
            </div>
          </div>

          {/* Embedded Player or Interactive Preview Box */}
          {youtubeEmbed ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-black">
              <iframe
                src={youtubeEmbed}
                title={resource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  {resource.mediaType === 'pdf' ? (
                    <FileText className="w-6 h-6" />
                  ) : resource.mediaType === 'presentation' ? (
                    <Presentation className="w-6 h-6" />
                  ) : (
                    <Globe className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                    เปิดดูสื่อต้นฉบับ ({resource.mediaType.toUpperCase()})
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md truncate">
                    {resource.resourceUrl}
                  </p>
                </div>
              </div>
              <a
                href={resource.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition whitespace-nowrap"
              >
                <span>เข้าสู่สื่อการเรียนรู้</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Detailed Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              คำอธิบายและวัตถุประสงค์การเรียนรู้
            </h4>
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {resource.description}
            </div>
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                คำค้นหา / ป้ายกำกับ (Tags)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {resource.authorName?.slice(0, 2) || 'ครู'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {resource.authorName || 'ผู้แบ่งปันความรู้'}
                </p>
                <p className="text-xs text-slate-500">
                  {resource.authorEmail || 'สมาชิก EduShare TH'}
                </p>
              </div>
            </div>
            {resource.status === 'hidden' && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                สถานะ: ซ่อนจากบุคคลทั่วไป
              </span>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleFavorite(resource)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                isFavorited
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isFavorited ? 'บันทึกไว้แล้ว' : 'บันทึกรายการโปรด'}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'แชร์ลิงก์'}</span>
            </button>

            {/* Report button */}
            <button
              onClick={() => onReport(resource)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <Flag className="w-4 h-4" />
              <span>รายงาน</span>
            </button>
          </div>

          {/* Author/Admin Actions */}
          {canModify && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(resource)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>แก้ไข</span>
              </button>
              <button
                onClick={() => onDelete(resource)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบสื่อ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
