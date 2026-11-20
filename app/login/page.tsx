'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        return;
      }
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('role', data.session.role);
      sessionStorage.setItem('session', JSON.stringify(data.session));
      const home: Record<string, string> = { hr: '/Hr', manager: '/manager', user: '/' };
      window.location.href = home[data.session.role] || '/';
    } catch {
      setError('เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] font-sans">
      
      {/* ================= ฝั่งซ้าย: แบรนด์และผู้ใช้งาน 3 บทบาท ================= */}
      <div 
        className="hidden md:flex md:w-[45%] lg:w-[40%] bg-gradient-to-b from-[#1E3A8A] to-[#0F172A] p-12 text-white flex-col justify-between relative overflow-hidden"
        style={{ backgroundImage: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)" }}
      >
        {/* ลายตกแต่ง background (เบลอๆ) */}
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
        
        {/* ข้อความโปรโมทตรงกลาง */}
        <div className="my-auto space-y-8 z-10">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              ระบบพนักงานและสวัสดิการ
            </h1>
            <p className="text-sm lg:text-base text-blue-100/85 font-light max-w-sm leading-relaxed">
              ยื่นขอความช่วยเหลือภัยพิบัติ เบิกสวัสดิการ และติดตามสถานะคำขอได้ในที่เดียว
            </p>
          </div>

          {/* บทบาทผู้ใช้ 3 บทบาท */}
          <div className="space-y-4">
            <span className="text-xs font-semibold text-blue-200/70 block uppercase tracking-wider">
              ผู้ใช้งาน 3 บทบาท
            </span>
            
            <div className="space-y-3 max-w-sm">
              {/* พนักงาน */}
              <div className="flex items-center gap-4 p-3.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center border-2 border-white/20">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" alt="พนักงาน" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">พนักงาน</h3>
                  <p className="text-[10px] text-blue-200/80">สิทธิ์พนักงานทั่วไป (User)</p>
                </div>
              </div>

              {/* HR */}
              <div className="flex items-center gap-4 p-3.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center border-2 border-white/20">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120" alt="HR" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">HR</h3>
                  <p className="text-[10px] text-blue-200/80">ฝ่ายทรัพยากรบุคคล (Hr)</p>
                </div>
              </div>

              {/* ผู้บริหาร */}
              <div className="flex items-center gap-4 p-3.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center border-2 border-white/20">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" alt="ผู้บริหาร" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ผู้บริหาร</h3>
                  <p className="text-[10px] text-blue-200/80">ระดับจัดการ (Manager)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* เครดิตด้านล่างสุด */}
        <div className="text-[11px] text-blue-200/50">
          © 2569 ทีม 3สิบ50cent • ระบบสวัสดิการพนักงาน
        </div>
      </div>

      {/* ================= ฝั่งขวา: ฟอร์มเข้าสู่ระบบ ================= */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-20 bg-[#F1F5F9]">
        
        {/* ข้อความหัวมุม (สำหรับ Responsive มือถือ) */}
        <div className="md:hidden flex justify-between items-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase">ระบบพนักงานและสวัสดิการ</span>
        </div>

        <div className="m-auto w-full max-w-md">
          {/* กล่องสีขาวของฟอร์ม */}
          <div className="bg-white p-8 md:p-10 rounded-[28px] shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              เข้าสู่ระบบ
            </h2>
            <p className="text-xs text-slate-400 mb-8 font-light">
              กรุณากรอกข้อมูลบัญชีเพื่อใช้งาน
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* ช่องรหัสพนักงาน */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  รหัสประจำตัวพนักงาน / ชื่อผู้ใช้งาน
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น EMP-001"
                    spellCheck="false"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl text-sm text-black font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    required
                  />
                </div>
                
              </div>

              {/* ช่องรหัสผ่าน */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-600">
                    รหัสผ่าน
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  spellCheck="false"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  required
                />
                {error && <p className="text-[12px] text-rose-600 font-medium">{error}</p>}
              </div>

              {/* จดจำฉันไว้
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-slate-50 cursor-pointer transition-all"
                  />
                  จดจำฉันไว้ในเครื่องนี้
                </label>
              </div> */}

              {/* ปุ่มเข้าสู่ระบบ */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* หมายเหตุ */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <span className="text-[10.5px] text-slate-400 font-light block leading-relaxed">
                ระบบจะพาไปหน้าตามสิทธิ์ของบัญชี: พนักงาน • HR • ผู้บริหาร
              </span>
            </div>
          </div>
        </div>

        {/* ข้อมูลช่วยเหลือ / Footer ของด้านขวา */}
        <div className="text-center md:text-right text-[11px] text-slate-400 font-light mt-8">
          ติดปัญหาการเข้าใช้งาน? ติดต่อฝ่าย HR โทร 1234
        </div>
      </div>
    </div>
  );
}