"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalizedPath } from "@/providers/i18n.provider";

export default function MePage() {
  const router = useRouter();
  const localizedPath = useLocalizedPath();

  useEffect(() => {
    router.replace(localizedPath("/me/bookings"));
  }, [router, localizedPath]);

  return null;
}
