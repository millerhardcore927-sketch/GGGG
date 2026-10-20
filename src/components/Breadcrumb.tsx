import React from 'react';
import { ChevronRight, Home, BookOpen, Layers } from 'lucide-react';

interface BreadcrumbProps {
  currentCategory?: string;
  educationLevel?: string;
  resourceTitle?: string;
  onResetCategory?: () => void;
  onResetEducationLevel?: () => void;
  onResetAll?: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentCategory,
  educationLevel,
  resourceTitle,
  onResetCategory,
  onResetEducationLevel,
  onResetAll,
}) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 py-3 overflow-x-auto whitespace-nowrap">
      <button
        onClick={onResetAll}
        className="flex items-center gap-1 hover:text-blue-600 transition font-medium text-slate-700"
      >
        <Home className="w-3.5 h-3.5 text-blue-600" />
        <span>หน้าหลักคลังความรู้</span>
      </button>

      {currentCategory && currentCategory !== 'all' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <button
            onClick={onResetEducationLevel}
            className="flex items-center gap-1 hover:text-blue-600 transition font-medium text-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>{currentCategory}</span>
          </button>
        </>
      )}

      {educationLevel && educationLevel !== 'all' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>ระดับ: {educationLevel}</span>
          </span>
        </>
      )}

      {resourceTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">
            {resourceTitle}
          </span>
        </>
      )}
    </nav>
  );
};
