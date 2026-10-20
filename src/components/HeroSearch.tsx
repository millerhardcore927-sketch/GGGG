import React from 'react';
import {
  Search,
  Filter,
  FileText,
  Video,
  Globe,
  Presentation,
  FileCode,
  GraduationCap,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { CategoryItem, EducationLevel, MediaType, SearchFilters } from '../types';

interface HeroSearchProps {
  categories: CategoryItem[];
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  announcement?: string;
  totalResultsCount: number;
}

const EDUCATION_LEVELS: { label: string; value: string }[] = [
  { label: 'ทุกระดับชั้น', value: 'all' },
  { label: 'ประถมศึกษา', value: 'ประถมศึกษา' },
  { label: 'มัธยมศึกษาตอนต้น', value: 'มัธยมศึกษาตอนต้น' },
  { label: 'มัธยมศึกษาตอนปลาย', value: 'มัธยมศึกษาตอนปลาย' },
  { label: 'อุดมศึกษา / มหาวิทยาลัย', value: 'อุดมศึกษา' },
  { label: 'บุคคลทั่วไป / ตลอดชีวิต', value: 'บุคคลทั่วไป' },
];

const MEDIA_TYPES: { label: string; value: string; icon: React.ReactNode }[] = [
  { label: 'ทุกประเภทสื่อ', value: 'all', icon: null },
  { label: 'เอกสารสรุป PDF', value: 'pdf', icon: <FileText className="w-4 h-4 text-rose-500" /> },
  { label: 'วิดีโอ / คลิปติว', value: 'video', icon: <Video className="w-4 h-4 text-red-500" /> },
  { label: 'เว็บไซต์ / แหล่งข้อมูล', value: 'website', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
  { label: 'สไลด์ประกอบการสอน', value: 'presentation', icon: <Presentation className="w-4 h-4 text-amber-500" /> },
  { label: 'ใบงาน / ชีทสรุป', value: 'document', icon: <FileCode className="w-4 h-4 text-sky-500" /> },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  announcement,
  totalResultsCount,
}) => {
  const hasActiveFilters =
    filters.query !== '' ||
    filters.category !== 'all' ||
    filters.educationLevel !== 'all' ||
    filters.mediaType !== 'all' ||
    filters.sortBy !== 'latest';

  return (
    <div className="bg-gradient-to-b from-sky-50 via-blue-50/40 to-slate-50 pt-8 pb-6 border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Announcement Banner */}
        {announcement && (
          <div className="mb-6 mx-auto max-w-4xl p-3 bg-white/80 border border-sky-200/80 rounded-2xl shadow-xs flex items-center gap-3 backdrop-blur-xs">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {announcement}
            </p>
          </div>
        )}

        {/* Hero Headlines */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            คลังปัญญาเพื่อการเรียนรู้
            <span className="text-blue-600 block sm:inline sm:ml-2">แบ่งปันได้ไม่รู้จบ</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            รวบรวมสื่อการสอน สรุปบทเรียน คลิปติว และเอกสารประกอบการเรียนจากครูและเพื่อนนักเรียนทั่วประเทศ
          </p>
        </div>

        {/* Big Search Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative flex items-center shadow-lg shadow-blue-500/5 rounded-2xl bg-white border border-blue-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition">
            <div className="pl-4.5 text-blue-500 flex items-center">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              placeholder="ค้นหาชื่อเรื่อง, บทเรียน, เนื้อหา, หรือคีย์เวิร์ด เช่น ฟิสิกส์, Python, แคลคูลัส..."
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 text-slate-800 placeholder-slate-400 bg-transparent text-sm sm:text-base focus:outline-hidden"
            />
            {filters.query && (
              <button
                onClick={() => onFilterChange({ query: '' })}
                className="pr-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            <button
              onClick={() => onFilterChange({ category: 'all' })}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 shadow-xs ${
                filters.category === 'all'
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>ทั้งหมด ({totalResultsCount})</span>
            </button>
            {categories.map((cat) => {
              const isSelected = filters.category === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange({ category: cat.name })}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap shadow-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Bar Controls (Level, Media Type, Sort) */}
        <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 items-center">
            {/* Education Level Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                ระดับการศึกษา
              </label>
              <select
                value={filters.educationLevel}
                onChange={(e) => onFilterChange({ educationLevel: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Media Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                รูปแบบสื่อ
              </label>
              <select
                value={filters.mediaType}
                onChange={(e) => onFilterChange({ mediaType: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                {MEDIA_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                เรียงตาม
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFilterChange({ sortBy: e.target.value as 'latest' | 'popular' | 'views' })
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                <option value="latest">อัปเดตล่าสุด</option>
                <option value="popular">บันทึกโปรดสูงสุด</option>
                <option value="views">ยอดเข้าชมสูงสุด</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  onClick={onResetFilters}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตตัวกรองทั้งหมด</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 py-2 sm:text-center w-full">
                  กำลังแสดงผล {totalResultsCount} รายการ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
