"use client";

import React, { useState, useRef, useEffect } from "react";
import { EllipsisVertical, type LucideIcon } from "lucide-react";
import Link from "next/link";

export interface DropdownMenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

export default function DropdownMenu({ items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseItemClass =
    "bg-transparent rounded-sm flex items-center gap-3 w-full px-4 py-2.5 text-sm transition cursor-pointer";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-white/90 rounded-full p-2 shadow-sm hover:bg-white transition cursor-pointer"
      >
        <EllipsisVertical size={16} className="text-dark/70" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg w-50   z-20 overflow-hidden">
          {items.map((item, i) => {
            const isDanger = item.variant === "danger";
            const className = `${baseItemClass} ${
              isDanger
                ? "text-red-500 hover:bg-red-50"
                : "text-dark hover:bg-gray-50"
            }`;
            const iconClass = isDanger ? "" : "text-dark/60";

            const content = (
              <>
                <item.icon size={16} className={iconClass} />
                {item.label}
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={className}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={i}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
