"use client";

import React from "react";
import { Toaster, toast } from "react-hot-toast";

/**
 * Mount this once in app/layout.tsx.
 * Use `useToast()` anywhere to call toast("message").
 */
export default function ToastProvider({
  children,
}: { children?: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </>
  );
}

/** Simple hook that returns the `toast` function from react-hot-toast */
export function useToast() {
  return toast;
}
