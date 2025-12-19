import { z } from "zod";

export const apiErrorResponseSchema = z.object({
  message: z.string().nullish(),
  error: z.string().nullish(),
  statusCode: z.number(),
});

export type ApiErrorResponseSchema = z.infer<typeof apiErrorResponseSchema>;
