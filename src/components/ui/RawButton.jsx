import React from "react";

export function RawButton({ children, className = "", variant = "ghost", size = "md", onClick, disabled, type = "button", title }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-shadow rounded-md focus:outline-none";
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-4 py-2 text-base h-14 w-14" : "px-3 py-2 text-sm";
  const variantClass =
    variant === "solid"
      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm"
      : variant === "outline"
      ? "border border-border bg-transparent"
      : "bg-transparent";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}