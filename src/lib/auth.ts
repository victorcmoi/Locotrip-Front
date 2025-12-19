import 'server-only';
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export const signOut = async () => {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return;

  await fetch(`${process.env.NEXTAUTH_URL}/api/auth/signout`, {
    method: "POST",
    body: JSON.stringify(await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`, { cache: "no-cache" }).then(rs => rs.json())),
    headers: {
      'Content-Type': 'application/json',
    },
    cache: "no-cache"
  });
};

export const checkLogin = async (): Promise<boolean> => {
  try {
    const session = await getServerSession(authOptions);
    return !!session?.accessToken;
  } catch {
    return false;
  }
};
