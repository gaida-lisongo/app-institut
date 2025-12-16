import React from "react";

export default function RechargesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      {children}
    </div>
  );
}
