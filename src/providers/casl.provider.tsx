'use client';

import { AbilityContext } from '@/lib/can';
import { ReactNode } from 'react';
import { createPrismaAbility } from "@casl/prisma";

export default function CaslProvider({ children, abilities }: { children: ReactNode, abilities: any }) {
  return <AbilityContext.Provider value={createPrismaAbility(abilities)}>{children}</AbilityContext.Provider>;
}
