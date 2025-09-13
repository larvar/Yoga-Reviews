"use client";
import { createContext, useContext, useState } from "react";

const ToastCtx = createContext<(msg: string) => void>(() => {});
export function useToast(){ return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <ToastCtx.Provider value={(m)=>{ setMsg(m); setTimeout(()=>setMsg(null), 2200); }}>
      {children}
      {msg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg">
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
