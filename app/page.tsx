"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import HomePageContent from "@/components/HomePageContent";
import GeneralWelfareContent from "@/components/GeneralWelfareContent";
import DisasterWelfareContent from "@/components/DisasterWelfareContent";
import TrackStatusContent from "@/components/TrackStatusContent";
import ProfileContent from "@/components/ProfileContent";
import { useStore } from "@/lib/store";

// หน้าหลักฝั่งพนักงาน (U0–U4, G1–G2)
export default function Page() {
  const [activeTab, setActiveTab] = useState("หน้าหลัก");
  const [focusClaim, setFocusClaim] = useState<string | null>(null);
  const { db, session, me } = useStore();

  useEffect(() => {
    const s = sessionStorage.getItem("session");
    if (!s || JSON.parse(s).role !== "user") window.location.href = "/login";
  }, []);

  const go = (tab: string, claimId: string | null = null) => {
    setFocusClaim(claimId);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row font-sans antialiased text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={(t) => go(t)} />
      <main className="flex-1 bg-[#f8fafc] p-6 lg:p-10 overflow-y-auto">
        <Header />
        {!db || !session ? (
          <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
        ) : !me ? (
          <div className="bg-white rounded-2xl border border-amber-200 p-8 text-sm text-amber-800">
            บัญชีนี้ยังไม่ได้ผูกกับทะเบียนพนักงาน กรุณาติดต่อฝ่าย HR
          </div>
        ) : (
          <>
            {activeTab === "หน้าหลัก" && <HomePageContent go={go} />}
            {activeTab === "เบิกสวัสดิการทั่วไป" && <GeneralWelfareContent go={go} />}
            {activeTab === "เบิกสวัสดิการประเภทภัยพิบัติ" && <DisasterWelfareContent go={go} editId={focusClaim} />}
            {activeTab === "ติดตามสถานะ" && <TrackStatusContent go={go} focusId={focusClaim} />}
            {activeTab === "ข้อมูลส่วนตัว" && <ProfileContent />}
          </>
        )}
      </main>
    </div>
  );
}
