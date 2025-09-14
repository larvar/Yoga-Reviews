"use client";

import { Toaster } from "react-hot-toast";
import React from "react";

export default function ToastProvider({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </>
  );
}
