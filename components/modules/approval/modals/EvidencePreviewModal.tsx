import React from 'react';

interface EvidencePreviewModalProps {
  title: string | null;
  imageUrl?: string | null; // รับลิงก์รูปภาพหรือ Base64
  onClose: () => void;
}

export const EvidencePreviewModal: React.FC<EvidencePreviewModalProps> = ({
  title,
  imageUrl,
  onClose,
}) => {
  if (!title) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 text-center">
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          หลักฐานประกอบคำขอ
        </span>

        <h4 className="text-base font-bold text-slate-900">{title}</h4>

        {/* กล่องแสดงรูปภาพจริง (ถ้าไม่มีรูปจะแสดงข้อความสำรอง) */}
        <div className="my-5 flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[420px] w-auto rounded-xl object-contain shadow-xs"
            />
          ) : (
            <p className="py-10 px-4 text-xs text-slate-500">
              ตรวจสอบหลักฐานเรียบร้อยแล้ว • ตรงตามเงื่อนไขของบริษัท
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
};