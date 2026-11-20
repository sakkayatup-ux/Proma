import React from 'react';
import { ApprovalRequest } from '@/types';

interface ApprovalDetailInfoProps {
  request: ApprovalRequest;
  isOverQuota: boolean;
  onPreview: (title: string, imageUrl?: string) => void;
}

export const ApprovalDetailInfo: React.FC<ApprovalDetailInfoProps> = ({
  request,
  isOverQuota,
  onPreview,
}) => {
  const getCardStyle = (color: 'blue' | 'indigo' | 'sky') => {
    if (color === 'indigo') return 'bg-indigo-50/70 border-indigo-100';
    if (color === 'sky') return 'bg-sky-50/70 border-sky-100';
    return 'bg-blue-50/70 border-blue-100';
  };

  return (
    <div className="lg:col-span-2 space-y-5">
      <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              รายละเอียดคำขอ {request.id}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {request.employeeName} • {request.employeeId} • {request.department} • {request.roundTitle}
            </p>
          </div>

          <span
            className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
              isOverQuota ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {request.severityLabel}
            {isOverQuota ? ' • ยอดเกินสิทธิ์' : ''}
          </span>
        </div>

        {/* ส่วนที่ 1 */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-800">
            ส่วนที่ 1 • ข้อมูลที่พักอาศัยและเอกสารยืนยันที่อยู่
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="block text-[11px] text-slate-400">ที่อยู่ตามทะเบียนประวัติ</span>
              <span className="mt-1 block font-medium text-slate-700">{request.registeredAddress}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">ที่พักอาศัยปัจจุบันที่ได้รับผลกระทบ</span>
              <span className="mt-1 block font-bold text-slate-900">{request.currentAddress}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
            <div>
              <span className="text-slate-400">ลักษณะที่พัก: </span>
              <span className="font-bold text-slate-900">{request.houseType}</span>
            </div>
            <button
              type="button"
              onClick={() => onPreview(request.houseDocName, request.houseDocUrl)}
              className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
            >
              เปิดดู {request.houseDocName}
            </button>
          </div>
        </div>

        {/* ส่วนที่ 2 */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800">
              ส่วนที่ 2 • รายละเอียดผลกระทบและช่วงเวลา
            </h4>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              {request.impactDuration}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-xs text-slate-700">
            {request.description}
          </div>
        </div>

        {/* ส่วนที่ 3 */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800">
            ส่วนที่ 3 • หลักฐานรูปถ่ายและเอกสารที่ผู้ขอเบิกแนบมา ({request.photoCards.length} รายการ)
          </h4>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {request.photoCards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => onPreview(`${card.title} (${card.subtitle})`, card.imageUrl)}
                className={`cursor-pointer rounded-2xl border p-4 transition hover:shadow-xs ${getCardStyle(card.bgColor)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block rounded-lg border border-blue-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    ภาพถ่าย
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 underline">คลิกดูรูป</span>
                </div>
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="mb-2.5 h-24 w-full rounded-xl object-cover border border-white/60"
                  />
                )}
                <p className="text-xs font-bold text-slate-900">{card.title}</p>
                <p className="mt-1 text-[11px] text-slate-500">{card.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-slate-700">
            {request.documentChecklist.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-blue-400 text-[10px] font-bold text-blue-600">
                  ✓
                </span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* การ์ดใบที่ 2 */}
      <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-900">ผลการกลั่นกรองจาก HR</h4>
          <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
            ✓ ผ่านการตรวจสอบ {request.hrScreeningChecks.length}/{request.hrScreeningChecks.length}
          </span>
        </div>

        <div className="space-y-2.5 text-xs font-semibold text-emerald-700">
          {request.hrScreeningChecks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[10px]">
                ✓
              </span>
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};