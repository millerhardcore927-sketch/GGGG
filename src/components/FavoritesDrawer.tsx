import React from 'react';
import { X, Bookmark, Trash2, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { Favorite, Resource } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  favorites: Favorite[];
  resources: Resource[];
  onClose: () => void;
  onSelectResource: (resource: Resource) => void;
  onRemoveFavorite: (resource: Resource) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  favorites,
  resources,
  onClose,
  onSelectResource,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">รายการที่บันทึกไว้</h3>
              <p className="text-xs text-slate-500">
                ทั้งหมด {favorites.length} รายการ (ซิงค์ตามบัญชีผู้ใช้)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Bookmark className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">ยังไม่มีรายการที่บันทึกไว้</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                คุณสามารถกดไอคอนบันทึกบนการ์ดสื่อความรู้ใดๆ เพื่อเก็บไว้อ่านและทบทวนภายหลังได้
              </p>
            </div>
          ) : (
            favorites.map((fav) => {
              const matchedResource = resources.find((r) => r.id === fav.resourceId);
              return (
                <div
                  key={fav.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50/80 transition flex items-start justify-between gap-3 group"
                >
                  <div
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => {
                      if (matchedResource) {
                        onSelectResource(matchedResource);
                        onClose();
                      }
                    }}
                  >
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 mb-1">
                      {fav.resourceCategory || matchedResource?.category || 'คลังความรู้'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                      {fav.resourceTitle || matchedResource?.title || 'สื่อการเรียนรู้'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      บันทึกเมื่อ {new Date(fav.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                    {matchedResource && (
                      <button
                        onClick={() => {
                          onSelectResource(matchedResource);
                          onClose();
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="เปิดดูเนื้อหา"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const target = matchedResource || {
                          id: fav.resourceId,
                          title: fav.resourceTitle,
                          category: fav.resourceCategory,
                        } as Resource;
                        onRemoveFavorite(target);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบออกจากรายการบันทึก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
