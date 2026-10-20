import React from 'react';
import {
  FileText,
  Video,
  Globe,
  Presentation,
  FileCode,
  Eye,
  Bookmark,
  Share2,
  Flag,
  Edit3,
  Trash2,
  ExternalLink,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { MediaType, Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
  isFavorited: boolean;
  currentUserId?: string;
  isAdminOrMod: boolean;
  onSelect: (resource: Resource) => void;
  onToggleFavorite: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

const getMediaIcon = (type: MediaType) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-3.5 h-3.5 text-rose-500" />;
    case 'video':
      return <Video className="w-3.5 h-3.5 text-red-500" />;
    case 'website':
      return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
    case 'presentation':
      return <Presentation className="w-3.5 h-3.5 text-amber-500" />;
    default:
      return <FileCode className="w-3.5 h-3.5 text-sky-500" />;
  }
};

const getMediaLabel = (type: MediaType) => {
  switch (type) {
    case 'pdf':
      return 'PDF สรุป';
    case 'video':
      return 'วิดีโอคลิป';
    case 'website':
      return 'เว็บไซต์';
    case 'presentation':
      return 'สไลด์บรรยาย';
    case 'document':
      return 'ใบงาน/ชีท';
    default:
      return 'สื่ออื่นๆ';
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isFavorited,
  currentUserId,
  isAdminOrMod,
  onSelect,
  onToggleFavorite,
  onReport,
  onEdit,
  onDelete,
}) => {
  const isAuthor = currentUserId && resource.authorId === currentUserId;
  const canModify = isAuthor || isAdminOrMod;

  const dateFormatted = new Date(resource.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Top Header Card info */}
      <div className="p-4 sm:p-5 cursor-pointer" onClick={() => onSelect(resource)}>
        {/* Badges: Category & MediaType & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              {resource.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
              {getMediaIcon(resource.mediaType)}
              <span>{getMediaLabel(resource.mediaType)}</span>
            </span>
          </div>
          {resource.status === 'hidden' && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
              ซ่อนอยู่ (รอตรวจสอบ)
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-base sm:text-lg leading-snug line-clamp-2 mb-2">
          {resource.title}
        </h3>

        {/* Description snippet */}
        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
          {resource.description}
        </p>

        {/* Level & Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            <GraduationCap className="w-3 h-3" />
            <span>{resource.educationLevel}</span>
          </span>
          {resource.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Author + Metrics + Actions */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Author & Date */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
            {resource.authorName?.slice(0, 2) || 'ครู'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate max-w-[110px] sm:max-w-[140px]">
              {resource.authorName || 'ผู้แบ่งปันความรู้'}
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              <span>{dateFormatted}</span>
            </p>
          </div>
        </div>

        {/* Counters & Interactive Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Views count */}
          <span className="flex items-center gap-1 text-[11px] text-slate-500 mr-1" title="ยอดเข้าชม">
            <Eye className="w-3.5 h-3.5" />
            <span>{resource.viewsCount || 0}</span>
          </span>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(resource);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition active:scale-95 ${
              isFavorited
                ? 'bg-amber-100 text-amber-800'
                : 'hover:bg-slate-200/60 text-slate-600'
            }`}
            title={isFavorited ? 'ลบออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{resource.favoritesCount || 0}</span>
          </button>

          {/* Quick report button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReport(resource);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="รายงานเนื้อหาไม่เหมาะสม / ลิงก์เสีย"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {/* Edit / Delete actions for Author or Admin */}
          {canModify && (
            <div className="flex items-center border-l border-slate-200 pl-1.5 ml-0.5 gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="แก้ไขข้อมูลสื่อนี้"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(resource);
                }}
                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="ลบสื่อนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
