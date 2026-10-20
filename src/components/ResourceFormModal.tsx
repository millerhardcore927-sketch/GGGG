import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Link, FileText, Check, Tag } from 'lucide-react';
import { CategoryItem, EducationLevel, MediaType, Resource, ResourceStatus } from '../types';

interface ResourceFormModalProps {
  initialResource?: Resource | null;
  categories: CategoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    educationLevel: EducationLevel;
    mediaType: MediaType;
    resourceUrl: string;
    tags: string[];
    status: ResourceStatus;
  }) => Promise<void>;
}

const EDUCATION_LEVEL_OPTIONS: EducationLevel[] = [
  'ประถมศึกษา',
  'มัธยมศึกษาตอนต้น',
  'มัธยมศึกษาตอนปลาย',
  'อุดมศึกษา',
  'บุคคลทั่วไป',
];

const MEDIA_TYPE_OPTIONS: { label: string; value: MediaType }[] = [
  { label: 'เอกสารสรุป PDF', value: 'pdf' },
  { label: 'คลิปวิดีโอ / YouTube', value: 'video' },
  { label: 'เว็บไซต์ / ลิงก์บทความ', value: 'website' },
  { label: 'สไลด์ประกอบการบรรยาย', value: 'presentation' },
  { label: 'ใบงาน / แบบฝึกหัด', value: 'document' },
  { label: 'สื่อรูปแบบอื่นๆ', value: 'other' },
];

export const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  initialResource,
  categories,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('มัธยมศึกษาตอนปลาย');
  const [mediaType, setMediaType] = useState<MediaType>('pdf');
  const [resourceUrl, setResourceUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<ResourceStatus>('active');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialResource) {
      setTitle(initialResource.title);
      setDescription(initialResource.description);
      setCategory(initialResource.category);
      setEducationLevel(initialResource.educationLevel);
      setMediaType(initialResource.mediaType);
      setResourceUrl(initialResource.resourceUrl);
      setTagsInput(initialResource.tags?.join(', ') || '');
      setStatus(initialResource.status);
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.name || 'คอมพิวเตอร์และเทคโนโลยี');
      setEducationLevel('มัธยมศึกษาตอนปลาย');
      setMediaType('pdf');
      setResourceUrl('');
      setTagsInput('');
      setStatus('active');
    }
    setError(null);
  }, [initialResource, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Front-end strict validations
    if (!title.trim() || title.trim().length < 3) {
      setError('กรุณากรอกชื่อเรื่องอย่างน้อย 3 ตัวอักษร');
      return;
    }
    if (title.trim().length > 200) {
      setError('ชื่อเรื่องต้องไม่เกิน 200 ตัวอักษร');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('กรุณาระบุคำอธิบายหรือเนื้อหาย่ออย่างน้อย 10 ตัวอักษร');
      return;
    }
    if (description.trim().length > 4000) {
      setError('คำอธิบายต้องไม่เกิน 4,000 ตัวอักษร');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกหมวดหมู่ความรู้');
      return;
    }
    if (!resourceUrl.trim()) {
      setError('กรุณาระบุลิงก์หรือ URL ของสื่อความรู้');
      return;
    }

    try {
      const url = new URL(resourceUrl.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        setError('URL ต้องเริ่มต้นด้วย http:// หรือ https://');
        return;
      }
    } catch {
      setError('รูปแบบ URL ไม่ถูกต้อง โปรดตรวจสอบลิงก์ (เช่น https://example.com)');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 8);

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        educationLevel,
        mediaType,
        resourceUrl: resourceUrl.trim(),
        tags,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialResource ? 'แก้ไขสื่อความรู้' : 'แบ่งปันสื่อการเรียนรู้ใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              ร่วมสร้างสรรค์คลังความรู้เพื่อการศึกษาไทย ข้อมูลจะถูกจัดเก็บลงฐานข้อมูลจริง
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่อเรื่อง / หัวข้อสื่อการเรียนรู้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปสูตรเคมี ม.5 เทอม 1, สอนแคลคูลัส 1, ไวยากรณ์อังกฤษสอบเข้า..."
              maxLength={200}
              className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 transition"
            />
            <div className="flex justify-end text-[10px] text-slate-400 mt-1">
              {title.length}/200 ตัวอักษร
            </div>
          </div>

          {/* Category & Education Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมวดหมู่วิชา / ความรู้ <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระดับชั้นเป้าหมาย <span className="text-rose-500">*</span>
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5"
              >
                {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Type & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รูปแบบของสื่อ <span className="text-rose-500">*</span>
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5"
              >
                {MEDIA_TYPE_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ลิงก์สื่อการสอน / เอกสาร / คลิป <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Link className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... หรือ https://youtube.com/..."
                  className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำอธิบายรายละเอียด / หัวข้อย่อย / จุดประสงค์การเรียนรู้{' '}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายว่าสื่อนี้มีประโยชน์อย่างไร เหมาะกับบทไหน มีสูตรหรือตัวอย่างอะไรบ้าง..."
              maxLength={4000}
              className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-3.5 transition"
            />
            <div className="flex justify-end text-[10px] text-slate-400 mt-0.5">
              {description.length}/4000 ตัวอักษร
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำค้นหา / ป้ายกำกับ (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="เช่น สอบปลายภาค, ม.6, สรุปสั้น, TCAS68"
                className="w-full text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5"
              />
            </div>
          </div>

          {/* Status Selection (active or hidden) */}
          <div className="flex items-center gap-4 pt-2">
            <label className="text-xs font-semibold text-slate-700">สถานะการเผยแพร่:</label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="active"
                checked={status === 'active'}
                onChange={() => setStatus('active')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>เผยแพร่สาธารณะทันที</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="hidden"
                checked={status === 'hidden'}
                onChange={() => setStatus('hidden')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>ซ่อนไว้ก่อน (แบบร่าง)</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'กำลังบันทึกลงฐานข้อมูล...' : 'บันทึกสื่อความรู้'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
