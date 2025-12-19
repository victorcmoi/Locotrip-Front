'use client';

import { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { createPrismaAbility } from "@casl/prisma";

export const AbilityContext = createContext(createPrismaAbility());
export const Can = createContextualCan(AbilityContext.Consumer);
