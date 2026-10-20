import React from 'react';
import { X, BookOpen, ShieldCheck, CheckCircle2, Key, Users, Sparkles, Layers } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[88vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">คู่มือและขั้นตอนการทำงาน EduShare TH</h3>
              <p className="text-xs text-slate-500">
                โครงสร้างระบบ การตั้งค่า Firebase Console และขั้นตอนการทดสอบ
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

        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Overview */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              1. สรุปภาพรวมและสถาปัตยกรรม (Architecture)
            </h4>
            <p className="text-slate-600">
              EduShare TH ถูกออกแบบมาเพื่อรวบรวมและแบ่งปันสื่อการสอนสำหรับนักเรียน นักศึกษา และครูไทย
              ทำงานด้วยฐานข้อมูล Cloud Firestore จริงและ Firebase Authentication ไม่มีการใช้ข้อมูลจำลอง (Mock Data)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">บุคคลทั่วไป (Guest)</span>
                ค้นหา กรองสื่อตามระดับชั้นและประเภท ดูรายละเอียดและเปิดสื่อสาธารณะ
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                <span className="font-bold block mb-1">สมาชิก (Member)</span>
                โพสต์สื่อ แก้ไข/ลบสื่อของตนเอง บันทึกรายการโปรด ซิงค์ทุกอุปกรณ์ และส่งรายงาน
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900">
                <span className="font-bold block mb-1">ผู้ดูแล (Admin / Mod)</span>
                ตรวจสอบและจัดการรายงาน ซ่อน/ลบสื่อ ระงับผู้ใช้ และปรับแต่งหมวดหมู่เว็บ
              </div>
            </div>
          </div>

          {/* Section 2: Firebase Console Setup Checklist */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              2. ขั้นตอนการตั้งค่าใน Firebase Console เพิ่มเติม
            </h4>
            <ul className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>เปิดใช้งาน Email/Password Provider:</strong> ไปที่ Firebase Console &gt;
                  Authentication &gt; Sign-in method &gt; กดเปิดใช้งาน Email/Password
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>เปิดใช้งาน Google Sign-In Provider:</strong> ในแท็บ Sign-in method เลือก Google
                  และใส่ Support Email ของโครงการ
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Authorized Domains:</strong> เพิ่มโดเมนของแอปพลิเคชันลงใน Authentication &gt;
                  Settings &gt; Authorized domains เพื่อให้ Google Sign-In ทำงานได้ราบรื่น
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Firestore Security Rules:</strong> กฎความปลอดภัยที่เข้มงวดได้ถูกส่งไปติดตั้งยัง
                  Cloud Firestore เรียบร้อยแล้ว (บล็อกการแอบเลื่อนขั้นตัวเองเป็นแอดมิน ป้องกันการแก้ข้อมูลของผู้อื่น)
                </span>
              </li>
            </ul>
          </div>

          {/* Section 3: Testing Walkthrough */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              3. วิธีทดสอบระบบจริง (Step-by-Step Test Guide)
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>ค้นหาและกรองสื่อ:</strong> ลองพิมพ์คำค้นหา เช่น &quot;ฟิสิกส์&quot;, &quot;Python&quot;
                หรือคลิกเลือกหมวดหมู่และระดับชั้นเพื่อดูผลลัพธ์แบบเรียลไทม์
              </li>
              <li>
                <strong>สมัครสมาชิก:</strong> กดปุ่ม &quot;สมัครสมาชิก&quot; กรอกชื่อ อีเมล รหัสผ่าน
                ระบบจะสร้างบัญชีลงใน Firebase Authentication และส่งอีเมลยืนยันตัวตนจริง
              </li>
              <li>
                <strong>เข้าสู่ระบบด้วย Google:</strong> หรือกดเข้าสู่ระบบด้วย Google Popup เพื่อความสะดวก
              </li>
              <li>
                <strong>แบ่งปันสื่อใหม่:</strong> กดปุ่ม &quot;+ แบ่งปันความรู้&quot; กรอกข้อมูล แนบลิงก์
                (เช่น YouTube หรือ Google Drive) และกดบันทึกลง Firestore
              </li>
              <li>
                <strong>ทดสอบรายการโปรด (Favorites):</strong> กดไอคอนรูปที่คั่นหนังสือบนการ์ด ข้อมูลจะถูกจัดเก็บลง
                คอลเลกชัน <code>favorites</code> แยกตาม UID และซิงค์ทันที
              </li>
              <li>
                <strong>ทดสอบการรายงาน (Report):</strong> กดไอคอนธงเพื่อแจ้งปัญหาลิงก์เสียหรือเนื้อหาไม่เหมาะสม
              </li>
              <li>
                <strong>ระบบแอดมิน (Admin Dashboard):</strong> บัญชีผู้ดูแลระบบ (เช่น <code>millerhardcore927@gmail.com</code>)
                สามารถเข้าใช้งานเมนูแอดมินเพื่อตรวจสอบรายงาน ซ่อน/ลบสื่อ ระงับผู้ใช้ หรือเพิ่ม/ลบหมวดหมู่วิชาได้โดยตรง
              </li>
            </ol>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs sm:text-sm transition"
          >
            เข้าใจแล้ว เริ่มต้นใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};
